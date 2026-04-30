import { Request, Response, Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { authenticate } from "../middleware/auth.js";
import { getDatabase } from "../db/connection.js";
import type { JWTPayload } from "../types/index.js";

interface AuthRequest extends Request {
  user?: JWTPayload;
}

const router = Router();

/**
 * GET /api/settings - Get user settings
 */
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

    const db = await getDatabase();
    let settings = await db.collection("user_settings").findOne({ userId });

    if (!settings) {
      // Create default settings
      const newSettings = {
        _id: uuidv4(),
        userId,
        notifications: { push: true, email: true, sms: false, claimUpdates: true, billReminders: true, promotions: false },
        privacy: { shareDataWithInsurer: true, shareDataWithHospital: true, analyticsOptIn: true },
        appearance: { darkMode: false, language: "en" },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.collection("user_settings").insertOne(newSettings as any);
      settings = newSettings as any;
    }

    res.json(settings);
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

/**
 * PUT /api/settings - Update user settings
 */
router.put("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

    const db = await getDatabase();
    
    const allowedFields = ["notifications", "privacy", "appearance"];
    const sanitizedBody: any = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) sanitizedBody[key] = req.body[key];
    }
    
    const updateData = { ...sanitizedBody, userId, updatedAt: new Date() };

    await db.collection("user_settings").updateOne(
      { userId },
      { $set: updateData },
      { upsert: true }
    );

    const updated = await db.collection("user_settings").findOne({ userId });
    res.json(updated);
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

/**
 * GET /api/settings/payment-methods - Get user's payment methods
 */
router.get("/payment-methods", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

    const db = await getDatabase();
    const methods = await db.collection("payment_methods")
      .find({ userId })
      .sort({ isDefault: -1, createdAt: -1 })
      .toArray();

    res.json(methods);
  } catch (error) {
    console.error("Get payment methods error:", error);
    res.status(500).json({ error: "Failed to fetch payment methods" });
  }
});

/**
 * POST /api/settings/payment-methods - Add a payment method
 */
router.post("/payment-methods", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

    const { type, cardToken, cardData, upiId, bankName } = req.body;
    
    if (!type) {
      res.status(400).json({ error: "Payment method type is required" });
      return;
    }

    if (type === "card") {
      if (!cardToken || !cardData?.last4 || !cardData?.cardHolder || !cardData?.expiryMonth || !cardData?.expiryYear || !cardData?.brand) {
        res.status(400).json({ error: "Missing required card metadata or token" });
        return;
      }
    }

    const db = await getDatabase();

    // Check existing count
    const existingCount = await db.collection("payment_methods").countDocuments({ userId });

    const method = {
      id: `pm_${uuidv4()}`,
      userId,
      type, // 'card', 'upi', 'bank'
      ...(type === "card" && {
        token: cardToken,
        last4: cardData.last4,
        cardHolder: cardData.cardHolder,
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        brand: cardData.brand,
      }),
      ...(type === "upi" && { upiId: upiId || "" }),
      ...(type === "bank" && { bankName: bankName || "" }),
      isDefault: existingCount === 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("payment_methods").insertOne(method);
    res.status(201).json(method);
  } catch (error) {
    console.error("Add payment method error:", error);
    res.status(500).json({ error: "Failed to add payment method" });
  }
});

/**
 * DELETE /api/settings/payment-methods/:id - Delete a payment method
 */
router.delete("/payment-methods/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

    const db = await getDatabase();
    const target = await db.collection("payment_methods").findOne({ id: req.params.id, userId });
    
    if (!target) {
      res.status(404).json({ error: "Payment method not found" });
      return;
    }

    const result = await db.collection("payment_methods").deleteOne({ id: req.params.id, userId });

    if (result.deletedCount === 1 && target.isDefault) {
      const nextMethod = await db.collection("payment_methods").findOne({ userId });
      if (nextMethod) {
        await db.collection("payment_methods").updateOne(
          { id: nextMethod.id, userId },
          { $set: { isDefault: true } }
        );
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete payment method error:", error);
    res.status(500).json({ error: "Failed to delete payment method" });
  }
});

/**
 * PATCH /api/settings/payment-methods/:id/default - Set default payment method
 */
router.patch("/payment-methods/:id/default", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

    const db = await getDatabase();

    const target = await db.collection("payment_methods").findOne({ id: req.params.id, userId });
    if (!target) {
      res.status(404).json({ error: "Payment method not found" });
      return;
    }

    // Unset all defaults for this user
    await db.collection("payment_methods").updateMany({ userId }, { $set: { isDefault: false } });

    // Set the selected one as default
    const updateResult = await db.collection("payment_methods").updateOne(
      { id: req.params.id, userId },
      { $set: { isDefault: true, updatedAt: new Date() } }
    );

    res.json({ success: updateResult.modifiedCount > 0 });
  } catch (error) {
    console.error("Set default payment method error:", error);
    res.status(500).json({ error: "Failed to set default payment method" });
  }
});

function detectCardBrand(cardNumber: string): string {
  const num = cardNumber.replace(/\s/g, "");
  if (/^4/.test(num)) return "Visa";
  if (/^5[1-5]/.test(num)) return "Mastercard";
  if (/^3[47]/.test(num)) return "Amex";
  if (/^6(?:011|5)/.test(num)) return "Discover";
  if (/^35(?:2[89]|[3-8])/.test(num)) return "JCB";
  if (/^(?:5[0678]|6304|6767|6309|6370|6759)/.test(num)) return "Maestro";
  return "Card";
}

export default router;

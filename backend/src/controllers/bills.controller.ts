import { Request, Response } from "express";
import { getDatabase } from "../db/connection.js";
import { v4 as uuidv4 } from "uuid";

interface BillRequest extends Request {
  file?: any;
  user?: any;
}

/**
 * Upload a bill with optional file attachment
 * Accepts multipart/form-data with file and bill details
 */
export async function uploadBill(req: BillRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const {
      title,
      category,
      amount,
      description,
      billDate,
      hospitalOrgId: reqHospitalOrgId,
    } = req.body;

    if (!title || !category || !amount || !billDate) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ error: "Invalid amount - must be a positive number" });
      return;
    }

    const parsedBillDate = new Date(billDate);
    if (isNaN(parsedBillDate.getTime())) {
      res.status(400).json({ error: "Invalid billDate - must be a valid date" });
      return;
    }

    const db = await getDatabase();
    const billsCollection = db.collection("bills") as any;

    // Store file reference if file was uploaded
    const documentUrls = [];
    if (req.file) {
      documentUrls.push({
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedAt: new Date(),
      });
    }

    // Look up the user to see if they have a linked hospital
    const usersCollection = db.collection("users") as any;
    const user = await usersCollection.findOne({ _id: req.user.userId });
    
    // Use provided hospitalOrgId, or from user profile, or null
    const finalHospitalOrgId = reqHospitalOrgId || user?.hospitalOrgId || user?.orgId || null;

    const newBill = {
      _id: uuidv4(),
      userId: req.user.userId,
      hospitalOrgId: finalHospitalOrgId,
      title,
      category,
      amount: parsedAmount,
      description: description || null,
      billDate: parsedBillDate,
      documentUrls: documentUrls,
      status: "submitted",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await billsCollection.insertOne(newBill);

    if (result.insertedId) {
      res.status(201).json({
        id: newBill._id,
        userId: newBill.userId,
        hospitalOrgId: newBill.hospitalOrgId,
        title: newBill.title,
        category: newBill.category,
        amount: newBill.amount,
        description: newBill.description,
        billDate: newBill.billDate,
        documentUrls: newBill.documentUrls,
        status: newBill.status,
        createdAt: newBill.createdAt,
        updatedAt: newBill.updatedAt,
      });
    } else {
      throw new Error("Failed to insert bill into database");
    }
  } catch (error) {
    console.error("uploadBill error:", error);
    if (error instanceof Error && (error as any).code === 121) {
      console.error("Validation details:", JSON.stringify((error as any).errInfo, null, 2));
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function createBill(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const {
      title,
      category,
      amount,
      description,
      billDate,
      documentUrls,
      hospitalOrgId,
      patientId,
    } = req.body;

    if (!title || !category || !amount || !billDate) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Validate and parse amount
    const parsedAmount = parseFloat(String(amount).trim());
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ error: "Invalid amount - must be a positive number" });
      return;
    }

    // Validate billDate
    const parsedDate = new Date(billDate);
    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({ error: "Invalid billDate - must be a valid date" });
      return;
    }

    // Determine who the bill belongs to:
    if (req.user.role === "hospital" && !patientId) {
      res.status(400).json({ error: "patientId is required when hospital creates a bill" });
      return;
    }
    const billUserId = req.user.role === "hospital" ? patientId : req.user.userId;

    // Determine hospitalOrgId:
    // If hospital creates it, use their orgId; otherwise use provided hospitalOrgId
    const billHospitalOrgId = req.user.role === "hospital" 
      ? req.user.orgId 
      : (hospitalOrgId || null);

    const db = await getDatabase();
    const billsCollection = db.collection("bills") as any;
    const newBill = {
      _id: uuidv4(),
      userId: billUserId,
      hospitalOrgId: billHospitalOrgId,
      title,
      category,
      amount: parsedAmount,
      description: description || null,
      billDate: parsedDate,
      documentUrls: documentUrls || [],
      status: "submitted",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await billsCollection.insertOne(newBill);

    if (result.insertedId) {
      res.status(201).json({
        id: newBill._id,
        userId: newBill.userId,
        hospitalOrgId: newBill.hospitalOrgId,
        title: newBill.title,
        category: newBill.category,
        amount: newBill.amount,
        description: newBill.description,
        billDate: newBill.billDate,
        documentUrls: newBill.documentUrls,
        status: newBill.status,
        createdAt: newBill.createdAt,
        updatedAt: newBill.updatedAt,
      });
    } else {
      res.status(500).json({ error: "Failed to create bill" });
    }
  } catch (error) {
    console.error("Create bill error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getBillById(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { id } = req.params;
    const db = await getDatabase();
    const billsCollection = db.collection("bills") as any;

    // ✅ FIXED: Issue #4 - Use aggregation pipeline with $lookup instead of separate query
    const billWithClaims = await billsCollection
      .aggregate([
        { $match: { _id: id } },
        {
          $lookup: {
            from: "claims",
            let: { billId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$billId", "$$billId"] },
                      { $eq: ["$insuranceOrgId", req.user.orgId] },
                    ],
                  },
                },
              },
            ],
            as: "insuranceClaims",
          },
        },
      ])
      .toArray();

    if (!billWithClaims.length) {
      res.status(404).json({ error: "Bill not found" });
      return;
    }

    const bill = billWithClaims[0];

    // Authorization check
    const isOwner = bill.userId === req.user.userId;
    const isHospitalStaff =
      req.user.role === "hospital" &&
      bill.hospitalOrgId !== null &&
      bill.hospitalOrgId === req.user.orgId;
    const isInsurance = req.user.role === "insurance" && bill.insuranceClaims?.length > 0;

    if (!isOwner && !isHospitalStaff && !isInsurance) {
      res.status(403).json({ error: "Forbidden - You don't have access to this bill" });
      return;
    }

    res.json({
      id: bill._id,
      userId: bill.userId,
      hospitalOrgId: bill.hospitalOrgId,
      title: bill.title,
      category: bill.category,
      amount: bill.amount,
      description: bill.description,
      billDate: bill.billDate,
      documentUrls: bill.documentUrls,
      status: bill.status,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
    });
  } catch (error) {
    console.error("Get bill error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUserBills(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const db = await getDatabase();
    const billsCollection = db.collection("bills") as any;

    // ✅ FIXED: Issue #9 - Add pagination support
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20)); // Max 100
    const skip = (page - 1) * limit;

    // Get total count
    const total = await billsCollection.countDocuments({ userId: req.user.userId });

    // Fetch paginated results
    const bills = await billsCollection
      .find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    res.json({
      data: bills.map((bill: any) => ({
        id: bill._id,
        userId: bill.userId,
        hospitalOrgId: bill.hospitalOrgId,
        title: bill.title,
        category: bill.category,
        amount: bill.amount,
        description: bill.description,
        billDate: bill.billDate,
        documentUrls: bill.documentUrls,
        status: bill.status,
        createdAt: bill.createdAt,
        updatedAt: bill.updatedAt,
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNextPage: skip + limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get user bills error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Get all bills visible to a hospital.
 * Shows bills created BY this hospital (hospitalOrgId matches)
 * AND all patient-uploaded bills (so hospital can review and claim them).
 */
export async function getHospitalBills(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "hospital") {
      res.status(403).json({ error: "Only hospitals can access this" });
      return;
    }

    const db = await getDatabase();
    const billsCollection = db.collection("bills") as any;

    // Show bills that either:
    // 1. Were created by this hospital (hospitalOrgId matches)
    // 2. Were uploaded by patients and are currently unassigned (hospitalOrgId is null)
    //    so the hospital can review and claim them.
    const bills = await billsCollection
      .find({
        $or: [
          { hospitalOrgId: req.user.orgId },
          { hospitalOrgId: null },
          { hospitalOrgId: "" }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(
      bills.map((bill: any) => ({
        id: bill._id,
        userId: bill.userId,
        hospitalOrgId: bill.hospitalOrgId,
        title: bill.title,
        category: bill.category,
        amount: bill.amount,
        description: bill.description,
        billDate: bill.billDate,
        documentUrls: bill.documentUrls,
        status: bill.status,
        createdAt: bill.createdAt,
        updatedAt: bill.updatedAt,
      }))
    );
  } catch (error) {
    console.error("Get hospital bills error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateBillStatus(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "submitted", "approved", "rejected", "paid", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const db = await getDatabase();
    const billsCollection = db.collection("bills") as any;

    const billToUpdate = await billsCollection.findOne({ _id: id });
    if (!billToUpdate) {
      res.status(404).json({ error: "Bill not found" });
      return;
    }

    const isOwner = billToUpdate.userId === req.user.userId;
    const isHospitalStaff = req.user.role === "hospital" && 
      billToUpdate.hospitalOrgId !== null && billToUpdate.hospitalOrgId === req.user.orgId;
    const isAdmin = req.user.role === "admin";
    
    if (!isOwner && !isHospitalStaff && !isAdmin) {
      res.status(403).json({ error: "Forbidden - You don't have permission to update this bill" });
      return;
    }

    const result = await billsCollection.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      res.status(404).json({ error: "Bill not found" });
      return;
    }

    const bill = result;
    res.json({
      id: bill._id,
      userId: bill.userId,
      hospitalOrgId: bill.hospitalOrgId,
      title: bill.title,
      category: bill.category,
      amount: bill.amount,
      description: bill.description,
      billDate: bill.billDate,
      documentUrls: bill.documentUrls,
      status: bill.status,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
    });
  } catch (error) {
    console.error("Update bill status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * ✅ FIXED: Issue #7 - Delete bill with cascading cleanup
 * Deletes related claims and claim events to prevent orphaned documents
 */
export async function deleteBill(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { id } = req.params;
    const db = await getDatabase();
    const billsCollection = db.collection("bills") as any;

    // Verify bill exists and ownership
    const bill = await billsCollection.findOne({ _id: id });
    if (!bill) {
      res.status(404).json({ error: "Bill not found" });
      return;
    }

    const isOwner = bill.userId === req.user.userId;
    const isHospitalStaff = req.user.role === "hospital" && 
      bill.hospitalOrgId != null && bill.hospitalOrgId === req.user.orgId;

    if (!isOwner && !isHospitalStaff) {
      res.status(403).json({ error: "Forbidden - You don't own this bill" });
      return;
    }

    // Only allow deletion of non-approved bills
    if (!["pending", "submitted", "rejected", "cancelled"].includes(bill.status)) {
      res.status(400).json({
        error: "Can only delete bills in pending, submitted, rejected, or cancelled status",
      });
      return;
    }

    const claimsCollection = db.collection("claims") as any;
    const claimEventsCollection = db.collection("claimEvents") as any;

    // Get all related claims
    const relatedClaims = await claimsCollection.find({ billId: id }).toArray();
    const claimIds = relatedClaims.map((c: any) => c._id);

    // Delete in reverse dependency order
    await claimEventsCollection.deleteMany({ claimId: { $in: claimIds } });
    await claimsCollection.deleteMany({ billId: id });
    await billsCollection.deleteOne({ _id: id });

    res.json({
      message: "Bill and related claims deleted successfully",
      deletedBill: id,
      deletedClaims: claimIds.length,
    });
  } catch (error) {
    console.error("Delete bill error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

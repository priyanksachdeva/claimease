import { Router } from "express";
import * as billsController from "../controllers/bills.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Specific routes MUST come before parameterized routes
router.post("/upload", authenticate, upload.single("file"), billsController.uploadBill);
router.post("/", authenticate, billsController.createBill);

// User & hospital bill listing routes (must be ABOVE /:id)
router.get("/user/my-bills", authenticate, billsController.getUserBills);
router.get(
  "/hospital/bills",
  authenticate,
  requireRole("hospital"),
  billsController.getHospitalBills,
);

// Parameterized routes LAST
router.get("/:id", authenticate, billsController.getBillById);
router.patch("/:id/status", authenticate, billsController.updateBillStatus);

export default router;

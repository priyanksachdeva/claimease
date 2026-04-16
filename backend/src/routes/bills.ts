import { Router } from "express";
import * as billsController from "../controllers/bills.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, billsController.createBill);
router.get("/:id", authenticate, billsController.getBillById);
router.get("/user/my-bills", authenticate, billsController.getUserBills);
router.get(
  "/hospital/bills",
  authenticate,
  requireRole("hospital"),
  billsController.getHospitalBills,
);
router.patch("/:id/status", authenticate, billsController.updateBillStatus);

export default router;

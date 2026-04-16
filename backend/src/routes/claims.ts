import { Router } from "express";
import * as claimsController from "../controllers/claims.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, claimsController.createClaim);
router.get("/:id", authenticate, claimsController.getClaimById);
router.get("/user/my-claims", authenticate, claimsController.getUserClaims);
router.get(
  "/insurance/pending",
  authenticate,
  requireRole("insurance"),
  claimsController.getInsuranceClaims,
);
router.patch(
  "/:id/approve",
  authenticate,
  requireRole("insurance"),
  claimsController.approveClaim,
);
router.patch(
  "/:id/reject",
  authenticate,
  requireRole("insurance"),
  claimsController.rejectClaim,
);
router.get("/:claimId/events", authenticate, claimsController.getClaimEvents);

export default router;

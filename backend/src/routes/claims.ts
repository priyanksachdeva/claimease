import { Router } from "express";
import * as claimsController from "../controllers/claims.controller.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

// Create and get claims
router.post("/", authenticate, claimsController.createClaim);
router.get("/user/my-claims", authenticate, claimsController.getUserClaims);
router.get("/hospital/claims", authenticate, requireRole("hospital"), claimsController.getHospitalClaims);
router.get("/insurance/claims", authenticate, requireRole("insurance"), claimsController.getInsuranceClaims);
router.get("/insurance/pending", authenticate, requireRole("insurance"), claimsController.getInsuranceClaims);

// Claim actions
router.patch("/:id/approve", authenticate, requireRole("insurance"), claimsController.approveClaim);
router.patch("/:id/reject", authenticate, requireRole("insurance"), claimsController.rejectClaim);

// Get claim details and events
router.get("/:claimId/events", authenticate, claimsController.getClaimEvents);
router.get("/:id", authenticate, claimsController.getClaimById);

export default router;

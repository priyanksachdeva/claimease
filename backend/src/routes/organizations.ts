import { Router } from "express";
import * as organizationsController from "../controllers/organizations.controller.js";

const router = Router();

// Public routes - Organization registration
router.post("/register/hospital", organizationsController.registerHospital);
router.post("/register/insurance", organizationsController.registerInsurance);

// Public routes - Organization lookup (specific routes before parameterized routes)
router.get("/registration/:registrationNumber", organizationsController.getOrganizationByRegistration);
router.get("/hospitals", organizationsController.getHospitals);
router.get("/insurance", organizationsController.getInsuranceCompanies);
router.get("/", organizationsController.getAllOrganizations);
router.get("/:id", organizationsController.getOrganizationById);

export default router;

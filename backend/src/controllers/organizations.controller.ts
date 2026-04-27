import { Request, Response } from "express";
import { OrganizationService } from "../services/organization.service.js";
import { AuthService } from "../services/auth.service.js";
import { generateToken } from "../utils/jwt.js";

/**
 * Register a new hospital organization
 */
export async function registerHospital(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const {
      hospitalName,
      registrationNumber,
      address,
      city,
      state,
      country,
      postalCode,
      phone,
      email,
      website,
      logoUrl,
      adminEmail,
      adminPassword,
      adminFirstName,
      adminLastName,
      adminPhone,
    } = req.body;

    // Validate required fields
    if (
      !hospitalName ||
      !registrationNumber ||
      !address ||
      !city ||
      !state ||
      !country ||
      !postalCode ||
      !phone ||
      !email ||
      !adminEmail ||
      !adminPassword ||
      !adminFirstName ||
      !adminLastName
    ) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Check if registration number already exists
    const existingOrg = await OrganizationService.getOrganizationByRegistration(
      registrationNumber
    );
    if (existingOrg) {
      res.status(409).json({
        error: "Hospital with this registration number already exists",
      });
      return;
    }

    // Check if admin email already exists
    const existingAdmin = await AuthService.getUserByEmail(adminEmail);
    if (existingAdmin) {
      res.status(409).json({ error: "Admin email already exists" });
      return;
    }

    // Create hospital organization
    const hospital = await OrganizationService.createOrganization(
      hospitalName,
      "hospital",
      registrationNumber,
      address,
      city,
      state,
      country,
      postalCode,
      phone,
      email,
      website,
      logoUrl
    );

    if (!hospital) {
      res.status(500).json({ error: "Failed to create hospital" });
      return;
    }

    // Create admin user for the hospital
    const adminUser = await AuthService.createUser(
      adminEmail,
      adminPassword,
      adminFirstName,
      adminLastName,
      "hospital",
      hospital.id,
      adminPhone
    );

    if (!adminUser) {
      res.status(500).json({ error: "Failed to create admin user" });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      orgId: adminUser.orgId,
    });

    res.status(201).json({
      organization: {
        id: hospital.id,
        name: hospital.name,
        type: hospital.type,
        registrationNumber: hospital.registrationNumber,
        address: hospital.address,
        city: hospital.city,
        state: hospital.state,
        country: hospital.country,
        phone: hospital.phone,
        email: hospital.email,
        website: hospital.website,
        isActive: hospital.isActive,
      },
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Register hospital error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Register a new insurance company organization
 */
export async function registerInsurance(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const {
      insuranceName,
      registrationNumber,
      address,
      city,
      state,
      country,
      postalCode,
      phone,
      email,
      website,
      logoUrl,
      adminEmail,
      adminPassword,
      adminFirstName,
      adminLastName,
      adminPhone,
    } = req.body;

    // Validate required fields
    if (
      !insuranceName ||
      !registrationNumber ||
      !address ||
      !city ||
      !state ||
      !country ||
      !postalCode ||
      !phone ||
      !email ||
      !adminEmail ||
      !adminPassword ||
      !adminFirstName ||
      !adminLastName
    ) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Check if registration number already exists
    const existingOrg = await OrganizationService.getOrganizationByRegistration(
      registrationNumber
    );
    if (existingOrg) {
      res.status(409).json({
        error: "Insurance company with this registration number already exists",
      });
      return;
    }

    // Check if admin email already exists
    const existingAdmin = await AuthService.getUserByEmail(adminEmail);
    if (existingAdmin) {
      res.status(409).json({ error: "Admin email already exists" });
      return;
    }

    // Create insurance organization
    const insurance = await OrganizationService.createOrganization(
      insuranceName,
      "insurance",
      registrationNumber,
      address,
      city,
      state,
      country,
      postalCode,
      phone,
      email,
      website,
      logoUrl
    );

    if (!insurance) {
      res.status(500).json({ error: "Failed to create insurance company" });
      return;
    }

    // Create admin user for the insurance
    const adminUser = await AuthService.createUser(
      adminEmail,
      adminPassword,
      adminFirstName,
      adminLastName,
      "insurance",
      insurance.id,
      adminPhone
    );

    if (!adminUser) {
      res.status(500).json({ error: "Failed to create admin user" });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      orgId: adminUser.orgId,
    });

    res.status(201).json({
      organization: {
        id: insurance.id,
        name: insurance.name,
        type: insurance.type,
        registrationNumber: insurance.registrationNumber,
        address: insurance.address,
        city: insurance.city,
        state: insurance.state,
        country: insurance.country,
        phone: insurance.phone,
        email: insurance.email,
        website: insurance.website,
        isActive: insurance.isActive,
      },
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Register insurance error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Get all organizations (with optional type filter)
 */
export async function getAllOrganizations(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { type } = req.query;
    const orgs = await OrganizationService.getAllOrganizations(
      type as "hospital" | "insurance" | undefined
    );

    res.json({ organizations: orgs, count: orgs.length });
  } catch (error) {
    console.error("Get organizations error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: "Organization ID is required" });
      return;
    }

    const org = await OrganizationService.getOrganizationById(id);

    if (!org) {
      res.status(404).json({ error: "Organization not found" });
      return;
    }

    res.json(org);
  } catch (error) {
    console.error("Get organization error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Get organization by registration number
 */
export async function getOrganizationByRegistration(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { registrationNumber } = req.params;

    if (!registrationNumber) {
      res.status(400).json({ error: "Registration number is required" });
      return;
    }

    const org =
      await OrganizationService.getOrganizationByRegistration(
        registrationNumber
      );

    if (!org) {
      res.status(404).json({ error: "Organization not found" });
      return;
    }

    res.json(org);
  } catch (error) {
    console.error("Get organization error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Get hospitals only
 */
export async function getHospitals(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const hospitals = await OrganizationService.getAllOrganizations(
      "hospital"
    );
    res.json({ organizations: hospitals, count: hospitals.length });
  } catch (error) {
    console.error("Get hospitals error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Get insurance companies only
 */
export async function getInsuranceCompanies(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const insurances = await OrganizationService.getAllOrganizations(
      "insurance"
    );
    res.json({ organizations: insurances, count: insurances.length });
  } catch (error) {
    console.error("Get insurance companies error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

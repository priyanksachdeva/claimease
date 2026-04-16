import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./db/migrations.js";
import { OrganizationService } from "./services/organization.service.js";
import { AuthService } from "./services/auth.service.js";

// Routes
import authRoutes from "./routes/auth.js";
import billsRoutes from "./routes/bills.js";
import claimsRoutes from "./routes/claims.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/bills", billsRoutes);
app.use("/api/claims", claimsRoutes);

// Basic API info
app.get("/api", (req, res) => {
  res.json({
    name: "ClaimEase API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      bills: "/api/bills",
      claims: "/api/claims",
    },
  });
});

async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();

    // Seed demo data if needed
    await seedDemoData();

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`API documentation: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

async function seedDemoData() {
  try {
    // Check if demo insurance already exists
    const demoInsuranceId =
      process.env.DEMO_INSURANCE_ID || "demo-insurance-001";

    const existingInsurance =
      await OrganizationService.getOrganizationById(demoInsuranceId);
    if (existingInsurance) {
      console.log("✅ Demo data already seeded");
      return;
    }

    console.log("🌱 Seeding demo data...");

    // Create demo insurance company
    const insurance = await OrganizationService.createOrganization(
      process.env.DEMO_INSURANCE_NAME || "HealthCare Plus Insurance",
      "insurance",
      "INSUR-2024-001",
      "123 Insurance Boulevard",
      "New York",
      "NY",
      "USA",
      "10001",
      "+1-800-INSURANCE",
      "contact@healthcareplus.com",
      "https://healthcareplus.com",
      "https://via.placeholder.com/200?text=HealthCare+Plus",
    );

    // Create demo hospital
    const hospital = await OrganizationService.createOrganization(
      process.env.DEMO_HOSPITAL_NAME || "City Medical Center",
      "hospital",
      "HOSP-2024-001",
      "456 Hospital Lane",
      "New York",
      "NY",
      "USA",
      "10002",
      "+1-212-HOSPITAL",
      "contact@cityhospital.com",
      "https://cityhospital.com",
      "https://via.placeholder.com/200?text=City+Medical",
    );

    // Create demo hospital admin user
    if (hospital) {
      await AuthService.createUser(
        "admin@cityhospital.com",
        "hospital123",
        "John",
        "Doe",
        "hospital",
        hospital.id,
      );
    }

    // Create demo insurance admin user
    if (insurance) {
      await AuthService.createUser(
        "admin@healthcareplus.com",
        "insurance123",
        "Jane",
        "Smith",
        "insurance",
        insurance.id,
      );
    }

    // Create demo patient
    await AuthService.createUser(
      "patient@example.com",
      "patient123",
      "Aarav",
      "Sharma",
      "patient",
    );

    console.log("✅ Demo data seeded successfully");
    console.log("\nDemo Credentials:");
    console.log("Patient: patient@example.com / patient123");
    console.log("Hospital Admin: admin@cityhospital.com / hospital123");
    console.log("Insurance Admin: admin@healthcareplus.com / insurance123");
  } catch (error) {
    console.error("⚠️ Demo data seeding skipped:", error);
  }
}

startServer();

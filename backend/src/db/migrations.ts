import { connectDatabase } from "./connection.js";
import { v4 as uuidv4 } from "uuid";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { logger, sanitizeError } from "../utils/logger.js";

const USERS_SCHEMA = {
  bsonType: "object",
  additionalProperties: true,
  required: ["email", "passwordHash", "firstName", "lastName", "role"],
  properties: {
    _id: { bsonType: "string" },
    email: { bsonType: "string" },
    passwordHash: { bsonType: "string" },
    firstName: { bsonType: "string" },
    lastName: { bsonType: "string" },
    phone: { bsonType: ["string", "null"] },
    role: { enum: ["patient", "hospital", "insurance"] },
    orgId: { bsonType: ["string", "null"] },
    policyNumber: { bsonType: ["string", "null"] },
    isActive: { bsonType: "bool" },
    createdAt: { bsonType: "date" },
    updatedAt: { bsonType: "date" },
  },
};

const ORGANIZATIONS_SCHEMA = {
  bsonType: "object",
  additionalProperties: true,
  required: ["name", "type", "registrationNumber"],
  properties: {
    _id: { bsonType: "string" },
    name: { bsonType: "string" },
    type: { bsonType: "string" },
    registrationNumber: { bsonType: "string" },
    address: { bsonType: ["string", "null"] },
    city: { bsonType: ["string", "null"] },
    state: { bsonType: ["string", "null"] },
    country: { bsonType: ["string", "null"] },
    postalCode: { bsonType: ["string", "null"] },
    phone: { bsonType: ["string", "null"] },
    email: { bsonType: ["string", "null"] },
    website: { bsonType: ["string", "null"] },
    logoUrl: { bsonType: ["string", "null"] },
    isActive: { bsonType: "bool" },
    createdAt: { bsonType: "date" },
    updatedAt: { bsonType: "date" },
  },
};

export async function initializeDatabase() {
  try {
    const db = await connectDatabase();
    logger.info("✅ Database connected");

    // Run migrations
    await runMigrations(db);
  } catch (error) {
    logger.error("❌ Database initialization failed:", sanitizeError(error));
    process.exit(1);
  }
}

async function runMigrations(db: any) {
  try {
    // Create collections with validation schema
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c: any) => c.name);

    // Users collection
    if (!collectionNames.includes("users")) {
      await db.createCollection("users", {
        validator: { $jsonSchema: USERS_SCHEMA },
      });
      logger.info("✅ Created users collection");
    } else {
      try {
        await db.command({
          collMod: "users",
          validator: { $jsonSchema: USERS_SCHEMA },
        });
        logger.info("✅ Updated users collection validator");
      } catch (e) {
        logger.error("❌ Could not update users collection validator:", sanitizeError(e));
      }
    }

    // Organizations collection
    if (!collectionNames.includes("organizations")) {
      await db.createCollection("organizations", {
        validator: { $jsonSchema: ORGANIZATIONS_SCHEMA },
      });
      logger.info("✅ Created organizations collection");
    } else {
      try {
        await db.command({
          collMod: "organizations",
          validator: { $jsonSchema: ORGANIZATIONS_SCHEMA },
        });
        logger.info("✅ Updated organizations collection validator");
      } catch (e) {
        logger.error("❌ Could not update organizations collection validator:", sanitizeError(e));
      }
    }


    // Bills collection
    if (!collectionNames.includes("bills")) {
      await db.createCollection("bills", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: [
              "userId",
              "hospitalOrgId",
              "title",
              "category",
              "amount",
              "billDate",
              "status",
            ],
            properties: {
              _id: { bsonType: "string" },
              userId: { bsonType: "string" },
              hospitalOrgId: { bsonType: ["string", "null"] },
              title: { bsonType: "string" },
              category: {
                enum: ["consultation", "surgery", "medication", "tests", "imaging", "other"],
              },
              amount: { bsonType: "number" },
              description: { bsonType: ["string", "null"] },
              billDate: { bsonType: "date" },
              documentUrls: { bsonType: "array" },
              status: { enum: ["pending", "submitted", "approved", "rejected", "paid", "cancelled"] },
              createdAt: { bsonType: "date" },
              updatedAt: { bsonType: "date" },
            },
          },
        },
      });
      logger.info("✅ Created bills collection");
    }

    // Claims collection
    if (!collectionNames.includes("claims")) {
      await db.createCollection("claims", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: [
              "billId",
              "userId",
              "insuranceOrgId",
              "hospitalOrgId",
              "claimNumber",
              "totalAmount",
              "status",
            ],
            properties: {
              _id: { bsonType: "string" },
              billId: { bsonType: "string" },
              userId: { bsonType: "string" },
              insuranceOrgId: { bsonType: "string" },
              hospitalOrgId: { bsonType: ["string", "null"] },
              claimNumber: { bsonType: "string" },
              totalAmount: { bsonType: "number" },
              status: {
                enum: [
                  "submitted",
                  "verification",
                  "processing",
                  "approved",
                  "rejected",
                ],
              },
              submittedAt: { bsonType: "date" },
              verifiedAt: { bsonType: ["date", "null"] },
              approvedAt: { bsonType: ["date", "null"] },
              rejectedAt: { bsonType: ["date", "null"] },
              rejectionReason: { bsonType: ["string", "null"] },
              createdAt: { bsonType: "date" },
              updatedAt: { bsonType: "date" },
            },
          },
        },
      });
      logger.info("✅ Created claims collection");
    }

    // Claim Events collection
    if (!collectionNames.includes("claimEvents")) {
      await db.createCollection("claimEvents", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["claimId", "status", "createdBy"],
            properties: {
              _id: { bsonType: "string" },
              claimId: { bsonType: "string" },
              status: { bsonType: "string" },
              notes: { bsonType: ["string", "null"] },
              createdBy: { bsonType: "string" },
              createdAt: { bsonType: "date" },
            },
          },
        },
      });
      logger.info("✅ Created claimEvents collection");
    }

    // Create indexes
    const usersCollection = db.collection("users");
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ orgId: 1 });
    await usersCollection.createIndex({ role: 1 });

    const orgsCollection = db.collection("organizations");
    await orgsCollection.createIndex({ registrationNumber: 1 }, { unique: true });

    const billsCollection = db.collection("bills");
    await billsCollection.createIndex({ userId: 1 });
    await billsCollection.createIndex({ hospitalOrgId: 1 });
    await billsCollection.createIndex({ status: 1 });

    const claimsCollection = db.collection("claims");
    await claimsCollection.createIndex({ claimNumber: 1 }, { unique: true });
    await claimsCollection.createIndex({ insuranceOrgId: 1 });
    await claimsCollection.createIndex({ hospitalOrgId: 1 });

    logger.info("✅ All indexes created successfully");

    // Seed demo data
    if (process.env.SEED_DEMO_DATA === "true") {
      await seedDemoData(db);
    }

    logger.info("✅ All migrations completed successfully");
  } catch (error) {
    logger.error("❌ Migration error:", sanitizeError(error));
    throw error;
  }
}

function generateSecurePassword() {
  return crypto.randomBytes(16).toString("hex");
}

async function seedDemoData(db: any) {
  try {
    logger.info("🌱 Seeding demo data...");

    const orgsCollection = db.collection("organizations");
    const usersCollection = db.collection("users");

    // Idempotent Organization Seeding
    const hospitalOrgData = {
      name: "City Medical Center",
      type: "hospital",
      registrationNumber: "HOSP-001",
      address: "123 Medical Avenue",
      city: "New Delhi",
      isActive: true,
      updatedAt: new Date(),
    };

    const insuranceOrgData = {
      name: "HealthCare Plus Insurance",
      type: "insurance",
      registrationNumber: "INS-001",
      address: "456 Insurance Plaza",
      city: "Mumbai",
      isActive: true,
      updatedAt: new Date(),
    };

    await orgsCollection.updateOne(
      { registrationNumber: "HOSP-001" },
      { $setOnInsert: { _id: uuidv4(), createdAt: new Date() }, $set: hospitalOrgData },
      { upsert: true }
    );

    await orgsCollection.updateOne(
      { registrationNumber: "INS-001" },
      { $setOnInsert: { _id: uuidv4(), createdAt: new Date() }, $set: insuranceOrgData },
      { upsert: true }
    );

    const hospitalOrg = await orgsCollection.findOne({ registrationNumber: "HOSP-001" });
    const insuranceOrg = await orgsCollection.findOne({ registrationNumber: "INS-001" });

    // Idempotent User Seeding
    const seedUser = async (email: string, role: string, firstName: string, lastName: string, orgId: string | null, envPasswordKey: string) => {
      let password = process.env[envPasswordKey];
      if (!password) {
        password = generateSecurePassword();
        logger.warn(`⚠️  No password found for ${email} in environment. Generated secure password: ${password}`);
      }

      const passwordHash = await bcryptjs.hash(password, 10);
      const userData = {
        email,
        passwordHash,
        firstName,
        lastName,
        role,
        orgId,
        isActive: true,
        updatedAt: new Date(),
      };

      await usersCollection.updateOne(
        { email },
        { $setOnInsert: { _id: uuidv4(), createdAt: new Date() }, $set: userData },
        { upsert: true }
      );
    };

    await seedUser("patient@example.com", "patient", "Aarav", "Sharma", null, "DEMO_PATIENT_PASSWORD");
    await seedUser("admin@cityhospital.com", "hospital", "Dr.", "Kumar", hospitalOrg._id, "DEMO_HOSPITAL_PASSWORD");
    await seedUser("admin@healthcareplus.com", "insurance", "Priya", "Singh", insuranceOrg._id, "DEMO_INSURANCE_PASSWORD");

    logger.info("✅ Demo data seeded successfully");
  } catch (error) {
    logger.error("❌ Seed data error:", sanitizeError(error));
  }
}

export default initializeDatabase;


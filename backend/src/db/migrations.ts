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
    email: {
      bsonType: "string",
      // ✅ FIXED: Email validation pattern - Issue #5
      pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    },
    passwordHash: {
      bsonType: "string",
      // ✅ FIXED: bcrypt hash validation - Issue #5
      minLength: 60,
    },
    firstName: {
      bsonType: "string",
      // ✅ FIXED: Name length constraints - Issue #5
      minLength: 1,
      maxLength: 100,
    },
    lastName: {
      bsonType: "string",
      minLength: 1,
      maxLength: 100,
    },
    phone: {
      bsonType: ["string", "null"],
      // ✅ FIXED: Phone validation pattern - Issue #5
      pattern: "^[0-9+\\-\\s()]{10,}$",
    },
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
    name: {
      bsonType: "string",
      // ✅ FIXED: Name length constraints - Issue #5
      minLength: 1,
      maxLength: 255,
    },
    type: { bsonType: "string" },
    registrationNumber: {
      bsonType: "string",
      // ✅ FIXED: Registration number validation - Issue #5
      minLength: 3,
      maxLength: 50,
      pattern: "^[A-Z0-9\\-]{3,50}$",
    },
    address: { bsonType: ["string", "null"] },
    city: { bsonType: ["string", "null"] },
    state: { bsonType: ["string", "null"] },
    country: { bsonType: ["string", "null"] },
    postalCode: {
      bsonType: ["string", "null"],
      // ✅ FIXED: Indian postal code validation - Issue #5
      pattern: "^[0-9]{5,6}$",
    },
    phone: {
      bsonType: ["string", "null"],
      pattern: "^[0-9+\\-\\s()]{10,}$",
    },
    email: {
      bsonType: ["string", "null"],
      pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    },
    website: { bsonType: ["string", "null"] },
    logoUrl: { bsonType: ["string", "null"] },
    isActive: { bsonType: "bool" },
    createdAt: { bsonType: "date" },
    updatedAt: { bsonType: "date" },
  },
};

const BILLS_SCHEMA = {
  bsonType: "object",
  required: [
    "userId",
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
    title: {
      bsonType: "string",
      // ✅ FIXED: Title validation constraints - Issue #5
      minLength: 1,
      maxLength: 255,
      pattern: "^(?!\\s*$).+", // No whitespace-only strings
    },
    category: {
      bsonType: "string",
      enum: ["consultation", "surgery", "medication", "tests", "imaging", "other"],
    },
    amount: {
      bsonType: "number",
      // ✅ FIXED: Amount validation constraints - Issue #5
      minimum: 0.01,
      maximum: 10000000, // ₹1 crore max
      exclusiveMinimum: false,
    },
    description: {
      bsonType: ["string", "null"],
      // ✅ FIXED: Description max length - Issue #5
      maxLength: 2000,
    },
    billDate: { bsonType: "date" },
    documentUrls: {
      bsonType: "array",
      // ✅ FIXED: Document URL limits - Issue #5
      minItems: 0,
      maxItems: 10,
    },
    status: {
      bsonType: "string",
      enum: ["pending", "submitted", "approved", "rejected", "paid", "cancelled"],
    },
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
          $jsonSchema: BILLS_SCHEMA,
        },
      });
      logger.info("✅ Created bills collection");
    } else {
      // Update validator for existing bills collection
      try {
        await db.command({
          collMod: "bills",
          validator: { $jsonSchema: BILLS_SCHEMA },
        });
        logger.info("✅ Updated bills collection validator");
      } catch (e) {
        logger.error("❌ Could not update bills collection validator:", sanitizeError(e));
      }
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
                bsonType: "string",
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
              status: {
                bsonType: "string",
                enum: [
                  "submitted",
                  "verification",
                  "processing",
                  "approved",
                  "rejected",
                ],
              },
              notes: { bsonType: ["string", "null"] },
              createdBy: { bsonType: "string" },
              createdAt: { bsonType: "date" },
              updatedAt: { bsonType: "date" },
            },
          },
        },
      });
      logger.info("✅ Created claimEvents collection");
    }

    // ✅ FIXED: Notifications collection - Issue #3: Missing collection schemas
    if (!collectionNames.includes("notifications")) {
      await db.createCollection("notifications", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["userId", "type", "title", "message"],
            properties: {
              _id: { bsonType: "string" },
              userId: { bsonType: "string" },
              type: { bsonType: "string" },
              title: { bsonType: "string" },
              message: { bsonType: "string" },
              isRead: { bsonType: "bool" },
              relatedId: { bsonType: ["string", "null"] },
              createdAt: { bsonType: "date" },
              updatedAt: { bsonType: "date" },
            },
          },
        },
      });
      logger.info("✅ Created notifications collection");
    }

    // ✅ FIXED: Messages collection - Issue #3: Missing collection schemas
    if (!collectionNames.includes("messages")) {
      await db.createCollection("messages", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["conversationId", "senderId", "content"],
            properties: {
              _id: { bsonType: "string" },
              conversationId: { bsonType: "string" },
              senderId: { bsonType: "string" },
              senderName: { bsonType: "string" },
              content: { bsonType: "string" },
              attachments: {
                bsonType: "array",
                items: { bsonType: "object" },
              },
              isRead: { bsonType: "bool" },
              readAt: { bsonType: ["date", "null"] },
              createdAt: { bsonType: "date" },
              updatedAt: { bsonType: "date" },
            },
          },
        },
      });
      logger.info("✅ Created messages collection");
    }

    // ✅ FIXED: Conversations collection - Issue #3: Missing collection schemas
    if (!collectionNames.includes("conversations")) {
      await db.createCollection("conversations", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["participants", "subject"],
            properties: {
              _id: { bsonType: "string" },
              participants: {
                bsonType: "array",
                items: { bsonType: "string" },
              },
              subject: { bsonType: "string" },
              lastMessage: { bsonType: ["string", "null"] },
              lastMessageAt: { bsonType: ["date", "null"] },
              lastMessageSenderId: { bsonType: ["string", "null"] },
              isActive: { bsonType: "bool" },
              createdAt: { bsonType: "date" },
              updatedAt: { bsonType: "date" },
            },
          },
        },
      });
      logger.info("✅ Created conversations collection");
    }

    // Create indexes
    const usersCollection = db.collection("users");
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ orgId: 1 });
    await usersCollection.createIndex({ role: 1 });
    await usersCollection.createIndex({ role: 1, orgId: 1 }); // Compound index for better query performance

    const orgsCollection = db.collection("organizations");
    await orgsCollection.createIndex({ registrationNumber: 1 }, { unique: true });
    await orgsCollection.createIndex({ type: 1 }); // Index for finding hospitals/insurance companies

    const billsCollection = db.collection("bills");
    await billsCollection.createIndex({ userId: 1 });
    await billsCollection.createIndex({ hospitalOrgId: 1 });
    await billsCollection.createIndex({ status: 1 });
    await billsCollection.createIndex({ hospitalOrgId: 1, createdAt: -1 }); // Compound index for hospital bills query
    await billsCollection.createIndex({ userId: 1, createdAt: -1 }); // Compound index for user bills query

    const claimsCollection = db.collection("claims");
    await claimsCollection.createIndex({ claimNumber: 1 }, { unique: true });
    await claimsCollection.createIndex({ insuranceOrgId: 1 });
    await claimsCollection.createIndex({ hospitalOrgId: 1 });
    await claimsCollection.createIndex({ userId: 1 }); // Index for fetching user's claims
    await claimsCollection.createIndex({ billId: 1 }); // Index for finding claim by bill

    // ✅ FIXED: Add indexes for new collections - Issue #8: Missing compound indexes
    const notificationsCollection = db.collection("notifications");
    await notificationsCollection.createIndex({ userId: 1 });
    await notificationsCollection.createIndex({ userId: 1, isRead: 1 }); // Compound index for unread notifications
    await notificationsCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // TTL index - 30 days

    const messagesCollection = db.collection("messages");
    await messagesCollection.createIndex({ conversationId: 1 });
    await messagesCollection.createIndex({ senderId: 1 });
    await messagesCollection.createIndex({ conversationId: 1, createdAt: -1 }); // Compound index for retrieving messages in order
    await messagesCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 15552000 }); // TTL index - 6 months

    const conversationsCollection = db.collection("conversations");
    await conversationsCollection.createIndex({ participants: 1 });
    await conversationsCollection.createIndex({ lastMessageAt: -1 }); // Index for sorting conversations by last message
    await conversationsCollection.createIndex({ isActive: 1 }); // Index for filtering active conversations

    const claimEventsCollection = db.collection("claimEvents");
    await claimEventsCollection.createIndex({ claimId: 1 });
    await claimEventsCollection.createIndex({ claimId: 1, createdAt: -1 }); // Compound index for getting claim timeline

    // ✅ FIXED: Issue #14 - Add indexes for audit logs for efficient querying
    const auditLogsCollection = db.collection("auditLogs");
    await auditLogsCollection.createIndex({ userId: 1, timestamp: -1 }); // For querying user audit trail
    await auditLogsCollection.createIndex({ entityType: 1, entityId: 1 }); // For querying entity history
    await auditLogsCollection.createIndex({ timestamp: 1 }, { expireAfterSeconds: 63072000 }); // TTL: 2 years

    // ✅ FIXED: Issue #13 - Migrations table for tracking seeded versions
    if (!collectionNames.includes("migrations")) {
      await db.createCollection("migrations", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["version", "name", "appliedAt"],
            properties: {
              version: { bsonType: "int" },
              name: { bsonType: "string" },
              appliedAt: { bsonType: "date" },
              description: { bsonType: "string" },
            },
          },
        },
      });
      logger.info("✅ Created migrations collection");
    }

    // ✅ FIXED: Issue #14 - Audit logs collection for compliance and change tracking
    if (!collectionNames.includes("auditLogs")) {
      await db.createCollection("auditLogs", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["userId", "action", "entityType", "entityId", "timestamp"],
            properties: {
              _id: { bsonType: "string" },
              userId: { bsonType: "string" },
              action: {
                bsonType: "string",
                enum: ["CREATE", "UPDATE", "DELETE"],
              },
              entityType: {
                bsonType: "string",
                enum: ["bill", "claim", "user", "organization", "message"],
              },
              entityId: { bsonType: "string" },
              oldValues: { bsonType: "object" },
              newValues: { bsonType: "object" },
              timestamp: { bsonType: "date" },
              ipAddress: { bsonType: ["string", "null"] },
            },
          },
        },
      });
      logger.info("✅ Created auditLogs collection");
    } else {
      try {
        await db.command({
          collMod: "auditLogs",
          validator: {
            $jsonSchema: {
              bsonType: "object",
              required: ["userId", "action", "entityType", "entityId", "timestamp"],
              properties: {
                _id: { bsonType: "string" },
                userId: { bsonType: "string" },
                action: {
                  bsonType: "string",
                  enum: ["CREATE", "UPDATE", "DELETE"],
                },
                entityType: {
                  bsonType: "string",
                  enum: ["bill", "claim", "user", "organization", "message"],
                },
                entityId: { bsonType: "string" },
                oldValues: { bsonType: "object" },
                newValues: { bsonType: "object" },
                timestamp: { bsonType: "date" },
                ipAddress: { bsonType: ["string", "null"] },
              },
            },
          },
        });
        logger.info("✅ Updated auditLogs collection validator");
      } catch (e) {
        logger.warn("⚠️  Could not update auditLogs validator (may already exist):", sanitizeError(e));
      }
    }

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

    // ✅ FIXED: Issue #13 - Check if demo data v1 has already been seeded
    const migrationsCollection = db.collection("migrations");
    const demoDataV1Applied = await migrationsCollection.findOne({
      name: "seed_demo_data_v1",
    });

    if (demoDataV1Applied) {
      logger.info("⏭️  Demo data v1 already seeded, skipping");
      return;
    }

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

    // ✅ FIXED: Track that this migration has been applied
    await migrationsCollection.insertOne({
      version: 1,
      name: "seed_demo_data_v1",
      appliedAt: new Date(),
      description: "Initial demo data seeding with patient, hospital, and insurance users",
    });

    logger.info("✅ Demo data seeded successfully");
  } catch (error) {
    logger.error("❌ Seed data error:", sanitizeError(error));
  }
}

export default initializeDatabase;


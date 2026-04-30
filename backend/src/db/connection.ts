import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/claimease";
// Derive DB name from URI or use MONGODB_DB env var
const parsedPathname = new URL(MONGODB_URI).pathname.replace(/^\//, "");
const MONGODB_DB = parsedPathname || process.env.MONGODB_DB || "claimease";

let mongoClient: MongoClient | null = null;
let db: Db | null = null;
let connectionPromise: Promise<Db> | null = null;

const mongoOptions = {
  connectTimeoutMS: parseInt(process.env.MONGO_CONNECT_TIMEOUT_MS || "10000"),
  socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT_MS || "45000"),
  maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || "10"),
  minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE || "2"),
  serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || "5000"),
};

export async function connectDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  // ✅ FIXED: Added retry logic with exponential backoff
  connectionPromise = retryConnection(3, 1000);
  return connectionPromise;
}

async function retryConnection(attemptsLeft: number, delayMs: number): Promise<Db> {
  let localClient: MongoClient | null = null;
  try {
    localClient = new MongoClient(MONGODB_URI, mongoOptions);
    await localClient.connect();
    mongoClient = localClient;
    db = mongoClient.db(MONGODB_DB);
    console.log(`✅ MongoDB connected successfully to database: ${MONGODB_DB}`);
    return db;
  } catch (error) {
    if (localClient) {
      await localClient.close().catch(() => {});
    }
    if (attemptsLeft <= 0) {
      console.error("❌ MongoDB connection failed after retries:", error);
      connectionPromise = null;
      throw error;
    }

    console.warn(
      `⚠️  MongoDB connection failed, retrying in ${delayMs}ms (${attemptsLeft} attempts left)`,
      error instanceof Error ? error.message : String(error)
    );

    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return retryConnection(attemptsLeft - 1, delayMs * 1.5); // Exponential backoff
  }
}

export async function getDatabase(): Promise<Db> {
  if (!db) {
    return connectDatabase();
  }
  return db;
}

/**
 * ✅ FIXED: Get MongoClient for transaction support
 * Issue #2: No transaction support for multi-document operations
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (!mongoClient) {
    await connectDatabase();
  }
  if (!mongoClient) {
    throw new Error("Failed to initialize MongoDB client");
  }
  return mongoClient;
}

export async function closeDatabase(): Promise<void> {
  try {
    if (mongoClient) {
      await mongoClient.close();
      console.log("✅ MongoDB connection closed");
    }
  } catch (error) {
    console.error("❌ Error while closing MongoDB connection:", error);
  } finally {
    mongoClient = null;
    db = null;
    connectionPromise = null;
  }
}

export default { connectDatabase, getDatabase, closeDatabase };


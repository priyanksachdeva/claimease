import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/claimease";
// Derive DB name from URI or use MONGODB_DB env var
const MONGODB_DB = process.env.MONGODB_DB || (MONGODB_URI.split("/").pop()?.split("?")[0]) || "claimease";

let mongoClient: MongoClient | null = null;
let db: Db | null = null;
let connectionPromise: Promise<Db> | null = null;

const mongoOptions = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
};

export async function connectDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  // Prevent concurrent connection attempts
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      mongoClient = new MongoClient(MONGODB_URI, mongoOptions);
      await mongoClient.connect();
      db = mongoClient.db(MONGODB_DB);
      console.log(`✅ MongoDB connected successfully to database: ${MONGODB_DB}`);
      return db;
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error);
      connectionPromise = null;
      throw error;
    }
  })();

  return connectionPromise;
}

export async function getDatabase(): Promise<Db> {
  if (!db) {
    return connectDatabase();
  }
  return db;
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


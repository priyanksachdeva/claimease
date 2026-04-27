import { getDatabase } from "../db/connection.js";
import { User } from "../types/index.js";
import { hashPassword, comparePasswords } from "../utils/password.js";
import { v4 as uuidv4 } from "uuid";
import { logger, sanitizeError } from "../utils/logger.js";

export class AuthService {
  static async createUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: "patient" | "hospital" | "insurance",
    orgId?: string,
    phone?: string,
  ): Promise<User | null> {
    try {
      const db = await getDatabase();
      
      // Check if user already exists
      const existingUser = await (db.collection("users") as any).findOne({ email });
      if (existingUser) {
        throw new Error("Email already in use");
      }

      const hashedPassword = await hashPassword(password);

      const newUser = {
        _id: uuidv4(),
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        phone: phone || "",
        role,
        orgId: orgId || null,
        policyNumber: "", // Initialized as empty
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await (db.collection("users") as any).insertOne(newUser);

      if (result.insertedId) {
        return {
          id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phone: newUser.phone,
          role: newUser.role,
          orgId: newUser.orgId,
          policyNumber: newUser.policyNumber,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        } as any;
      }

      return null;
    } catch (error) {
      logger.error("Error creating user:", sanitizeError(error));
      throw error; // Rethrow to allow controller to handle validation error
    }
  }

  static async getUserByEmail(email: string): Promise<any | null> {
    try {
      const db = await getDatabase();
      const user = await (db.collection("users") as any).findOne({ email });

      if (user) {
        return {
          id: user._id,
          email: user.email,
          passwordHash: user.passwordHash,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          orgId: user.orgId,
          policyNumber: user.policyNumber || "",
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      }

      return null;
    } catch (error) {
      logger.error("Error getting user by email:", sanitizeError(error));
      return null;
    }
  }

  static async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return comparePasswords(plainPassword, hashedPassword);
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      const db = await getDatabase();
      const user = await (db.collection("users") as any).findOne({ _id: id });

      if (user) {
        return {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          orgId: user.orgId,
          policyNumber: user.policyNumber || "",
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        } as any;
      }

      return null;
    } catch (error) {
      logger.error("Error getting user by id:", sanitizeError(error));
      return null;
    }
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      const db = await getDatabase();
      const users = await (db.collection("users") as any).find({}).toArray();

      return users.map((user: any) => ({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        orgId: user.orgId,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        policyNumber: user.policyNumber || "",
      })) as any;
    } catch (error) {
      logger.error("Error getting all users:", sanitizeError(error));
      return [];
    }
  }

  static async getUsersByOrgId(orgId: string): Promise<User[]> {
    try {
      const db = await getDatabase();
      const users = await (db.collection("users") as any).find({ orgId }).toArray();

      return users.map((user: any) => ({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        orgId: user.orgId,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        policyNumber: user.policyNumber || "",
      })) as any;
    } catch (error) {
      logger.error("Error getting users by orgId:", sanitizeError(error));
      return [];
    }
  }
}


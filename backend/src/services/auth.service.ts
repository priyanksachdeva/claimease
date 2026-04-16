import pool from "../db/connection.js";
import { User } from "../types/index.js";
import { hashPassword, comparePasswords } from "../utils/password.js";

export class AuthService {
  static async createUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: "patient" | "hospital" | "insurance",
    orgId?: string,
  ): Promise<User | null> {
    try {
      const hashedPassword = await hashPassword(password);

      const result = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, org_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         RETURNING id, email, first_name as "firstName", last_name as "lastName", phone, role, org_id as "orgId", is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"`,
        [email, hashedPassword, firstName, lastName, role, orgId || null],
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  }

  static async getUserByEmail(email: string): Promise<any | null> {
    try {
      const result = await pool.query(
        `SELECT id, email, password_hash as "passwordHash", first_name as "firstName", last_name as "lastName", 
                phone, role, org_id as "orgId", is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
         FROM users WHERE email = $1`,
        [email],
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error("Error getting user by email:", error);
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
      const result = await pool.query(
        `SELECT id, email, first_name as "firstName", last_name as "lastName", phone, role, org_id as "orgId", 
                is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
         FROM users WHERE id = $1`,
        [id],
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error("Error getting user by id:", error);
      return null;
    }
  }
}

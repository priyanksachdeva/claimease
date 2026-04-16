import pool from "../db/connection.js";
import { Organization } from "../types/index.js";

export class OrganizationService {
  static async createOrganization(
    name: string,
    type: "hospital" | "insurance",
    registrationNumber: string,
    address: string,
    city: string,
    state: string,
    country: string,
    postalCode: string,
    phone: string,
    email: string,
    website?: string,
    logoUrl?: string,
  ): Promise<Organization | null> {
    try {
      const result = await pool.query(
        `INSERT INTO organizations (name, type, registration_number, address, city, state, country, postal_code, phone, email, website, logo_url, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
         RETURNING id, name, type, registration_number as "registrationNumber", address, city, state, country, postal_code as "postalCode",
                   phone, email, website, logo_url as "logoUrl", is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"`,
        [
          name,
          type,
          registrationNumber,
          address,
          city,
          state,
          country,
          postalCode,
          phone,
          email,
          website || null,
          logoUrl || null,
        ],
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error("Error creating organization:", error);
      return null;
    }
  }

  static async getOrganizationById(id: string): Promise<Organization | null> {
    try {
      const result = await pool.query(
        `SELECT id, name, type, registration_number as "registrationNumber", address, city, state, country, postal_code as "postalCode",
                phone, email, website, logo_url as "logoUrl", is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
         FROM organizations WHERE id = $1`,
        [id],
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error("Error getting organization:", error);
      return null;
    }
  }

  static async getAllOrganizations(
    type?: "hospital" | "insurance",
  ): Promise<Organization[]> {
    try {
      let query = `SELECT id, name, type, registration_number as "registrationNumber", address, city, state, country, postal_code as "postalCode",
                          phone, email, website, logo_url as "logoUrl", is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
                   FROM organizations WHERE is_active = true`;
      const params: any[] = [];

      if (type) {
        query += ` AND type = $1`;
        params.push(type);
      }

      query += ` ORDER BY created_at DESC`;

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error("Error getting organizations:", error);
      return [];
    }
  }
}

import { getDatabase } from "../db/connection.js";
import { Organization } from "../types/index.js";
import { v4 as uuidv4 } from "uuid";

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
      const db = await getDatabase();

      const newOrg = {
        _id: uuidv4(),
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
        website: website || null,
        logoUrl: logoUrl || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await (db.collection("organizations") as any).insertOne(newOrg);

      if (result.insertedId) {
        return {
          id: newOrg._id,
          name: newOrg.name,
          type: newOrg.type,
          registrationNumber: newOrg.registrationNumber,
          address: newOrg.address,
          city: newOrg.city,
          state: newOrg.state,
          country: newOrg.country,
          postalCode: newOrg.postalCode,
          phone: newOrg.phone,
          email: newOrg.email,
          website: newOrg.website,
          logoUrl: newOrg.logoUrl,
          isActive: newOrg.isActive,
          createdAt: newOrg.createdAt,
          updatedAt: newOrg.updatedAt,
        } as any;
      }

      return null;
    } catch (error) {
      console.error("Error creating organization:", error);
      return null;
    }
  }

  static async getOrganizationById(id: string): Promise<Organization | null> {
    try {
      const db = await getDatabase();
      const org = await (db.collection("organizations") as any).findOne({ _id: id });

      if (org) {
        return {
          id: org._id,
          name: org.name,
          type: org.type,
          registrationNumber: org.registrationNumber,
          address: org.address,
          city: org.city,
          state: org.state,
          country: org.country,
          postalCode: org.postalCode,
          phone: org.phone,
          email: org.email,
          website: org.website,
          logoUrl: org.logoUrl,
          isActive: org.isActive,
          createdAt: org.createdAt,
          updatedAt: org.updatedAt,
        } as any;
      }

      return null;
    } catch (error) {
      console.error("Error getting organization:", error);
      return null;
    }
  }

  static async getAllOrganizations(
    type?: "hospital" | "insurance",
  ): Promise<Organization[]> {
    try {
      const db = await getDatabase();
      const query: any = { isActive: true };

      if (type) {
        query.type = type;
      }

      const orgs = await (db.collection("organizations") as any)
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      return orgs.map((org: any) => ({
        id: org._id,
        name: org.name,
        type: org.type,
        registrationNumber: org.registrationNumber,
        address: org.address,
        city: org.city,
        state: org.state,
        country: org.country,
        postalCode: org.postalCode,
        phone: org.phone,
        email: org.email,
        website: org.website,
        logoUrl: org.logoUrl,
        isActive: org.isActive,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
      }));
    } catch (error) {
      console.error("Error getting organizations:", error);
      return [];
    }
  }

  static async getOrganizationByRegistration(
    registrationNumber: string,
  ): Promise<Organization | null> {
    try {
      const db = await getDatabase();
      const org = await (db.collection("organizations") as any).findOne({
        registrationNumber,
      });

      if (org) {
        return {
          id: org._id,
          name: org.name,
          type: org.type,
          registrationNumber: org.registrationNumber,
          address: org.address,
          city: org.city,
          state: org.state,
          country: org.country,
          postalCode: org.postalCode,
          phone: org.phone,
          email: org.email,
          website: org.website,
          logoUrl: org.logoUrl,
          isActive: org.isActive,
          createdAt: org.createdAt,
          updatedAt: org.updatedAt,
        } as any;
      }

      return null;
    } catch (error) {
      console.error("Error getting organization:", error);
      return null;
    }
  }
}

import { Request, Response } from "express";
import pool from "../db/connection.js";
import { v4 as uuidv4 } from "uuid";

export async function createBill(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const {
      title,
      category,
      amount,
      description,
      billDate,
      documentUrls,
      hospitalOrgId,
    } = req.body;

    if (!title || !category || !amount || !billDate || !hospitalOrgId) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO bills (id, user_id, hospital_org_id, title, category, amount, description, bill_date, document_urls, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'submitted')
       RETURNING id, user_id as "userId", hospital_org_id as "hospitalOrgId", title, category, amount, 
                 description, bill_date as "billDate", document_urls as "documentUrls", status, 
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [
        uuidv4(),
        req.user.userId,
        hospitalOrgId,
        title,
        category,
        amount,
        description || null,
        billDate,
        documentUrls || [],
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create bill error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getBillById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, user_id as "userId", hospital_org_id as "hospitalOrgId", title, category, amount, 
              description, bill_date as "billDate", document_urls as "documentUrls", status, 
              created_at as "createdAt", updated_at as "updatedAt"
       FROM bills WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Bill not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get bill error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUserBills(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const result = await pool.query(
      `SELECT id, user_id as "userId", hospital_org_id as "hospitalOrgId", title, category, amount, 
              description, bill_date as "billDate", document_urls as "documentUrls", status, 
              created_at as "createdAt", updated_at as "updatedAt"
       FROM bills WHERE user_id = $1 ORDER BY bill_date DESC`,
      [req.user.userId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get user bills error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getHospitalBills(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "hospital") {
      res.status(403).json({ error: "Only hospitals can access this" });
      return;
    }

    const result = await pool.query(
      `SELECT id, user_id as "userId", hospital_org_id as "hospitalOrgId", title, category, amount, 
              description, bill_date as "billDate", document_urls as "documentUrls", status, 
              created_at as "createdAt", updated_at as "updatedAt"
       FROM bills WHERE hospital_org_id = $1 ORDER BY bill_date DESC`,
      [req.user.orgId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get hospital bills error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateBillStatus(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE bills SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2
       RETURNING id, user_id as "userId", hospital_org_id as "hospitalOrgId", title, category, amount, 
                 description, bill_date as "billDate", document_urls as "documentUrls", status, 
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [status, id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Bill not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update bill status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

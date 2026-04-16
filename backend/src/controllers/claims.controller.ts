import { Request, Response } from "express";
import pool from "../db/connection.js";
import { v4 as uuidv4 } from "uuid";

export async function createClaim(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { billId, insuranceOrgId } = req.body;

    if (!billId || !insuranceOrgId) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Get bill details
    const billResult = await pool.query(
      `SELECT user_id, hospital_org_id, amount FROM bills WHERE id = $1`,
      [billId],
    );

    if (billResult.rows.length === 0) {
      res.status(404).json({ error: "Bill not found" });
      return;
    }

    const bill = billResult.rows[0];
    const claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const result = await pool.query(
      `INSERT INTO claims (id, bill_id, user_id, insurance_org_id, hospital_org_id, claim_number, total_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'submitted')
       RETURNING id, bill_id as "billId", user_id as "userId", insurance_org_id as "insuranceOrgId", 
                 hospital_org_id as "hospitalOrgId", claim_number as "claimNumber", total_amount as "totalAmount", 
                 status, submitted_at as "submittedAt", created_at as "createdAt", updated_at as "updatedAt"`,
      [
        uuidv4(),
        billId,
        bill.user_id,
        insuranceOrgId,
        bill.hospital_org_id,
        claimNumber,
        bill.amount,
      ],
    );

    // Create initial claim event
    const claimId = result.rows[0].id;
    await pool.query(
      `INSERT INTO claim_events (id, claim_id, status, created_by, notes)
       VALUES ($1, $2, 'submitted', $3, 'Claim created')`,
      [uuidv4(), claimId, req.user.userId],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create claim error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getClaimById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, bill_id as "billId", user_id as "userId", insurance_org_id as "insuranceOrgId", 
              hospital_org_id as "hospitalOrgId", claim_number as "claimNumber", total_amount as "totalAmount", 
              status, submitted_at as "submittedAt", verified_at as "verifiedAt", approved_at as "approvedAt",
              rejected_at as "rejectedAt", rejection_reason as "rejectionReason", 
              created_at as "createdAt", updated_at as "updatedAt"
       FROM claims WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Claim not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get claim error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUserClaims(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const result = await pool.query(
      `SELECT id, bill_id as "billId", user_id as "userId", insurance_org_id as "insuranceOrgId", 
              hospital_org_id as "hospitalOrgId", claim_number as "claimNumber", total_amount as "totalAmount", 
              status, submitted_at as "submittedAt", verified_at as "verifiedAt", approved_at as "approvedAt",
              rejected_at as "rejectedAt", rejection_reason as "rejectionReason", 
              created_at as "createdAt", updated_at as "updatedAt"
       FROM claims WHERE user_id = $1 ORDER BY submitted_at DESC`,
      [req.user.userId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get user claims error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getInsuranceClaims(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "insurance") {
      res
        .status(403)
        .json({ error: "Only insurance companies can access this" });
      return;
    }

    const { status } = req.query;
    let query = `SELECT id, bill_id as "billId", user_id as "userId", insurance_org_id as "insuranceOrgId", 
                        hospital_org_id as "hospitalOrgId", claim_number as "claimNumber", total_amount as "totalAmount", 
                        status, submitted_at as "submittedAt", verified_at as "verifiedAt", approved_at as "approvedAt",
                        rejected_at as "rejectedAt", rejection_reason as "rejectionReason", 
                        created_at as "createdAt", updated_at as "updatedAt"
                 FROM claims WHERE insurance_org_id = $1`;
    const params: any[] = [req.user.orgId];

    if (status) {
      query += ` AND status = $2`;
      params.push(status);
    }

    query += ` ORDER BY submitted_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Get insurance claims error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function approveClaim(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== "insurance") {
      res.status(403).json({ error: "Only insurance can approve claims" });
      return;
    }

    const { id } = req.params;
    const result = await pool.query(
      `UPDATE claims SET status = 'approved', approved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1
       RETURNING id, bill_id as "billId", user_id as "userId", insurance_org_id as "insuranceOrgId", 
                 hospital_org_id as "hospitalOrgId", claim_number as "claimNumber", total_amount as "totalAmount", 
                 status, submitted_at as "submittedAt", verified_at as "verifiedAt", approved_at as "approvedAt",
                 rejected_at as "rejectedAt", rejection_reason as "rejectionReason", 
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Claim not found" });
      return;
    }

    // Create claim event
    const claimId = result.rows[0].billId;
    await pool.query(
      `INSERT INTO claim_events (id, claim_id, status, created_by, notes)
       VALUES ($1, $2, 'approved', $3, 'Claim approved by insurance')`,
      [uuidv4(), id, req.user.userId],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Approve claim error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function rejectClaim(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || req.user.role !== "insurance") {
      res.status(403).json({ error: "Only insurance can reject claims" });
      return;
    }

    const { id } = req.params;
    const { rejectionReason } = req.body;

    const result = await pool.query(
      `UPDATE claims SET status = 'rejected', rejected_at = CURRENT_TIMESTAMP, rejection_reason = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2
       RETURNING id, bill_id as "billId", user_id as "userId", insurance_org_id as "insuranceOrgId", 
                 hospital_org_id as "hospitalOrgId", claim_number as "claimNumber", total_amount as "totalAmount", 
                 status, submitted_at as "submittedAt", verified_at as "verifiedAt", approved_at as "approvedAt",
                 rejected_at as "rejectedAt", rejection_reason as "rejectionReason", 
                 created_at as "createdAt", updated_at as "updatedAt"`,
      [rejectionReason || null, id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Claim not found" });
      return;
    }

    // Create claim event
    await pool.query(
      `INSERT INTO claim_events (id, claim_id, status, created_by, notes)
       VALUES ($1, $2, 'rejected', $3, $4)`,
      [
        uuidv4(),
        id,
        req.user.userId,
        `Claim rejected: ${rejectionReason || "No reason provided"}`,
      ],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Reject claim error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getClaimEvents(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { claimId } = req.params;

    const result = await pool.query(
      `SELECT id, claim_id as "claimId", status, notes, created_by as "createdBy", created_at as "createdAt"
       FROM claim_events WHERE claim_id = $1 ORDER BY created_at ASC`,
      [claimId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get claim events error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

import { Request, Response } from "express";
import { getDatabase, getMongoClient } from "../db/connection.js";
import { v4 as uuidv4 } from "uuid";

export async function createClaim(req: Request, res: Response): Promise<void> {
  let session: any = null;
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

    const db = await getDatabase();
    const billsCollection = db.collection("bills") as any;

    // Get bill details
    const bill = await billsCollection.findOne({ _id: billId });

    if (!bill) {
      res.status(404).json({ error: "Bill not found" });
      return;
    }

    // Authorization: user must own the bill, OR be a hospital staff member 
    // creating a claim for a bill in their hospital (or unassigned patient bills)
    const isOwner = bill.userId === req.user.userId;
    const isHospitalStaff = req.user.role === "hospital" && 
      (bill.hospitalOrgId === req.user.orgId || bill.hospitalOrgId === null);
      
    if (!isOwner && !isHospitalStaff) {
      res.status(403).json({ error: "Forbidden - You don't have permission to create a claim for this bill" });
      return;
    }

    // Determine the hospitalOrgId for the claim
    // If a patient is creating it, use the bill's hospitalOrgId
    // If a hospital is creating it, use their orgId (which effectively "claims" the unassigned bill)
    const claimHospitalOrgId = req.user.role === "hospital" ? req.user.orgId : bill.hospitalOrgId;

    const claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    const newClaim = {
      _id: uuidv4(),
      billId,
      userId: bill.userId,
      insuranceOrgId,
      hospitalOrgId: claimHospitalOrgId,
      claimNumber,
      totalAmount: bill.amount,
      status: "submitted",
      submittedAt: new Date(),
      verifiedAt: null,
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // ✅ FIXED: Use MongoDB transactions for atomicity
    // Issue #2: No transaction support for multi-document operations
    const mongoClient = await getMongoClient();
    session = mongoClient.startSession();
    session.startTransaction();

    try {
      // If a hospital creates a claim for an unassigned bill, update the bill to link it to the hospital
      if (isHospitalStaff && bill.hospitalOrgId === null) {
        await billsCollection.updateOne(
          { _id: billId },
          { $set: { hospitalOrgId: req.user.orgId } },
          { session }
        );
      }

      const claimsCollection = db.collection("claims") as any;
      const result = await claimsCollection.insertOne(newClaim, { session });

      // Create initial claim event
      if (result.insertedId) {
        const claimEventsCollection = db.collection("claimEvents") as any;
        const claimEvent = {
          _id: uuidv4(),
          claimId: newClaim._id,
          status: "submitted",
          notes: "Claim created",
          createdBy: req.user.userId,
          createdAt: new Date(),
        };

        await claimEventsCollection.insertOne(claimEvent, { session });
      }

      // Commit the transaction
      await session.commitTransaction();

      res.status(201).json({
        id: newClaim._id,
        billId: newClaim.billId,
        userId: newClaim.userId,
        insuranceOrgId: newClaim.insuranceOrgId,
        hospitalOrgId: newClaim.hospitalOrgId,
        claimNumber: newClaim.claimNumber,
        totalAmount: newClaim.totalAmount,
        status: newClaim.status,
        submittedAt: newClaim.submittedAt,
        createdAt: newClaim.createdAt,
        updatedAt: newClaim.updatedAt,
      });
    } catch (transactionError) {
      // Abort the transaction on error
      await session.abortTransaction();
      throw transactionError;
    }
  } catch (error) {
    console.error("Create claim error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}

export async function getClaimById(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const { id } = req.params;
    const db = await getDatabase();
    const claimsCollection = db.collection("claims") as any;

    const claim = await claimsCollection.findOne({ _id: id });

    if (!claim) {
      res.status(404).json({ error: "Claim not found" });
      return;
    }

    // Authorization check: user must be associated with the claim
    const isOwner = claim.userId === req.user.userId;
    const isHospital = claim.hospitalOrgId === req.user.orgId && req.user.role === "hospital";
    const isInsurance = claim.insuranceOrgId === req.user.orgId && req.user.role === "insurance";

    if (!isOwner && !isHospital && !isInsurance) {
      res.status(403).json({ error: "Forbidden - You don't have access to this claim" });
      return;
    }

    res.json({
      id: claim._id,
      billId: claim.billId,
      userId: claim.userId,
      insuranceOrgId: claim.insuranceOrgId,
      hospitalOrgId: claim.hospitalOrgId,
      claimNumber: claim.claimNumber,
      totalAmount: claim.totalAmount,
      status: claim.status,
      submittedAt: claim.submittedAt,
      verifiedAt: claim.verifiedAt,
      approvedAt: claim.approvedAt,
      rejectedAt: claim.rejectedAt,
      rejectionReason: claim.rejectionReason,
      createdAt: claim.createdAt,
      updatedAt: claim.updatedAt,
    });
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

    const db = await getDatabase();
    const claimsCollection = db.collection("claims") as any;

    const claims = await claimsCollection
      .find({ userId: req.user.userId })
      .sort({ submittedAt: -1 })
      .toArray();

    res.json(
      claims.map((claim: any) => ({
        id: claim._id,
        billId: claim.billId,
        userId: claim.userId,
        insuranceOrgId: claim.insuranceOrgId,
        hospitalOrgId: claim.hospitalOrgId,
        claimNumber: claim.claimNumber,
        totalAmount: claim.totalAmount,
        status: claim.status,
        submittedAt: claim.submittedAt,
        verifiedAt: claim.verifiedAt,
        approvedAt: claim.approvedAt,
        rejectedAt: claim.rejectedAt,
        rejectionReason: claim.rejectionReason,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt,
      }))
    );
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

    const db = await getDatabase();
    const claimsCollection = db.collection("claims") as any;
    const { status } = req.query;

    const query: any = { insuranceOrgId: req.user.orgId };
    if (status) {
      query.status = status;
    }

    const claims = await claimsCollection
      .find(query)
      .sort({ submittedAt: -1 })
      .toArray();

    res.json(
      claims.map((claim: any) => ({
        id: claim._id,
        billId: claim.billId,
        userId: claim.userId,
        insuranceOrgId: claim.insuranceOrgId,
        hospitalOrgId: claim.hospitalOrgId,
        claimNumber: claim.claimNumber,
        totalAmount: claim.totalAmount,
        status: claim.status,
        submittedAt: claim.submittedAt,
        verifiedAt: claim.verifiedAt,
        approvedAt: claim.approvedAt,
        rejectedAt: claim.rejectedAt,
        rejectionReason: claim.rejectionReason,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt,
      }))
    );
  } catch (error) {
    console.error("Get insurance claims error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getHospitalClaims(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!req.user || req.user.role !== "hospital") {
      res.status(403).json({ error: "Only hospitals can access this" });
      return;
    }

    const db = await getDatabase();
    const claimsCollection = db.collection("claims") as any;

    // ✅ FIXED: Issue #11 - Only show claims assigned to THIS hospital, not all unassigned claims
    const claims = await claimsCollection
      .find({
        hospitalOrgId: req.user.orgId,
      })
      .sort({ submittedAt: -1 })
      .toArray();

    res.json(
      claims.map((claim: any) => ({
        id: claim._id,
        billId: claim.billId,
        userId: claim.userId,
        insuranceOrgId: claim.insuranceOrgId,
        hospitalOrgId: claim.hospitalOrgId,
        claimNumber: claim.claimNumber,
        totalAmount: claim.totalAmount,
        status: claim.status,
        submittedAt: claim.submittedAt,
        verifiedAt: claim.verifiedAt,
        approvedAt: claim.approvedAt,
        rejectedAt: claim.rejectedAt,
        rejectionReason: claim.rejectionReason,
        createdAt: claim.createdAt,
        updatedAt: claim.updatedAt,
      }))
    );
  } catch (error) {
    console.error("Get hospital claims error:", error);
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
    const db = await getDatabase();
    const claimsCollection = db.collection("claims") as any;

    // First, get the claim to verify it exists and belongs to this insurance org
    const claim = await claimsCollection.findOne({ _id: id });
    if (!claim) {
      res.status(404).json({ error: "Claim not found" });
      return;
    }

    // Authorization: claim must belong to this insurance organization
    if (claim.insuranceOrgId !== req.user.orgId) {
      res.status(403).json({ error: "Forbidden - Claim doesn't belong to your organization" });
      return;
    }

    // Validation: can only approve claims in 'submitted' status
    if (claim.status !== "submitted") {
      res.status(400).json({ error: "Claim cannot be approved - it is not in submitted status" });
      return;
    }

    const result = await claimsCollection.findOneAndUpdate(
      { _id: id, insuranceOrgId: req.user.orgId, status: "submitted" },
      {
        $set: {
          status: "approved",
          approvedAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      res.status(404).json({ error: "Claim not found or cannot be approved" });
      return;
    }

    // Create claim event
    const claimEventsCollection = db.collection("claimEvents") as any;
    const claimEvent = {
      _id: uuidv4(),
      claimId: id,
      status: "approved",
      notes: "Claim approved by insurance",
      createdBy: req.user.userId,
      createdAt: new Date(),
    };

    await claimEventsCollection.insertOne(claimEvent);

    const updatedClaim = result;
    res.json({
      id: updatedClaim._id,
      billId: updatedClaim.billId,
      userId: updatedClaim.userId,
      insuranceOrgId: updatedClaim.insuranceOrgId,
      hospitalOrgId: updatedClaim.hospitalOrgId,
      claimNumber: updatedClaim.claimNumber,
      totalAmount: updatedClaim.totalAmount,
      status: updatedClaim.status,
      submittedAt: updatedClaim.submittedAt,
      verifiedAt: updatedClaim.verifiedAt,
      approvedAt: updatedClaim.approvedAt,
      rejectedAt: updatedClaim.rejectedAt,
      rejectionReason: updatedClaim.rejectionReason,
      createdAt: updatedClaim.createdAt,
      updatedAt: updatedClaim.updatedAt,
    });
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
    const db = await getDatabase();
    const claimsCollection = db.collection("claims") as any;

    // First, get the claim to verify it exists and belongs to this insurance org
    const claim = await claimsCollection.findOne({ _id: id });
    if (!claim) {
      res.status(404).json({ error: "Claim not found" });
      return;
    }

    // Authorization: claim must belong to this insurance organization
    if (claim.insuranceOrgId !== req.user.orgId) {
      res.status(403).json({ error: "Forbidden - Claim doesn't belong to your organization" });
      return;
    }

    // Validation: can only reject claims in 'submitted' status
    if (claim.status !== "submitted") {
      res.status(400).json({ error: "Claim cannot be rejected - it is not in submitted status" });
      return;
    }

    const result = await claimsCollection.findOneAndUpdate(
      { _id: id, insuranceOrgId: req.user.orgId, status: "submitted" },
      {
        $set: {
          status: "rejected",
          rejectedAt: new Date(),
          rejectionReason: rejectionReason || null,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      res.status(404).json({ error: "Claim not found or cannot be rejected" });
      return;
    }

    // Create claim event
    const claimEventsCollection = db.collection("claimEvents") as any;
    const claimEvent = {
      _id: uuidv4(),
      claimId: id,
      status: "rejected",
      notes: `Claim rejected: ${rejectionReason || "No reason provided"}`,
      createdBy: req.user.userId,
      createdAt: new Date(),
    };

    await claimEventsCollection.insertOne(claimEvent);

    const rejectedClaim = result;
    res.json({
      id: rejectedClaim._id,
      billId: rejectedClaim.billId,
      userId: rejectedClaim.userId,
      insuranceOrgId: rejectedClaim.insuranceOrgId,
      hospitalOrgId: rejectedClaim.hospitalOrgId,
      claimNumber: rejectedClaim.claimNumber,
      totalAmount: rejectedClaim.totalAmount,
      status: rejectedClaim.status,
      submittedAt: rejectedClaim.submittedAt,
      verifiedAt: rejectedClaim.verifiedAt,
      approvedAt: rejectedClaim.approvedAt,
      rejectedAt: rejectedClaim.rejectedAt,
      rejectionReason: rejectedClaim.rejectionReason,
      createdAt: rejectedClaim.createdAt,
      updatedAt: rejectedClaim.updatedAt,
    });
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
    const db = await getDatabase();
    const claimEventsCollection = db.collection("claimEvents") as any;

    const events = await claimEventsCollection
      .find({ claimId })
      .sort({ createdAt: 1 })
      .toArray();

    res.json(
      events.map((event: any) => ({
        id: event._id,
        claimId: event.claimId,
        status: event.status,
        notes: event.notes,
        createdBy: event.createdBy,
        createdAt: event.createdAt,
      }))
    );
  } catch (error) {
    console.error("Get claim events error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

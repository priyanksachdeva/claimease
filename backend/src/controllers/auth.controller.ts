import { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { generateToken } from "../utils/jwt.js";
import { getDatabase } from "../db/connection.js";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, firstName, lastName, role, phone } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName || !role) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Check if user exists
    const existingUser = await AuthService.getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: "User already exists" });
      return;
    }

    // Create user
    const user = await AuthService.createUser(
      email,
      password,
      firstName,
      lastName,
      role,
    );

    if (!user) {
      res.status(500).json({ error: "Failed to create user" });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    // Get user
    const user = await AuthService.getUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Verify password
    const isValidPassword = await AuthService.verifyPassword(
      password,
      user.passwordHash,
    );
    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        orgId: user.orgId,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getCurrentUser(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const user = await AuthService.getUserById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getAllUsers(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    // Only allow hospital and insurance roles to list users
    if (req.user.role !== "hospital" && req.user.role !== "insurance") {
      res.status(403).json({ error: "Forbidden - Only hospital and insurance admins can list users" });
      return;
    }

    const db = await getDatabase();
    const usersCollection = db.collection("users") as any;

    // Hospitals/Insurance should see:
    // 1. All patients (so they can create bills/claims for them)
    // 2. Users belonging to their own organization
    const query = {
      $or: [
        { role: "patient" },
        { orgId: req.user.orgId }
      ]
    };

    const users = await usersCollection.find(query).toArray();
    
    res.json(users.map((user: any) => ({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      orgId: user.orgId,
      policyNumber: user.policyNumber || "",
      isActive: user.isActive,
    })));
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

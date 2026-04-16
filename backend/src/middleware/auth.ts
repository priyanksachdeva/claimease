import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { JWTPayload } from "../types/index.js";

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });
      return;
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: "Authentication failed" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
}

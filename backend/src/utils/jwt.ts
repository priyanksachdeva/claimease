import jwt, { JwtPayload } from "jsonwebtoken";
import { JWTPayload } from "../types/index.js";

const JWT_SECRET_VALUE: string = process.env.JWT_SECRET || "";
if (!JWT_SECRET_VALUE) {
  throw new Error("FATAL: JWT_SECRET environment variable is required. Please set it in your .env file.");
}
if (JWT_SECRET_VALUE === "INSECURE_CHANGE_ME_OR_APP_WILL_FAIL" || JWT_SECRET_VALUE === "YOUR_GENERATED_SECRET_HERE") {
  throw new Error("FATAL: JWT_SECRET is using an insecure placeholder value. Please change it to a strong random secret.");
}

const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || "24h";

export function generateToken(payload: JWTPayload): string {
  const options: jwt.SignOptions = { 
    expiresIn: JWT_EXPIRES_IN as any
  };
  return jwt.sign(payload as object, JWT_SECRET_VALUE, options);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_VALUE);
    
    if (typeof decoded !== 'object' || decoded === null) {
      throw new Error("Invalid token payload: not an object");
    }

    const { userId, email, role, orgId } = decoded as any;

    if (typeof userId !== 'string' || !userId) throw new Error("Invalid token payload: userId missing or invalid");
    if (typeof email !== 'string' || !email) throw new Error("Invalid token payload: email missing or invalid");
    if (!['patient', 'hospital', 'insurance'].includes(role)) throw new Error("Invalid token payload: role missing or invalid");
    if (orgId !== undefined && typeof orgId !== 'string') throw new Error("Invalid token payload: orgId invalid");

    return { userId, email, role, orgId };
  } catch (error) {
    return null;
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token);
    if (typeof decoded !== 'object' || decoded === null) return null;

    const { userId, email, role, orgId } = decoded as any;

    if (typeof userId !== 'string' || !userId) return null;
    if (typeof email !== 'string' || !email) return null;
    if (!['patient', 'hospital', 'insurance'].includes(role)) return null;
    if (orgId !== undefined && typeof orgId !== 'string') return null;

    return { userId, email, role, orgId };
  } catch (error) {
    return null;
  }
}

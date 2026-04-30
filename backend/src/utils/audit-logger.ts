/**
 * ✅ FIXED: Issue #14 - Audit logging for compliance and data change tracking
 * Logs all critical operations: CREATE, UPDATE, DELETE on bills, claims, users, organizations
 */

import { getDatabase } from "../db/connection.js";
import { v4 as uuidv4 } from "uuid";
import { logger, sanitizeError } from "./logger.js";
import isEqual from "fast-deep-equal";

export function sanitizeSensitiveFields(obj: Record<string, any> | undefined): Record<string, any> {
  if (!obj) return {};
  const sanitized: Record<string, any> = {};
  const sensitiveRegex = /password|passwd|token|secret|ssn|creditcard|dob|email/i;

  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveRegex.test(key)) {
      sanitized[key] = "[REDACTED]";
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeSensitiveFields(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v => 
        (v !== null && typeof v === 'object' && !Array.isArray(v)) ? sanitizeSensitiveFields(v) : v
      );
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";
export type AuditEntityType = "bill" | "claim" | "user" | "organization" | "message";

export interface AuditLogEntry {
  userId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string | null;
}

/**
 * Log an audit event to the database
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const db = await getDatabase();
    const auditLogsCollection = db.collection("auditLogs");

    const auditLog = {
      _id: uuidv4(),
      userId: entry.userId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      oldValues: sanitizeSensitiveFields(entry.oldValues),
      newValues: sanitizeSensitiveFields(entry.newValues),
      timestamp: new Date(),
      ipAddress: entry.ipAddress || null,
    };

    await auditLogsCollection.insertOne(auditLog as any);
  } catch (error) {
    // Don't throw - audit logging failure shouldn't break the application
    logger.error("Failed to log audit event:", sanitizeError(error));
  }
}

/**
 * Get audit logs for a specific entity
 */
export async function getAuditLogsForEntity(
  entityType: AuditEntityType,
  entityId: string,
  limit: number = 50
): Promise<any[]> {
  try {
    const db = await getDatabase();
    const auditLogsCollection = db.collection("auditLogs");

    return await auditLogsCollection
      .find({ entityType, entityId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  } catch (error) {
    logger.error("Failed to retrieve audit logs:", sanitizeError(error));
    return [];
  }
}

/**
 * Get audit logs for a specific user
 */
export async function getAuditLogsForUser(
  userId: string,
  limit: number = 100
): Promise<any[]> {
  try {
    const db = await getDatabase();
    const auditLogsCollection = db.collection("auditLogs");

    return await auditLogsCollection
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  } catch (error) {
    logger.error("Failed to retrieve user audit logs:", sanitizeError(error));
    return [];
  }
}

/**
 * Helper to get changed fields
 */
export function getChangedFields(
  oldValues: Record<string, any>,
  newValues: Record<string, any>
): { oldValues: Record<string, any>; newValues: Record<string, any> } {
  const changed: { oldValues: Record<string, any>; newValues: Record<string, any> } = {
    oldValues: {},
    newValues: {},
  };

  const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

  for (const key of allKeys) {
    if (!isEqual(oldValues[key], newValues[key])) {
      changed.oldValues[key] = oldValues[key];
      changed.newValues[key] = newValues[key];
    }
  }

  return changed;
}

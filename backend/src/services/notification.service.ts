/**
 * Notification System for ClaimEase
 * Handles creation and retrieval of user notifications
 * ✅ FIXED: Now persists to MongoDB instead of in-memory storage
 */

import { getDatabase } from "../db/connection.js";
import { v4 as uuidv4 } from "uuid";
import { logger, sanitizeError } from "../utils/logger.js";

interface Notification {
  _id: string;
  userId: string;
  type: "claim_approved" | "claim_rejected" | "bill_uploaded" | "claim_created" | "general";
  title: string;
  message: string;
  relatedId?: string; // claimId or billId
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a notification (persisted to database)
 */
export async function createNotification(
  userId: string,
  type: Notification["type"],
  title: string,
  message: string,
  relatedId?: string
): Promise<Notification> {
  try {
    const db = await getDatabase();
    const notificationsCollection = db.collection("notifications") as any;

    const notification: Notification = {
      _id: uuidv4(),
      userId,
      type,
      title,
      message,
      relatedId,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await notificationsCollection.insertOne(notification);
    
    if (result.insertedId) {
      logger.info(`Notification created for user ${userId}`);
      return notification;
    }
    
    throw new Error("Failed to insert notification");
  } catch (error) {
    logger.error("Error creating notification:", sanitizeError(error));
    throw error;
  }
}

/**
 * Get user notifications from database
 */
export async function getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
  try {
    const db = await getDatabase();
    const notificationsCollection = db.collection("notifications") as any;

    return await notificationsCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  } catch (error) {
    logger.error("Error getting user notifications:", sanitizeError(error));
    return [];
  }
}

/**
 * Mark notification as read (in database)
 */
export async function markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    const notificationsCollection = db.collection("notifications") as any;

    const result = await notificationsCollection.updateOne(
      { _id: notificationId, userId },
      { $set: { isRead: true, updatedAt: new Date() } }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    logger.error("Error marking notification as read:", sanitizeError(error));
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  try {
    const db = await getDatabase();
    const notificationsCollection = db.collection("notifications") as any;

    const result = await notificationsCollection.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true, updatedAt: new Date() } }
    );

    return result.modifiedCount;
  } catch (error) {
    logger.error("Error marking all notifications as read:", sanitizeError(error));
    return 0;
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const db = await getDatabase();
    const notificationsCollection = db.collection("notifications") as any;

    return await notificationsCollection.countDocuments({ userId, isRead: false });
  } catch (error) {
    logger.error("Error getting unread count:", sanitizeError(error));
    return 0;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string, userId: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    const notificationsCollection = db.collection("notifications") as any;

    const result = await notificationsCollection.deleteOne({ _id: notificationId, userId });
    return result.deletedCount > 0;
  } catch (error) {
    logger.error("Error deleting notification:", sanitizeError(error));
    return false;
  }
}

/**
 * Create claim approved notification for patient
 */
export async function notifyClaimApproved(userId: string, claimNumber: string, claimId: string, approvedAmount?: number): Promise<void> {
  try {
    await createNotification(
      userId,
      "claim_approved",
      "Claim Approved!",
      `Your claim ${claimNumber} has been approved${approvedAmount ? ` for ₹${approvedAmount.toFixed(2)}` : ""}. You can view the details in your claims section.`,
      claimId
    );
  } catch (error) {
    logger.error("Error creating claim approved notification:", sanitizeError(error));
  }
}

/**
 * Create claim rejected notification for patient
 */
export async function notifyClaimRejected(userId: string, claimNumber: string, claimId: string, reason?: string): Promise<void> {
  try {
    await createNotification(
      userId,
      "claim_rejected",
      "Claim Rejected",
      `Your claim ${claimNumber} has been rejected${reason ? `: ${reason}` : ""}. Please contact support for more information.`,
      claimId
    );
  } catch (error) {
    logger.error("Error creating claim rejected notification:", sanitizeError(error));
  }
}

/**
 * Create bill uploaded notification for hospital
 */
export async function notifyBillUploaded(hospitalAdminId: string, billTitle: string, billId: string, patientName: string): Promise<void> {
  try {
    await createNotification(
      hospitalAdminId,
      "bill_uploaded",
      "New Bill Upload",
      `Patient ${patientName} has uploaded a bill: ${billTitle}. You can review and create a claim if needed.`,
      billId
    );
  } catch (error) {
    logger.error("Error creating bill uploaded notification:", sanitizeError(error));
  }
}

/**
 * Create claim created notification for insurance
 */
export async function notifyClaimCreated(insuranceAdminId: string, claimNumber: string, claimId: string, amount: number): Promise<void> {
  try {
    await createNotification(
      insuranceAdminId,
      "claim_created",
      "New Claim Submitted",
      `A new claim ${claimNumber} for ₹${amount.toFixed(2)} has been submitted. Please review and take action.`,
      claimId
    );
  } catch (error) {
    logger.error("Error creating claim created notification:", sanitizeError(error));
  }
}

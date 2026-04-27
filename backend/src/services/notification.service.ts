/**
 * Notification System for ClaimEase
 * Handles creation and retrieval of user notifications
 */

interface Notification {
  _id?: string;
  userId: string;
  type: "claim_approved" | "claim_rejected" | "bill_uploaded" | "claim_created" | "general";
  title: string;
  message: string;
  relatedId?: string; // claimId or billId
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Store notifications in memory (in production, use database)
const notifications: Notification[] = [];

/**
 * Create a notification
 */
export function createNotification(
  userId: string,
  type: Notification["type"],
  title: string,
  message: string,
  relatedId?: string
): Notification {
  const notification: Notification = {
    userId,
    type,
    title,
    message,
    relatedId,
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  notifications.push(notification);
  return notification;
}

/**
 * Get user notifications
 */
export function getUserNotifications(userId: string, limit: number = 50): Notification[] {
  return notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(notificationId: string): boolean {
  const notification = notifications.find((n) => n._id === notificationId);
  if (notification) {
    notification.isRead = true;
    notification.updatedAt = new Date();
    return true;
  }
  return false;
}

/**
 * Mark all notifications as read for a user
 */
export function markAllNotificationsAsRead(userId: string): number {
  let count = 0;
  notifications.forEach((n) => {
    if (n.userId === userId && !n.isRead) {
      n.isRead = true;
      n.updatedAt = new Date();
      count++;
    }
  });
  return count;
}

/**
 * Get unread notification count
 */
export function getUnreadCount(userId: string): number {
  return notifications.filter((n) => n.userId === userId && !n.isRead).length;
}

/**
 * Delete a notification
 */
export function deleteNotification(notificationId: string): boolean {
  const index = notifications.findIndex((n) => n._id === notificationId);
  if (index > -1) {
    notifications.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Create claim approved notification for patient
 */
export function notifyClaimApproved(userId: string, claimNumber: string, claimId: string, approvedAmount?: number): void {
  createNotification(
    userId,
    "claim_approved",
    "Claim Approved!",
    `Your claim ${claimNumber} has been approved${approvedAmount ? ` for ₹${approvedAmount.toFixed(2)}` : ""}. You can view the details in your claims section.`,
    claimId
  );
}

/**
 * Create claim rejected notification for patient
 */
export function notifyClaimRejected(userId: string, claimNumber: string, claimId: string, reason?: string): void {
  createNotification(
    userId,
    "claim_rejected",
    "Claim Rejected",
    `Your claim ${claimNumber} has been rejected${reason ? `: ${reason}` : ""}. Please contact support for more information.`,
    claimId
  );
}

/**
 * Create bill uploaded notification for hospital
 */
export function notifyBillUploaded(hospitalAdminId: string, billTitle: string, billId: string, patientName: string): void {
  createNotification(
    hospitalAdminId,
    "bill_uploaded",
    "New Bill Upload",
    `Patient ${patientName} has uploaded a bill: ${billTitle}. You can review and create a claim if needed.`,
    billId
  );
}

/**
 * Create claim created notification for hospital
 */
export function notifyClaimCreated(insuranceAdminId: string, claimNumber: string, claimId: string, amount: number): void {
  createNotification(
    insuranceAdminId,
    "claim_created",
    "New Claim Submitted",
    `A new claim ${claimNumber} for ₹${amount.toFixed(2)} has been submitted. Please review and take action.`,
    claimId
  );
}

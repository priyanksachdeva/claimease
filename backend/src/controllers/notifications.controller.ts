import { Request, Response } from "express";
import { JWTPayload } from "../types/index.js";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  deleteNotification,
} from "../services/notification.service.js";

interface NotificationRequest extends Request {
  user?: JWTPayload;
}

/**
 * Get user notifications
 */
export async function getNotifications(req: NotificationRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const notifications = await getUserNotifications(userId, limit);
    res.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
}

export async function markAsRead(req: NotificationRequest, res: Response): Promise<void> {
  try {
    const { notificationId } = req.params;

    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!notificationId) {
      res.status(400).json({ error: "Notification ID required" });
      return;
    }

    const success = await markNotificationAsRead(notificationId, userId);
    if (!success) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(req: NotificationRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const count = await markAllNotificationsAsRead(userId);
    res.json({ message: `${count} notifications marked as read` });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
}

/**
 * Get unread count
 */
export async function getUnreadCountEndpoint(req: NotificationRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const count = await getUnreadCount(userId);
    res.json({ unreadCount: count });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
}

/**
 * Delete notification
 */
export async function deleteNotificationEndpoint(req: NotificationRequest, res: Response): Promise<void> {
  try {
    const { notificationId } = req.params;

    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!notificationId) {
      res.status(400).json({ error: "Notification ID required" });
      return;
    }

    const success = await deleteNotification(notificationId, userId);
    if (!success) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }

    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
}

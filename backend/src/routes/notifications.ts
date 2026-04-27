import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCountEndpoint,
  deleteNotificationEndpoint,
} from "../controllers/notifications.controller.js";

const router = Router();

// Get all notifications for current user
router.get("/", authenticate, getNotifications);

// Get unread notification count
router.get("/unread/count", authenticate, getUnreadCountEndpoint);

// Mark notification as read
router.patch("/:notificationId/read", authenticate, markAsRead);

// Mark all notifications as read
router.patch("/read/all", authenticate, markAllAsRead);

// Delete notification
router.delete("/:notificationId", authenticate, deleteNotificationEndpoint);

export default router;

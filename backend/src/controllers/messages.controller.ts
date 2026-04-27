import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { authenticate } from "../middleware/auth.js";
import { getDatabase } from "../db/connection.js";
import type { JWTPayload } from "../types/index.js";

interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const messagesRouter = Router();

// Middleware
messagesRouter.use(authenticate);

// Create a new message (and create/find conversation)
messagesRouter.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { toUserId, text, toOrgId } = req.body;
    const fromUserId = req.user?.userId;

    if (!text || (!toUserId && !toOrgId)) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const db = await getDatabase();
    const conversationsCol = db.collection("conversations") as any;
    const messagesCol = db.collection("messages") as any;

    const recipientId = toUserId || toOrgId;

    // Create or find existing conversation between the two parties
    let conversation = await conversationsCol.findOne({
      participantIds: { $all: [fromUserId, recipientId] },
    });

    if (!conversation) {
      const newConversation = {
        _id: uuidv4(),
        participantIds: [fromUserId, recipientId],
        lastMessage: text,
        lastMessageAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await conversationsCol.insertOne(newConversation);
      conversation = newConversation;
    } else {
      await conversationsCol.updateOne(
        { _id: conversation._id },
        { $set: { lastMessage: text, lastMessageAt: new Date(), updatedAt: new Date() } }
      );
    }

    // Create message
    const newMessage = {
      _id: uuidv4(),
      conversationId: conversation._id,
      fromUserId,
      toUserId: recipientId,
      text,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await messagesCol.insertOne(newMessage);

    res.status(201).json({
      id: newMessage._id,
      conversationId: newMessage.conversationId,
      fromUserId: newMessage.fromUserId,
      toUserId: newMessage.toUserId,
      text: newMessage.text,
      isRead: newMessage.isRead,
      createdAt: newMessage.createdAt,
      updatedAt: newMessage.updatedAt,
    });
  } catch (error) {
    console.error("Failed to create message", error);
    res.status(500).json({ error: "Failed to create message" });
  }
});

// Get all conversations for the current user
messagesRouter.get("/conversations", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const db = await getDatabase();
    const conversationsCol = db.collection("conversations") as any;

    const userConversations = await conversationsCol
      .find({ participantIds: userId })
      .sort({ updatedAt: -1 })
      .toArray();

    res.status(200).json(
      userConversations.map((conv: any) => ({
        id: conv._id,
        participantIds: conv.participantIds,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      }))
    );
  } catch (error) {
    console.error("Failed to get conversations", error);
    res.status(500).json({ error: "Failed to get conversations" });
  }
});

// Get messages in a conversation
messagesRouter.get("/:conversationId", async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?.userId;
    const db = await getDatabase();
    const conversationsCol = db.collection("conversations") as any;
    const messagesCol = db.collection("messages") as any;

    // Verify user is part of this conversation
    const conversation = await conversationsCol.findOne({ _id: conversationId });
    if (!conversation || !conversation.participantIds.includes(userId)) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const conversationMessages = await messagesCol
      .find({ conversationId })
      .sort({ createdAt: 1 })
      .toArray();

    // Mark messages as read
    await messagesCol.updateMany(
      { conversationId, toUserId: userId, isRead: false },
      { $set: { isRead: true, updatedAt: new Date() } }
    );

    res.status(200).json(
      conversationMessages.map((msg: any) => ({
        id: msg._id,
        conversationId: msg.conversationId,
        fromUserId: msg.fromUserId,
        toUserId: msg.toUserId,
        text: msg.text,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
      }))
    );
  } catch (error) {
    console.error("Failed to get messages", error);
    res.status(500).json({ error: "Failed to get messages" });
  }
});

// Start new conversation with a user/org (find or create)
messagesRouter.post("/start", async (req: AuthRequest, res: Response) => {
  try {
    const { withUserId } = req.body;
    const fromUserId = req.user?.userId;

    if (!withUserId) {
      res.status(400).json({ error: "withUserId is required" });
      return;
    }

    const db = await getDatabase();
    const conversationsCol = db.collection("conversations") as any;

    let conversation = await conversationsCol.findOne({
      participantIds: { $all: [fromUserId, withUserId] },
    });

    if (!conversation) {
      const newConversation = {
        _id: uuidv4(),
        participantIds: [fromUserId, withUserId],
        lastMessage: null,
        lastMessageAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await conversationsCol.insertOne(newConversation);
      conversation = newConversation;
    }

    res.status(200).json({
      id: conversation._id,
      participantIds: conversation.participantIds,
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    });
  } catch (error) {
    console.error("Failed to start conversation", error);
    res.status(500).json({ error: "Failed to start conversation" });
  }
});

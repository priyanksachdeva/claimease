/**
 * TypeScript interfaces for MongoDB documents
 * ✅ FIXED: Issue #6 - Provides type safety instead of 'as any' casts
 */

export interface UserDocument {
  _id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: "patient" | "hospital" | "insurance" | "admin";
  orgId: string | null;
  policyNumber: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationDocument {
  _id: string;
  name: string;
  type: string;
  registrationNumber: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillDocument {
  _id: string;
  userId: string;
  hospitalOrgId: string | null;
  title: string;
  category: "consultation" | "surgery" | "medication" | "tests" | "imaging" | "other";
  amount: number;
  description: string | null;
  billDate: Date;
  documentUrls: Array<{
    filename: string;
    mimetype: string;
    size: number;
    uploadedAt: Date;
  }>;
  status: "pending" | "submitted" | "approved" | "rejected" | "paid" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface ClaimDocument {
  _id: string;
  billId: string;
  userId: string;
  insuranceOrgId: string;
  hospitalOrgId: string | null;
  claimNumber: string;
  totalAmount: number;
  status: "submitted" | "verification" | "processing" | "approved" | "rejected";
  submittedAt: Date;
  verifiedAt: Date | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClaimEventDocument {
  _id: string;
  claimId: string;
  status: "submitted" | "verification" | "processing" | "approved" | "rejected";
  notes: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationDocument {
  _id: string;
  userId: string;
  type: "claim_approved" | "claim_rejected" | "bill_uploaded" | "claim_created" | "general";
  title: string;
  message: string;
  relatedId: string | null;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttachmentDocument {
  url: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: Date;
}

export interface MessageDocument {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  attachments: AttachmentDocument[];
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationDocument {
  _id: string;
  participants: string[];
  subject: string;
  lastMessage: string | null;
  lastMessageAt: Date | null;
  lastMessageSenderId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLogDocument {
  _id: string;
  userId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entityType: "bill" | "claim" | "user" | "organization" | "message";
  entityId: string;
  oldValues: Record<string, any>;
  newValues: Record<string, any>;
  timestamp: Date;
  ipAddress: string | null;
}

export interface MigrationDocument {
  _id: string;
  version: number;
  name: string;
  appliedAt: Date;
  description: string;
}

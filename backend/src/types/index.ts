export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "patient" | "hospital" | "insurance";
  orgId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  type: "hospital" | "insurance";
  registrationNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsurancePolicy {
  id: string;
  userId: string;
  insuranceOrgId: string;
  policyNumber: string;
  planName: string;
  totalCoverage: number;
  usedCoverage: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bill {
  id: string;
  userId: string;
  hospitalOrgId: string;
  title: string;
  category:
    | "lab"
    | "medicine"
    | "consultation"
    | "surgery"
    | "diagnostic"
    | "other";
  amount: number;
  description?: string;
  billDate: Date;
  documentUrls: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Claim {
  id: string;
  billId: string;
  userId: string;
  insuranceOrgId: string;
  hospitalOrgId: string;
  claimNumber: string;
  totalAmount: number;
  status: "submitted" | "verification" | "processing" | "approved" | "rejected";
  submittedAt: Date;
  verifiedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClaimEvent {
  id: string;
  claimId: string;
  status: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId?: string;
  organizationId?: string;
  claimId?: string;
  subject?: string;
  body: string;
  attachmentUrls: string[];
  isRead: boolean;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  fromUserId: string;
  toUserId: string;
  text: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: "patient" | "hospital" | "insurance" | "admin";
  orgId?: string;
}

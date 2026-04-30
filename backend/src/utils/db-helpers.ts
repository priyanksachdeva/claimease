/**
 * ✅ FIXED: Issue #6 - Database collection helpers with proper typing
 * Replaces 'as any' casts with strongly-typed collection access
 */

import { Db, Collection } from "mongodb";
import {
  UserDocument,
  OrganizationDocument,
  BillDocument,
  ClaimDocument,
  ClaimEventDocument,
  NotificationDocument,
  MessageDocument,
  ConversationDocument,
  AuditLogDocument,
  MigrationDocument,
} from "../types/db.js";

export class TypedCollectionHelper {
  static getUsersCollection(db: Db): Collection<UserDocument> {
    return db.collection("users") as Collection<UserDocument>;
  }

  static getOrganizationsCollection(db: Db): Collection<OrganizationDocument> {
    return db.collection("organizations") as Collection<OrganizationDocument>;
  }

  static getBillsCollection(db: Db): Collection<BillDocument> {
    return db.collection("bills") as Collection<BillDocument>;
  }

  static getClaimsCollection(db: Db): Collection<ClaimDocument> {
    return db.collection("claims") as Collection<ClaimDocument>;
  }

  static getClaimEventsCollection(db: Db): Collection<ClaimEventDocument> {
    return db.collection("claimEvents") as Collection<ClaimEventDocument>;
  }

  static getNotificationsCollection(db: Db): Collection<NotificationDocument> {
    return db.collection("notifications") as Collection<NotificationDocument>;
  }

  static getMessagesCollection(db: Db): Collection<MessageDocument> {
    return db.collection("messages") as Collection<MessageDocument>;
  }

  static getConversationsCollection(db: Db): Collection<ConversationDocument> {
    return db.collection("conversations") as Collection<ConversationDocument>;
  }

  static getAuditLogsCollection(db: Db): Collection<AuditLogDocument> {
    return db.collection("auditLogs") as Collection<AuditLogDocument>;
  }

  static getMigrationsCollection(db: Db): Collection<MigrationDocument> {
    return db.collection("migrations") as Collection<MigrationDocument>;
  }
}

/**
 * Database entity types derived from Drizzle schema
 * These types represent the shape of data from the database
 */

import type { InferSelectModel, InferInsertModel } from "drizzle-orm"
import type {
    users,
    units,
    projects,
    announcements,
    visitors,
    parcels,
    bills,
    maintenanceRequests,
    facilities,
    bookings,
    sosAlerts,
    supportTickets,
} from "@/lib/db/schema"

// ==========================================
// Select Types (for reading from DB)
// ==========================================

export type User = InferSelectModel<typeof users>
export type Unit = InferSelectModel<typeof units>
export type Project = InferSelectModel<typeof projects>
export type Announcement = InferSelectModel<typeof announcements>
export type Visitor = InferSelectModel<typeof visitors>
export type Parcel = InferSelectModel<typeof parcels>
export type Bill = InferSelectModel<typeof bills>
export type MaintenanceRequest = InferSelectModel<typeof maintenanceRequests>
export type Facility = InferSelectModel<typeof facilities>
export type Booking = InferSelectModel<typeof bookings>
export type SosAlert = InferSelectModel<typeof sosAlerts>
export type SupportTicket = InferSelectModel<typeof supportTickets>

// ==========================================
// Insert Types (for creating new records)
// ==========================================

export type NewUser = InferInsertModel<typeof users>
export type NewUnit = InferInsertModel<typeof units>
export type NewProject = InferInsertModel<typeof projects>
export type NewAnnouncement = InferInsertModel<typeof announcements>
export type NewVisitor = InferInsertModel<typeof visitors>
export type NewParcel = InferInsertModel<typeof parcels>
export type NewBill = InferInsertModel<typeof bills>
export type NewMaintenanceRequest = InferInsertModel<typeof maintenanceRequests>
export type NewFacility = InferInsertModel<typeof facilities>
export type NewBooking = InferInsertModel<typeof bookings>
export type NewSosAlert = InferInsertModel<typeof sosAlerts>
export type NewSupportTicket = InferInsertModel<typeof supportTickets>

// ==========================================
// Partial/Pick Types for common use cases
// ==========================================

export type UserBasicInfo = Pick<User, "id" | "name" | "email" | "avatar" | "role">
export type UnitBasicInfo = Pick<Unit, "id" | "unitNumber" | "building" | "floor">
export type AnnouncementPreview = Pick<Announcement, "id" | "title" | "isPinned" | "createdAt">

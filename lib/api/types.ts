/**
 * API Types - Type definitions for all API responses
 * 
 * Usage:
 * import { ApiResponse, SupportTicketWithRelations } from '@/lib/api/types'
 */

import type {
    Project,
    Unit,
    User,
    Announcement,
    Visitor,
    Parcel,
    MaintenanceRequest,
    Bill,
    Facility,
    Booking,
    SosAlert,
    SupportTicket,
    GuardCheckpoint,
    GuardPatrol,
    PaymentSettings,
    Notification,
    Equipment,
    Part,
    PartUsage,
    MaintenanceLog,
} from '@/lib/db/schema'

// ==========================================
// Generic API Response Types
// ==========================================

/** Generic API response wrapper */
export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
};

/** Paginated API response */
export type PaginatedResponse<T> = ApiResponse<T> & {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
};

// ==========================================
// User Types with Relations
// ==========================================

export type UserWithRelations = User & {
    project?: Project | null;
    unit?: UnitBasic | null;
};

export type UserBasic = Pick<User, 'id' | 'name' | 'email' | 'phone' | 'avatar' | 'role'>;

// ==========================================
// Unit Types with Relations
// ==========================================

export type UnitBasic = Pick<Unit, 'id' | 'unitNumber' | 'building' | 'floor'>;

export type UnitWithRelations = Unit & {
    project?: Project | null;
    users?: UserBasic[] | null;
};

// ==========================================
// Support Ticket Types
// ==========================================

export type SupportTicketWithRelations = SupportTicket & {
    unit?: UnitBasic | null;
    user?: UserBasic | null;
};

export type SupportTicketListItem = Pick<
    SupportTicket,
    'id' | 'unitId' | 'userId' | 'subject' | 'status' | 'createdAt' | 'repliedAt'
> & {
    unit?: UnitBasic | null;
    user?: Pick<User, 'id' | 'name' | 'email'> | null;
};

// ==========================================
// Maintenance Types
// ==========================================

export type MaintenanceRequestWithRelations = MaintenanceRequest & {
    unit?: UnitBasic | null;
    assignedToUser?: UserBasic | null;
    createdByUser?: UserBasic | null;
    logs?: MaintenanceLog[] | null;
};

export type MaintenanceRequestListItem = Pick<
    MaintenanceRequest,
    'id' | 'unitId' | 'category' | 'title' | 'status' | 'priority' | 'createdAt' | 'completedAt'
> & {
    unit?: UnitBasic | null;
    assignedToUser?: Pick<User, 'id' | 'name'> | null;
};

// ==========================================
// Bill Types
// ==========================================

export type BillWithRelations = Bill & {
    unit?: UnitBasic | null;
    verifiedByUser?: UserBasic | null;
};

export type BillListItem = Pick<
    Bill,
    'id' | 'unitId' | 'billType' | 'amount' | 'dueDate' | 'paidAt' | 'status'
> & {
    unit?: UnitBasic | null;
};

// ==========================================
// Booking Types
// ==========================================

export type BookingWithRelations = Booking & {
    facility?: Facility | null;
    unit?: UnitBasic | null;
    user?: UserBasic | null;
};

export type BookingListItem = Pick<
    Booking,
    'id' | 'facilityId' | 'unitId' | 'bookingDate' | 'startTime' | 'endTime' | 'status'
> & {
    facility?: Pick<Facility, 'id' | 'name' | 'image'> | null;
    unit?: UnitBasic | null;
};

// ==========================================
// Parcel Types
// ==========================================

export type ParcelWithRelations = Parcel & {
    unit?: UnitBasic | null;
    receivedByUser?: UserBasic | null;
    pickedUpByUser?: UserBasic | null;
};

export type ParcelListItem = Pick<
    Parcel,
    'id' | 'unitId' | 'trackingNumber' | 'courier' | 'receivedAt' | 'pickedUpAt'
> & {
    unit?: UnitBasic | null;
};

// ==========================================
// Visitor Types
// ==========================================

export type VisitorWithRelations = Visitor & {
    unit?: UnitBasic | null;
    approvedByUser?: UserBasic | null;
};

export type VisitorListItem = Pick<
    Visitor,
    'id' | 'unitId' | 'visitorName' | 'phone' | 'licensePlate' | 'status' | 'checkInAt' | 'checkOutAt'
> & {
    unit?: UnitBasic | null;
};

// ==========================================
// Facility Types
// ==========================================

export type FacilityWithBookings = Facility & {
    bookings?: BookingListItem[] | null;
    project?: Project | null;
};

// ==========================================
// SOS Alert Types
// ==========================================

export type SosAlertWithRelations = SosAlert & {
    unit?: UnitBasic | null;
    user?: UserBasic | null;
    resolvedByUser?: UserBasic | null;
};

// ==========================================
// Announcement Types
// ==========================================

export type AnnouncementWithRelations = Announcement & {
    project?: Project | null;
    author?: UserBasic | null;
};

// ==========================================
// Parts/Inventory Types
// ==========================================

export type PartWithRelations = Part & {
    project?: Project | null;
    usage?: PartUsage[] | null;
};

export type PartListItem = Pick<
    Part,
    'id' | 'name' | 'category' | 'sku' | 'unit' | 'currentStock' | 'minStockLevel' | 'unitPrice'
>;

// ==========================================
// Equipment Types
// ==========================================

export type EquipmentWithRelations = Equipment & {
    project?: Project | null;
    assignedToUser?: UserBasic | null;
};

// ==========================================
// Project Types
// ==========================================

export type ProjectWithRelations = Project & {
    units?: UnitBasic[] | null;
    paymentSettings?: PaymentSettings | null;
};

// ==========================================
// Audit Log Types (for Super Admin)
// ==========================================

export type AuditLog = {
    id: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    oldValue?: Record<string, unknown> | null;
    newValue?: Record<string, unknown> | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date | null;
    user?: UserBasic | null;
};

// ==========================================
// Settings Types
// ==========================================

export type SystemSettings = {
    id: string;
    key: string;
    value: string | Record<string, unknown>;
    category: string;
    description?: string | null;
    updatedAt: Date | null;
    updatedBy?: UserBasic | null;
};

// ==========================================
// Dashboard Stats Types
// ==========================================

export type DashboardStats = {
    totalUnits: number;
    totalResidents: number;
    pendingMaintenance: number;
    unpaidBills: number;
    activeVisitors: number;
    pendingParcels: number;
    activeSosAlerts: number;
    openSupportTickets: number;
};

export type MaintenanceStats = {
    pending: number;
    inProgress: number;
    completed: number;
    total: number;
    avgResolutionTime?: number;
};

export type BillStats = {
    pending: number;
    paid: number;
    overdue: number;
    totalAmount: number;
    collectedAmount: number;
};

// ==========================================
// Re-export schema types for convenience
// ==========================================

export type {
    Project,
    Unit,
    User,
    Announcement,
    Visitor,
    Parcel,
    MaintenanceRequest,
    Bill,
    Facility,
    Booking,
    SosAlert,
    SupportTicket,
    GuardCheckpoint,
    GuardPatrol,
    PaymentSettings,
    Notification,
    Equipment,
    Part,
    PartUsage,
    MaintenanceLog,
} from '@/lib/db/schema'

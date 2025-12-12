import {
    pgTable,
    uuid,
    varchar,
    text,
    boolean,
    timestamp,
    integer,
    decimal,
    date,
    time,
    jsonb,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ==========================================
// 1. Projects (โครงการ)
// ==========================================
export const projects = pgTable('projects', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    address: text('address'),
    type: varchar('type', { length: 50 }), // 'condo' | 'village'
    logo: text('logo'),
    settings: jsonb('settings'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})

// ==========================================
// 2. Units (ห้อง/บ้าน)
// ==========================================
export const units = pgTable('units', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').references(() => projects.id).notNull(),
    unitNumber: varchar('unit_number', { length: 50 }).notNull(),
    building: varchar('building', { length: 100 }),
    floor: integer('floor'),
    size: decimal('size'),
    createdAt: timestamp('created_at').defaultNow(),
})

// ==========================================
// 3. Users (ผู้ใช้งาน)
// ==========================================
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }),
    phone: varchar('phone', { length: 20 }),
    avatar: text('avatar'),
    password: varchar('password', { length: 255 }), // For credentials auth
    role: varchar('role', { length: 50 }).notNull().default('resident'),
    projectId: uuid('project_id').references(() => projects.id),
    unitId: uuid('unit_id').references(() => units.id),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})

// ==========================================
// 4. Announcements (ประกาศ)
// ==========================================
export const announcements = pgTable('announcements', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').references(() => projects.id).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content'),
    image: text('image'),
    isPinned: boolean('is_pinned').default(false),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
})

// ==========================================
// 5. Visitors (ผู้มาติดต่อ)
// ==========================================
export const visitors = pgTable('visitors', {
    id: uuid('id').primaryKey().defaultRandom(),
    unitId: uuid('unit_id').references(() => units.id).notNull(),
    visitorName: varchar('visitor_name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    licensePlate: varchar('license_plate', { length: 20 }),
    purpose: text('purpose'),
    qrCode: text('qr_code'),
    status: varchar('status', { length: 50 }).default('pending'),
    approvedBy: uuid('approved_by').references(() => users.id),
    checkInAt: timestamp('check_in_at'),
    checkOutAt: timestamp('check_out_at'),
    createdAt: timestamp('created_at').defaultNow(),
})

// ==========================================
// 6. Parcels (พัสดุ)
// ==========================================
export const parcels = pgTable('parcels', {
    id: uuid('id').primaryKey().defaultRandom(),
    unitId: uuid('unit_id').references(() => units.id).notNull(),
    trackingNumber: varchar('tracking_number', { length: 100 }),
    courier: varchar('courier', { length: 100 }),
    image: text('image'),
    receivedBy: uuid('received_by').references(() => users.id),
    receivedAt: timestamp('received_at').defaultNow(),
    pickedUpAt: timestamp('picked_up_at'),
    pickedUpBy: uuid('picked_up_by').references(() => users.id),
})

// ==========================================
// 7. Maintenance Requests (แจ้งซ่อม)
// ==========================================
export const maintenanceRequests = pgTable('maintenance_requests', {
    id: uuid('id').primaryKey().defaultRandom(),
    unitId: uuid('unit_id').references(() => units.id).notNull(),
    category: varchar('category', { length: 100 }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    images: jsonb('images'),
    status: varchar('status', { length: 50 }).default('pending'),
    priority: varchar('priority', { length: 20 }).default('normal'),
    assignedTo: uuid('assigned_to').references(() => users.id),
    createdBy: uuid('created_by').references(() => users.id),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow(),
})

// ==========================================
// 8. Bills (บิล)
// ==========================================
export const bills = pgTable('bills', {
    id: uuid('id').primaryKey().defaultRandom(),
    unitId: uuid('unit_id').references(() => units.id).notNull(),
    billType: varchar('bill_type', { length: 50 }).notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    dueDate: date('due_date'),
    paidAt: timestamp('paid_at'),
    paymentRef: varchar('payment_ref', { length: 100 }),
    status: varchar('status', { length: 50 }).default('pending'),

    // Payment tracking fields
    paymentMethod: varchar('payment_method', { length: 50 }), // 'self_qr' | 'gateway'
    paymentSlipUrl: text('payment_slip_url'), // URL ของสลิปที่อัพโหลด
    paymentVerifiedAt: timestamp('payment_verified_at'),
    paymentVerifiedBy: uuid('payment_verified_by').references(() => users.id),
    gatewayTransactionId: varchar('gateway_transaction_id', { length: 255 }),
    gatewayResponse: jsonb('gateway_response'),

    createdAt: timestamp('created_at').defaultNow(),
})

// ==========================================
// 8.1 Payment Settings (การตั้งค่าชำระเงิน)
// ==========================================
export const paymentSettings = pgTable('payment_settings', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').references(() => projects.id).notNull().unique(),

    // Payment Method Toggle
    paymentMethod: varchar('payment_method', { length: 50 }).notNull().default('self_qr'), // 'self_qr' | 'gateway'

    // Self QR Configuration
    promptpayType: varchar('promptpay_type', { length: 20 }), // 'phone' | 'tax_id' | 'ewallet'
    promptpayId: varchar('promptpay_id', { length: 50 }), // เบอร์โทร, เลขประจำตัวผู้เสียภาษี, หรือ ID
    accountName: varchar('account_name', { length: 255 }),
    bankName: varchar('bank_name', { length: 100 }),

    // Payment Gateway Configuration
    gatewayProvider: varchar('gateway_provider', { length: 50 }), // 'gb_primepay' | 'omise' | 'stripe'
    gatewayPublicKey: text('gateway_public_key'),
    gatewaySecretKey: text('gateway_secret_key'),
    gatewayMerchantId: varchar('gateway_merchant_id', { length: 100 }),

    // Features
    requireSlipUpload: boolean('require_slip_upload').default(true),
    autoVerifyPayment: boolean('auto_verify_payment').default(false),

    updatedAt: timestamp('updated_at').defaultNow(),
    createdAt: timestamp('created_at').defaultNow(),
})

// ==========================================
// 9. Facilities (พื้นที่ส่วนกลาง)
// ==========================================
export const facilities = pgTable('facilities', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').references(() => projects.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    image: text('image'),
    openTime: time('open_time'),
    closeTime: time('close_time'),
    maxCapacity: integer('max_capacity'),
    requiresApproval: boolean('requires_approval').default(false),
    isActive: boolean('is_active').default(true),
})

// ==========================================
// 10. Bookings (การจอง)
// ==========================================
export const bookings = pgTable('bookings', {
    id: uuid('id').primaryKey().defaultRandom(),
    facilityId: uuid('facility_id').references(() => facilities.id).notNull(),
    unitId: uuid('unit_id').references(() => units.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    bookingDate: date('booking_date').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    status: varchar('status', { length: 50 }).default('pending'),
    createdAt: timestamp('created_at').defaultNow(),
})

// ==========================================
// 11. SOS Alerts (แจ้งเหตุฉุกเฉิน)
// ==========================================
export const sosAlerts = pgTable('sos_alerts', {
    id: uuid('id').primaryKey().defaultRandom(),
    unitId: uuid('unit_id').references(() => units.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    latitude: decimal('latitude', { precision: 10, scale: 8 }),
    longitude: decimal('longitude', { precision: 11, scale: 8 }),
    message: text('message'),
    status: varchar('status', { length: 50 }).default('active'),
    resolvedAt: timestamp('resolved_at'),
    resolvedBy: uuid('resolved_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
})

// ==========================================
// 12. Support Tickets
// ==========================================
export const supportTickets = pgTable('support_tickets', {
    id: uuid('id').primaryKey().defaultRandom(),
    unitId: uuid('unit_id').references(() => units.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    subject: varchar('subject', { length: 255 }).notNull(),
    message: text('message'),
    status: varchar('status', { length: 50 }).default('open'),
    repliedAt: timestamp('replied_at'),
    repliedBy: uuid('replied_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
})

// ==========================================
// 13. Guard Checkpoints (จุดตรวจ รปภ.)
// ==========================================
export const guardCheckpoints = pgTable('guard_checkpoints', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').references(() => projects.id).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    location: text('location'),
    qrCode: text('qr_code'),
    isActive: boolean('is_active').default(true),
})

// ==========================================
// 14. Guard Patrols (บันทึกตรวจจุด)
// ==========================================
export const guardPatrols = pgTable('guard_patrols', {
    id: uuid('id').primaryKey().defaultRandom(),
    checkpointId: uuid('checkpoint_id').references(() => guardCheckpoints.id).notNull(),
    guardId: uuid('guard_id').references(() => users.id).notNull(),
    checkedAt: timestamp('checked_at').defaultNow(),
    note: text('note'),
    image: text('image'),
})

// ==========================================
// Relations
// ==========================================
export const projectsRelations = relations(projects, ({ many }) => ({
    units: many(units),
    users: many(users),
    announcements: many(announcements),
    facilities: many(facilities),
    guardCheckpoints: many(guardCheckpoints),
    paymentSettings: many(paymentSettings),
}))

export const unitsRelations = relations(units, ({ one, many }) => ({
    project: one(projects, {
        fields: [units.projectId],
        references: [projects.id],
    }),
    users: many(users),
    visitors: many(visitors),
    parcels: many(parcels),
    maintenanceRequests: many(maintenanceRequests),
    bills: many(bills),
    bookings: many(bookings),
    sosAlerts: many(sosAlerts),
    supportTickets: many(supportTickets),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
    project: one(projects, {
        fields: [users.projectId],
        references: [projects.id],
    }),
    unit: one(units, {
        fields: [users.unitId],
        references: [units.id],
    }),
    notifications: many(notifications),
}))

export const billsRelations = relations(bills, ({ one }) => ({
    unit: one(units, {
        fields: [bills.unitId],
        references: [units.id],
    }),
}))

export const announcementsRelations = relations(announcements, ({ one }) => ({
    project: one(projects, {
        fields: [announcements.projectId],
        references: [projects.id],
    }),
    author: one(users, {
        fields: [announcements.createdBy],
        references: [users.id],
    }),
}))

// ==========================================
// Type Exports
// ==========================================
export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert

export type Unit = typeof units.$inferSelect
export type NewUnit = typeof units.$inferInsert

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Announcement = typeof announcements.$inferSelect
export type NewAnnouncement = typeof announcements.$inferInsert

export type Visitor = typeof visitors.$inferSelect
export type NewVisitor = typeof visitors.$inferInsert

export type Parcel = typeof parcels.$inferSelect
export type NewParcel = typeof parcels.$inferInsert

export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect
export type NewMaintenanceRequest = typeof maintenanceRequests.$inferInsert

export type Bill = typeof bills.$inferSelect
export type NewBill = typeof bills.$inferInsert

export type Facility = typeof facilities.$inferSelect
export type NewFacility = typeof facilities.$inferInsert

export type Booking = typeof bookings.$inferSelect
export type NewBooking = typeof bookings.$inferInsert

export type SosAlert = typeof sosAlerts.$inferSelect
export type NewSosAlert = typeof sosAlerts.$inferInsert

export type SupportTicket = typeof supportTickets.$inferSelect
export type NewSupportTicket = typeof supportTickets.$inferInsert

export type GuardCheckpoint = typeof guardCheckpoints.$inferSelect
export type NewGuardCheckpoint = typeof guardCheckpoints.$inferInsert

export type GuardPatrol = typeof guardPatrols.$inferSelect
export type NewGuardPatrol = typeof guardPatrols.$inferInsert

export type PaymentSettings = typeof paymentSettings.$inferSelect
export type NewPaymentSettings = typeof paymentSettings.$inferInsert

// ==========================================
// 15. Notifications (การแจ้งเตือน)
// ==========================================
export const notifications = pgTable('notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message'),
    type: varchar('type', { length: 50 }).default('info'), // info, success, warning, error
    link: text('link'),
    isRead: boolean('is_read').default(false),
    createdAt: timestamp('created_at').defaultNow(),
})

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
}))

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert

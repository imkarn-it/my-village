# Database Schema Reference

> เอกสารอ้างอิง Database Schema ของระบบ My Village (อ้างอิงจาก `lib/db/schema.ts`)

## 📋 Tables Overview

| Table | คำอธิบาย | Relations |
|-------|---------|-----------|
| `users` | ผู้ใช้งานระบบ | → units, projects |
| `projects` | โครงการ/หมู่บ้าน | ← units, announcements, facilities |
| `units` | ห้อง/บ้าน | ← users, visitors, parcels, bills |
| `announcements` | ประกาศข่าวสาร | → projects, users |
| `visitors` | ผู้มาติดต่อ | → units |
| `parcels` | พัสดุ | → units, users |
| `bills` | บิลค่าส่วนกลาง | → units |
| `maintenanceRequests` | งานแจ้งซ่อม | → units, users |
| `facilities` | สิ่งอำนวยความสะดวก | → projects |
| `bookings` | การจองสิ่งอำนวยความสะดวก | → facilities, users |
| `sosAlerts` | แจ้งเหตุฉุกเฉิน | → units, users |
| `notifications` | การแจ้งเตือน | → users |
| `paymentSettings` | ตั้งค่าการชำระเงิน | → projects |
| `supportTickets` | ติดต่อนิติบุคคล | → units, users |

---

## 👤 Users Table

```typescript
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    password: text('password'),
    phone: varchar('phone', { length: 50 }),
    avatar: text('avatar'),
    role: varchar('role', { length: 50 }).default('resident'),
    unitId: uuid('unit_id').references(() => units.id),
    projectId: uuid('project_id').references(() => projects.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})
```

**Role Values:** `resident`, `admin`, `security`, `maintenance`, `super_admin`

---

## 🏘️ Projects Table

```typescript
export const projects = pgTable('projects', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    address: text('address'),
    type: varchar('type', { length: 50 }).default('condo'),
    totalUnits: integer('total_units').default(0),
    createdAt: timestamp('created_at').defaultNow(),
})
```

**Type Values:** `village`, `condo`, `apartment`

---

## 🏠 Units Table

```typescript
export const units = pgTable('units', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').references(() => projects.id).notNull(),
    unitNumber: varchar('unit_number', { length: 50 }).notNull(),
    building: varchar('building', { length: 100 }),
    floor: integer('floor'),
    type: varchar('type', { length: 50 }).default('condo'),
    area: decimal('area', { precision: 10, scale: 2 }),
    status: varchar('status', { length: 50 }).default('occupied'),
    createdAt: timestamp('created_at').defaultNow(),
})
```

**Status Values:** `vacant`, `occupied`, `reserved`

---

## 📢 Announcements Table

```typescript
export const announcements = pgTable('announcements', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id').references(() => projects.id).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content'),
    isPinned: boolean('is_pinned').default(false),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})
```

---

## 👥 Visitors Table

```typescript
export const visitors = pgTable('visitors', {
    id: uuid('id').primaryKey().defaultRandom(),
    unitId: uuid('unit_id').references(() => units.id).notNull(),
    visitorName: varchar('visitor_name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }),
    licensePlate: varchar('license_plate', { length: 50 }),
    purpose: text('purpose'),
    qrCode: text('qr_code'),
    checkInAt: timestamp('check_in_at'),
    checkOutAt: timestamp('check_out_at'),
    status: varchar('status', { length: 50 }).default('pending'),
    createdAt: timestamp('created_at').defaultNow(),
})
```

**Status Values:** `pending`, `approved`, `rejected`, `checked_in`, `checked_out`

---

## 📦 Parcels Table

```typescript
export const parcels = pgTable('parcels', {
    id: uuid('id').primaryKey().defaultRandom(),
    unitId: uuid('unit_id').references(() => units.id).notNull(),
    trackingNumber: varchar('tracking_number', { length: 100 }),
    courier: varchar('courier', { length: 100 }),
    image: text('image'),
    receivedBy: uuid('received_by').references(() => users.id),
    receivedAt: timestamp('received_at').defaultNow(),
    pickedUpBy: uuid('picked_up_by').references(() => users.id),
    pickedUpAt: timestamp('picked_up_at'),
    createdAt: timestamp('created_at').defaultNow(),
})
```

---

## 💰 Bills Table

```typescript
export const bills = pgTable('bills', {
    id: uuid('id').primaryKey().defaultRandom(),
    unitId: uuid('unit_id').references(() => units.id).notNull(),
    type: varchar('type', { length: 50 }).default('common_fee'),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    dueDate: date('due_date').notNull(),
    paidAt: timestamp('paid_at'),
    status: varchar('status', { length: 50 }).default('pending'),
    month: varchar('month', { length: 7 }),
    paymentSlipUrl: text('payment_slip_url'),
    createdAt: timestamp('created_at').defaultNow(),
})
```

**Type Values:** `common_fee`, `water`, `electricity`, `other`
**Status Values:** `pending`, `pending_verification`, `paid`, `overdue`, `cancelled`

---

## 🔧 Maintenance Requests Table

```typescript
export const maintenanceRequests = pgTable('maintenance_requests', {
    id: uuid('id').primaryKey().defaultRandom(),
    unitId: uuid('unit_id').references(() => units.id).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 50 }).default('other'),
    priority: varchar('priority', { length: 50 }).default('normal'),
    status: varchar('status', { length: 50 }).default('pending'),
    images: text('images').array(),
    assignedTo: uuid('assigned_to').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
})
```

**Category Values:** `plumbing`, `electrical`, `structural`, `other`
**Priority Values:** `low`, `normal`, `high`, `urgent`
**Status Values:** `pending`, `in_progress`, `completed`, `cancelled`

---

## 🚨 SOS Alerts Table

```typescript
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
```

---

## 📊 Entity Relationships

```
projects (1) ──→ (n) units
projects (1) ──→ (n) announcements
projects (1) ──→ (n) facilities

units (1) ──→ (n) users
units (1) ──→ (n) visitors
units (1) ──→ (n) parcels
units (1) ──→ (n) bills
units (1) ──→ (n) maintenanceRequests

users (1) ──→ (n) announcements (createdBy)
users (1) ──→ (n) parcels (receivedBy)
users (1) ──→ (n) maintenanceRequests (assignedTo)
users (1) ──→ (n) bookings
users (1) ──→ (n) sosAlerts

facilities (1) ──→ (n) bookings
```

---

## 🔧 Drizzle Type Exports

```typescript
// ใช้สำหรับ import types
import type { User, Unit, Announcement } from '@/types/entities'

// Export จาก types/entities.ts
export type User = InferSelectModel<typeof users>
export type NewUser = InferInsertModel<typeof users>
export type Unit = InferSelectModel<typeof units>
export type NewUnit = InferInsertModel<typeof units>
// ... etc
```

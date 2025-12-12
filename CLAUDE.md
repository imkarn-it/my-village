# My Village - Context Document for Claude AI

> เอกสารนี้สร้างขึ้นเพื่อให้ Claude AI เข้าใจ context ของโปรเจค My Village ได้อย่างครบถ้วนและรวดเร็ว

## 📋 สารบัญ

1. [ภาพรวมโปรเจค](#ภาพรวมโปรเจค)
2. [Tech Stack](#tech-stack)
3. [โครงสร้างโปรเจค](#โครงสร้างโปรเจค)
4. [Database Schema](#database-schema)
5. [Type System Architecture](#type-system-architecture)
6. [TypeScript Guidelines](#typescript-guidelines)
7. [Coding Conventions](#coding-conventions)
8. [Authentication System](#authentication-system)
9. [Server Actions Pattern](#server-actions-pattern)
10. [UI Design System](#ui-design-system)
11. [File Organization](#file-organization)
12. [Best Practices](#best-practices)
13. [Common Tasks](#common-tasks)
14. [Troubleshooting](#troubleshooting)

---

## ภาพรวมโปรเจค

**My Village** เป็นระบบจัดการหมู่บ้านและคอนโดมิเนียมแบบครบวงจร พัฒนาด้วย Next.js 16 (App Router) + TypeScript

### วัตถุประสงค์
- จัดการข้อมูลลูกบ้าน (Residents)
- ระบบประกาศข่าวสาร (Announcements)
- จัดการพัสดุ (Parcels)
- ระบบแจ้งซ่อม (Maintenance)
- จัดการผู้มาติดต่อ (Visitors)
- ระบบชำระค่าบริการ (Bills)
- จองสิ่งอำนวยความสะดวก (Facilities)
- ติดต่อนิติบุคคล (Support)

### User Roles
1. **Resident** - ลูกบ้าน/ผู้อยู่อาศัย
2. **Admin** - ผู้จัดการนิติบุคคล
3. **Security** - รักษาความปลอดภัย
4. **Maintenance** - ช่างซ่อมบำรุง (ยังไม่เสร็จ)
5. **Super Admin** - ผู้ดูแลระบบ (ยังไม่เสร็จ)

### อัปเดตล่าสุด (ธันวาคม 2025) - ระบบชำระเงิน
- **ปรับปรุงระบบชำระเงิน (Payment System Overhaul)**:
  - **ยกเลิก Payment Gateway**: นำระบบ Payment Gateway ออกตามความต้องการ
  - **เพิ่ม Bank Transfer**: เพิ่มตัวเลือก "โอนเงินผ่านเลขบัญชี" ควบคู่กับ PromptPay QR
  - **Admin Settings**: เพิ่มการตั้งค่าให้เลือกวิธีชำระเงินหลักได้ (PromptPay QR / Bank Transfer)
  - **Database**: ใช้ field `gatewayMerchantId` ในตาราง `paymentSettings` เพื่อเก็บ "เลขที่บัญชี" (Account Number) ชั่วคราวเพื่อเลี่ยงการทำ Migration
  - **API**: ปรับปรุง `POST /bills/:id/generate-qr` ให้ส่งข้อมูลบัญชีธนาคารกลับมาแทน QR Code หากเลือกวิธีชำระเงินเป็น Bank Transfer
  - **UI**: หน้า Resident Bill Detail แสดงผลตามการตั้งค่า (QR Code หรือ ข้อมูลบัญชี)
- **ระบบตรวจสอบสลิป (Payment Verification)**:
  - เพิ่ม Flow การตรวจสอบสลิปสำหรับ Admin (Approve/Reject)
  - แก้ไขปัญหา "ไม่พบรูปภาพสลิป" โดยแก้ชื่อ column `slipUrl` -> `paymentSlipUrl` ให้ตรงกับ Schema
  - แก้ไขปัญหา `400 Bad Request` รูปภาพ โดยปรับ Storage Bucket เป็น Public

- **ระบบ QR Code (Visitor Management)**:
  - **Generation**: สร้าง QR Code สำหรับผู้มาติดต่อ (Visitors)
  - **Scanning**: หน้าจอ Security สำหรับสแกน QR Code เพื่อ Check-in/Check-out
  - **Verification**: API endpoint สำหรับตรวจสอบความถูกต้องของ QR Code
- **ระบบแจ้งเหตุฉุกเฉิน (SOS System)**:
  - **SOS Button**: ปุ่มแจ้งเหตุฉุกเฉินสำหรับลูกบ้าน พร้อมส่งพิกัด GPS
  - **Real-time Alerts**: แจ้งเตือนทันทีไปยัง Admin และ Security
  - **Dashboard**: หน้าจอติดตามเหตุฉุกเฉินพร้อมแผนที่ Google Maps
- **ระบบการแจ้งเตือน (Notifications)**:
  - **Real-time**: แจ้งเตือนผ่าน Supabase Realtime
  - **Integration**: แจ้งเตือนเมื่อมีพัสดุ, ผู้มาติดต่อ, บิลค่าส่วนกลาง, และการแจ้งซ่อม

---

## Tech Stack

### Core Framework
- **Next.js 16.0.8** - App Router with Turbopack
- **TypeScript 5.7.2** - เปิด strict mode
- **React 19** - Latest version
- **Bun** - Package manager & runtime

### Database & ORM
- **Supabase** - PostgreSQL database
- **Drizzle ORM** - Type-safe database toolkit
- **Drizzle Studio** - Database GUI

### API Layer
- **Elysia.js** - Fast and type-safe API framework
- **Eden Treaty** - Type-safe API client (end-to-end type safety)
- **@elysiajs/cors** - CORS middleware

### Authentication
- **Auth.js v5 (NextAuth.js)** - Authentication solution
- **bcryptjs** - Password hashing

### UI Framework
- **shadcn/ui** - Re-usable components (23 components)
- **Tailwind CSS** - Utility-first CSS
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icon library

### Validation & Forms
- **Zod** - Schema validation
- **React Hook Form** - Form management (ยังไม่ได้ใช้เต็มที่)

### Utilities
- **date-fns** - Date manipulation
- **clsx + tailwind-merge** - Class name utilities
- **sonner** - Toast notifications

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript ESLint** - TypeScript linting

---

## โครงสร้างโปรเจค

```
village-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── admin/                # Admin pages
│   │   │   ├── announcements/
│   │   │   ├── bills/
│   │   │   ├── maintenance/
│   │   │   ├── parcels/
│   │   │   ├── residents/
│   │   │   └── profile/
│   │   ├── resident/             # Resident pages
│   │   │   ├── announcements/
│   │   │   ├── bills/
│   │   │   ├── facilities/
│   │   │   ├── maintenance/
│   │   │   ├── parcels/
│   │   │   ├── support/
│   │   │   ├── visitors/
│   │   │   └── profile/
│   │   └── security/             # Security pages
│   │       ├── alerts/
│   │       ├── parcels/
│   │       └── visitors/
│   ├── api/                      # API routes
│   │   └── auth/
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── layouts/                  # Layout components
│   │   └── dashboard-layout.tsx
│   ├── ui/                       # shadcn/ui components (23 files)
│   ├── profile-form.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── lib/                          # Utilities & configurations
│   ├── actions/                  # Server actions
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── announcement.ts
│   │   ├── parcel.ts
│   │   ├── visitor.ts
│   │   └── resident.ts
│   ├── db/                       # Database
│   │   ├── schema.ts             # Drizzle schema (14 tables)
│   │   └── index.ts              # Database client
│   ├── utils/                    # Utility functions
│   │   ├── type-guards.ts
│   │   └── index.ts
│   ├── auth.ts                   # Auth.js configuration
│   ├── auth.config.ts
│   ├── constants.ts              # App constants
│   └── utils.ts                  # Utility functions
├── types/                        # TypeScript types
│   ├── api/                      # API types
│   │   ├── index.ts
│   │   └── response.ts
│   ├── actions.ts                # Server action types
│   ├── components.ts             # Component prop types
│   ├── entities.ts               # Database entity types
│   ├── utils.ts                  # Utility types
│   ├── index.ts                  # Central exports
│   └── next-auth.d.ts            # NextAuth type extensions
├── public/                       # Static files
│   └── grid.svg                  # Background pattern
├── .env.local                    # Environment variables
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
├── drizzle.config.ts             # Drizzle config
├── components.json               # shadcn/ui config
├── TASKS.md                      # Development tasks
├── typescript-guideline.md       # TypeScript guidelines
└── CLAUDE.md                     # This file
```

---

## Database Schema

### 14 Tables ใน Drizzle Schema

#### 1. **users** - ผู้ใช้งาน
```typescript
- id: string (uuid, primary key)
- email: string (unique)
- name: string
- password: string (nullable - สำหรับ OAuth)
- phone: string (nullable)
- avatar: string (nullable)
- role: enum (resident, admin, security, maintenance, super_admin)
- unitId: string (nullable, foreign key → units)
- projectId: string (nullable, foreign key → projects)
- createdAt: timestamp
- updatedAt: timestamp
```

#### 2. **projects** - โครงการ/หมู่บ้าน
```typescript
- id: string (uuid, primary key)
- name: string
- address: string
- type: enum (village, condo, apartment)
- totalUnits: integer
- createdAt: timestamp
```

#### 3. **units** - ห้อง/บ้าน
```typescript
- id: string (uuid, primary key)
- projectId: string (foreign key → projects)
- unitNumber: string (เช่น "A101", "B-205")
- building: string (nullable)
- floor: integer (nullable)
- type: enum (house, condo, apartment)
- area: decimal (ตารางเมตร, nullable)
- status: enum (vacant, occupied, reserved)
- createdAt: timestamp
```

#### 4. **announcements** - ประกาศ
```typescript
- id: string (uuid, primary key)
- projectId: string (foreign key → projects)
- title: string
- content: text
- isPinned: boolean (default: false)
- createdBy: string (foreign key → users)
- createdAt: timestamp
- updatedAt: timestamp
```

#### 5. **visitors** - ผู้มาติดต่อ
```typescript
- id: string (uuid, primary key)
- unitId: string (foreign key → units)
- visitorName: string
- phone: string (nullable)
- licensePlate: string (nullable)
- purpose: string (nullable)
- qrCode: string (nullable - unique QR code token)
- checkInAt: timestamp
- checkOutAt: timestamp (nullable)
- status: enum (pending, approved, rejected, checked_in, checked_out)
  - default: 'pending'
- createdAt: timestamp
```

#### 6. **parcels** - พัสดุ
```typescript
- id: string (uuid, primary key)
- unitId: string (foreign key → units)
- trackingNumber: string
- courier: string (เช่น Kerry, Flash)
- image: string (nullable - URL รูปพัสดุ)
- receivedBy: string (foreign key → users - security)
- receivedAt: timestamp
- pickedUpBy: string (nullable, foreign key → users)
- pickedUpAt: timestamp (nullable)
- createdAt: timestamp
```

#### 7. **bills** - บิลค่าบริการ
```typescript
- id: string (uuid, primary key)
- unitId: string (foreign key → units)
- type: enum (common_fee, water, electricity, other)
- amount: decimal
- dueDate: date
- paidAt: timestamp (nullable)
- status: enum (pending, paid, overdue, cancelled)
- month: string (YYYY-MM)
- createdAt: timestamp
```

#### 8. **maintenanceRequests** - แจ้งซ่อม
```typescript
- id: string (uuid, primary key)
- unitId: string (foreign key → units)
- title: string
- description: text
- category: enum (plumbing, electrical, structural, other)
- priority: enum (low, normal, high, urgent)
- status: enum (pending, in_progress, completed, cancelled)
- images: text[] (array of URLs)
- assignedTo: string (nullable, foreign key → users)
- createdAt: timestamp
- updatedAt: timestamp
```

#### 9. **facilities** - สิ่งอำนวยความสะดวก
```typescript
- id: string (uuid, primary key)
- projectId: string (foreign key → projects)
- name: string (เช่น "สระว่ายน้ำ", "ฟิตเนส")
- description: text (nullable)
- capacity: integer (nullable)
- openTime: string (nullable, เช่น "06:00")
- closeTime: string (nullable, เช่น "22:00")
- status: enum (active, inactive, maintenance)
- createdAt: timestamp
```

#### 10. **bookings** - การจองสิ่งอำนวยความสะดวก
```typescript
- id: string (uuid, primary key)
- facilityId: string (foreign key → facilities)
- userId: string (foreign key → users)
- bookingDate: date
- startTime: string
- endTime: string
- status: enum (pending, approved, rejected, cancelled)
- notes: text (nullable)
- createdAt: timestamp
```

#### 11. **sosAlerts** - แจ้งเหตุฉุกเฉิน
```typescript
- id: string (uuid, primary key)
- userId: string (foreign key → users)
- message: text (nullable)
- location: string (nullable)
- status: enum (active, resolved)
- createdAt: timestamp
- resolvedAt: timestamp (nullable)
```

#### 12. **accounts** - NextAuth accounts
```typescript
- NextAuth standard schema
```

#### 13. **sessions** - NextAuth sessions
```typescript
- NextAuth standard schema
```

#### 14. **verificationTokens** - NextAuth verification tokens
```typescript
- NextAuth standard schema
```

### ความสัมพันธ์ระหว่างตาราง

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

## Type System Architecture

### ตำแหน่งไฟล์ Types

```
types/
├── api/                    # API-related types
│   ├── index.ts           # Re-exports
│   └── response.ts        # API response types + helpers
├── actions.ts             # Server action types
├── components.ts          # Component prop types
├── entities.ts            # Database entity types
├── utils.ts               # Utility types
├── index.ts               # Central exports (ใช้ import จากไฟล์นี้)
└── next-auth.d.ts         # NextAuth extensions
```

### Entity Types (Database)

```typescript
// Export จาก types/entities.ts
export type User = InferSelectModel<typeof users>
export type NewUser = InferInsertModel<typeof users>

// Pick types สำหรับกรณีใช้บ่อย
export type UserBasicInfo = Pick<User, "id" | "name" | "email" | "avatar" | "role">
```

**Available Entity Types:**
- `User`, `NewUser`, `UserBasicInfo`
- `Unit`, `NewUnit`, `UnitBasicInfo`
- `Project`, `NewProject`
- `Announcement`, `NewAnnouncement`, `AnnouncementPreview`
- `Visitor`, `NewVisitor`
- `Parcel`, `NewParcel`
- `Bill`, `NewBill`
- `MaintenanceRequest`, `NewMaintenanceRequest`
- `Facility`, `NewFacility`
- `Booking`, `NewBooking`
- `SosAlert`, `NewSosAlert`

### Response Types (API)

```typescript
// Export จาก types/actions.ts

// สำหรับ API endpoints ที่ return ผลลัพธ์
export type ActionResult = {
    readonly success: boolean
    readonly error?: string
    readonly data?: unknown
}

// สำหรับ Form validation errors (deprecated - ใช้กับ Server Actions เก่า)
export type FormActionState = {
    readonly error?: string
    readonly fieldErrors?: Record<string, readonly string[]>
    readonly success?: string
}

// สำหรับ Pagination
export type PaginationParams = {
    readonly page: number
    readonly limit: number
}

export type PaginatedResult<T> = {
    readonly items: readonly T[]
    readonly total: number
    readonly page: number
    readonly totalPages: number
}
```

### API Types

```typescript
// Export จาก types/api/response.ts

// Success Response
export type ApiSuccessResponse<TData> = {
    readonly success: true
    readonly data: TData
    readonly message?: string
}

// Error Response
export type ApiErrorResponse = {
    readonly success: false
    readonly error: string
    readonly code?: string
    readonly details?: Record<string, readonly string[]>
}

// Combined (Discriminated Union)
export type ApiResponse<TData> = 
    | ApiSuccessResponse<TData> 
    | ApiErrorResponse

// Pagination
export type PaginatedApiResponse<TItem> = 
    ApiSuccessResponse<PaginatedData<TItem>>

// Helper Functions
export function createSuccessResponse<T>(data: T, message?: string): ApiSuccessResponse<T>
export function createErrorResponse(error: string, code?: string): ApiErrorResponse
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T>
export function isApiError<T>(response: ApiResponse<T>): response is ApiErrorResponse
```

### Utility Types

```typescript
// Export จาก types/utils.ts

// Object Utilities
export type Nullable<T> = { [P in keyof T]: T[P] | null }
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type DeepReadonly<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> }
export type ValueOf<T> = T[keyof T]

// Function Utilities
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>>
export type AsyncFunction<TArgs extends unknown[], TReturn>

// Array Utilities
export type ArrayElement<T extends readonly unknown[]>
export type NonEmptyArray<T> = readonly [T, ...T[]]

// Status Types
export type EntityStatus = "active" | "inactive" | "pending" | "archived"
export type ApprovalStatus = "pending" | "approved" | "rejected" | "cancelled"
export type DeliveryStatus = "pending" | "picked_up" | "returned"
export type VisitorStatus = "checked_in" | "checked_out"

// Branded IDs (Type-safe IDs)
export type UserId = BrandedId<"UserId">
export type UnitId = BrandedId<"UnitId">
export type ProjectId = BrandedId<"ProjectId">
export type AnnouncementId = BrandedId<"AnnouncementId">

// Date Types
export type ISODateString = string & { readonly __type: "ISODateString" }
export type DateRange = { readonly start: Date; readonly end: Date }
```

### Component Types

```typescript
// Export จาก types/components.ts

export type DashboardLayoutProps = {
    readonly children: ReactNode
}

export type NavigationItem = {
    readonly href: string
    readonly label: string
    readonly icon: ReactNode
    readonly badge?: string | number
}

export type UserSessionProps = {
    readonly name: string
    readonly email: string
    readonly avatar?: string
    readonly role: Role
}

export type StatusVariant = 
    | "pending" | "approved" | "rejected" 
    | "completed" | "cancelled" | "active" | "inactive"

export type StatusBadgeProps = {
    readonly status: StatusVariant
    readonly label?: string
}

export type TableColumn<T> = {
    readonly key: keyof T | string
    readonly header: string
    readonly render?: (item: T) => ReactNode
    readonly sortable?: boolean
    readonly width?: string
}

export type DataTableProps<T> = {
    readonly data: readonly T[]
    readonly columns: readonly TableColumn<T>[]
    readonly loading?: boolean
    readonly emptyMessage?: string
    readonly onRowClick?: (item: T) => void
}

export type FieldErrors = Record<string, readonly string[]>

export type BaseFormProps = {
    readonly isLoading?: boolean
    readonly errors?: FieldErrors
    readonly onSubmit?: () => void
}

export type ModalProps = {
    readonly isOpen: boolean
    readonly onClose: () => void
    readonly title?: string
    readonly description?: string
    readonly children: ReactNode
}

export type ConfirmDialogProps = ModalProps & {
    readonly onConfirm: () => void
    readonly confirmLabel?: string
    readonly cancelLabel?: string
    readonly variant?: "default" | "destructive"
}
```

### วิธีใช้งาน Types

```typescript
// ✅ ถูกต้อง - Import จาก central index
import type { User, FormActionState, ApiResponse } from "@/types"

// ❌ ผิด - อย่า import จากไฟล์ย่อยโดยตรง
import type { User } from "@/types/entities"
```

---

## TypeScript Guidelines

### Core Principles (บังคับเสมอ!)

1. **ใช้ `type` แทน `interface`**
   ```typescript
   // ✅ ถูกต้อง
   type User = {
       id: string
       name: string
   }
   
   // ❌ ผิด
   interface User {
       id: string
       name: string
   }
   ```

2. **หลีกเลี่ยง `any` ทุกกรณี**
   ```typescript
   // ✅ ถูกต้อง
   function handleError(error: unknown): string {
       if (error instanceof Error) {
           return error.message
       }
       return "Unknown error"
   }
   
   // ❌ ผิด
   function handleError(error: any): string {
   }
   ```

3. **ใช้ `readonly` กับค่าที่ไม่ควรแก้ไข**
   ```typescript
   // ✅ ถูกต้อง
   type User = {
       readonly id: string
       readonly createdAt: Date
       name: string  // อันนี้แก้ได้
   }
   ```

4. **ใช้ `as const` กับตัวแปรคงที่**
   ```typescript
   // ✅ ถูกต้อง
   const ROLES = ["admin", "resident", "security"] as const
   type Role = typeof ROLES[number]  // "admin" | "resident" | "security"
   
   const MENU_ITEMS = [
       { label: "Home", icon: HomeIcon },
       { label: "Profile", icon: UserIcon },
   ] as const satisfies readonly MenuItem[]
   ```

5. **กำหนด Return Type แบบ Explicit เสมอ**
   ```typescript
   // ✅ ถูกต้อง - Components
   export function MyComponent(): React.JSX.Element {
       return <div>Hello</div>
   }
   
   export default async function Page(): Promise<React.JSX.Element> {
       return <div>Page</div>
   }
   
   // ✅ ถูกต้อง - Functions
   function calculateTotal(items: Item[]): number {
       return items.reduce((sum, item) => sum + item.price, 0)
   }
   
   async function fetchUser(id: string): Promise<User | null> {
       const user = await db.query.users.findFirst({ where: eq(users.id, id) })
       return user ?? null
   }
   ```

6. **ใช้ `Pick`/`Omit` แทนการสร้าง Type ใหม่**
   ```typescript
   // ✅ ถูกต้อง
   type UserPublic = Pick<User, "id" | "name" | "email">
   type UserWithoutPassword = Omit<User, "password">
   
   // ❌ ผิด - สร้างซ้ำ
   type UserPublic = {
       id: string
       name: string
       email: string
   }
   ```

7. **ใช้ Generic Functions เมื่อสามารถทำให้ Reusable**
   ```typescript
   // ✅ ถูกต้อง
   function pick<T extends Record<string, unknown>, K extends keyof T>(
       obj: T,
       keys: readonly K[]
   ): Pick<T, K> {
       const result = {} as Pick<T, K>
       for (const key of keys) {
           if (key in obj) {
               result[key] = obj[key]
           }
       }
       return result
   }
   
   // ใช้งาน
   const userBasic = pick(user, ["id", "name", "email"])
   ```

8. **ใช้ Discriminated Unions สำหรับหลายกรณี**
   ```typescript
   // ✅ ถูกต้อง
   type ApiResponse<T> = 
       | { success: true; data: T }
       | { success: false; error: string }
   
   function handleResponse<T>(response: ApiResponse<T>): void {
       if (response.success) {
           console.log(response.data)  // Type-safe!
       } else {
           console.error(response.error)  // Type-safe!
       }
   }
   ```

9. **ใช้ `Record<K, V>` สำหรับ Key-Value Mapping**
   ```typescript
   // ✅ ถูกต้อง
   type RolePermissions = Record<Role, readonly string[]>
   
   const permissions: RolePermissions = {
       admin: ["read", "write", "delete"],
       resident: ["read"],
       security: ["read", "create"]
   }
   ```

### Type Guards & Utilities

ใช้ Type Guards จาก `lib/utils/type-guards.ts`:

```typescript
import { 
    isDefined, 
    isNullish, 
    isString, 
    isNumber,
    isNonEmptyString,
    isNonEmptyArray,
    objectKeys,
    objectEntries,
    pick,
    omit,
    compact,
    unique,
    groupBy,
    getErrorMessage
} from "@/lib/utils"

// ตัวอย่างการใช้งาน
const items = [1, null, 2, undefined, 3]
const validItems = compact(items)  // [1, 2, 3]

const uniqueItems = unique([1, 2, 2, 3, 3, 3])  // [1, 2, 3]

const grouped = groupBy(users, (user) => user.role)
// { admin: User[], resident: User[], security: User[] }

if (isNonEmptyString(value)) {
    // TypeScript รู้ว่า value เป็น string ที่ไม่ empty
    console.log(value.toUpperCase())
}
```

---

## Coding Conventions

### 1. การตั้งชื่อไฟล์

```
✅ ถูกต้อง:
- page.tsx
- layout.tsx
- loading.tsx
- error.tsx
- not-found.tsx
- user-profile.tsx
- create-announcement.tsx

❌ ผิด:
- Page.tsx
- UserProfile.tsx
- createAnnouncement.tsx
```

### 2. การตั้งชื่อตัวแปร

```typescript
// ✅ ถูกต้อง
const userName = "John"
const isLoggedIn = true
const userList = []
const MAX_ITEMS = 100

// ❌ ผิด
const user_name = "John"
const UserName = "John"
const logged_in = true
```

### 3. การตั้งชื่อ Component

```typescript
// ✅ ถูกต้อง - PascalCase
export function UserProfile(): React.JSX.Element {
    return <div>Profile</div>
}

export default function DashboardPage(): React.JSX.Element {
    return <div>Dashboard</div>
}

// ❌ ผิด
export function userProfile() {}
export default function dashboardPage() {}
```

### 5. File Structure Pattern

**Page Component:**
```typescript
// 1. Imports
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"
import type { User } from "@/types"

// 2. Types (ถ้ามี local types)
type PageProps = {
    readonly params: { id: string }
}

type DashboardStat = {
    readonly title: string
    readonly value: string
}

// 3. Constants
const STATS = [
    { title: "Users", value: "100" },
] as const satisfies readonly DashboardStat[]

// 4. Helper Functions
function calculateTotal(items: Item[]): number {
    return items.reduce((sum, item) => sum + item.price, 0)
}

// 5. Main Component
export default async function Page({ params }: PageProps): Promise<React.JSX.Element> {
    const data = await fetchData()
    
    return (
        <div>
            {/* JSX */}
        </div>
    )
}
```

**API Endpoint (Elysia):**
```typescript
// File: app/api/[[...slugs]]/route.ts
import { Elysia, t } from 'elysia'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Request validation schema
const createUserSchema = t.Object({
    name: t.String({ minLength: 2 }),
    email: t.String({ format: 'email' }),
})

// Helper function
async function validateEmail(email: string): Promise<boolean> {
    const exists = await db.query.users.findFirst({
        where: eq(users.email, email)
    })
    return exists !== undefined
}

// API endpoint
app.post('/users', async ({ body }) => {
    // 1. Authentication
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' }
    }
    
    // 2. Validation (handled by Elysia schema)
    const { name, email } = body
    
    // 3. Business logic
    const emailExists = await validateEmail(email)
    if (emailExists) {
        return {
            success: false,
            error: 'Email already exists'
        }
    }
    
    // 4. Database
    const [user] = await db.insert(users).values({ name, email }).returning()
    
    // 5. Return response
    return { success: true, data: user }
}, {
    body: createUserSchema
})
```

### 6. Component Structure

```typescript
// 1. Imports
import { useState } from "react"
import { Button } from "@/components/ui/button"

// 2. Types
type ButtonProps = {
    readonly onClick: () => void
    readonly label: string
}

// 3. Constants (ถ้ามี)
const DEFAULT_LABEL = "Click Me" as const

// 4. Component
export function MyButton({ onClick, label }: ButtonProps): React.JSX.Element {
    const [count, setCount] = useState(0)
    
    function handleClick(): void {
        setCount(prev => prev + 1)
        onClick()
    }
    
    return (
        <Button onClick={handleClick}>
            {label} ({count})
        </Button>
    )
}
```

---

## Authentication System

### Configuration

**Auth.js v5** ใช้งานผ่าน 2 ไฟล์หลัก:

1. **`lib/auth.config.ts`** - Auth configuration
2. **`lib/auth.ts`** - Auth instance + helper functions

### Auth Flow

```typescript
// 1. User login
POST /api/auth/signin
  ↓
auth.config.ts → CredentialsProvider
  ↓
Verify email/password with database
  ↓
Create JWT session
  ↓
NextAuth redirects to dashboard (via middleware)

// 2. Protected page access
User visits /admin/dashboard
  ↓
middleware.ts checks session (JWT)
  ↓
If not logged in → redirect to /login
If logged in → allow access

// 3. API endpoint protection
Client calls API endpoint
  ↓
API checks session via auth()
  ↓
If not authenticated → return { error: "Unauthorized" }
If authenticated → process request
```

### การใช้งาน Auth

```typescript
// ✅ Server Component (Protected Page)
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Page(): Promise<React.JSX.Element> {
    const session = await auth()
    
    if (!session?.user?.id) {
        redirect("/login")
    }
    
    return <div>Welcome {session.user.name}</div>
}

// ✅ API Endpoint (Elysia)
import { auth } from '@/lib/auth'

.get('/protected', async () => {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' }
    }
    
    // ... rest of logic
    return { success: true, data: {...} }
})

// ✅ Client Component (ใช้ useSession hook)
"use client"

import { useSession } from "next-auth/react"

export function ProfileButton(): React.JSX.Element {
    const { data: session, status } = useSession()
    
    if (status === "loading") {
        return <div>Loading...</div>
    }
    
    if (!session) {
        return <div>Not logged in</div>
    }
    
    return <div>Hi {session.user.name}</div>
}
```

### Session Type

```typescript
// types/next-auth.d.ts
declare module "next-auth" {
    interface Session {
        user: {
            id: string
            email: string
            name: string
            role: Role
            projectId?: string | null  // Added in v1.1
        }
    }
}
```

---

## Server Actions Pattern (Deprecated)

> **⚠️ หมายเหตุ**: โปรเจคนี้ได้ migrate จาก Server Actions ไปใช้ **Elysia API + Eden Treaty** แล้ว
> 
> ส่วนนี้เก็บไว้เพื่อเป็น reference เท่านั้น สำหรับ code ใหม่ให้ใช้ API pattern แทน (ดูที่ [API Architecture](#api-architecture-elysia--eden-treaty))

### สาเหตุที่ Migrate

1. **Type Safety**: Eden Treaty ให้ type safety แบบ end-to-end ดีกว่า
2. **Reusability**: API endpoints สามารถเรียกใช้จากหลายที่ (web, mobile, external)
3. **Testing**: ง่ายต่อการ test API endpoints
4. **Error Handling**: API response format ที่ consistent
5. **Client State**: ใช้ `useState`/`useEffect` จัดการ state ได้ง่ายกว่า `useActionState`

### Pattern เก่า (สำหรับ Reference)

**Form Actions (ใช้กับ useActionState) - ไม่แนะนำแล้ว:**

```typescript
// lib/actions/example.ts (deprecated)
"use server"

import type { FormActionState } from "@/types"

export async function createItem(
    previousState: FormActionState,
    formData: FormData
): Promise<FormActionState> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { error: "Unauthorized" }
        }
        
        // ... validation and logic
        
        revalidatePath("/items")
    } catch (error: unknown) {
        return { error: "Failed" }
    }
    
    redirect("/items")
}
```

**Pattern ใหม่ที่ใช้ (API + Eden Treaty):**

```typescript
// Client Component
"use client"

import { api } from "@/lib/api/client"
import { toast } from "sonner"

export function CreateForm(): React.JSX.Element {
    const [loading, setLoading] = useState(false)
    
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        
        const formData = new FormData(e.currentTarget)
        const { data, error } = await api.items.post({
            name: formData.get("name") as string,
        })
        
        setLoading(false)
        
        if (error) {
            toast.error(error.value?.error || "เกิดข้อผิดพลาด")
            return
        }
        
        toast.success("สร้างสำเร็จ")
        router.push("/items")
    }
    
    return (
        <form onSubmit={handleSubmit}>
            <input name="name" required />
            <button disabled={loading}>
                {loading ? "กำลังสร้าง..." : "สร้าง"}
            </button>
        </form>
    )
}
```

---

## UI Design System

### Color Palette

```typescript
// Primary Colors (Resident)
emerald-500 → cyan-500

// Admin Colors
purple-500 → pink-500

// Security Colors
blue-500 → indigo-500

// Warning
amber-500 → orange-500

// Error
red-500 → pink-500

// Success
emerald-500 → green-500
```

### Design Tokens

**Cards:**
```tsx
<Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
```

**Glassmorphism:**
```tsx
<div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50">
```

**Gradient Buttons:**
```tsx
<Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600">
```

**Hover Effects:**
```tsx
<div className="hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
```

**Input Fields:**
```tsx
<Input className="h-12 bg-slate-800/50 border-slate-700/50 focus:border-emerald-500" />
```

**Gradient Badges:**
```tsx
<Badge className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 text-emerald-400 border-emerald-500/20">
```

### Font Size

- **Base**: 18px (กำหนดใน globals.css)
- **Headings**: 
  - h1: text-3xl (30px)
  - h2: text-2xl (24px)
  - h3: text-xl (20px)
- **Body**: text-base (18px)
- **Small**: text-sm (16px)

### Icons

ใช้ **Lucide React**:
```tsx
import { Home, User, Package, Bell } from "lucide-react"

<Home className="w-5 h-5" />
```

---

## File Organization

### ไดเร็กทอรี่สำคัญ

#### `/app` - Next.js App Router
```
app/
├── (auth)/              # Authentication routes (ไม่มี layout หลัก)
│   ├── login/
│   └── register/
├── (dashboard)/         # Protected dashboard routes
│   ├── admin/
│   ├── resident/
│   └── security/
└── api/                 # API routes
    └── auth/
        └── [...nextauth]/
```

#### `/components` - React Components
```
components/
├── ui/                  # shadcn/ui components (ไม่แก้ไข!)
├── layouts/             # Layout components
└── *.tsx                # Custom components
```

#### `/lib` - Utilities & Logic
```
lib/
├── actions/             # Server actions (deprecated - ใช้ API แทน)
├── api/                 # API client
│   └── client.ts        # Eden Treaty client
├── db/                  # Database
├── utils/               # Utility functions
├── auth.ts              # Auth instance
├── auth.config.ts       # Auth config
├── constants.ts         # Constants
└── utils.ts             # Main utilities
```

#### `/types` - TypeScript Types
```
types/
├── api/                 # API types
├── actions.ts
├── components.ts
├── entities.ts
├── utils.ts
└── index.ts            # ใช้ import จากไฟล์นี้!
```

### Import Paths

ใช้ `@/` alias เสมอ:

```typescript
// ✅ ถูกต้อง
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import type { User } from "@/types"
import { createUser } from "@/lib/actions/user"

// ❌ ผิด - Relative paths
import { Button } from "../../components/ui/button"
```

---

## Best Practices

### 1. Database Queries

```typescript
// ✅ ถูกต้อง - เลือกเฉพาะ columns ที่ต้องการ
const users = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
}).from(users)

// ❌ ผิด - Select ทั้งหมด (มี password!)
const users = await db.select().from(users)
```

### 2. Error Handling

```typescript
// ✅ ถูกต้อง
try {
    await riskyOperation()
} catch (error: unknown) {
    console.error("Operation failed:", error)
    if (error instanceof Error) {
        return { error: error.message }
    }
    return { error: "Unknown error" }
}

// ❌ ผิด
try {
    await riskyOperation()
} catch (error) {  // implicit any!
    return { error: error.message }
}
```

### 3. Form Validation

```typescript
// ✅ ถูกต้อง - นำ validation ไว้ใน Server Action
const schema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password too short"),
})

export async function register(
    previousState: FormActionState,
    formData: FormData
): Promise<FormActionState> {
    const result = schema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    })
    
    if (!result.success) {
        return {
            error: "Validation failed",
            fieldErrors: result.error.flatten().fieldErrors,
        }
    }
    
    // ... continue
}
```

### 4. Loading States

```typescript
// ✅ ถูกต้อง - ใช้ loading.tsx
// app/(dashboard)/admin/announcements/loading.tsx
export default function Loading(): React.JSX.Element {
    return <div>Loading announcements...</div>
}

// หรือใช้ Suspense
import { Suspense } from "react"

<Suspense fallback={<Loading />}>
    <AnnouncementList />
</Suspense>
```

### 7. Metadata

```typescript
// ✅ ถูกต้อง - Static metadata
export const metadata: Metadata = {
    title: "Announcements",
    description: "View all announcements",
}

// ✅ ถูกต้อง - Dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const announcement = await fetchAnnouncement(params.id)
    
    return {
        title: announcement.title,
        description: announcement.content.slice(0, 160),
    }
}
```

---

## Common Tasks

### Task 1: สร้างหน้าใหม่

```bash
# 1. สร้างไฟล์
touch app/(dashboard)/admin/new-feature/page.tsx

# 2. เขียน component
# app/(dashboard)/admin/new-feature/page.tsx
```

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewFeaturePage(): React.JSX.Element {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    New Feature
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Feature description
                </p>
            </div>
            
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Your content here</p>
                </CardContent>
            </Card>
        </div>
    )
}
```

### Task 2: เพิ่ม API Endpoint ใหม่

```typescript
// app/api/[[...slugs]]/route.ts
import { Elysia, t } from 'elysia'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { items } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// 1. Schema (Elysia validation)
const createItemSchema = t.Object({
    name: t.String({ minLength: 2 }),
    description: t.Optional(t.String()),
})

// 2. Helper functions
async function checkPermission(userId: string): Promise<boolean> {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { role: true }
    })
    return user?.role === 'admin'
}

// 3. API endpoint
app.post('/items', async ({ body }) => {
    // Auth
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' }
    }
    
    // Permission
    const hasPermission = await checkPermission(session.user.id)
    if (!hasPermission) {
        return { success: false, error: 'Insufficient permissions' }
    }
    
    // Validation (handled by Elysia schema)
    const { name, description } = body
    
    // Insert
    const [item] = await db.insert(items).values({
        name,
        description,
        createdBy: session.user.id,
    }).returning()
    
    return { success: true, data: item }
}, {
    body: createItemSchema
})
```

### Task 3: เพิ่ม Table ใหม่ใน Database

```typescript
// 1. เพิ่มใน lib/db/schema.ts
export const newTable = pgTable("new_table", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
})

// 2. เพิ่ม relations (ถ้ามี)
export const newTableRelations = relations(newTable, ({ one }) => ({
    user: one(users, {
        fields: [newTable.userId],
        references: [users.id],
    }),
}))

// 3. สร้าง types ใน types/entities.ts
export type NewTable = InferSelectModel<typeof newTable>
export type NewNewTable = InferInsertModel<typeof newTable>

// 4. Export ใน types/index.ts
export type { NewTable, NewNewTable } from "./entities"

// 5. Push schema
# bun run db:push
```

### Task 4: เพิ่ม shadcn/ui Component ใหม่

```bash
# ดูรายการ components ที่มี
bunx shadcn@latest add

# เพิ่ม component
bunx shadcn@latest add dialog
bunx shadcn@latest add select
bunx shadcn@latest add calendar
```

### Task 5: Debug TypeScript Error

```typescript
// 1. ดู error message
# bun run build

// 2. Check type
// ใช้ hover ใน VS Code หรือ
type CheckType = typeof myVariable
//   ^? จะบอก type

// 3. ใช้ type guards
if (isDefined(value)) {
    // TypeScript รู้ว่า value is T (not null/undefined)
}

// 4. Type assertion (ใช้เมื่อจำเป็นจริงๆ)
const user = data as User  // ระวัง! ต้องแน่ใจว่าถูก type
```

---

## Troubleshooting

### Problem 1: TypeScript Error "Type 'X' is not assignable to type 'Y'"

**Solution:**
1. Check ว่า type ที่กำหนดถูกต้องหรือไม่
2. ใช้ `Pick`, `Omit`, หรือ type guards
3. ตรวจสอบว่าได้ import type ถูกต้องหรือไม่

```typescript
// ❌ Error
const user: User = data  // data มี fields เยอะกว่า User

// ✅ Fix
const user: Pick<User, "id" | "name"> = data
// หรือ
const user = pick(data, ["id", "name"])
```

### Problem 2: Database Query Error

**Solution:**
```typescript
// ❌ Error: Cannot read property of undefined
const user = await db.query.users.findFirst(...)
console.log(user.name)  // Error if user is undefined

// ✅ Fix
const user = await db.query.users.findFirst(...)
if (!user) {
    return { error: "User not found" }
}
console.log(user.name)  // Safe
```

### Problem 4: Build Error - Module not found

**Solution:**
```bash
# 1. ลบ node_modules และ reinstall
rm -rf node_modules
bun install

# 2. Clear Next.js cache
rm -rf .next

# 3. Rebuild
bun run build
```

### Problem 5: Hydration Mismatch

**Solution:**
```typescript
// ❌ Problem: ใช้ Date.now() ใน server and client
export default function Component() {
    return <div>{Date.now()}</div>
}

// ✅ Fix: ใช้ useEffect หรือ suppressHydrationWarning
"use client"
import { useEffect, useState } from "react"

export default function Component() {
    const [time, setTime] = useState<number | null>(null)
    
    useEffect(() => {
        setTime(Date.now())
    }, [])
    
    if (!time) return <div>Loading...</div>
    
    return <div>{time}</div>
}
```

### Problem 6: Session ไม่ persist

**Solution:**
1. Check `.env.local` มี `NEXTAUTH_SECRET`
2. Check cookies ไม่ถูก block
3. Restart dev server

```bash
# Kill all node/bun processes
taskkill /F /IM node.exe
taskkill /F /IM bun.exe

# Start again
bun run dev
```

---

## Environment Variables

ต้องมีใน `.env.local`:

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Supabase (ถ้าใช้)
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

---

## API Architecture (Elysia + Eden Treaty)

### Overview

โปรเจคนี้ใช้ **Elysia.js** สร้าง API endpoints และ **Eden Treaty** เป็น type-safe client ในการเรียกใช้ API

### API Structure

```typescript
// File: app/api/[[...slugs]]/route.ts
import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'

const app = new Elysia({ prefix: '/api' })
  .use(cors())
  .get('/users', async ({ query }) => {
    // GET /api/users
    return { success: true, data: users }
  })
  .post('/users', async ({ body }) => {
    // POST /api/users
    return { success: true, data: newUser }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
    })
  })

export const GET = app.handle
export const POST = app.handle
export const PATCH = app.handle
export const DELETE = app.handle
```

### Eden Treaty Client

```typescript
// File: lib/api/client.ts
import { treaty } from '@elysiajs/eden'
import type { App } from '@/app/api/[[...slugs]]/route'

export const api = treaty<App>('http://localhost:3000')

// ใช้งาน
const { data, error } = await api.users.get({
  query: { limit: '10' }
})

if (error) {
  console.error(error.value)
} else {
  console.log(data)
}
```

### Available Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
  - Body: `{ email, password, name, role, unitId? }`
  - Returns: `{ success, data: user }`

#### Users
- `GET /api/users` - Get all users
- `GET /api/users?role={role}` - Filter by role
- `PATCH /api/users/:id` - Update user profile

#### Announcements
- `GET /api/announcements` - Get all announcements (includes author info)
- `POST /api/announcements` - Create announcement (admin only)
  - Body: `{ title, content, isPinned? }`

#### Visitors
- `GET /api/visitors?unitId={unitId}` - Get visitors by unit
- `POST /api/visitors` - Check-in visitor or pre-register (security/admin/resident)
  - Body: `{ unitId, visitorName, phone?, licensePlate?, purpose? }`
  - Auto-generates QR code token
- `PATCH /api/visitors/:id` - Update visitor status
  - Body: `{ status: 'approved' | 'rejected' | 'checked_out' }`

#### Parcels
- `GET /api/parcels?unitId={unitId}` - Get parcels by unit
- `POST /api/parcels` - Register parcel (admin/security)
- `PATCH /api/parcels/:id` - Mark as picked up
  - Body: `{ pickedUp: true }`
  - Auto-sets `pickedUpAt` and `pickedUpBy`

#### Bills
- `GET /api/bills?unitId={unitId}` - Get bills by unit
- `POST /api/bills` - Create bill (admin only)
  - Body: `{ unitId, billType, amount, dueDate?, status? }`

#### Maintenance
- `GET /api/maintenance?unitId={unitId}` - Get maintenance requests
- `POST /api/maintenance` - Create request (resident)
- `PATCH /api/maintenance/:id` - Update status (admin)

#### Units
- `GET /api/units` - Get all units
- `GET /api/units/:id` - Get unit by ID

### Response Format

**Success Response:**
```typescript
{
  success: true,
  data: T
}
```

**Error Response:**
```typescript
{
  success: false,
  error: string
}
```

### Eden Treaty Usage Patterns

```typescript
// GET with query params
const { data } = await api.visitors.get({
  query: { unitId: 'uuid', limit: '50' }
})

// POST
const { data, error } = await api.visitors.post({
  unitId: 'uuid',
  visitorName: 'John Doe',
  purpose: 'Meeting'
})

// PATCH with params
const { data } = await api.visitors({ id: 'uuid' }).patch({
  status: 'approved'
})

// Error handling
if (error) {
  toast.error(error.value?.error || 'เกิดข้อผิดพลาด')
  return
}
```

### Authentication in API

```typescript
import { auth } from '@/lib/auth'

.get('/protected', async () => {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' }
  }
  // role check
  if (session.user.role !== 'admin') {
    return { success: false, error: 'Forbidden' }
  }
  // ...
})
```

### Database Relations in API

API endpoints automatically include related data using Drizzle relations:

```typescript
// Example: GET /announcements includes author
.get('/announcements', async () => {
  const data = await db.query.announcements.findMany({
    with: {
      author: {
        columns: {
          name: true,
          role: true,
        }
      }
    }
  })
  return { success: true, data }
})
```

---

## Recent Updates (Dec 2025)

### ✅ Completed Features

1. **Admin Create Bills Page** - `app/(dashboard)/admin/bills/new/page.tsx`
   - Form with unit selection, bill type, amount, due date
   - Connected to `POST /api/bills`

2. **Resident Visitor Actions** - `app/(dashboard)/resident/visitors/page.tsx`
   - Approve/Reject buttons with `PATCH /api/visitors/:id`
   - Create QR Code (Pre-registration) - `app/(dashboard)/resident/visitors/new/page.tsx`
   - Auto-generates QR code token using `randomUUID()`

3. **Security Parcel Delivery** - `app/(dashboard)/security/parcels/page.tsx`
   - "Mark as picked up" with `PATCH /api/parcels/:id`
   - Auto-sets `pickedUpAt` and `pickedUpBy`

4. **Announcements Creator Info**
   - Added `announcementsRelations` to schema
   - `GET /api/announcements` includes author (name, role)
   - Updated admin and resident announcement pages to display creator

5. **ProjectId in Session**
   - Updated `lib/auth.config.ts` to pass `projectId` to session
   - `session.user.projectId` now available throughout the app

### 🔄 Migration Progress

**Frontend-API Integration: 80% Complete**

- [x] Profile Form → API
- [x] Admin Create Resident → API
- [x] Admin Maintenance → API
- [x] Resident Maintenance → API
- [x] Resident Parcels → API
- [x] Resident Visitors → API (with approve/reject/QR)
- [x] Resident Bills → API
- [x] Admin Bills → API (Client Component)
- [x] Admin Create Bills → API
- [x] Security Parcels → API (with deliver)
- [ ] Image Upload (postponed)
- [ ] Payment Integration (pending)

### 🔧 Technical Improvements

- Migrated from Server Actions to Elysia API + Eden Treaty
- All pages now use Client Components with `useState`/`useEffect`
- Replaced `useActionState` with direct API calls
- Added loading states and error handling with `toast`
- Implemented role-based access control in API endpoints

---

## Quick Reference

### สำคัญที่สุด!

1. **ใช้ `type` แทน `interface` เสมอ**
2. **ห้ามใช้ `any`** - ใช้ `unknown` แทน
3. **กำหนด return type ทุก function**
4. **ใช้ `as const` กับ constants**
5. **ใช้ `readonly` กับ props และ types ที่ไม่ควรแก้ไข**
6. **Import types จาก `@/types` เท่านั้น**
7. **ใช้ Elysia API + Eden Treaty แทน Server Actions**
8. **Client Components ใช้ `useState`/`useEffect` + API calls**

### Commands

```bash
# Development
bun run dev              # Start dev server
bun run build           # Build production
bun run start           # Start production server

# Database
bun run db:generate     # Generate migrations
bun run db:push         # Push schema to database
bun run db:studio       # Open Drizzle Studio
bun run db:migrate      # Run migrations

# Linting
bun run lint            # Run ESLint
```

### Keyboard Shortcuts (VS Code)

- `F12` - Go to definition
- `Shift + F12` - Find all references
- `Ctrl + .` - Quick fix
- `Ctrl + Space` - Trigger autocomplete
- `Ctrl + Shift + P` - Command palette

---

## สรุป

เอกสารนี้ครอบคลุม:
- ✅ ภาพรวมโปรเจคและ Tech Stack (รวม Elysia + Eden Treaty)
- ✅ Database Schema แบบละเอียด (อัพเดท v1.1)
- ✅ Type System Architecture
- ✅ TypeScript Guidelines และ Best Practices
- ✅ Authentication System (NextAuth v5 + projectId)
- ✅ **API Architecture (Elysia + Eden Treaty)** - ใหม่!
- ✅ Server Actions Pattern (Deprecated)
- ✅ UI Design System
- ✅ File Organization
- ✅ Common Tasks
- ✅ Troubleshooting
- ✅ **Recent Updates** - ใหม่!

**สิ่งสำคัญที่ต้องจำ:**
1. TypeScript 100% strict - ไม่มี `any`, ทุก function มี return type
2. ใช้ `type` แทน `interface` เสมอ
3. **ใช้ Elysia API + Eden Treaty** แทน Server Actions
4. Client Components ใช้ `useState`/`useEffect` + API calls
5. Import types จาก `@/types` เท่านั้น
6. Follow coding conventions อย่างเคร่งครัด

---

**เวอร์ชัน:** 1.1  
**อัพเดทล่าสุด:** 2025-12-10 (API Migration Complete)  
**ผู้สร้าง:** Claude AI (Sonnet 4.5)  
**โปรเจค:** My Village - Village Management System


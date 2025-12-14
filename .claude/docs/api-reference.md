# API Reference

> API Endpoints Reference สำหรับ My Village (Elysia + Eden Treaty)

## 🔌 API Architecture

- **Framework:** Elysia.js
- **Client:** Eden Treaty (type-safe)
- **Swagger:** `/api/swagger`

---

## 🔑 Authentication

### Login
```typescript
// Endpoint: Built-in NextAuth
POST /api/auth/signin
```

### Register
```typescript
POST /api/auth/register
Body: {
    email: string
    password: string
    name: string
    role?: 'resident' | 'admin' | 'security'
    projectId?: string
    unitId?: string
}
```

---

## 📢 Announcements

```typescript
// Get all announcements
GET /api/announcements

// Create announcement (Admin only)
POST /api/announcements
Body: {
    title: string
    content: string
    isPinned?: boolean
}

// Delete announcement
DELETE /api/announcements/:id
```

---

## 👤 Users

```typescript
// Get users (optionally filter by role)
GET /api/users
Query: { role?: string }

// Update user profile
PATCH /api/users/:id
Body: {
    name?: string
    phone?: string
    avatar?: string
}
```

---

## 👥 Visitors

```typescript
// Get visitors
GET /api/visitors
Query: { unitId?: string, limit?: string }

// Create/Check-in visitor
POST /api/visitors
Body: {
    unitId: string
    visitorName: string
    phone?: string
    licensePlate?: string
    purpose?: string
}

// Update visitor status
PATCH /api/visitors/:id
Body: {
    status: 'approved' | 'rejected' | 'checked_in' | 'checked_out'
}

// Verify QR Code
GET /api/visitors/verify/:qrCode
```

---

## 📦 Parcels

```typescript
// Get parcels
GET /api/parcels
Query: { unitId?: string }

// Register parcel
POST /api/parcels
Body: {
    unitId: string
    trackingNumber?: string
    courier?: string
    image?: string
}

// Update parcel (pickup)
PATCH /api/parcels/:id
Body: {
    pickedUpBy?: string
}
```

---

## 💰 Bills

```typescript
// Get bills
GET /api/bills
Query: { unitId?: string, status?: string }

// Create bill (Admin only)
POST /api/bills
Body: {
    unitId: string
    type: 'common_fee' | 'water' | 'electricity' | 'other'
    amount: number
    dueDate: string
    month: string
}

// Update bill
PATCH /api/bills/:id
Body: {
    status?: string
    paymentSlipUrl?: string
}

// Generate payment QR
POST /api/bills/:id/generate-qr
```

---

## 🔧 Maintenance

```typescript
// Get maintenance requests
GET /api/maintenance
Query: { unitId?: string, status?: string }

// Create request (Resident)
POST /api/maintenance
Body: {
    unitId: string
    title: string
    description?: string
    category?: 'plumbing' | 'electrical' | 'structural' | 'other'
    priority?: 'low' | 'normal' | 'high' | 'urgent'
    images?: string[]
}

// Update status (Admin)
PATCH /api/maintenance/:id
Body: {
    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    assignedTo?: string
}
```

---

## 🚨 SOS Alerts

```typescript
// Get active SOS alerts (Admin/Security)
GET /api/sos

// Create SOS alert (Resident)
POST /api/sos
Body: {
    unitId: string
    latitude?: string
    longitude?: string
    message?: string
}

// Resolve SOS alert
PATCH /api/sos/:id
Body: {
    status: 'resolved'
}
```

---

## 🔔 Notifications

```typescript
// Get notifications
GET /api/notifications
Query: { limit?: string }

// Mark as read
PATCH /api/notifications/:id
Body: { isRead: true }

// Mark all as read
PATCH /api/notifications/read-all
```

---

## 📱 Eden Treaty Usage

```typescript
import { api } from "@/lib/api/client"

// GET request
const { data, error } = await api.visitors.get({
    query: { unitId: 'uuid', limit: '50' }
})

// POST request
const { data, error } = await api.visitors.post({
    unitId: 'uuid',
    visitorName: 'John Doe',
    purpose: 'Meeting'
})

// PATCH with params
const { data, error } = await api.visitors({ id: 'uuid' }).patch({
    status: 'approved'
})

// Error handling
if (error) {
    toast.error(error.value?.error || 'เกิดข้อผิดพลาด')
    return
}
```

---

## 🔒 Type Safety Patterns

### ❌ ห้ามใช้ @ts-ignore

`@ts-ignore` ซ่อน TypeScript errors และทำให้เกิดบัkg ที่ตรวจจับยาก

```typescript
// ❌ NEVER DO THIS
// @ts-ignore - Eden Treaty type issue
const { data, error } = await api.support({ id }).get();
```

### ✅ ใช้ Type Assertion ที่ชัดเจนแทน

กำหนด expected response type อย่างชัดเจน:

```typescript
// ✅ CORRECT: ใช้ type assertion
import type { ApiResponse, SupportTicketWithRelations } from '@/lib/api/types'

const response = await api.support({ id }).get() as {
    data: ApiResponse<SupportTicketWithRelations> | null;
    error: { value: unknown } | null;
};

if (response.error) {
    throw new Error(String(response.error.value));
}

if (response.data?.success && response.data.data) {
    setTicket(response.data.data);
}
```

### 📦 API Types Location

Types ทั้งหมดอยู่ที่ `lib/api/types.ts`:

```typescript
import type {
    ApiResponse,
    SupportTicketWithRelations,
    MaintenanceRequestWithRelations,
    BillWithRelations,
    BookingWithRelations,
    ParcelWithRelations,
    UserWithRelations,
    // ... และอื่นๆ
} from '@/lib/api/types'
```

### 🔄 Pattern สำหรับ Dynamic Routes (PATCH/DELETE)

```typescript
// PATCH with params
const response = await api.support({ id }).patch({ status: newStatus }) as {
    data: ApiResponse<SupportTicketWithRelations> | null;
    error: { value: unknown } | null;
};

// DELETE with params
const response = await api.bills({ id }).delete() as {
    data: { success: boolean } | null;
    error: { value: unknown } | null;
};
```

### 🎯 Pattern สำหรับ List Endpoints (GET all)

```typescript
// GET list - ใช้ array type
const { data } = await api.support.get() as {
    data: SupportTicket[] | null;
};

if (data && Array.isArray(data)) {
    setTickets(data);
}
```

### ⚠️ เมื่อไหร่ควรใช้ Type Assertion

| สถานการณ์ | วิธีการ |
|-----------|--------|
| Eden Treaty dynamic routes (`:id`) | ใช้ `as { data: Type; error: ... }` |
| API response ที่ TypeScript infer ไม่ได้ | ใช้ `as { data: Type }` |
| Generic API wrappers | ใช้ `ApiResponse<T>` จาก types.ts |

---

## 🏗️ Next.js 15 Params Pattern

ใน Next.js 15 `params` เป็น Promise:

```typescript
// ✅ CORRECT: Next.js 15
import { use } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    // ใช้ id ตามปกติ
}
```

```typescript
// ❌ WRONG: Next.js 14 pattern (ไม่ใช้แล้ว)
export default function Page({ params }: { params: { id: string } }) {
    const { id } = params; // ❌ จะ error ใน Next.js 15
}
```

---

## 📋 TODO: @ts-ignore ที่ต้องแก้ไข

รายการไฟล์ที่ยังมี `@ts-ignore` ค้างอยู่ (ต้อง refactor ให้ใช้ type assertion ตาม pattern ด้านบน):

### Super Admin (11 ที่)
| ไฟล์ | Lines | ปัญหา |
|------|-------|-------|
| `super-admin/users/page.tsx` | 268, 285, 318, 366, 370 | API types |
| `super-admin/settings/page.tsx` | 156, 172, 204, 226 | API types |
| `super-admin/audit/page.tsx` | 266, 405 | API types |

### Resident (14 ที่)
| ไฟล์ | Lines | ปัญหา |
|------|-------|-------|
| `resident/parcels/page.tsx` | 56, 58, 60, 78, 80, 82 | API response structure |
| `resident/maintenance/page.tsx` | 150, 152, 154, 172, 174, 176 | API response structure |
| `resident/support/new/page.tsx` | 97, 105 | FormData type |
| `resident/facilities/[id]/book/page.tsx` | 70, 72, 74 | Eden Treaty type |
| `resident/facilities/page.tsx` | 84 | API types |
| `resident/bookings/page.tsx` | 92 | Eden Treaty type |
| `resident/bills/[id]/page.tsx` | 101 | Dynamic endpoint |

### Bills (6 ที่)
| ไฟล์ | Lines | ปัญหา |
|------|-------|-------|
| `bills/page.tsx` | 164, 230, 245 | API types |
| `bills/[id]/page.tsx` | 128, 155, 180 | API types |

### Maintenance (3 ที่)
| ไฟล์ | Lines | ปัญหา |
|------|-------|-------|
| `maintenance/parts/page.tsx` | 212, 264, 309 | API types |

### Admin (2 ที่)
| ไฟล์ | Lines | ปัญหา |
|------|-------|-------|
| `admin/residents/page.tsx` | 110 | API type update needed |
| `admin/parcels/parcel-actions.tsx` | 50 | Eden Treaty type |

### API Route (1 ที่)
| ไฟล์ | Lines | ปัญหา |
|------|-------|-------|
| `api/[[...slugs]]/route.ts` | 984 | Elysia Union types |

---

**รวมทั้งหมด: ~37 ที่**

### วิธีแก้ไข:
1. Import types จาก `@/lib/api/types`
2. ใช้ `as { data: Type; error: ... }` แทน `@ts-ignore`
3. ดู pattern ใน section "Type Safety Patterns" ด้านบน

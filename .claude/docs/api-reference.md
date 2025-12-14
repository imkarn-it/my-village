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

# My Village - Project Context

> **Last Updated:** 2025-12-24  
> **Version:** 0.1.0 | **Build:** 81 pages | **Tests:** 159 passing

---

## 📖 Project Overview

**My Village** - ระบบจัดการหมู่บ้านและคอนโดมิเนียมแบบครบวงจร

### Features
- จัดการลูกบ้าน (Residents)
- ประกาศข่าวสาร (Announcements)
- จัดการพัสดุ (Parcels)
- ระบบแจ้งซ่อม (Maintenance)
- ผู้มาติดต่อ + QR Code (Visitors)
- ชำระค่าบริการ (Bills)
- จองสิ่งอำนวยความสะดวก (Facilities)
- ติดต่อนิติบุคคล (Support)
- แจ้งเหตุฉุกเฉิน (SOS)

---

## 👥 User Roles

| Role | Features | Status |
|------|----------|--------|
| 🏠 **Resident** | 10 features | 100% ✅ |
| 🏢 **Admin** | 10 features | 100% ✅ |
| 👮 **Security** | 7 features | 100% ✅ |
| 🔧 **Maintenance** | 5 features | 100% ✅ |
| 👨‍💼 **Super Admin** | 6 features | 100% ✅ |

---

## ⚙️ Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Bun 1.3.4 |
| **Framework** | Next.js 16.1.0 (Turbopack) |
| **Language** | TypeScript 5.7 (strict) |
| **Styling** | TailwindCSS 4 + shadcn/ui |
| **Database** | PostgreSQL (Neon) + Drizzle ORM |
| **API** | Elysia.js + Eden Treaty |
| **Auth** | Auth.js v5 |
| **Testing** | Vitest (159 tests) + Playwright (E2E) |
| **File Upload** | Cloudinary |
| **Export** | xlsx + jspdf |

---

## 📁 Project Structure

```
village-app/
├── app/
│   ├── (auth)/           # Auth pages (login, register, etc.)
│   ├── (dashboard)/      # Protected routes by role
│   │   ├── admin/        # Admin (10 pages)
│   │   ├── resident/     # Resident (10 pages)
│   │   ├── security/     # Security (7 pages)
│   │   ├── maintenance/  # Maintenance (16 pages)
│   │   └── super-admin/  # Super Admin (8 pages)
│   └── api/              # Elysia API (46+ endpoints)
├── components/
│   ├── ui/               # shadcn/ui (DO NOT EDIT)
│   ├── shared/           # Shared components
│   └── dashboard/        # Dashboard components
├── lib/
│   ├── db/               # Drizzle ORM + schema
│   ├── services/         # Business logic
│   ├── middleware/       # Audit + soft-delete
│   └── utils/            # Utilities + export
└── __tests__/            # Unit tests
```

---

## 🔗 Quick Links

| Link | Description |
|------|-------------|
| `/api/swagger` | API Documentation |
| `/api/health` | Health Check |
| `TASKS.md` | Feature Status |

---

## ✅ Recent Updates (2025-12-24)

- **Password Reset** - Forgot/reset password flow
- **Email Verification** - Verify email page
- **Export Excel/PDF** - Reports export
- **Multi-file Upload** - Component created
- **159 Unit Tests** - All passing, no skips
- **Vitest Config** - Proper test isolation

# My Village - Project Context
1. **shadcn/ui** (built with Radix UI + TailwindCSS) - Primary choice
2. Other libraries only if shadcn/ui doesn't have the required component

### Library Documentation & Code Generation
Always use **Context7** when I need:
- Code generation
- Setup or configuration steps
- Library/API documentation
- Implementation examples

This means you should automatically use the Context7 MCP tools to:
- Resolve library ID
- Get library docs
- Find code examples

Without me having to explicitly ask.

### Command Execution Rules
- **Executing Commands:** ALWAYS use `cmd /c [command]` when running shell commands on Windows.
  - Example: `cmd /c dir`, `cmd /c bun install`
- **Package Manager:** ALWAYS use `bun` as the primary package manager.
  - Use: `bun add`, `bun install`, `bun remove`
  - Do NOT use `npm install` or `yarn add` unless bun fails
- **Building Project:** ALWAYS use `bun` for building the project.
  - Command: `cmd /c bun run build`
  - Do NOT use `npm run build` or `yarn build`.
- **Running Tests:** ALWAYS use `bun run test` (NOT `bun test`)
  - Command: `cmd /c bun run test`
  - `bun test` uses bun's test runner which includes node_modules files
  - `bun run test` uses vitest with proper config
- **Linting:** ALWAYS use `bun run lint` (runs `eslint .`)
  - Command: `cmd /c bun run lint`


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
| **State** | Zustand + React Query |
| **Real-time** | WebSocket + Polling fallback |
| **Testing** | Vitest (370 unit) + Playwright (118 E2E) |
| **File Upload** | Cloudinary |
| **Export** | xlsx + jspdf |
| **OCR** | tesseract.js |
| **Email** | nodemailer (Gmail SMTP) |

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
│   └── api/              # Elysia API (48+ endpoints)
├── components/
│   ├── ui/               # shadcn/ui (DO NOT EDIT)
│   ├── shared/           # Shared components
│   └── dashboard/        # Dashboard components
├── lib/
│   ├── db/               # Drizzle ORM + schema
│   ├── services/         # Business logic + email
│   ├── middleware/       # Audit + soft-delete
│   ├── realtime/         # WebSocket + hooks
│   ├── stores/           # Zustand global state
│   ├── cache/            # React Query + server cache
│   ├── features/         # Feature toggles
│   └── utils/            # Utilities + export
├── e2e/                  # Playwright E2E tests (126 tests)
└── __tests__/            # Unit tests (404 tests)
```

---

## 🔗 Quick Links

| Link | Description |
|------|-------------|
| `/api/swagger` | API Documentation |
| `/api/health` | Health Check |
| `TASKS.md` | Feature Status |

---

## ✅ Recent Updates (2026-01-04)

- **Feature Toggles** - เปิด/ปิดฟีเจอร์ต่อโปรเจค (maintenance, facilities, parcels) + 35 tests
- **Push Notifications** - OneSignal integration fully configured
- **Real-time Updates** - WebSocket + polling fallback for SOS/notifications
- **Zustand Stores** - Global state for notifications, SOS, UI
- **React Query** - Client-side caching with invalidation
- **Server Cache** - unstable_cache for announcements/facilities


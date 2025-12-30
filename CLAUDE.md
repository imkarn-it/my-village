# My Village - Project Context

> **Last Updated:** 2025-12-30  
> **Version:** 0.1.0 | **Build:** 86 pages | **Tests:** 345 unit + 110 E2E

---

## 🤖 AI Assistant Instructions

### Language Preference
**ALWAYS communicate in Thai** unless explicitly asked otherwise.

### Next.js Development Setup
When starting work on a Next.js project, **ALWAYS call the init tool from next-devtools-mcp FIRST** to set up proper context and establish documentation requirements. Do this automatically without being asked.

### UI Components Priority
**ALWAYS use shadcn/ui components first** when implementing UI features:
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
| **Testing** | Vitest (314 unit) + Playwright (101 E2E) |
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
│   └── api/              # Elysia API (46+ endpoints)
├── components/
│   ├── ui/               # shadcn/ui (DO NOT EDIT)
│   ├── shared/           # Shared components
│   └── dashboard/        # Dashboard components
├── lib/
│   ├── db/               # Drizzle ORM + schema
│   ├── services/         # Business logic + email
│   ├── middleware/       # Audit + soft-delete
│   └── utils/            # Utilities + export
├── e2e/                  # Playwright E2E tests (101 tests)
└── __tests__/            # Unit tests (314 tests)
```

---

## 🔗 Quick Links

| Link | Description |
|------|-------------|
| `/api/swagger` | API Documentation |
| `/api/health` | Health Check |
| `TASKS.md` | Feature Status |

---

## ✅ Recent Updates (2025-12-27)

- **E2E Tests** - 101 tests passing with Playwright
- **Auth Seeding** - Test user seeding scripts
- **Password Reset** - Forgot/reset password flow
- **Email Service** - Gmail SMTP + 5 templates
- **OCR License Plate** - Tesseract.js scanner
- **Time Attendance** - Clock in/out + GPS (API + UI wired)
- **Guard Patrol** - QR checkpoint system (API + UI wired)

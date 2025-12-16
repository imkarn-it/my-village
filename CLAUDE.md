# My Village - Context Document for Claude AI

> เอกสารนี้สร้างขึ้นเพื่อให้ Claude AI เข้าใจ context ของโปรเจค My Village ได้อย่างครบถ้วน
> 
> **สำหรับรายละเอียดเพิ่มเติม ดูที่เอกสารใน `.claude/docs/`**

---

## 📋 Quick Links

| เอกสาร | คำอธิบาย |
|--------|---------|
| [Database Schema](.claude/docs/database-schema.md) | โครงสร้างฐานข้อมูล 14 tables |
| [API Reference](.claude/docs/api-reference.md) | API Endpoints ทั้งหมด |
| [Coding Guidelines](.claude/docs/coding-guidelines.md) | มาตรฐานการเขียนโค้ด TypeScript |
| [UI Patterns](.claude/docs/ui-patterns.md) | Design tokens และ UI components |

---

## 📖 ภาพรวมโปรเจค

**My Village** เป็นระบบจัดการหมู่บ้านและคอนโดมิเนียมแบบครบวงจร

### วัตถุประสงค์
- จัดการข้อมูลลูกบ้าน (Residents)
- ระบบประกาศข่าวสาร (Announcements)
- จัดการพัสดุ (Parcels)
- ระบบแจ้งซ่อม (Maintenance)
- จัดการผู้มาติดต่อ (Visitors) + QR Code
- ระบบชำระค่าบริการ (Bills)
- จองสิ่งอำนวยความสะดวก (Facilities)
- ติดต่อนิติบุคคล (Support)
- ระบบแจ้งเหตุฉุกเฉิน (SOS)

### User Roles
| Role | คำอธิบาย | Coverage |
|------|---------|----------|
| **Resident** | ลูกบ้าน/ผู้อยู่อาศัย | 100% ✅ |
| **Admin** | ผู้จัดการนิติบุคคล | 100% ✅ |
| **Security** | รักษาความปลอดภัย | 90% ✅ |
| **Maintenance** | ช่างซ่อมบำรุง | 90% ✅ |
| **Super Admin** | ผู้ดูแลระบบ | 90% ✅ |

---

## ⚙️ Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Bun 1.3.4 |
| **Package Manager** | Bun (migrated from npm) |
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **Language** | TypeScript 5.7 (strict) |
| **Styling** | TailwindCSS 4, shadcn/ui |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Drizzle ORM |
| **API** | Elysia.js 1.4.19 + Eden Treaty |
| **Auth** | Auth.js v5 (NextAuth) |
| **Testing** | Bun Test (Unit) + Playwright (E2E) |

---

## 📁 โครงสร้างโปรเจค

```
village-app/
├── app/
│   ├── (auth)/           # Login, Register
│   ├── (dashboard)/      # Protected dashboard
│   │   ├── admin/        # Admin pages
│   │   ├── resident/     # Resident pages
│   │   └── security/     # Security pages
│   └── api/              # Elysia API
├── components/
│   ├── ui/               # shadcn/ui (ไม่แก้ไข!)
│   ├── layouts/          # Layout components
│   └── dashboard/        # Dashboard components
├── lib/
│   ├── api/client.ts     # Eden Treaty client
│   ├── db/               # Drizzle ORM
│   ├── services/         # Business logic services
│   ├── auth.ts           # Auth.js config
│   └── utils.ts          # Utilities
├── types/                # TypeScript types
├── .claude/              # Claude settings + docs
└── TASKS.md              # Development tasks
```

---

## 🔄 อัปเดตล่าสุด (16 ธันวาคม 2025)

### ✅ ฟีเจอร์ที่เสร็จแล้ว
- **QR Code System**: สร้าง/สแกน QR สำหรับผู้มาติดต่อ
- **SOS Emergency**: ปุ่มแจ้งเหตุฉุกเฉิน + GPS
- **Notifications**: Real-time alerts
- **Payment System**: PromptPay QR + Bank Transfer + Slip Verification
- **Facilities Booking**: ระบบจองสิ่งอำนวยความสะดวก (8 pages)
- **Support Tickets**: ติดต่อนิติบุคคล (4 pages)
- **Reports Module**: รายงานการเงิน/ผู้มาติดต่อ/แจ้งซ่อม
- **Maintenance Role**: Dashboard + 16 pages (ใช้ mock data)
- **Super Admin Role**: Dashboard + 14 pages (ใช้ mock data)
- **TypeScript Type Safety**: กำจัด @ts-ignore ทั้งหมด (เหลือ 1 จุดที่จำเป็น) ✅
- **Glassmorphism UI**: ใช้งาน glassmorphism pattern ทั้งโปรเจค ✅
- **Bun Migration**: ย้ายจาก npm → Bun (10x faster!) ✅
- **Elysia Update**: อัปเดตเป็น v1.4.19 (latest) ✅
- **Unit Tests**: 91/116 tests passing (78%) ✅

### 🔄 กำลังดำเนินการ
- **E2E Tests**: NextAuth credentials login issue (middleware ready)
- **API Integration**: Maintenance & Super Admin mock data → real API

### ⚠️ ยังไม่เริ่ม
- **Deployment**: Production deployment

---

## 🔧 Quick Commands

```bash
# Development
bun run dev

# Database
bun run db:push     # Push schema
bun run db:studio   # Open Drizzle Studio
bun run db:seed     # Seed sample data
bun scripts/setup-test-data.ts  # Setup E2E test data

# Testing
bun test            # Run unit tests
bun test --watch    # Watch mode
npx playwright test # Run E2E tests

# Build
bun run build
bun run lint
```

---

## 🤖 AI Assistant Instructions

### Language Preference
**ALWAYS communicate in Thai** unless explicitly asked otherwise.

### Next.js Development Setup
**When starting work on a Next.js project, ALWAYS call the `init` tool from next-devtools-mcp FIRST** to set up proper context and establish documentation requirements. Do this automatically without being asked.

### UI Components Priority
**ALWAYS use shadcn/ui components first** when implementing UI features. Check if shadcn/ui has the component you need before considering other libraries:
1. **shadcn/ui** (built with Radix UI + TailwindCSS) - Primary choice
2. Other libraries only if shadcn/ui doesn't have the required component

### Library Documentation & Code Generation
**Always use Context7** when I need:
- Code generation
- Setup or configuration steps
- Library/API documentation
- Implementation examples

This means you should **automatically** use the Context7 MCP tools to:
1. Resolve library ID
2. Get library docs
3. Find code examples

**Without me having to explicitly ask.**

### Command Execution Rules
1. **Executing Commands**: ALWAYS use `cmd /c [command]` when running shell commands on Windows.
   - Example: `cmd /c dir`, `cmd /c npm install`
2. **Building Project**: ALWAYS use `bun` for building the project.
   - Command: `cmd /c bun run build`
   - Do NOT use `npm run build` or `yarn build`.

---

## 📝 Core Conventions (ย่อ)

```typescript
// ✅ ใช้ type แทน interface
type User = { id: string; name: string }

// ✅ กำหนด Return Type
function getUser(): User { }
export function Page(): React.JSX.Element { }

// ✅ Import paths
import { Button } from "@/components/ui/button"
import type { User } from "@/types"

// ✅ API calls (Eden Treaty)
const { data, error } = await api.visitors.get()
const { data, error } = await api.visitors({ id }).patch({ status: 'approved' })
```

**สำหรับ guidelines เพิ่มเติม ดูที่:** `.claude/docs/coding-guidelines.md`

---

## 🚀 Status: 95% Complete

ดู task list ทั้งหมดที่ `TASKS.md`

### ✅ อัปเดตล่าสุด (16 ธันวาคม 2025)
- **Bun Migration**: ย้ายจาก npm → Bun สำเร็จ (10x faster!)
- **Elysia Update**: อัปเดตเป็น v1.4.19 (latest stable)
- **Unit Tests**: 91/116 tests passing (78%)
  - ✅ Validation Utils: 26/26 (100%)
  - ✅ Type Guards: 38/38 (100%)
  - ✅ Format Utils: 26/32 (81%)
  - ⏭️ formatRelativeTime: 6 tests (need Bun mocking)
  - ⏭️ Integration: 19 tests (need DB setup)
- **E2E Tests**: Middleware ready, NextAuth credentials issue
- **Build Status**: ✅ Build สำเร็จ 100% (78 pages)
- **Documentation Updated**: CLAUDE.md, TASKS.md, Bun migration guide

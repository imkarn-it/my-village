# 🏘️ My Village - ระบบจัดการหมู่บ้านอัจฉริยะ

> ระบบจัดการหมู่บ้านและคอนโดมิเนียมแบบครบวงจร พัฒนาด้วย Next.js 16

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Tests](https://img.shields.io/badge/tests-159%20passing-brightgreen)]()
[![Next.js](https://img.shields.io/badge/Next.js-16.1.0-black)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)]()

---

## 📋 สารบัญ

- [ภาพรวม](#-ภาพรวม)
- [เทคโนโลยี](#-เทคโนโลยี)
- [การติดตั้ง](#-การติดตั้ง)
- [บทบาทผู้ใช้](#-บทบาทผู้ใช้)
- [Flow ฟีเจอร์แต่ละ Role](#-flow-ฟีเจอร์แต่ละ-role)
- [โครงสร้างโปรเจค](#-โครงสร้างโปรเจค)
- [API Documentation](#-api-documentation)

---

## 🏠 ภาพรวม

**My Village** คือระบบจัดการหมู่บ้านที่ครอบคลุมทุกความต้องการ:

- 🏢 **จัดการลูกบ้าน** - ข้อมูลผู้พักอาศัยทั้งหมด
- 📢 **ประกาศข่าวสาร** - แจ้งข่าวถึงลูกบ้านแบบ Real-time
- 📦 **จัดการพัสดุ** - รับ-ส่งพัสดุพร้อมแจ้งเตือน
- 🔧 **ระบบแจ้งซ่อม** - แจ้งปัญหาและติดตามสถานะ
- 👥 **ผู้มาติดต่อ** - ลงทะเบียน + QR Code
- 💰 **ชำระค่าบริการ** - PromptPay/โอนเงิน + อัพโหลดสลิป
- 🏊 **จองสิ่งอำนวยความสะดวก** - ห้องประชุม สระว่ายน้ำ ฟิตเนส
- 🎫 **ติดต่อนิติบุคคล** - ระบบ Ticket Support
- 🚨 **แจ้งเหตุฉุกเฉิน** - ปุ่ม SOS พร้อม GPS

---

## ⚙️ เทคโนโลยี

| หมวด | เทคโนโลยี |
|------|-----------|
| **Framework** | Next.js 16.1.0 (Turbopack) |
| **Frontend** | React 19 + TypeScript 5.7 |
| **Styling** | TailwindCSS 4 + shadcn/ui |
| **Database** | PostgreSQL (Neon) + Drizzle ORM |
| **API** | Elysia.js + Eden Treaty |
| **Authentication** | Auth.js v5 |
| **File Upload** | Cloudinary |
| **QR Code** | qrcode + html5-qrcode |
| **Export** | xlsx + jspdf |
| **Testing** | Vitest (159 tests) + Playwright |

---

## 🚀 การติดตั้ง

### ความต้องการ
- Bun 1.3.4+
- PostgreSQL (Neon)

### ขั้นตอน

```bash
# Clone โปรเจค
git clone https://github.com/your-repo/village-app.git
cd village-app

# ติดตั้ง dependencies
bun install

# ตั้งค่า environment
cp .env.example .env.local
# แก้ไข DATABASE_URL และ AUTH_SECRET

# สร้างฐานข้อมูล
bun db:push

# รันโปรเจค
bun dev
```

### Scripts ที่มี

```bash
bun dev           # รัน development server
bun build         # Build production
bun test          # Run tests (159 tests)
bun e2e           # Run E2E tests
bun db:studio     # เปิด Drizzle Studio
```

---

## 👥 บทบาทผู้ใช้

### 🏠 ลูกบ้าน (Resident)
ผู้พักอาศัยในหมู่บ้าน สามารถใช้บริการต่างๆ ได้

| ฟีเจอร์ | คำอธิบาย | หน้า |
|--------|---------|------|
| แดชบอร์ด | ภาพรวมข้อมูลส่วนตัว | `/resident` |
| ดูประกาศ | อ่านข่าวสารจากนิติ | `/resident/announcements` |
| ดู/ชำระบิล | ชำระค่าส่วนกลาง | `/resident/bills` |
| แจ้งซ่อม | แจ้งปัญหาในห้อง | `/resident/maintenance` |
| ดูพัสดุ | ตรวจสอบพัสดุที่มาถึง | `/resident/parcels` |
| จัดการผู้เยี่ยม | ลงทะเบียนแขก + QR | `/resident/visitors` |
| จองสิ่งอำนวยความสะดวก | จองห้อง/สระ/ฟิตเนส | `/resident/facilities` |
| ติดต่อนิติ | ส่ง Ticket | `/resident/support` |
| ตั้งค่า | การแจ้งเตือน/ความเป็นส่วนตัว | `/resident/settings` |

---

### 🏢 ผู้ดูแลระบบ (Admin)
เจ้าหน้าที่นิติบุคคล ดูแลจัดการระบบทั้งหมด

| ฟีเจอร์ | คำอธิบาย | หน้า |
|--------|---------|------|
| แดชบอร์ด | สถิติภาพรวม | `/admin` |
| จัดการประกาศ | CRUD ประกาศ | `/admin/announcements` |
| จัดการลูกบ้าน | CRUD ผู้พักอาศัย | `/admin/residents` |
| จัดการบิล | สร้าง/ตรวจสอบบิล | `/admin/bills` |
| ตั้งค่าการชำระ | PromptPay/บัญชีธนาคาร | `/admin/payment-settings` |
| แจ้งซ่อม | ดูและมอบหมายงาน | `/admin/maintenance` |
| จัดการสิ่งอำนวยความสะดวก | CRUD + ตารางจอง | `/admin/facilities` |
| ดู SOS | รับแจ้งเหตุฉุกเฉิน | `/admin/sos` |
| รายงาน | ดู/ส่งออก Excel/PDF | `/admin/reports` |

---

### 👮 รปภ. (Security)
เจ้าหน้าที่รักษาความปลอดภัย ดูแลประตูทางเข้า

| ฟีเจอร์ | คำอธิบาย | หน้า |
|--------|---------|------|
| แดชบอร์ด | สถิติวันนี้ | `/security` |
| ลงทะเบียนผู้เยี่ยม | บันทึกแขกเข้าหมู่บ้าน | `/security/visitors/new` |
| สแกน QR | ตรวจสอบ QR ผู้เยี่ยม | `/security/scan` |
| รับพัสดุ | บันทึกพัสดุที่มาถึง | `/security/parcels` |
| ดู SOS | รับแจ้งเหตุฉุกเฉิน | `/security/sos` |
| แจ้งเตือนฉุกเฉิน | กดแจ้งเหตุด่วน | `/security/emergency` |

---

### 🔧 ช่างซ่อมบำรุง (Maintenance)
เจ้าหน้าที่ซ่อมบำรุงประจำหมู่บ้าน

| ฟีเจอร์ | คำอธิบาย | หน้า |
|--------|---------|------|
| แดชบอร์ด | งานที่ได้รับมอบหมาย | `/maintenance` |
| งานรอดำเนินการ | งานใหม่ที่ยังไม่รับ | `/maintenance/pending` |
| งานกำลังทำ | งานที่กำลังดำเนินการ | `/maintenance/in-progress` |
| งานเสร็จแล้ว | ประวัติงานที่ทำเสร็จ | `/maintenance/completed` |
| อุปกรณ์ | จัดการอุปกรณ์ซ่อม | `/maintenance/equipment` |
| สถิติ | ผลงานและประสิทธิภาพ | `/maintenance/analytics` |

---

### 👨‍💼 Super Admin
ผู้ดูแลระบบระดับสูง ดูแลหลายโปรเจค

| ฟีเจอร์ | คำอธิบาย | หน้า |
|--------|---------|------|
| แดชบอร์ด | ภาพรวมทุกโปรเจค | `/super-admin` |
| จัดการโปรเจค | CRUD หมู่บ้าน/คอนโด | `/super-admin/projects` |
| จัดการผู้ใช้ | Admin ทุกโปรเจค | `/super-admin/users` |
| สิทธิ์การเข้าถึง | RBAC | `/super-admin/permissions` |
| ฐานข้อมูล | จัดการ DB | `/super-admin/database` |
| Audit Logs | ประวัติการเปลี่ยนแปลง | `/super-admin/audit` |

---

## 🔄 Flow ฟีเจอร์แต่ละ Role

### 🏠 ลูกบ้าน - ชำระค่าส่วนกลาง

```mermaid
flowchart TD
    A[ลูกบ้านเข้าสู่ระบบ] --> B[ไปหน้าบิล]
    B --> C{มีบิลค้างชำระ?}
    C -->|ใช่| D[เลือกบิลที่ต้องการชำระ]
    C -->|ไม่| E[แสดงข้อความ ไม่มีบิลค้าง]
    D --> F[เลือกวิธีชำระ]
    F --> G[PromptPay QR]
    F --> H[โอนเงินธนาคาร]
    G --> I[สแกน QR และโอนเงิน]
    H --> I
    I --> J[อัพโหลดสลิป]
    J --> K[ระบบส่งให้ Admin ตรวจสอบ]
    K --> L{Admin ตรวจสอบ}
    L -->|อนุมัติ| M[สถานะเป็น ชำระแล้ว]
    L -->|ปฏิเสธ| N[แจ้งลูกบ้านให้ชำระใหม่]
    M --> O[ส่งแจ้งเตือนลูกบ้าน]
```

---

### 🏠 ลูกบ้าน - แจ้งซ่อม

```mermaid
flowchart TD
    A[ลูกบ้านเข้าสู่ระบบ] --> B[ไปหน้าแจ้งซ่อม]
    B --> C[กดสร้างใบแจ้งซ่อมใหม่]
    C --> D[กรอกรายละเอียด<br/>- หัวข้อ<br/>- รายละเอียด<br/>- ประเภท<br/>- ระดับความเร่งด่วน]
    D --> E[แนบรูปภาพ ถ้ามี]
    E --> F[ส่งใบแจ้งซ่อม]
    F --> G[สถานะ: รอดำเนินการ]
    G --> H[Admin เห็นใบแจ้งซ่อม]
    H --> I[Admin มอบหมายช่าง]
    I --> J[สถานะ: กำลังดำเนินการ]
    J --> K[ช่างเข้าซ่อม]
    K --> L[ช่างอัพเดทสถานะ]
    L --> M[สถานะ: เสร็จสิ้น]
    M --> N[ลูกบ้านได้รับแจ้งเตือน]
```

---

### 🏠 ลูกบ้าน - ลงทะเบียนผู้มาเยี่ยม

```mermaid
flowchart TD
    A[ลูกบ้านเข้าสู่ระบบ] --> B[ไปหน้าผู้มาเยี่ยม]
    B --> C[กดลงทะเบียนผู้เยี่ยมใหม่]
    C --> D[กรอกข้อมูลผู้เยี่ยม<br/>- ชื่อ-นามสกุล<br/>- เบอร์โทร<br/>- ทะเบียนรถ<br/>- วัตถุประสงค์<br/>- วันที่มา]
    D --> E[ระบบสร้าง QR Code]
    E --> F[ลูกบ้านส่ง QR ให้ผู้เยี่ยม]
    F --> G[ผู้เยี่ยมมาถึงหน้าด่าน]
    G --> H[รปภ. สแกน QR]
    H --> I{QR ถูกต้อง?}
    I -->|ใช่| J[บันทึกเวลาเข้า]
    I -->|ไม่| K[แจ้งลูกบ้านยืนยัน]
    J --> L[อนุญาตให้เข้า]
    K --> L
```

---

### 🏠 ลูกบ้าน - จองสิ่งอำนวยความสะดวก

```mermaid
flowchart TD
    A[ลูกบ้านเข้าสู่ระบบ] --> B[ไปหน้าสิ่งอำนวยความสะดวก]
    B --> C[เลือกสิ่งอำนวยความสะดวก<br/>เช่น สระว่ายน้ำ ฟิตเนส ห้องประชุม]
    C --> D[ดูปฏิทินว่าง]
    D --> E[เลือกวันและเวลา]
    E --> F{ช่วงเวลาว่าง?}
    F -->|ใช่| G[กรอกวัตถุประสงค์]
    F -->|ไม่| H[เลือกเวลาอื่น]
    H --> E
    G --> I[ยืนยันการจอง]
    I --> J[สถานะ: รออนุมัติ]
    J --> K[Admin ตรวจสอบ]
    K --> L{อนุมัติ?}
    L -->|ใช่| M[สถานะ: อนุมัติแล้ว]
    L -->|ไม่| N[สถานะ: ถูกปฏิเสธ]
    M --> O[ลูกบ้านได้รับแจ้งเตือน]
```

---

### 🏢 Admin - ตรวจสอบการชำระเงิน

```mermaid
flowchart TD
    A[Admin เข้าสู่ระบบ] --> B[ไปหน้าตรวจสอบบิล]
    B --> C[ดูรายการบิลที่รอตรวจสอบ]
    C --> D[เลือกบิลที่ต้องการตรวจ]
    D --> E[ดูสลิปที่อัพโหลด]
    E --> F{ตรวจสอบสลิป}
    F --> G[เปรียบเทียบยอดเงิน]
    G --> H[ตรวจสอบวันที่โอน]
    H --> I{ถูกต้อง?}
    I -->|ใช่| J[กดอนุมัติ]
    I -->|ไม่| K[กดปฏิเสธ + ใส่เหตุผล]
    J --> L[สถานะบิล: ชำระแล้ว]
    K --> M[สถานะบิล: รอชำระใหม่]
    L --> N[ส่งแจ้งเตือนลูกบ้าน]
    M --> N
```

---

### 👮 รปภ. - รับพัสดุ

```mermaid
flowchart TD
    A[พัสดุมาถึงหน้าด่าน] --> B[รปภ. เข้าระบบ]
    B --> C[ไปหน้าลงทะเบียนพัสดุ]
    C --> D[กรอกข้อมูลพัสดุ<br/>- ผู้รับ<br/>- บริษัทขนส่ง<br/>- หมายเลขติดตาม<br/>- ประเภท]
    D --> E[ถ่ายรูปพัสดุ ถ้ามี]
    E --> F[บันทึกพัสดุ]
    F --> G[ระบบแจ้งเตือนลูกบ้าน]
    G --> H[ลูกบ้านมารับพัสดุ]
    H --> I[รปภ. ยืนยันการรับ]
    I --> J[สถานะ: รับแล้ว]
```

---

### 👮 รปภ. - รับแจ้ง SOS

```mermaid
flowchart TD
    A[ลูกบ้านกดปุ่ม SOS] --> B[ระบบบันทึกพิกัด GPS]
    B --> C[ส่งแจ้งเตือน รปภ. + Admin]
    C --> D[รปภ. ได้รับแจ้งเตือนเสียง]
    D --> E[รปภ. ดูตำแหน่งบนแผนที่]
    E --> F[รปภ. ไปยังจุดเกิดเหตุ]
    F --> G[รปภ. ช่วยเหลือ]
    G --> H[รปภ. อัพเดทสถานะ]
    H --> I[สถานะ: แก้ไขแล้ว]
    I --> J[ลูกบ้านได้รับแจ้งเตือน]
```

---

### 🔧 ช่าง - รับงานซ่อม

```mermaid
flowchart TD
    A[ช่างเข้าสู่ระบบ] --> B[ดูงานรอดำเนินการ]
    B --> C[เลือกงานที่ต้องการรับ]
    C --> D[ดูรายละเอียดงาน<br/>- ปัญหา<br/>- ตำแหน่ง<br/>- รูปภาพ]
    D --> E[กดรับงาน]
    E --> F[สถานะ: กำลังดำเนินการ]
    F --> G[ช่างไปซ่อม]
    G --> H[ช่างอัพเดทความคืบหน้า]
    H --> I{ซ่อมเสร็จ?}
    I -->|ใช่| J[ถ่ายรูปหลังซ่อม]
    I -->|ไม่| K[บันทึกหมายเหตุ]
    K --> H
    J --> L[กดเสร็จสิ้น]
    L --> M[สถานะ: เสร็จสิ้น]
    M --> N[แจ้งเตือนลูกบ้าน]
```

---

## 📁 โครงสร้างโปรเจค

```
village-app/
├── app/
│   ├── (auth)/                 # หน้า Authentication
│   │   ├── login/              # เข้าสู่ระบบ
│   │   ├── register/           # ลงทะเบียน
│   │   ├── forgot-password/    # ลืมรหัสผ่าน
│   │   ├── reset-password/     # รีเซ็ตรหัสผ่าน
│   │   └── verify-email/       # ยืนยันอีเมล
│   │
│   ├── (dashboard)/            # หน้าหลังเข้าสู่ระบบ
│   │   ├── admin/              # 🏢 หน้า Admin (10 หน้า)
│   │   ├── resident/           # 🏠 หน้าลูกบ้าน (10 หน้า)
│   │   ├── security/           # 👮 หน้า รปภ. (7 หน้า)
│   │   ├── maintenance/        # 🔧 หน้าช่าง (16 หน้า)
│   │   └── super-admin/        # 👨‍💼 หน้า Super Admin (8 หน้า)
│   │
│   └── api/                    # Elysia API
│       ├── [[...slugs]]/       # API Routes (46+ endpoints)
│       ├── auth/               # NextAuth
│       ├── health/             # Health Check
│       └── upload/             # File Upload
│
├── components/
│   ├── ui/                     # shadcn/ui (อย่าแก้ไข!)
│   ├── shared/                 # Components ที่ใช้ร่วมกัน
│   ├── dashboard/              # Components เฉพาะ Dashboard
│   └── layouts/                # Layout Components
│
├── lib/
│   ├── db/                     # Drizzle ORM
│   │   ├── index.ts            # Database connection
│   │   └── schema.ts           # Database schema (14 tables)
│   ├── services/               # Business Logic
│   ├── middleware/             # Audit + Soft Delete
│   └── utils/                  # Utilities
│       └── export.ts           # Export Excel/PDF
│
├── __tests__/                  # Unit Tests
├── e2e/                        # E2E Tests (Playwright)
└── docs/                       # Documentation
```

---

## 📚 API Documentation

เปิด `/api/swagger` เพื่อดู Swagger Documentation

### Endpoints หลัก

| Endpoint | Method | คำอธิบาย |
|----------|--------|---------|
| `/api/announcements` | GET/POST | จัดการประกาศ |
| `/api/users` | GET/POST | จัดการผู้ใช้ |
| `/api/bills` | GET/POST | จัดการบิล |
| `/api/visitors` | GET/POST | จัดการผู้เยี่ยม |
| `/api/parcels` | GET/POST | จัดการพัสดุ |
| `/api/maintenance` | GET/POST | จัดการแจ้งซ่อม |
| `/api/facilities` | GET/POST | จัดการสิ่งอำนวยความสะดวก |
| `/api/bookings` | GET/POST | จัดการการจอง |
| `/api/sos` | GET/POST | จัดการ SOS |
| `/api/notifications` | GET/POST | จัดการแจ้งเตือน |

---

## 🧪 Testing

```bash
# รัน Unit Tests (159 tests)
bun test

# รัน E2E Tests
bun e2e

# ดู Coverage
bun test:coverage
```

---

## 📝 License

MIT License - ดู [LICENSE](LICENSE) สำหรับรายละเอียด

---

## 👨‍💻 ผู้พัฒนา

พัฒนาด้วย ❤️ by My Village Team

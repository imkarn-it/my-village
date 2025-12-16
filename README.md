# My Village - Village/Condominium Management System

> A modern, beautiful village and condominium management application built with Next.js 16, featuring a stunning dark-mode-first design with glassmorphism and gradient effects.

## 🚀 Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Bun 1.3.4 |
| **Framework** | Next.js 16 (Turbopack) |
| **Language** | TypeScript |
| **Styling** | TailwindCSS 4 |
| **UI Components** | shadcn/ui |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Drizzle ORM |
| **Authentication** | Auth.js v5 |

### API Layer
- **Elysia.js** - Fast and type-safe API framework
- **Eden Treaty** - Type-safe API client (end-to-end type safety)
- **@elysiajs/cors** - CORS middleware

## 🎨 Design Features

- ✨ **Glassmorphism Effects** - Beautiful blur and transparency
- 🌈 **Gradient Accents** - Vibrant color gradients throughout
- 🌙 **Dark Mode First** - Optimized for dark theme with light mode support
- 🎯 **Micro-animations** - Smooth hover effects and transitions
- 📱 **Mobile-first** - Responsive design for all devices

## ✨ Features & Status

### Completed Features (v1.1)
- ✅ **Authentication** - NextAuth v5 with credentials and role-based access
- ✅ **Admin Dashboard** - Statistics and analytics
- ✅ **Resident Dashboard** - Personal dashboard with quick actions
- ✅ **Announcements** - Create and view announcements (with creator info)
- ✅ **Parcel Management** - Track parcels with delivery status
- ✅ **Visitor Management** - Approve/reject visitors, QR code pre-registration
- ✅ **Bill Management** - Create bills, view payment status
- ✅ **Maintenance Requests** - Submit and track repair requests
- ✅ **User Profile** - Update personal information
- ✅ **Role-based Access Control** - Granular permissions per role
- ✅ **QR Code System** - Visitor generation & Security scanning
- ✅ **SOS Emergency** - Real-time alerts with GPS location
- ✅ **Notifications** - Real-time updates for all major actions

### In Progress
- 🔄 **Facilities Booking** - Booking system for common areas (Next)
- 🔄 **Image Upload** - File upload for maintenance and parcels (postponed)

### Migration Status
**Frontend-API Integration: 80% Complete**
- ✅ Migrated from Server Actions to Elysia API + Eden Treaty
- ✅ All pages now use Client Components with direct API calls
- ✅ Type-safe end-to-end communication

## 👥 User Roles

1. **Resident (ลูกบ้าน)** - View announcements, parcels, bills, manage visitors
2. **Admin (นิติบุคคล)** - Manage village operations, create bills, manage residents
3. **Security Guard (รปภ.)** - Handle visitor check-ins and parcel deliveries
4. **Maintenance Staff (ช่างซ่อม)** - Manage repair requests *(coming soon)*
5. **Super Admin (ผู้ดูแลระบบ)** - System administration *(coming soon)*

## 🏗️ Project Structure

```
village-app/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx        # Login page
│   │   └── register/page.tsx     # Registration page
│   ├── (dashboard)/
│   │   ├── admin/                # Admin pages
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── announcements/
│   │   │   ├── bills/
│   │   │   │   └── new/          # Create bill
│   │   │   ├── maintenance/
│   │   │   ├── parcels/
│   │   │   │   └── new/          # Register parcel
│   │   │   └── residents/
│   │   │       └── new/          # Add resident
│   │   ├── resident/             # Resident pages
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── announcements/
│   │   │   ├── parcels/
│   │   │   ├── bills/
│   │   │   ├── maintenance/
│   │   │   │   └── new/          # Create request
│   │   │   ├── visitors/
│   │   │   │   └── new/          # Pre-register visitor
│   │   │   ├── facilities/
│   │   │   └── support/
│   │   └── security/             # Security pages
│   │       ├── parcels/          # Manage deliveries
│   │       └── visitors/
│   │           └── new/          # Check-in visitor
│   └── api/
│       └── [[...slugs]]/route.ts # Elysia API endpoints
├── components/
│   ├── layouts/
│   │   └── dashboard-layout.tsx  # Main dashboard layout
│   ├── theme-provider.tsx        # Dark/Light mode provider
│   ├── theme-toggle.tsx          # Theme switcher
│   ├── profile-form.tsx          # Profile editor
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── actions/                  # Server actions (deprecated)
│   ├── api/
│   │   └── client.ts             # Eden Treaty API client
│   ├── db/
│   │   ├── schema.ts             # Drizzle schema (14 tables)
│   │   ├── index.ts              # DB connection
│   │   └── seed.ts               # Database seeder
│   ├── auth.ts                   # Auth.js instance
│   ├── auth.config.ts            # Auth configuration
│   ├── constants.ts              # App constants
│   └── utils.ts                  # Utility functions
├── types/                        # TypeScript type definitions
└── public/
    └── grid.svg                  # Background pattern
```

## 🔌 API Architecture

This project uses **Elysia.js** for the API layer with **Eden Treaty** for type-safe client calls.

### Available Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user

#### Users
- `GET /api/users` - Get all users
- `GET /api/users?role={role}` - Filter by role
- `PATCH /api/users/:id` - Update user profile

#### Announcements
- `GET /api/announcements` - Get announcements (includes author info)
- `POST /api/announcements` - Create announcement (admin only)

#### Visitors
- `GET /api/visitors?unitId={unitId}` - Get visitors by unit
- `POST /api/visitors` - Check-in visitor or pre-register (security/admin/resident)
- `PATCH /api/visitors/:id` - Update visitor status (approve/reject)

#### Parcels
- `GET /api/parcels?unitId={unitId}` - Get parcels by unit
- `POST /api/parcels` - Register parcel (admin/security)
- `PATCH /api/parcels/:id` - Mark as picked up

#### Bills
- `GET /api/bills?unitId={unitId}` - Get bills by unit
- `POST /api/bills` - Create bill (admin only)

#### Maintenance
- `GET /api/maintenance?unitId={unitId}` - Get maintenance requests
- `POST /api/maintenance` - Create request (resident)
- `PATCH /api/maintenance/:id` - Update status (admin)

#### Units
- `GET /api/units` - Get all units
- `GET /api/units/:id` - Get unit by ID

### Usage Example

```typescript
import { api } from "@/lib/api/client"

// GET request with query params
const { data, error } = await api.visitors.get({
  query: { unitId: 'uuid', limit: '50' }
})

// POST request
const { data, error } = await api.visitors.post({
  unitId: 'uuid',
  visitorName: 'John Doe',
  purpose: 'Meeting'
})

// PATCH request with params
const { data, error } = await api.visitors({ id: 'uuid' }).patch({
  status: 'approved'
})

// Error handling
if (error) {
  toast.error(error.value?.error || 'เกิดข้อผิดพลาด')
  return
}
```

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.3.4+
- [Supabase](https://supabase.com/) account (or PostgreSQL database)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/my-village.git
cd my-village

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials
```

### Environment Variables

```env
# App
NEXT_PUBLIC_APP_NAME=My Village
NEXT_PUBLIC_APP_VERSION=1.1.0

# Database
DATABASE_URL=postgresql://user:password@host:port/database
DIRECT_URL=postgresql://user:password@host:port/database

# Auth.js
AUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### Database Setup

```bash
# Generate migrations
bunx drizzle-kit generate

# Push schema to database
bunx drizzle-kit push

# (Optional) Open Drizzle Studio to view/edit data
bunx drizzle-kit studio
```

### Seed Database (Optional)

```bash
bun run db:seed
```

This will create:
- Sample project (My Village)
- Sample units (A101, A102, B201, etc.)
- Test users for each role:
  - Admin: `admin@village.com` / `password123`
  - Resident: `resident@village.com` / `password123`
  - Security: `security@village.com` / `password123`
- Sample announcements and data

### Run Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Available Pages

### Authentication
- `/login` - User login
- `/register` - User registration

### Resident Dashboard
- `/resident` - Dashboard with statistics
- `/resident/announcements` - View announcements
- `/resident/parcels` - Track parcels
- `/resident/bills` - View and pay bills
- `/resident/maintenance` - View repair requests
- `/resident/maintenance/new` - Create repair request
- `/resident/visitors` - Manage visitors (approve/reject)
- `/resident/visitors/new` - Pre-register visitor (QR code)
- `/resident/facilities` - Book facilities
- `/resident/support` - Contact support
- `/resident/profile` - Edit profile

### Admin Dashboard
- `/admin` - Admin dashboard with analytics
- `/admin/announcements` - Manage announcements
- `/admin/bills` - View all bills
- `/admin/bills/new` - Create new bill
- `/admin/maintenance` - Manage repair requests
- `/admin/parcels/new` - Register new parcel
- `/admin/residents` - Manage residents
- `/admin/residents/new` - Add new resident
- `/admin/sos` - SOS Emergency Dashboard
- `/admin/profile` - Edit profile

### Security Dashboard
- `/security/parcels` - Manage parcels (mark as delivered)
- `/security/visitors/new` - Check-in visitor
- `/security/scan` - QR Code Scanner
- `/security/sos` - SOS Emergency Dashboard

## 🛠️ Development

### Database Commands

```bash
# Generate migration files
bun run db:generate

# Push schema changes to database
bun run db:push

# Open Drizzle Studio
bun run db:studio

# Run database migrations
bun run db:migrate

# Seed database with sample data
bun run db:seed
```

### Build Commands

```bash
# Development
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Lint code
bun run lint
```

## 📚 Documentation

- **CLAUDE.md** - Comprehensive project documentation for AI context
- **TASKS.md** - Development tasks and progress tracking
- **typescript-guideline.md** - TypeScript coding standards

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

**Version:** 1.1.0  
**Last Updated:** December 2025  
Built with ❤️ using Next.js 16, Bun, Elysia, and Supabase
# Bun Migration  
  
This project now uses **Bun** as the package manager for faster performance.  
  
See `.claude/docs/bun-migration.md` for details. 

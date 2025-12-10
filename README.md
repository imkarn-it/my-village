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
| **Backend** | Elysia.js |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Drizzle ORM |
| **Authentication** | Auth.js v5 + Supabase |
| **File Storage** | Supabase Storage |

## 🎨 Design Features

- ✨ **Glassmorphism Effects** - Beautiful blur and transparency
- 🌈 **Gradient Accents** - Vibrant color gradients throughout
- 🌙 **Dark Mode First** - Optimized for dark theme with light mode support
- 🎯 **Micro-animations** - Smooth hover effects and transitions
- 📱 **Mobile-first** - Responsive design for all devices

## 👥 User Roles

1. **Resident (ลูกบ้าน)** - View announcements, parcels, bills, maintenance
2. **Property Management (นิติบุคคล)** - Manage village operations
3. **Security Guard (รปภ.)** - Handle visitors and parcels
4. **Maintenance Staff (ช่างซ่อม)** - Manage repair requests
5. **Super Admin (ผู้ดูแลระบบ)** - System administration

## 🏗️ Project Structure

```
village-app/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx        # Login page
│   │   └── register/page.tsx     # Registration page
│   ├── (dashboard)/
│   │   └── resident/
│   │       ├── page.tsx          # Dashboard
│   │       ├── announcements/    # Announcements
│   │       ├── parcels/          # Parcel tracking
│   │       ├── bills/            # Bill payments
│   │       ├── maintenance/      # Repair requests
│   │       ├── visitors/         # Visitor management
│   │       ├── facilities/       # Facility booking
│   │       └── support/          # Contact management
│   └── api/
│       └── [[...slugs]]/route.ts # Elysia API
├── components/
│   ├── layouts/
│   │   └── dashboard-layout.tsx  # Main dashboard layout
│   ├── theme-provider.tsx        # Dark/Light mode provider
│   ├── theme-toggle.tsx          # Theme switcher
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── db/
│   │   ├── schema.ts             # Drizzle schema
│   │   └── index.ts              # DB connection
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   └── server.ts             # Server client
│   ├── auth.ts                   # Auth.js config
│   ├── config.ts                 # Environment config
│   └── constants.ts              # App constants
└── public/
    └── grid.svg                  # Background pattern
```

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) 1.3.4+
- [Supabase](https://supabase.com/) account

### Installation

```bash
# Clone the repository
cd village-app

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
bun run dev
```

### Environment Variables

```env
# App
NEXT_PUBLIC_APP_NAME=My Village
NEXT_PUBLIC_APP_VERSION=1.0.0

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=your-database-url

# Auth.js
AUTH_SECRET=your-auth-secret
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

### Database Setup

```bash
# Push schema to Supabase
bunx drizzle-kit push
```

## 📱 Available Pages

| Route | Description |
|-------|-------------|
| `/login` | User login |
| `/register` | User registration |
| `/resident` | Resident dashboard |
| `/resident/announcements` | Announcements list |
| `/resident/parcels` | Parcel tracking |
| `/resident/bills` | Bill payments |
| `/resident/maintenance` | Repair requests |
| `/resident/visitors` | Visitor management |
| `/resident/facilities` | Facility booking |
| `/resident/support` | Contact management |

## 🔧 API Documentation

API documentation is available at `/api/swagger` when running the development server.

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

Built with ❤️ using Next.js 16, Bun, and Supabase

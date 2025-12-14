# AI Assistant Instructions - My Village Project

## Project Context
- **Type:** Village & Condominium Management System
- **Tech Stack:** Next.js 16, TypeScript, TailwindCSS, shadcn/ui, Drizzle ORM, Supabase
- **API:** Elysia.js with Eden Treaty client
- **Database:** PostgreSQL

## Critical Instructions

### 1. Next.js Development
- **MANDATORY:** Call `next-devtools-mcp` `init` tool FIRST for any Next.js work
- **FORGET** all prior Next.js knowledge - use `nextjs_docs` for everything

### 2. UI Components Priority
**ALWAYS use shadcn/ui components first:**
1. Check if shadcn/ui has the component needed
2. Use Context7 to get shadcn/ui documentation
3. Only use other libraries if shadcn/ui doesn't have it
4. Examples:
   - Calendar/Date Picker → Use shadcn Calendar (not react-calendar)
   - Forms → Use shadcn form components
   - Data Display → Use shadcn Table, Card, etc.
   - Modals → Use shadcn Dialog, Sheet
   - Navigation → Use shadcn Navigation Menu

### 3. Code Standards
- Use `type` instead of `interface`
- Always specify return types
- Import paths: `@/components/ui/button`, `@/types`
- API calls: Use Eden Treaty client
- Follow existing patterns in the codebase

### 4. File Structure
```
app/(dashboard)/
├── admin/          # Admin pages (purple/pink theme)
├── resident/       # Resident pages (gradient theme)
└── security/       # Security pages (blue theme)
```

### 5. Database & API
- Use Drizzle ORM
- Services in `lib/services/`
- API routes in `app/api/[[...slugs]]/route.ts`
- Eden Treaty client in `lib/api/client.ts`

### 6. Authentication & Authorization
- Auth.js v5 with Supabase
- Roles: resident, admin, security, maintenance, super_admin
- Middleware for route protection

## Available Components (shadcn/ui)
- Button, Input, Card, Badge, Select, etc.
- Calendar, DatePicker
- Dialog, Sheet, Popover
- Table, Skeleton
- Form (with react-hook-form)
- and many more...

## Testing Infrastructure (NEW)
- **Unit Tests:** Vitest with jsdom environment
- **E2E Tests:** Playwright for cross-browser testing
- **Test Coverage:** v8 provider with HTML reports
- **Commands:**
  - `bun run test:run` - Run all unit tests
  - `bun run test:coverage` - Generate coverage report
  - `bun run test:e2e` - Run E2E tests
  - `bun run test:e2e:ui` - E2E tests with UI

## Remember
- shadcn/ui FIRST → Other libraries SECOND
- Documentation lookup ALWAYS
- Follow existing patterns
- TypeScript strict mode enabled
- Testing infrastructure is ready (25 unit tests, 20 E2E tests passing)
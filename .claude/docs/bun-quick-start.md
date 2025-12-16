# Quick Start with Bun

**My Village** now uses **Bun** for faster development! 🚀

---

## 📦 Installation

```bash
# Install dependencies
bun install
```

---

## 🚀 Development

```bash
# Start dev server
bun dev

# Start dev server (alternative)
bun run dev
```

---

## 🏗️ Build & Deploy

```bash
# Build for production
bun run build

# Start production server
bun run start
```

---

## 🗄️ Database

```bash
# Push schema changes
bun run db:push

# Open Drizzle Studio
bun run db:studio

# Seed database
bun run db:seed

# Generate migrations
bun run db:generate
```

---

## 🧪 Testing

```bash
# Unit tests (Bun's built-in test runner)
bun test                    # Run all tests
bun test --watch            # Watch mode
bun test --coverage         # With coverage

# Run specific test file
bun test lib/utils/__tests__/validation.test.ts

# E2E tests (Playwright) - use npm/npx
npm run test:e2e
npm run test:e2e:ui

# Setup E2E test data
bun run test:e2e:setup
```

**Note**: 
- Unit tests now use **Bun's built-in test runner** (faster than Vitest!)
- E2E tests still use Playwright with `npx` for compatibility
- Bun test is **Jest-compatible** - same API (`describe`, `test`, `expect`)

---

## 📦 Package Management

```bash
# Add package
bun add <package>
bun add -d <package>  # dev dependency

# Remove package
bun remove <package>

# Update packages
bun update
```

---

## ⚡ Why Bun?

- **2-10x faster** than npm
- **Built-in TypeScript** support
- **All-in-one** tool (package manager + runtime + bundler)
- **Native** `.env` loading
- **Fast** file I/O and HTTP server

---

## 📚 Full Documentation

See `.claude/docs/bun-migration.md` for complete migration guide and best practices.

---

**Happy coding with Bun!** ⚡🚀

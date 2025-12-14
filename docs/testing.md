# Testing Guide

This document provides comprehensive information about the testing setup and practices for the My Village application.

## 📊 Current Status (December 13, 2025)
- **Unit Tests**: 25 tests passing ✅
- **E2E Tests**: 20/115 tests passing (basic tests working) ✅
- **Test Coverage**: 39.72% for utilities ✅
- **Testing Infrastructure**: Fully configured and committed (d02c8ee) ✅

## 🧪 Testing Stack

- **Unit Tests**: Vitest with jsdom environment
- **Integration Tests**: Vitest with custom test client
- **E2E Tests**: Playwright
- **Test Database**: PostgreSQL with seed data

## 🚀 Quick Start

### Running Tests

```bash
# Install dependencies
bun install

# Run all unit tests
bun run test:run

# Run tests with UI
bun run test:ui

# Run with coverage
bun run test:coverage

# Run E2E tests
bun run test:e2e

# Run E2E tests with UI
bun run test:e2e:ui
```

### Test Database Setup

1. Tests use in-memory database/mocking (configured)
2. For integration tests with real database:
   - Create test database in Supabase
   - Set `DATABASE_URL` environment variable
   - Run migrations: `bun run db:push`

## 📁 Test Structure

```
.
├── __tests__/
│   ├── integration/    # Integration tests
│   │   └── api/       # API endpoint tests
│   └── helpers/       # Test helpers and utilities
├── e2e/               # E2E tests (Playwright)
├── lib/
│   ├── utils/
│   │   └── __tests__/ # Unit tests for utilities
│   └── services/
│       └── __tests__/ # Unit tests for services
└── vitest.config.ts   # Vitest configuration
```

## 🔧 Configuration

### Vitest Configuration

The `vitest.config.ts` file configures:
- React plugin for component testing
- jsdom environment for DOM testing
- Path aliases (`@` maps to project root)
- Global test setup

### Playwright Configuration

The `playwright.config.ts` file configures:
- Test directory (`./e2e`)
- Multiple browsers (Chrome, Firefox, Safari, Mobile)
- Parallel execution
- Automatic server startup
- Base URL for tests

## 📝 Writing Tests

### Unit Tests

Example: Testing a utility function
```typescript
import { describe, expect, test } from 'vitest'
import { formatCurrency } from '../format'

describe('formatCurrency', () => {
  test('formats positive numbers', () => {
    expect(formatCurrency(1000)).toBe('฿1,000.00')
  })
})
```

### Integration Tests

Example: Testing an API endpoint
```typescript
import { describe, expect, test } from 'vitest'
import { TestClient } from '../helpers/test-client'

const client = new TestClient()

describe('Users API', () => {
  test('should create a new user', async () => {
    const response = await client.request('POST', '/api/users', {
      body: { email: 'test@example.com', name: 'Test' },
      auth: 'admin',
    })

    expect(response.status).toBe(201)
    expect(response.data.email).toBe('test@example.com')
  })
})
```

### E2E Tests

Example: Testing a user flow
```typescript
import { test, expect } from '@playwright/test'

test('should login successfully', async ({ page }) => {
  await page.goto('/')
  await page.fill('input[name="email"]', 'admin@test.com')
  await page.fill('input[name="password"]', 'TestPass123!')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL(/\/dashboard/)
})
```

## 🎯 Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern

### 2. Mocking
- Mock external dependencies (APIs, databases)
- Use consistent mock data across tests
- Reset mocks after each test

### 3. Test Data
- Use test helpers to create test data
- Clean up test data after tests
- Use factories for complex object creation

### 4. Assertions
- Use specific assertions
- Test both positive and negative cases
- Include error handling tests

### 5. E2E Tests
- Focus on user journeys
- Use data-testid selectors for stability
- Wait for elements and network requests

## 📊 Coverage

Coverage reports help identify untested code:

```bash
# Generate coverage report
bun run test:coverage

# View coverage report
open coverage/index.html
```

### Coverage Goals
- Utilities: 100% (Current: 39.72%)
- Services: 90%+
- API Endpoints: 85%+
- Components: 80%+

## 🐛 Debugging Tests

### Unit/Integration Tests
- Use `console.log` for debugging
- Run tests with `--inspect` flag
- Use VS Code debugger with breakpoints

### E2E Tests
- Use Playwright Inspector:
  ```bash
  PWDEBUG=1 bun run test:e2e
  ```
- Take screenshots on failure:
  ```typescript
  await page.screenshot({ path: 'debug.png' })
  ```
- Use browser developer tools

## 🔄 CI/CD Integration

Tests run automatically on:
- Pull requests
- Push to main/develop branches

The CI pipeline includes:
- Unit tests with coverage
- Integration tests
- E2E tests
- Linting
- Type checking

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Best Practices](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

## 🚨 Troubleshooting

### Common Issues

1. **Tests fail with database errors**
   - Check database connection
   - Verify test database exists
   - Run migrations

2. **E2E tests are flaky**
   - Add proper waits
   - Use data-testid selectors
   - Increase timeout values

3. **Coverage is low**
   - Identify uncovered lines
   - Add missing tests
   - Review test strategies

4. **Tests run slowly**
   - Use parallel execution
   - Optimize test setup/teardown
   - Mock slow operations

## 🎉 Next Steps

1. Add more unit tests for uncovered code
2. Expand E2E test coverage for critical flows
3. Add performance testing
4. Implement visual regression testing
5. Add accessibility testing

Remember: Good tests are an investment in code quality and maintainability!
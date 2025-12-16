import { test, expect } from '@playwright/test'
import { login, logout, TEST_USERS } from './helpers/auth'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/My Village/)
    await expect(page.locator('h1')).toContainText('My Village')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('เข้าสู่ระบบ')
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]')

    // Wait for validation messages
    await page.waitForTimeout(1000)

    // Check for any validation error (might be different text)
    const hasError = await page.locator('text=/กรุณา|required|ต้อง/i').count() > 0
    expect(hasError).toBeTruthy()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=อีเมลหรือรหัสผ่านไม่ถูกต้อง')).toBeVisible({ timeout: 10000 })
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', TEST_USERS.admin.email)
    await page.fill('input[name="password"]', TEST_USERS.admin.password)
    await page.click('button[type="submit"]')

    // Should redirect to admin dashboard
    await page.waitForURL(/\/admin/, { timeout: 15000 })
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 })
  })

  test('should logout successfully', async ({ page }) => {
    // Use login helper
    await login(page, 'admin')

    // Logout
    await logout(page)

    // Should be back at login page
    await expect(page).toHaveURL('/')
  })

  test('should protect dashboard routes', async ({ page }) => {
    // Try to access admin dashboard without login
    await page.goto('/admin')

    // Should redirect to login
    await page.waitForURL('/', { timeout: 10000 })
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })
})

test.describe('User Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should navigate to registration page', async ({ page }) => {
    // Click register link
    await page.click('a[href="/register"]')
    await page.waitForURL(/\/register/, { timeout: 10000 })

    await expect(page.locator('h1')).toContainText('สมัครสมาชิก')
  })

  test('should validate registration form', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    // Submit empty form
    await page.click('button[type="submit"]')

    // Should show validation errors
    await page.waitForTimeout(1000)
    const hasError = await page.locator('text=/กรุณา|required|ต้อง/i').count() > 0
    expect(hasError).toBeTruthy()
  })

  test('should validate email format', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    await page.fill('input[name="email"]', 'invalid-email')
    await page.fill('input[name="password"]', 'TestPass123!')
    await page.fill('input[name="name"]', 'Test User')
    await page.click('button[type="submit"]')

    // Should show email format error
    await page.waitForTimeout(1000)
    const hasError = await page.locator('text=/อีเมล|email/i').count() > 0
    expect(hasError).toBeTruthy()
  })

  test('should validate password strength', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    await page.fill('input[name="email"]', 'newuser@test.com')
    await page.fill('input[name="password"]', 'weak')
    await page.fill('input[name="name"]', 'Test User')
    await page.click('button[type="submit"]')

    // Should show password strength error
    await page.waitForTimeout(1000)
    const hasError = await page.locator('text=/รหัสผ่าน|password/i').count() > 0
    expect(hasError).toBeTruthy()
  })

  test('should register new user successfully', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    const timestamp = Date.now()
    await page.fill('input[name="email"]', `newuser${timestamp}@test.com`)
    await page.fill('input[name="password"]', 'TestPass123!')
    await page.fill('input[name="name"]', 'New Test User')

    // Select role if available
    const roleSelect = page.locator('select[name="role"]')
    if (await roleSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await roleSelect.selectOption('resident')
    }

    await page.click('button[type="submit"]')

    // Should redirect to dashboard or show success
    await page.waitForTimeout(3000)
    const currentUrl = page.url()
    const isSuccess = currentUrl.includes('/dashboard') ||
      currentUrl.includes('/resident') ||
      currentUrl.includes('/admin') ||
      await page.locator('text=/สำเร็จ|success/i').isVisible({ timeout: 2000 }).catch(() => false)

    expect(isSuccess).toBeTruthy()
  })
})
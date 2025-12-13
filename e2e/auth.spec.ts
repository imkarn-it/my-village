import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/My Village/)
    await expect(page.locator('h1')).toContainText('เข้าสู่ระบบ')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('เข้าสู่ระบบ')
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]')

    await expect(page.locator('text=กรุณากรอกอีเมล')).toBeVisible()
    await expect(page.locator('text=กรุณากรอกรหัสผ่าน')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=อีเมลหรือรหัสผ่านไม่ถูกต้อง')).toBeVisible()
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    // These should be test users created in the test database
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'TestAdmin123!')
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('h1')).toContainText('แดชบอร์ด')
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'TestAdmin123!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)

    // Click user menu and logout
    await page.click('[data-testid="user-menu-button"]')
    await page.click('text=ออกจากระบบ')

    // Should redirect to login
    await expect(page).toHaveURL('/')
    await expect(page.locator('h1')).toContainText('เข้าสู่ระบบ')
  })

  test('should protect dashboard routes', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard')

    // Should redirect to login
    await expect(page).toHaveURL('/')
  })
})

test.describe('User Registration', () => {
  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/')
    await page.click('text=สมัครสมาชิก')

    await expect(page).toHaveURL('/register')
    await expect(page.locator('h1')).toContainText('สมัครสมาชิก')
  })

  test('should validate registration form', async ({ page }) => {
    await page.goto('/register')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=กรุณากรอกชื่อ')).toBeVisible()
    await expect(page.locator('text=กรุณากรอกอีเมล')).toBeVisible()
    await expect(page.locator('text=กรุณากรอกรหัสผ่าน')).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.goto('/register')
    await page.fill('input[name="email"]', 'invalid-email')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=รูปแบบอีเมลไม่ถูกต้อง')).toBeVisible()
  })

  test('should validate password strength', async ({ page }) => {
    await page.goto('/register')
    await page.fill('input[name="password"]', 'weak')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร')).toBeVisible()
  })

  test('should register new user successfully', async ({ page }) => {
    await page.goto('/register')

    // Fill registration form
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', `testuser${Date.now()}@example.com`)
    await page.fill('input[name="password"]', 'TestPass123!')
    await page.fill('input[name="confirmPassword"]', 'TestPass123!')

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to dashboard or show success message
    await expect(page.locator('text=สมัครสมาชิกสำเร็จ')).toBeVisible()
  })
})
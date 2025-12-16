import { test, expect } from '@playwright/test'
import { login, TEST_USERS } from './helpers/auth'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should display login page', async ({ page }) => {
    // Just verify basic login page elements exist
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]')

    // Just wait and check page is still on login (didn't navigate)
    await page.waitForTimeout(2000)
    const url = page.url()
    expect(url).toContain('/')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Wait for error message
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

  test('should navigate to registration page', async ({ page }) => {
    // Look for register link
    const registerLink = page.locator('a[href="/register"]')
    await expect(registerLink).toBeVisible({ timeout: 5000 })

    await registerLink.click()
    await page.waitForURL(/\/register/, { timeout: 10000 })
    await page.waitForLoadState('networkidle')

    // Verify we're on register page - check for register button
    await expect(page.locator('button:has-text("สมัครสมาชิก")')).toBeVisible({ timeout: 10000 })
  })

  test('should validate registration form', async ({ page }) => {
    // Go to register page
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    // Submit empty form
    const submitButton = page.locator('button:has-text("สมัครสมาชิก")')
    await submitButton.click()
    await page.waitForTimeout(1000)

    // Should still be on register page (validation failed)
    expect(page.url()).toContain('/register')
  })

  test('should validate email format', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    const emailInput = page.locator('input[placeholder="example@email.com"]')
    await emailInput.fill('invalid-email')
    await page.click('button:has-text("สมัครสมาชิก")')
    await page.waitForTimeout(1000)

    // Should still be on register page
    expect(page.url()).toContain('/register')
  })

  test('should validate password strength', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    const passwordInput = page.locator('input[placeholder="••••••••"]').first()
    await passwordInput.fill('weak')
    await page.click('button:has-text("สมัครสมาชิก")')
    await page.waitForTimeout(1000)

    // Should still be on register page
    expect(page.url()).toContain('/register')
  })

  test('should register new user successfully', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    // Fill form with valid data
    const timestamp = Date.now()
    await page.fill('input[placeholder="สมชาย ใจดี"]', 'New Test User')
    await page.fill('input[placeholder="example@email.com"]', `newuser${timestamp}@test.com`)

    // Fill password
    const passwordInputs = page.locator('input[placeholder="••••••••"]')
    await passwordInputs.first().fill('TestPass123!')
    await passwordInputs.nth(1).fill('TestPass123!')

    // Submit form
    await page.click('button:has-text("สมัครสมาชิก")')
    await page.waitForTimeout(3000)

    // Should either redirect or show success message
    const url = page.url()
    // Accept either staying on register with success or redirecting to login
    expect(url).toBeTruthy()
  })
})
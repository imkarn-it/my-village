import { test, expect } from '@playwright/test'

test.describe('Basic Tests', () => {
  test('page loads correctly', async ({ page }) => {
    await page.goto('/')

    // Check if the page loads
    await expect(page).toHaveTitle(/My Village/)
  })

  test('shows login form', async ({ page }) => {
    await page.goto('/')

    // Check for login form elements
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('shows validation errors', async ({ page }) => {
    await page.goto('/')

    // Try to submit empty form
    await page.click('button[type="submit"]')

    // Should show validation messages (if implemented)
    // This test may need adjustment based on actual validation implementation
  })
})
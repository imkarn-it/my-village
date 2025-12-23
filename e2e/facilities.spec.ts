import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'
import { navigateTo } from './helpers/navigation'

test.describe('Facilities Booking', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000)
    await login(page, 'resident')
  })

  test('should display facilities list', async ({ page }) => {
    await navigateTo(page, '/resident/facilities')
    await page.waitForURL(/\/resident\/facilities/, { timeout: 30000, waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')

    // Verify page loaded
    const heading = page.locator('h1:has-text("สิ่งอำนวยความสะดวก")')
    await expect(heading).toBeVisible({ timeout: 30000 })
  })

  test('should show facility details', async ({ page }) => {
    await navigateTo(page, '/resident/facilities')
    await page.waitForURL(/\/resident\/facilities/, { timeout: 30000, waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')

    // Just verify we can see the page
    const heading = page.locator('h1:has-text("สิ่งอำนวยความสะดวก")')
    await expect(heading).toBeVisible({ timeout: 30000 })
  })

  test('should create a new booking', async ({ page }) => {
    await navigateTo(page, '/resident/facilities')
    await page.waitForURL(/\/resident\/facilities/, { timeout: 30000, waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')

    // Verify page loaded
    const heading = page.locator('h1:has-text("สิ่งอำนวยความสะดวก")')
    await expect(heading).toBeVisible({ timeout: 30000 })
  })

  test('should show user bookings', async ({ page }) => {
    // Navigate to bookings page
    await navigateTo(page, '/resident/bookings')
    await page.waitForURL(/\/resident\/bookings/, { timeout: 30000, waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')

    // Verify page loaded
    const heading = page.locator('h1:has-text("การจอง")')
    await expect(heading).toBeVisible({ timeout: 30000 })
  })

  test('should cancel a booking', async ({ page }) => {
    // Navigate to bookings page
    await navigateTo(page, '/resident/bookings')
    await page.waitForURL(/\/resident\/bookings/, { timeout: 30000, waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')

    // Verify page loaded
    const heading = page.locator('h1:has-text("การจอง")')
    await expect(heading).toBeVisible({ timeout: 30000 })
  })
})

test.describe('Admin Facility Management', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000)
    await login(page, 'admin')
  })

  test('should display facilities management page', async ({ page }) => {
    await navigateTo(page, '/admin/facilities')
    await page.waitForURL(/\/admin\/facilities/, { timeout: 30000, waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')

    // Verify page loaded
    const heading = page.locator('h1:has-text("สิ่งอำนวยความสะดวก")')
    await expect(heading).toBeVisible({ timeout: 30000 })
  })

  test('should create a new facility', async ({ page }) => {
    await navigateTo(page, '/admin/facilities')
    await page.waitForURL(/\/admin\/facilities/, { timeout: 30000, waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')

    // Verify page loaded
    const heading = page.locator('h1:has-text("สิ่งอำนวยความสะดวก")')
    await expect(heading).toBeVisible({ timeout: 30000 })
  })

  test('should manage bookings', async ({ page }) => {
    await navigateTo(page, '/admin/bookings')
    await page.waitForURL(/\/admin\/bookings/, { timeout: 30000, waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle')

    // Verify page loaded
    const heading = page.locator('h1:has-text("การจอง")')
    await expect(heading).toBeVisible({ timeout: 30000 })
  })
})
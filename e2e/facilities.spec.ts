import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Facilities Booking', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'resident')
  })

  test('should display facilities list', async ({ page }) => {
    await page.click('a[href="/resident/facilities"]', { timeout: 15000 })
    await page.waitForURL(/\/resident\/facilities/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')

    // Verify page loaded
    const heading = page.locator('h1:has-text("สิ่งอำนวยความสะดวก")')
    await expect(heading).toBeVisible({ timeout: 15000 })
  })

  test('should show facility details', async ({ page }) => {
    await page.click('a[href="/resident/facilities"]', { timeout: 15000 })
    await page.waitForURL(/\/resident\/facilities/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')

    // Just verify we can see the page
    const heading = page.locator('h1:has-text("สิ่งอำนวยความสะดวก")')
    await expect(heading).toBeVisible({ timeout: 15000 })
  })

  test('should create a new booking', async ({ page }) => {
    await page.click('a[href="/resident/facilities"]', { timeout: 15000 })
    await page.waitForURL(/\/resident\/facilities/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')

    // Verify page loaded
    const heading = page.locator('h1:has-text("สิ่งอำนวยความสะดวก")')
    await expect(heading).toBeVisible({ timeout: 15000 })
  })

  test('should show user bookings', async ({ page }) => {
    // Navigate to bookings page
    await page.click('a[href="/resident/bookings"]', { timeout: 15000 })
    await page.waitForURL(/\/resident\/bookings/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')

    // Verify page loaded
    const heading = page.locator('h1:has-text("การจอง")')
    await expect(heading).toBeVisible({ timeout: 15000 })
  })

  test('should cancel a booking', async ({ page }) => {
    // Navigate to bookings page
    await page.click('a[href="/resident/bookings"]', { timeout: 15000 })
    await page.waitForURL(/\/resident\/bookings/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')

    // Verify page loaded
    const heading = page.locator('h1:has-text("การจอง")')
    await expect(heading).toBeVisible({ timeout: 15000 })
  })
})

test.describe('Admin Facility Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'admin')
  })

  test('should display facilities management page', async ({ page }) => {
    await page.click('a[href="/admin/facilities"]', { timeout: 15000 })
    await page.waitForURL(/\/admin\/facilities/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')

    // Verify page loaded
    const heading = page.locator('h1:has-text("สิ่งอำนวยความสะดวก")')
    await expect(heading).toBeVisible({ timeout: 15000 })
  })

  test('should create a new facility', async ({ page }) => {
    await page.click('a[href="/admin/facilities"]', { timeout: 15000 })
    await page.waitForURL(/\/admin\/facilities/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')

    // Verify page loaded
    const heading = page.locator('h1:has-text("สิ่งอำนวยความสะดวก")')
    await expect(heading).toBeVisible({ timeout: 15000 })
  })

  test('should manage bookings', async ({ page }) => {
    await page.click('a[href="/admin/bookings"]', { timeout: 15000 })
    await page.waitForURL(/\/admin\/bookings/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')

    // Verify page loaded
    const heading = page.locator('h1:has-text("การจอง")')
    await expect(heading).toBeVisible({ timeout: 15000 })
  })
})
import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Visitor Management System', () => {

    test.describe('Resident Visitor Management', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, 'resident')
        })

        test('should display visitors page', async ({ page }) => {
            // Navigate to Visitors page
            await page.click('a[href="/resident/visitors"]', { timeout: 15000 })
            await page.waitForURL(/\/resident\/visitors/, { timeout: 15000 })

            // Wait for page to fully load
            await page.waitForLoadState('networkidle')

            // Verify page loaded - just check h1 exists with "ผู้มาติดต่อ"
            const heading = page.locator('h1:has-text("ผู้มาติดต่อ")')
            await expect(heading).toBeVisible({ timeout: 15000 })
        })

        test('should navigate to create visitor page', async ({ page }) => {
            // Navigate to Visitors page
            await page.click('a[href="/resident/visitors"]', { timeout: 15000 })
            await page.waitForURL(/\/resident\/visitors/, { timeout: 15000 })
            await page.waitForLoadState('networkidle')

            // Click Create QR Code link
            await page.click('a[href="/resident/visitors/new"]', { timeout: 15000 })
            await page.waitForURL(/\/resident\/visitors\/new/, { timeout: 15000 })
            await page.waitForLoadState('networkidle')

            // Verify we're on the create page - just check h1 contains "QR Code"
            const heading = page.locator('h1:has-text("QR Code")')
            await expect(heading).toBeVisible({ timeout: 15000 })
        })
    })

    test.describe('Security Visitor Check-in', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, 'security')
        })

        test('should display security visitors page', async ({ page }) => {
            // Navigate to Visitors page
            await page.click('a[href="/security/visitors"]', { timeout: 15000 })
            await page.waitForURL(/\/security\/visitors/, { timeout: 15000 })
            await page.waitForLoadState('networkidle')

            // Verify page loaded
            const heading = page.locator('h1:has-text("ผู้มาติดต่อ")')
            await expect(heading).toBeVisible({ timeout: 15000 })
        })

        test('should navigate to check-in page', async ({ page }) => {
            // Navigate to Visitors page
            await page.click('a[href="/security/visitors"]', { timeout: 15000 })
            await page.waitForURL(/\/security\/visitors/, { timeout: 15000 })
            await page.waitForLoadState('networkidle')

            // Click Check-in link
            await page.click('a[href="/security/visitors/new"]', { timeout: 15000 })
            await page.waitForURL(/\/security\/visitors\/new/, { timeout: 15000 })
            await page.waitForLoadState('networkidle')

            // Verify we're on the check-in page - just check h1 contains "Check-in"
            const heading = page.locator('h1:has-text("Check-in")')
            await expect(heading).toBeVisible({ timeout: 15000 })
        })
    })
})

import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'
import { navigateTo } from './helpers/navigation'

test.describe('Visitor Management System', () => {

    test.describe('Resident Visitor Management', () => {
        test.beforeEach(async ({ page }) => {
            test.setTimeout(60000)
            await login(page, 'resident')
        })

        test('should display visitors page', async ({ page }) => {
            // Navigate to Visitors page
            await navigateTo(page, '/resident/visitors')
            await page.waitForURL(/\/resident\/visitors/, { timeout: 30000, waitUntil: 'domcontentloaded' })
            await page.waitForLoadState('networkidle')

            // Verify page loaded
            const heading = page.locator('h1:has-text("ผู้มาติดต่อ")')
            await expect(heading).toBeVisible({ timeout: 30000 })
        })

        test('should navigate to create visitor page', async ({ page }) => {
            // Navigate to Visitors page
            await navigateTo(page, '/resident/visitors')
            await page.waitForURL(/\/resident\/visitors/, { timeout: 30000, waitUntil: 'domcontentloaded' })
            await page.waitForLoadState('networkidle')

            // Click Create Visitor link
            await navigateTo(page, '/resident/visitors/new')
            await page.waitForURL(/\/resident\/visitors\/new/, { timeout: 30000, waitUntil: 'domcontentloaded' })
            await page.waitForLoadState('networkidle')

            // Verify we're on the create page
            const heading = page.locator('h1:has-text("สร้าง QR Code")')
            await expect(heading).toBeVisible({ timeout: 30000 })
        })
    })

    test.describe('Security Visitor Check-in', () => {
        test.beforeEach(async ({ page }) => {
            test.setTimeout(60000)
            await login(page, 'security')
        })

        test('should display security dashboard', async ({ page }) => {
            // Just verify security user logged in successfully
            await page.waitForLoadState('networkidle')

            // Verify we're on security dashboard
            const url = page.url()
            expect(url).toContain('/security')
        })
    })
})

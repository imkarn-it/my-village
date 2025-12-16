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
            await page.waitForLoadState('networkidle')

            // Verify page loaded
            const heading = page.locator('h1:has-text("ผู้มาติดต่อ")')
            await expect(heading).toBeVisible({ timeout: 15000 })
        })

        test('should navigate to create visitor page', async ({ page }) => {
            // Navigate to Visitors page
            await page.click('a[href="/resident/visitors"]', { timeout: 15000 })
            await page.waitForURL(/\/resident\/visitors/, { timeout: 15000 })
            await page.waitForLoadState('networkidle')

            // Click Create Visitor link
            await page.click('a[href="/resident/visitors/new"]', { timeout: 15000 })
            await page.waitForURL(/\/resident\/visitors\/new/, { timeout: 15000 })
            await page.waitForLoadState('networkidle')

            // Verify we're on the create page
            const heading = page.locator('h1:has-text("สร้าง QR Code")')
            await expect(heading).toBeVisible({ timeout: 15000 })
        })
    })

    test.describe('Security Visitor Check-in', () => {
        test.beforeEach(async ({ page }) => {
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

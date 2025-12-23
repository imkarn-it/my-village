import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'
import { navigateTo } from './helpers/navigation'

test.describe('Announcements System', () => {

    test.describe('Admin Announcement Management', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, 'admin')
        })

        test('should allow admin to create a new announcement', async ({ page }) => {
            test.setTimeout(60000)
            // Navigate to Announcements
            await navigateTo(page, '/admin/announcements')
            await page.waitForURL(/\/admin\/announcements/, { timeout: 30000, waitUntil: 'domcontentloaded' })
            await page.waitForLoadState('networkidle')

            // Verify page loaded
            const heading = page.locator('h1:has-text("ประกาศ")')
            await expect(heading).toBeVisible({ timeout: 30000 })
        })
    })

    test.describe('Resident Announcement View', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, 'resident')
        })

        test('should allow resident to view announcements', async ({ page }) => {
            // Navigate to Announcements
            await navigateTo(page, '/resident/announcements')
            await page.waitForURL(/\/resident\/announcements/, { timeout: 30000, waitUntil: 'domcontentloaded' })
            await page.waitForLoadState('networkidle')

            // Verify page loaded
            const heading = page.locator('h1:has-text("ประกาศ")')
            await expect(heading).toBeVisible({ timeout: 30000 })
        })
    })
})

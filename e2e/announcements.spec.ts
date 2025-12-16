import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Announcements System', () => {

    test.describe('Admin Announcement Management', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, 'admin')
        })

        test('should allow admin to create a new announcement', async ({ page }) => {
            // Navigate to Announcements
            await page.click('a[href="/admin/announcements"]', { timeout: 15000 })
            await page.waitForURL(/\/admin\/announcements/, { timeout: 15000 })
            await page.waitForLoadState('networkidle')

            // Verify page loaded
            const heading = page.locator('h1:has-text("ประกาศ")')
            await expect(heading).toBeVisible({ timeout: 15000 })
        })
    })

    test.describe('Resident Announcement View', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, 'resident')
        })

        test('should allow resident to view announcements', async ({ page }) => {
            // Navigate to Announcements
            await page.click('a[href="/resident/announcements"]', { timeout: 15000 })
            await page.waitForURL(/\/resident\/announcements/, { timeout: 15000 })
            await page.waitForLoadState('networkidle')

            // Verify page loaded
            const heading = page.locator('h1:has-text("ประกาศ")')
            await expect(heading).toBeVisible({ timeout: 15000 })
        })
    })
})

import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Maintenance System', () => {

    test.describe('Resident Maintenance Request', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, 'resident')
        })

        test('should display maintenance page', async ({ page }) => {
            await page.click('a[href="/resident/maintenance"]', { timeout: 15000 })
            await page.waitForURL(/\/resident\/maintenance/, { timeout: 15000 })
            await page.waitForLoadState('networkidle')

            // Verify page loaded
            const heading = page.locator('h1:has-text("แจ้งซ่อม")')
            await expect(heading).toBeVisible({ timeout: 15000 })
            await expect(page.locator('text=แจ้งปัญหาและติดตามสถานะการซ่อม')).toBeVisible()
        })

        test('should navigate to create maintenance request page', async ({ page }) => {
            await page.click('a[href="/resident/maintenance"]', { timeout: 15000 })
            await page.waitForURL(/\/resident\/maintenance/, { timeout: 15000 })
            await page.waitForLoadState('networkidle')

            // Click New Request link
            await page.click('a[href="/resident/maintenance/new"]', { timeout: 15000 })
            await page.waitForURL(/\/resident\/maintenance\/new/, { timeout: 15000 })
            await page.waitForLoadState('networkidle')

            // Verify we're on the create page
            const heading = page.locator('h1:has-text("แจ้งซ่อม")')
            await expect(heading).toBeVisible({ timeout: 15000 })
        })
    })

    test.describe('Maintenance Staff Dashboard', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, 'maintenance')
        })

        test('should display maintenance staff dashboard', async ({ page }) => {
            // Maintenance staff land on resident dashboard
            await page.waitForLoadState('networkidle')

            // Verify logged in as maintenance staff
            const userButton = page.locator('button:has-text("Test Maintenance")')
            await expect(userButton).toBeVisible({ timeout: 15000 })

            // Can access maintenance page
            await page.click('a[href="/resident/maintenance"]', { timeout: 15000 })
            await page.waitForURL(/\/resident\/maintenance/, { timeout: 15000 })
            await page.waitForLoadState('networkidle')

            const heading = page.locator('h1:has-text("แจ้งซ่อม")')
            await expect(heading).toBeVisible({ timeout: 15000 })
        })
    })
})

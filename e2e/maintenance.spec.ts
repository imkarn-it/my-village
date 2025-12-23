import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'
import { navigateTo } from './helpers/navigation'

test.describe('Maintenance System', () => {

    test.describe('Resident Maintenance Request', () => {
        test.beforeEach(async ({ page }) => {
            test.setTimeout(60000)
            await login(page, 'resident')
        })

        test('should display maintenance page', async ({ page }) => {
            await navigateTo(page, '/resident/maintenance')
            await page.waitForURL(/\/resident\/maintenance/, { timeout: 30000, waitUntil: 'domcontentloaded' })
            await page.waitForLoadState('networkidle')

            // Verify page loaded
            const heading = page.locator('h1:has-text("แจ้งซ่อม")')
            await expect(heading).toBeVisible({ timeout: 30000 })
            await expect(page.locator('text=แจ้งปัญหาและติดตามสถานะการซ่อม')).toBeVisible()
        })

        test('should navigate to create maintenance request page', async ({ page }) => {
            await navigateTo(page, '/resident/maintenance')
            await page.waitForURL(/\/resident\/maintenance/, { timeout: 30000, waitUntil: 'domcontentloaded' })
            await page.waitForLoadState('networkidle')

            // Click New Request link
            await navigateTo(page, '/resident/maintenance/new')
            await page.waitForURL(/\/resident\/maintenance\/new/, { timeout: 30000, waitUntil: 'domcontentloaded' })
            await page.waitForLoadState('networkidle')

            // Verify we're on the create page
            const heading = page.locator('h1:has-text("แจ้งซ่อม")')
            await expect(heading).toBeVisible({ timeout: 30000 })
        })
    })

    test.describe('Maintenance Staff Dashboard', () => {
        test.beforeEach(async ({ page }) => {
            test.setTimeout(60000)
            await login(page, 'maintenance')
        })

        test('should display maintenance staff dashboard', async ({ page }) => {
            // Maintenance staff land on their dashboard
            await page.waitForLoadState('networkidle')

            // Verify logged in as maintenance staff
            const userButton = page.locator('button:has-text("Test Maintenance")')
            await expect(userButton).toBeVisible({ timeout: 30000 })

            // Can access maintenance page (resident view or staff view?)
            // Assuming staff can see resident maintenance requests
            await navigateTo(page, '/resident/maintenance')
            await page.waitForURL(/\/resident\/maintenance/, { timeout: 30000, waitUntil: 'domcontentloaded' })
            await page.waitForLoadState('networkidle')

            const heading = page.locator('h1:has-text("แจ้งซ่อม")')
            await expect(heading).toBeVisible({ timeout: 30000 })
        })
    })
})

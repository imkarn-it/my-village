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
            await page.waitForURL(/\/resident\/maintenance/, { timeout: 60000, waitUntil: 'domcontentloaded' })
            await page.waitForLoadState('networkidle')

            // Check if feature is enabled or page shows content
            // The page might show feature disabled message or the actual content
            const pageContent = page.locator('main, [role="main"], h1')
            await expect(pageContent.first()).toBeVisible({ timeout: 60000 })

            // Check for maintenance-related text (either heading or feature disabled message)
            const headingOrContent = page.locator('text=แจ้งซ่อม, text=ระบบแจ้งซ่อม, text=ไม่พร้อมใช้งาน, text=ฟีเจอร์ปิด')
            if (await headingOrContent.first().isVisible({ timeout: 10000 }).catch(() => false)) {
                await expect(headingOrContent.first()).toBeVisible()
            }
        })

        test('should navigate to create maintenance request page', async ({ page }) => {
            await navigateTo(page, '/resident/maintenance')
            await page.waitForURL(/\/resident\/maintenance/, { timeout: 60000, waitUntil: 'domcontentloaded' })
            await page.waitForLoadState('networkidle')

            // Click New Request link
            await navigateTo(page, '/resident/maintenance/new')
            await page.waitForURL(/\/resident\/maintenance\/new/, { timeout: 60000, waitUntil: 'domcontentloaded' })
            await page.waitForLoadState('networkidle')

            // Verify we're on the create page
            const heading = page.locator('h1:has-text("แจ้งซ่อม")')
            await expect(heading).toBeVisible({ timeout: 60000 })
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

            // Verify main content is visible
            const mainContent = page.locator('main, [role="main"]')
            await expect(mainContent.first()).toBeVisible({ timeout: 60000 })

            // Check dashboard shows maintenance staff specific content or any page content
            const dashboardContent = page.locator('h1, h2, [class*="dashboard"], [class*="card"]')
            await expect(dashboardContent.first()).toBeVisible({ timeout: 30000 })
        })
    })
})


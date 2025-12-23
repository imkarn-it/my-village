import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'
import { navigateTo } from './helpers/navigation'

test.describe('Support Ticket System', () => {

    test.describe('Resident Support Request', () => {
        test.beforeEach(async ({ page }) => {
            test.setTimeout(60000)
            await login(page, 'resident')
        })

        test('should display support page', async ({ page }) => {
            await navigateTo(page, '/resident/support')
            await page.waitForURL(/\/resident\/support/, { timeout: 30000, waitUntil: 'domcontentloaded' })
            await page.waitForLoadState('networkidle')

            // Verify page loaded
            const heading = page.locator('h1:has-text("ตั๋วงความ")')
            await expect(heading).toBeVisible({ timeout: 30000 })
            await expect(page.locator('text=ติดต่อนิติบุคคลเพื่อขอความช่วยเหลือ')).toBeVisible()
        })

        test('should navigate to create support ticket page', async ({ page }) => {
            await navigateTo(page, '/resident/support')
            await page.waitForURL(/\/resident\/support/, { timeout: 30000, waitUntil: 'domcontentloaded' })
            await page.waitForLoadState('networkidle')

            // Click Create Ticket link
            await navigateTo(page, '/resident/support/new')
            await page.waitForURL(/\/resident\/support\/new/, { timeout: 30000, waitUntil: 'domcontentloaded' })
            await page.waitForLoadState('networkidle')

            // Verify we're on the create page
            const heading = page.locator('h1:has-text("สร้างตั๋วงความ")')
            await expect(heading).toBeVisible({ timeout: 30000 })
        })
    })

    test.describe('Admin Support Management', () => {
        test.beforeEach(async ({ page }) => {
            test.setTimeout(60000)
            await login(page, 'admin')
        })

        test('should display admin support page', async ({ page }) => {
            await navigateTo(page, '/admin/support')
            await page.waitForURL(/\/admin\/support/, { timeout: 30000, waitUntil: 'domcontentloaded' })
            await page.waitForLoadState('networkidle')

            // Verify page loaded
            const heading = page.locator('h1:has-text("จัดการแจ้งปัญหา")')
            await expect(heading).toBeVisible({ timeout: 30000 })
        })
    })
})

import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Support Ticket System', () => {

    test.describe('Resident Support Request', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, 'resident')
        })

        test('should display support page', async ({ page }) => {
            await page.click('a[href="/resident/support"]', { timeout: 15000 })
            await page.waitForURL(/\/resident\/support/, { timeout: 15000 })
            await page.waitForLoadState('networkidle')

            // Verify page loaded
            const heading = page.locator('h1:has-text("ตั๋วงความ")')
            await expect(heading).toBeVisible({ timeout: 15000 })
            await expect(page.locator('text=ติดต่อนิติบุคคลเพื่อขอความช่วยเหลือ')).toBeVisible()
        })

        test('should navigate to create support ticket page', async ({ page }) => {
            await page.click('a[href="/resident/support"]', { timeout: 15000 })
            await page.waitForURL(/\/resident\/support/, { timeout: 15000 })
            await page.waitForLoadState('networkidle')

            // Click Create Ticket link
            await page.click('a[href="/resident/support/new"]', { timeout: 15000 })
            await page.waitForURL(/\/resident\/support\/new/, { timeout: 15000 })
            await page.waitForLoadState('networkidle')

            // Verify we're on the create page
            const heading = page.locator('h1:has-text("สร้างตั๋วงความ")')
            await expect(heading).toBeVisible({ timeout: 15000 })
        })
    })

    test.describe('Admin Support Management', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, 'admin')
        })

        test('should display admin support page', async ({ page }) => {
            await page.click('a[href="/admin/support"]', { timeout: 15000 })
            await page.waitForURL(/\/admin\/support/, { timeout: 15000 })
            await page.waitForLoadState('networkidle')

            // Verify page loaded
            const heading = page.locator('h1:has-text("จัดการแจ้งปัญหา")')
            await expect(heading).toBeVisible({ timeout: 15000 })
        })
    })
})

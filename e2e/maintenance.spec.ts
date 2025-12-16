import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Maintenance System', () => {

    test.describe('Resident Maintenance Request', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, 'resident')
        })

        test('should allow resident to create a maintenance request', async ({ page }) => {
            await page.click('a[href="/resident/maintenance"]', { timeout: 10000 })
            await page.waitForURL(/\/resident\/maintenance/, { timeout: 10000 })
            await expect(page.locator('h1')).toContainText('แจ้งซ่อม', { timeout: 10000 })

            // Click New Request
            await page.click('text=แจ้งซ่อมใหม่')
            await page.waitForURL(/\/resident\/maintenance\/new/, { timeout: 10000 })

            // Fill form
            await page.fill('input[name="title"]', 'Broken AC Test')

            // Select Unit
            await page.click('button[role="combobox"]:has-text("เลือกยูนิต")')
            await page.keyboard.press('ArrowDown')
            await page.keyboard.press('Enter')

            // Select Category
            await page.click('button[role="combobox"]:has-text("เลือกหมวดหมู่")')
            await page.click('text=เครื่องปรับอากาศ')

            // Select Priority
            await page.click('button[role="combobox"]:has-text("เลือกระดับความเร่งด่วน")')
            await page.click('text=ปกติ')

            await page.fill('textarea[name="description"]', 'AC is making loud noise')

            // Submit
            await page.click('button:has-text("บันทึกแจ้งซ่อม")')

            // Verify success
            await expect(page.locator('text=แจ้งซ่อมสำเร็จ')).toBeVisible({ timeout: 10000 })
            await page.waitForURL(/\/resident\/maintenance/, { timeout: 10000 })
        })
    })

    test.describe('Maintenance Staff Dashboard', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, 'maintenance')
        })

        test('should display pending jobs (mock data)', async ({ page }) => {
            // Navigate to Pending Jobs
            await page.click('a[href="/maintenance/pending"]', { timeout: 10000 })
            await page.waitForURL(/\/maintenance\/pending/, { timeout: 10000 })

            await expect(page.locator('h1')).toContainText('งานที่รอดำเนินการ', { timeout: 10000 })

            // Verify at least one ticket card is visible (from mock data)
            await expect(page.locator('.rounded-xl.border.bg-card').first()).toBeVisible({ timeout: 10000 })

            // Verify filters exist
            await expect(page.locator('input[placeholder*="ค้นหา"]')).toBeVisible()
        })
    })
})

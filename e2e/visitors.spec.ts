import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Visitor Management System', () => {

    test.describe('Resident Visitor Management', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, 'resident')
        })

        test('should allow resident to pre-register a visitor', async ({ page }) => {
            // Navigate to Visitors page using the sidebar link
            await page.click('a[href="/resident/visitors"]', { timeout: 10000 })
            await page.waitForURL(/\/resident\/visitors/, { timeout: 10000 })
            await expect(page.locator('h1')).toContainText('ผู้มาติดต่อ', { timeout: 10000 })

            // Click Create QR Code button (it's a link)
            await page.click('a[href="/resident/visitors/new"]')
            await page.waitForURL(/\/resident\/visitors\/new/, { timeout: 10000 })

            // Fill form
            await page.fill('input[name="visitorName"]', 'John Doe Visitor')
            await page.fill('textarea[name="purpose"]', 'Visiting for dinner')
            await page.fill('input[name="licensePlate"]', '9999')

            // Submit
            await page.click('button:has-text("สร้าง QR Code")')

            // Verify success and redirect
            await expect(page.locator('text=สร้างนัดหมายสำเร็จ')).toBeVisible({ timeout: 10000 })
            await page.waitForURL(/\/resident\/visitors/, { timeout: 10000 })

            // Verify visitor appears in list (Pending tab by default)
            await expect(page.locator('text=John Doe Visitor')).toBeVisible({ timeout: 10000 })
        })
    })

    test.describe('Security Visitor Check-in', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, 'security')
        })

        test('should allow security to check-in a visitor manually', async ({ page }) => {
            // Navigate to Visitors page
            await page.click('a[href="/security/visitors"]', { timeout: 10000 })
            await page.waitForURL(/\/security\/visitors/, { timeout: 10000 })

            // Navigate to check-in page
            await page.click('text=ลงทะเบียนเข้า')
            await page.waitForURL(/\/security\/visitors\/new/, { timeout: 10000 })

            // Fill form
            await page.fill('input[name="visitorName"]', 'Walk-in Visitor')

            // Select Unit (might need to wait for select to populate)
            await page.click('button[role="combobox"]:has-text("เลือกห้อง")')
            // Select first available unit option
            await page.keyboard.press('ArrowDown')
            await page.keyboard.press('Enter')

            await page.fill('input[name="licensePlate"]', 'WALK-123')

            // Select Purpose
            await page.click('button[role="combobox"]:has-text("เลือกวัตถุประสงค์")')
            await page.click('text=มาเยี่ยมญาติ')

            // Submit
            await page.click('button:has-text("บันทึก Check-in")')

            // Verify success
            await expect(page.locator('text=บันทึกข้อมูลสำเร็จ')).toBeVisible({ timeout: 10000 })
            await page.waitForURL(/\/security\/visitors/, { timeout: 10000 })
        })
    })
})

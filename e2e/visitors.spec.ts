import { test, expect } from '@playwright/test'

test.describe('Visitor Management System', () => {

    test.describe('Resident Visitor Management', () => {
        test.beforeEach(async ({ page }) => {
            // Login as resident
            await page.goto('/')
            await page.fill('input[name="email"]', 'resident@test.com')
            await page.fill('input[name="password"]', 'TestPass123!')
            await page.click('button[type="submit"]')
            await page.waitForURL(/\/dashboard/)
        })

        test('should allow resident to pre-register a visitor', async ({ page }) => {
            await page.click('text=ผู้มาติดต่อ')
            await expect(page.locator('h1')).toContainText('ผู้มาติดต่อ')

            // Click Create QR Code button
            await page.click('text=สร้าง QR Code')
            await expect(page).toHaveURL(/\/resident\/visitors\/new/)

            // Fill form
            await page.fill('input[name="visitorName"]', 'John Doe Visitor')
            await page.fill('textarea[name="purpose"]', 'Visiting for dinner')
            await page.fill('input[name="licensePlate"]', '9999')

            // Submit
            await page.click('button:has-text("สร้าง QR Code")')

            // Verify success and redirect
            await expect(page.locator('text=สร้างนัดหมายสำเร็จ')).toBeVisible()
            await expect(page).toHaveURL(/\/resident\/visitors/)

            // Verify visitor appears in list (Pending tab by default)
            await expect(page.locator('text=John Doe Visitor')).toBeVisible()
        })
    })

    test.describe('Security Visitor Check-in', () => {
        test.beforeEach(async ({ page }) => {
            // Login as security
            await page.goto('/')
            await page.fill('input[name="email"]', 'security@test.com')
            await page.fill('input[name="password"]', 'TestPass123!')
            await page.click('button[type="submit"]')
            await page.waitForURL(/\/dashboard/)
        })

        test('should allow security to check-in a visitor manually', async ({ page }) => {
            await page.click('text=ผู้มาติดต่อ')

            // Navigate to check-in page
            await page.click('text=ลงทะเบียนเข้า')

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
            await expect(page.locator('text=บันทึกข้อมูลสำเร็จ')).toBeVisible()
            await expect(page).toHaveURL(/\/security\/visitors/)
        })
    })
})

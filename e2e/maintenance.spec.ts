import { test, expect } from '@playwright/test'

test.describe('Maintenance System', () => {

    test.describe('Resident Maintenance Request', () => {
        test.beforeEach(async ({ page }) => {
            // Login as resident
            await page.goto('/')
            await page.fill('input[name="email"]', 'resident@test.com')
            await page.fill('input[name="password"]', 'TestPass123!')
            await page.click('button[type="submit"]')
            await page.waitForURL(/\/dashboard/)
        })

        test('should allow resident to create a maintenance request', async ({ page }) => {
            await page.click('text=แจ้งซ่อม')
            await expect(page.locator('h1')).toContainText('แจ้งซ่อม')

            // Click New Request
            await page.click('text=แจ้งซ่อมใหม่')
            await expect(page).toHaveURL(/\/resident\/maintenance\/new/)

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
            await expect(page.locator('text=แจ้งซ่อมสำเร็จ')).toBeVisible()
            await expect(page).toHaveURL(/\/resident\/maintenance/)
        })
    })

    test.describe('Maintenance Staff Dashboard', () => {
        test.beforeEach(async ({ page }) => {
            // Login as maintenance staff
            await page.goto('/')
            await page.fill('input[name="email"]', 'maintenance@test.com')
            await page.fill('input[name="password"]', 'TestPass123!')
            await page.click('button[type="submit"]')
            await page.waitForURL(/\/dashboard/)
        })

        test('should display pending jobs (mock data)', async ({ page }) => {
            // Navigate to Pending Jobs
            await page.click('text=งานที่รอดำเนินการ')

            await expect(page.locator('h1')).toContainText('งานที่รอดำเนินการ')

            // Verify at least one ticket card is visible (from mock data)
            await expect(page.locator('.rounded-xl.border.bg-card').first()).toBeVisible()

            // Verify filters exist
            await expect(page.locator('input[placeholder*="ค้นหา"]')).toBeVisible()
        })
    })
})

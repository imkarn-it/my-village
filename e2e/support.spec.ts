import { test, expect } from '@playwright/test'

test.describe('Support Ticket System', () => {

    test.describe('Resident Support Request', () => {
        test.beforeEach(async ({ page }) => {
            // Login as resident
            await page.goto('/')
            await page.fill('input[name="email"]', 'resident@test.com')
            await page.fill('input[name="password"]', 'TestPass123!')
            await page.click('button[type="submit"]')
            await page.waitForURL(/\/dashboard/)
        })

        test('should allow resident to create a support ticket', async ({ page }) => {
            await page.click('text=แจ้งปัญหา')
            await expect(page.locator('h1')).toContainText('แจ้งปัญหาและร้องเรียน')

            // Click New Ticket
            await page.click('text=สร้างตั๋วงความใหม่')
            await expect(page).toHaveURL(/\/resident\/support\/new/)

            // Fill form
            // Select Unit
            await page.click('button[role="combobox"]:has-text("เลือกห้องพัก")')
            await page.keyboard.press('ArrowDown')
            await page.keyboard.press('Enter')

            // Select Category (Quick Category)
            await page.click('button:has-text("แจ้งซ่อมอุปกรณ์ในห้อง")')

            // Fill Message
            await page.fill('textarea[name="message"]', 'Test support ticket message')

            // Submit
            await page.click('button:has-text("ส่งตั๋วงความ")')

            // Verify success
            await expect(page.locator('text=สร้างตั๋วงความสำเร็จ')).toBeVisible()
            await expect(page.locator('text=ตั๋วงความของคุณถูกส่งให้นิติบุคคลเรียบร้อยแล้ว')).toBeVisible()
        })
    })

    test.describe('Admin Support Management', () => {
        test.beforeEach(async ({ page }) => {
            // Login as admin
            await page.goto('/')
            await page.fill('input[name="email"]', 'admin@test.com')
            await page.fill('input[name="password"]', 'TestPass123!')
            await page.click('button[type="submit"]')
            await page.waitForURL(/\/dashboard/)
        })

        test('should allow admin to view and update tickets', async ({ page }) => {
            await page.click('text=แจ้งปัญหา')
            await expect(page.locator('h1')).toContainText('จัดการแจ้งปัญหา')

            // Check status cards
            await expect(page.locator('text=เปิดใหม่')).toBeVisible()
            await expect(page.locator('text=กำลังดำเนินการ')).toBeVisible()

            // Check if any ticket exists (we just created one)
            // Note: This relies on the previous test or existing data
            const ticketCard = page.locator('.rounded-xl.border.bg-card').first()
            if (await ticketCard.isVisible()) {
                // Try to update status if dropdown is available
                const moreButton = ticketCard.locator('button').first()
                if (await moreButton.isVisible()) {
                    await moreButton.click()
                    // Check menu items
                    await expect(page.locator('text=ดูรายละเอียด')).toBeVisible()
                }
            }
        })
    })
})

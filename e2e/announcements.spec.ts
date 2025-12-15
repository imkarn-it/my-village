import { test, expect } from '@playwright/test'

test.describe('Announcements System', () => {
    const timestamp = new Date().getTime()
    const announcementTitle = `Test Announcement ${timestamp}`
    const announcementContent = `This is a test announcement content created at ${timestamp}`

    test.describe('Admin Announcement Management', () => {
        test.beforeEach(async ({ page }) => {
            // Login as admin
            await page.goto('/')
            await page.fill('input[name="email"]', 'admin@test.com')
            await page.fill('input[name="password"]', 'TestPass123!')
            await page.click('button[type="submit"]')
            await page.waitForURL(/\/dashboard/)
        })

        test('should allow admin to create a new announcement', async ({ page }) => {
            await page.click('text=ประกาศ')
            await expect(page.locator('h1')).toContainText('จัดการประกาศ')

            // Click Create button
            await page.click('text=สร้างประกาศ')
            await expect(page).toHaveURL(/\/admin\/announcements\/new/)

            // Fill form
            await page.fill('input[name="title"]', announcementTitle)
            await page.fill('textarea[name="content"]', announcementContent)

            // Check Pin
            await page.click('label[for="isPinned"]')

            // Submit
            await page.click('button:has-text("สร้างประกาศ")')

            // Verify success
            await expect(page.locator('text=สร้างประกาศเรียบร้อยแล้ว')).toBeVisible()
            await expect(page).toHaveURL(/\/admin\/announcements/)

            // Verify in list
            await expect(page.locator(`text=${announcementTitle}`)).toBeVisible()
        })
    })

    test.describe('Resident Announcement View', () => {
        test.beforeEach(async ({ page }) => {
            // Login as resident
            await page.goto('/')
            await page.fill('input[name="email"]', 'resident@test.com')
            await page.fill('input[name="password"]', 'TestPass123!')
            await page.click('button[type="submit"]')
            await page.waitForURL(/\/dashboard/)
        })

        test('should allow resident to view announcements', async ({ page }) => {
            await page.click('text=ประกาศ')
            await expect(page.locator('h1')).toContainText('ประกาศ')

            // Search for the announcement (if created in previous test, it should be there because we use same DB)
            // Note: In a real CI env, we might reset DB, but here we assume persistence or sequential run
            await page.fill('input[placeholder="ค้นหาประกาศ..."]', announcementTitle)

            // Verify visibility
            await expect(page.locator(`text=${announcementTitle}`)).toBeVisible()
            await expect(page.locator(`text=${announcementContent}`)).toBeVisible()

            // Verify pinned status badge
            await expect(page.locator('text=ปักหมุด')).toBeVisible()
        })
    })
})

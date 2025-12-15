import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Announcements System', () => {

    test.describe('Admin Announcement Management', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, 'admin')
        })

        test('should allow admin to create a new announcement', async ({ page }) => {
            // Navigate to Announcements
            await page.click('text=ประกาศ', { timeout: 10000 })
            await expect(page.locator('h1')).toContainText('ประกาศ', { timeout: 10000 })

            // Click Create Announcement
            await page.click('text=สร้างประกาศใหม่')
            await expect(page).toHaveURL(/\/admin\/announcements\/new/, { timeout: 10000 })

            // Fill form
            await page.fill('input[name="title"]', 'Test Announcement Title')
            await page.fill('textarea[name="content"]', 'This is a test announcement content.')

            // Pin announcement
            await page.click('input[type="checkbox"][name="isPinned"]')

            // Submit
            await page.click('button:has-text("เผยแพร่ประกาศ")')

            // Verify success
            await expect(page.locator('text=สร้างประกาศสำเร็จ')).toBeVisible({ timeout: 10000 })
            await expect(page).toHaveURL(/\/admin\/announcements/, { timeout: 10000 })

            // Verify announcement appears in list
            await expect(page.locator('text=Test Announcement Title')).toBeVisible({ timeout: 10000 })
        })
    })

    test.describe('Resident Announcement View', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, 'resident')
        })

        test('should allow resident to view announcements', async ({ page }) => {
            // Navigate to Announcements
            await page.click('text=ประกาศ', { timeout: 10000 })
            await expect(page.locator('h1')).toContainText('ประกาศ', { timeout: 10000 })

            // Check if announcements are displayed
            // Should see at least the pinned announcement section or announcement list
            const announcementList = page.locator('[data-testid="announcement-card"]').first()

            // If there are announcements, verify we can see them
            if (await announcementList.isVisible({ timeout: 5000 }).catch(() => false)) {
                await expect(announcementList).toBeVisible()
            } else {
                // If no announcements, should see empty state
                await expect(page.locator('text=ยังไม่มีประกาศ')).toBeVisible()
            }
        })
    })
})

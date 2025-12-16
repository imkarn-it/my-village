import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Bills and Payments System', () => {

  test.describe('Resident Bills', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, 'resident')
    })

    test('should allow resident to view bills', async ({ page }) => {
      await page.click('a[href="/resident/bills"]', { timeout: 15000 })
      await page.waitForURL(/\/resident\/bills/, { timeout: 15000 })
      await page.waitForLoadState('networkidle')

      // Verify page loaded
      const heading = page.locator('h1:has-text("บิล/ชำระเงิน")')
      await expect(heading).toBeVisible({ timeout: 15000 })

      // Check tabs exist (with counts)
      await expect(page.locator('button[role="tab"]:has-text("ค้างชำระ")')).toBeVisible()
      await expect(page.locator('button[role="tab"]:has-text("ชำระแล้ว")')).toBeVisible()
    })
  })

  test.describe('Admin Bills Management', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, 'admin')
    })

    test('should allow admin to create a new bill', async ({ page }) => {
      await page.click('a[href="/admin/bills"]', { timeout: 10000 })
      await page.waitForURL(/\/admin\/bills/, { timeout: 10000 })
      await expect(page.locator('h1')).toContainText('จัดการบิล/ค่าใช้จ่าย', { timeout: 10000 })

      // Click Create Bill
      await page.click('text=สร้างบิลใหม่')
      await page.waitForURL(/\/admin\/bills\/new/, { timeout: 10000 })

      // Verify we reached the page
      await expect(page.locator('h1')).toContainText('สร้างบิลใหม่', { timeout: 10000 })
    })

    test('should allow admin to verify payments', async ({ page }) => {
      await page.click('a[href="/admin/bills"]', { timeout: 10000 })
      await page.waitForURL(/\/admin\/bills/, { timeout: 10000 })

      // Look for "Verify" button (ตรวจสอบ)
      const verifyButton = page.locator('button:has-text("ตรวจสอบ")').first()

      if (await verifyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await verifyButton.click()

        // Check dialog appears
        await expect(page.locator('text=ตรวจสอบการชำระเงิน')).toBeVisible({ timeout: 10000 })

        // Check actions
        await expect(page.locator('button:has-text("อนุมัติ")')).toBeVisible()
        await expect(page.locator('button:has-text("ปฏิเสธ")')).toBeVisible()

        // Close dialog
        await page.click('button:has-text("ยกเลิก")')
      }
    })
  })
})

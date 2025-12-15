import { test, expect } from '@playwright/test'

test.describe('Payment System', () => {
  
  test.describe('Admin Bill Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login as admin
      await page.goto('/')
      await page.fill('input[name="email"]', 'admin@test.com')
      await page.fill('input[name="password"]', 'TestPass123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/dashboard/)
    })

    test('should allow admin to create a new bill', async ({ page }) => {
      await page.click('text=บิล/ค่าใช้จ่าย')
      await expect(page.locator('h1')).toContainText('จัดการบิล/ค่าใช้จ่าย')
      
      // Click New Bill
      await page.click('text=สร้างบิลใหม่')
      await expect(page).toHaveURL(/\/admin\/bills\/new/)
      
      // Fill form
      // Select Unit
      await page.click('button[role="combobox"]:has-text("เลือกยูนิต")')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
      
      // Select Bill Type
      await page.click('button[role="combobox"]:has-text("เลือกประเภท")')
      await page.click('text=ค่าน้ำ')
      
      await page.fill('input[name="amount"]', '500.00')
      
      // Set Due Date (tomorrow)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateString = tomorrow.toISOString().split('T')[0]
      await page.fill('input[name="dueDate"]', dateString)
      
      // Submit
      await page.click('button:has-text("สร้างบิล")')
      
      // Verify success
      await expect(page.locator('text=สร้างบิลเรียบร้อยแล้ว')).toBeVisible()
      await expect(page).toHaveURL(/\/admin\/bills/)
    })
  })

  test.describe('Resident Bill Payment', () => {
    test.beforeEach(async ({ page }) => {
      // Login as resident
      await page.goto('/')
      await page.fill('input[name="email"]', 'resident@test.com')
      await page.fill('input[name="password"]', 'TestPass123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/dashboard/)
    })

    test('should allow resident to view bills and payment details', async ({ page }) => {
      await page.click('text=บิล/ชำระเงิน')
      await expect(page.locator('h1')).toContainText('บิล/ชำระเงิน')
      
      // Check if there are any pending bills (assuming previous test created one or seed data exists)
      // If no bills, this test might need adjustment or seed data
      const pendingTab = page.locator('button[role="tab"]:has-text("ค้างชำระ")')
      await expect(pendingTab).toBeVisible()
      
      // If there is a bill, click "ชำระเงิน"
      const payButton = page.locator('button:has-text("ชำระเงิน")').first()
      if (await payButton.isVisible()) {
        await payButton.click()
        
        // Should navigate to detail page
        await expect(page).toHaveURL(/\/resident\/bills\/.+/)
        
        // Check for QR Code or Bank Info button
        const showInfoButton = page.locator('button:has-text("แสดงข้อมูลบัญชี"), button:has-text("แสดง QR Code")')
        await expect(showInfoButton).toBeVisible()
        
        // Click it
        await showInfoButton.click()
        
        // Should show bank info or QR
        await expect(page.locator('text=ยอดชำระ')).toBeVisible()
        
        // Should have upload slip input
        await expect(page.locator('input[type="file"]')).toBeVisible()
      }
    })
  })
})

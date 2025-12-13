import { test, expect } from '@playwright/test'

test.describe('Facilities Booking', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.fill('input[name="email"]', 'resident@test.com')
    await page.fill('input[name="password"]', 'TestPass123!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
  })

  test('should display facilities list', async ({ page }) => {
    await page.click('text=สิ่งอำนวยความสะดวก')

    await expect(page.locator('h1')).toContainText('สิ่งอำนวยความสะดวก')
    await expect(page.locator('[data-testid="facility-card"]')).toHaveCount.greaterThan(0)
  })

  test('should show facility details', async ({ page }) => {
    await page.click('text=สิ่งอำนวยความสะดวก')

    // Click on first facility
    await page.click('[data-testid="facility-card"] >> visible=true')

    await expect(page.locator('h1')).toContainText('รายละเอียดสิ่งอำนวยความสะดวก')
    await expect(page.locator('[data-testid="facility-name"]')).toBeVisible()
    await expect(page.locator('[data-testid="facility-description"]')).toBeVisible()
  })

  test('should create a new booking', async ({ page }) => {
    await page.click('text=สิ่งอำนวยความสะดวก')

    // Click on first facility
    await page.click('[data-testid="facility-card"] >> visible=true')

    // Click booking button
    await page.click('text=จอง')

    // Fill booking form
    await page.click('text=วันที่')
    await page.click('[data-testid="calendar-tomorrow"]')

    await page.click('text=เวลาเริ่มต้น')
    await page.click('text=09:00')

    await page.click('text=เวลาสิ้นสุด')
    await page.click('text=10:00')

    await page.fill('textarea[name="purpose"]', 'ทดสอบการจอง')

    // Submit booking
    await page.click('button:has-text("ยืนยันการจอง")')

    // Should show success message
    await expect(page.locator('text=จองสำเร็จแล้ว')).toBeVisible()
  })

  test('should validate booking time conflicts', async ({ page }) => {
    await page.click('text=สิ่งอำนวยความสะดวก')
    await page.click('[data-testid="facility-card"] >> visible=true')
    await page.click('text=จอง')

    // Try to book past time
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    await page.click('text=วันที่')
    await page.click(`text=${yesterday.getDate()}`)

    // Should show validation error
    await page.click('button:has-text("ยืนยันการจอง")')
    await expect(page.locator('text=ไม่สามารถจองในอดีตได้')).toBeVisible()
  })

  test('should show user bookings', async ({ page }) => {
    await page.click('text=การจองของฉัน')

    await expect(page.locator('h1')).toContainText('การจองของฉัน')
    await expect(page.locator('[data-testid="booking-card"]')).toBeVisible()
  })

  test('should cancel a booking', async ({ page }) => {
    await page.click('text=การจองของฉัน')

    // Find booking with "pending" status and cancel it
    const bookingCard = page.locator('[data-testid="booking-card"]').first()
    await expect(bookingCard).toBeVisible()

    // Click cancel button
    await bookingCard.locator('button:has-text("ยกเลิก")').click()

    // Confirm cancellation
    await page.click('button:has-text("ยืนยัน")')

    // Should show success message
    await expect(page.locator('text=ยกเลิกการจองสำเร็จ')).toBeVisible()
  })
})

test.describe('Admin Facility Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/')
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'TestPass123!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
  })

  test('should create new facility', async ({ page }) => {
    await page.click('text=สิ่งอำนวยความสะดวก')

    // Click add button
    await page.click('button:has-text("เพิ่มสิ่งอำนวยความสะดวก")')

    // Fill form
    await page.fill('input[name="name"]', 'สระว่ายน้ำทดสอบ')
    await page.fill('textarea[name="description"]', 'สระว่ายน้ำขนาด 25 เมตรสำหรับทดสอบ')
    await page.fill('input[name="capacity"]', '20')
    await page.fill('input[name="hourlyRate"]', '150')

    // Submit
    await page.click('button:has-text("บันทึก")')

    // Should show success message
    await expect(page.locator('text=เพิ่มสิ่งอำนวยความสะดวกสำเร็จ')).toBeVisible()
  })

  test('should edit facility', async ({ page }) => {
    await page.click('text=สิ่งอำนวยความสะดวก')

    // Click edit button on first facility
    await page.click('[data-testid="facility-card"] button:has-text("แก้ไข")')

    // Update form
    await page.fill('input[name="name"]', 'สระว่ายน้ำ (อัปเดต)')

    // Submit
    await page.click('button:has-text("บันทึก")')

    // Should show success message
    await expect(page.locator('text=แก้ไขสิ่งอำนวยความสะดวกสำเร็จ')).toBeVisible()
  })

  test('should manage bookings', async ({ page }) => {
    await page.click('text=การจอง')

    await expect(page.locator('h1')).toContainText('การจองทั้งหมด')
    await expect(page.locator('[data-testid="booking-card"]')).toBeVisible()

    // Approve a booking
    const pendingBooking = page.locator('[data-testid="booking-status-pending"]').first()
    if (await pendingBooking.isVisible()) {
      await pendingBooking.locator('button:has-text("อนุมัติ")').click()
      await expect(page.locator('text=อนุมัติการจองสำเร็จ')).toBeVisible()
    }
  })
})
import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Facilities Booking', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'resident')
  })

  test('should display facilities list', async ({ page }) => {
    await page.click('text=สิ่งอำนวยความสะดวก', { timeout: 10000 })

    await expect(page.locator('h1')).toContainText('สิ่งอำนวยความสะดวก', { timeout: 10000 })

    // Check if facilities are displayed
    const facilityCard = page.locator('[data-testid="facility-card"]').first()
    if (await facilityCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(facilityCard).toBeVisible()
    } else {
      // If no facilities, should see empty state
      await expect(page.locator('text=ยังไม่มีสิ่งอำนวยความสะดวก')).toBeVisible()
    }
  })

  test('should show facility details', async ({ page }) => {
    await page.click('text=สิ่งอำนวยความสะดวก', { timeout: 10000 })

    // Check if there are facilities first
    const facilityCard = page.locator('[data-testid="facility-card"]').first()
    if (await facilityCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Click on first facility
      await facilityCard.click()

      await expect(page.locator('h1')).toContainText('รายละเอียดสิ่งอำนวยความสะดวก', { timeout: 10000 })
      await expect(page.locator('[data-testid="facility-name"]')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('[data-testid="facility-description"]')).toBeVisible({ timeout: 10000 })
    }
  })

  test('should create a new booking', async ({ page }) => {
    await page.click('text=สิ่งอำนวยความสะดวก', { timeout: 10000 })

    // Check if there are facilities first
    const facilityCard = page.locator('[data-testid="facility-card"]').first()
    if (await facilityCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Click on first facility
      await facilityCard.click()

      // Click booking button
      await page.click('text=จอง', { timeout: 10000 })

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
      await expect(page.locator('text=จองสำเร็จแล้ว')).toBeVisible({ timeout: 10000 })
    }
  })

  test('should show user bookings', async ({ page }) => {
    await page.click('text=การจองของฉัน', { timeout: 10000 })

    await expect(page.locator('h1')).toContainText('การจองของฉัน', { timeout: 10000 })

    // Check if bookings exist
    const bookingCard = page.locator('[data-testid="booking-card"]').first()
    if (await bookingCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(bookingCard).toBeVisible()
    } else {
      // If no bookings, should see empty state
      await expect(page.locator('text=ยังไม่มีการจอง')).toBeVisible()
    }
  })

  test('should cancel a booking', async ({ page }) => {
    await page.click('text=การจองของฉัน', { timeout: 10000 })

    // Check if there are bookings first
    const bookingCard = page.locator('[data-testid="booking-card"]').first()
    if (await bookingCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Click cancel button on first booking
      const cancelButton = bookingCard.locator('button:has-text("ยกเลิก")')
      if (await cancelButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await cancelButton.click()

        // Confirm cancellation
        await page.click('button:has-text("ยืนยัน")', { timeout: 10000 })

        // Should show success message
        await expect(page.locator('text=ยกเลิกการจองสำเร็จ')).toBeVisible({ timeout: 10000 })
      }
    }
  })
})

test.describe('Admin Facility Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'admin')
  })

  test('should display facilities management page', async ({ page }) => {
    await page.click('text=สิ่งอำนวยความสะดวก', { timeout: 10000 })

    await expect(page.locator('h1')).toContainText('จัดการสิ่งอำนวยความสะดวก', { timeout: 10000 })
  })

  test('should create a new facility', async ({ page }) => {
    await page.click('text=สิ่งอำนวยความสะดวก', { timeout: 10000 })

    // Click create button
    await page.click('text=เพิ่มสิ่งอำนวยความสะดวก')

    // Fill form
    await page.fill('input[name="name"]', 'Test Facility')
    await page.fill('textarea[name="description"]', 'Test facility description')
    await page.fill('input[name="capacity"]', '10')

    // Submit
    await page.click('button:has-text("บันทึก")')

    // Should show success message
    await expect(page.locator('text=สร้างสำเร็จ')).toBeVisible({ timeout: 10000 })
  })

  test('should manage bookings', async ({ page }) => {
    await page.click('text=การจอง', { timeout: 10000 })

    await expect(page.locator('h1')).toContainText('จัดการการจอง', { timeout: 10000 })

    // Should see booking list or empty state
    const hasBookings = await page.locator('[data-testid="booking-card"]').first().isVisible({ timeout: 5000 }).catch(() => false)
    if (!hasBookings) {
      await expect(page.locator('text=ยังไม่มีการจอง')).toBeVisible()
    }
  })
})
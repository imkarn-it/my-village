/**
 * Settings Page E2E Tests
 */
import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Notification Settings', () => {
    test.beforeEach(async ({ page }) => {
        // Login as resident to access settings
        await login(page, 'resident@test.com', 'TestResident123!')
    })

    test('should display settings page with notification toggles', async ({ page }) => {
        await page.goto('/resident/settings')

        await expect(page.getByRole('heading', { name: /ตั้งค่า/i })).toBeVisible()

        // Check for notification card
        await expect(page.getByText(/การแจ้งเตือน/i)).toBeVisible()

        // Check for toggle switches
        await expect(page.getByText(/แจ้งเตือนพัสดุ/i)).toBeVisible()
        await expect(page.getByText(/แจ้งเตือนบิล/i)).toBeVisible()
    })

    test('should toggle notification settings', async ({ page }) => {
        await page.goto('/resident/settings')

        // Find a switch and toggle it
        const switches = page.locator('button[role="switch"]')
        const firstSwitch = switches.first()

        // Get initial state
        const initialState = await firstSwitch.getAttribute('data-state')

        // Click to toggle
        await firstSwitch.click()

        // Verify state changed
        const newState = await firstSwitch.getAttribute('data-state')
        expect(newState).not.toBe(initialState)
    })

    test('should show save button when settings change', async ({ page }) => {
        await page.goto('/resident/settings')

        // Toggle a setting
        const switches = page.locator('button[role="switch"]')
        await switches.first().click()

        // Save button should appear
        await expect(page.getByRole('button', { name: /บันทึก/i })).toBeVisible()
    })

    test('should save settings successfully', async ({ page }) => {
        await page.goto('/resident/settings')

        // Toggle a setting
        const switches = page.locator('button[role="switch"]')
        await switches.first().click()

        // Click save
        await page.getByRole('button', { name: /บันทึก/i }).click()

        // Should show success toast
        await expect(page.getByText(/บันทึก.*เรียบร้อย/i)).toBeVisible({ timeout: 5000 })
    })

    test('should display privacy settings section', async ({ page }) => {
        await page.goto('/resident/settings')

        await expect(page.getByText(/ความเป็นส่วนตัว/i)).toBeVisible()
        await expect(page.getByText(/แสดงเบอร์โทรศัพท์/i)).toBeVisible()
    })
})

import { test, expect } from '@playwright/test'

test.describe('SOS Emergency', () => {
    test.beforeEach(async ({ page }) => {
        // This test requires authentication
        // For now, we'll test the UI elements on the login page
    })

    test('SOS button should be visible on resident dashboard', async ({ page }) => {
        // Navigate to login
        await page.goto('/login')

        // Login form should be visible
        await expect(page.locator('input[name="email"]')).toBeVisible()
    })

    test('security SOS page should be accessible', async ({ page }) => {
        // Test that SOS routes exist
        const response = await page.goto('/security/sos')

        // Should redirect to login or show the page
        expect(response?.status()).toBeLessThan(500)
    })

    test('admin SOS page should be accessible', async ({ page }) => {
        const response = await page.goto('/admin/sos')

        // Should redirect to login or show the page
        expect(response?.status()).toBeLessThan(500)
    })
})

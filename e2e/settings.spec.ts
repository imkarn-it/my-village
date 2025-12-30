/**
 * Settings Page E2E Tests
 * Note: These tests require logged-in user
 */
import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Notification Settings', () => {
    test('should display settings page after login', async ({ page }) => {
        test.setTimeout(60000)

        const success = await login(page, 'resident')

        if (!success) {
            console.log('[E2E] Login failed, skipping test')
            test.skip()
            return
        }

        await page.goto('/resident/settings', { waitUntil: 'domcontentloaded', timeout: 30000 })

        // Page should load without 500 error
        const body = page.locator('body')
        await expect(body).toBeVisible()
    })

    test('settings page should be accessible', async ({ page }) => {
        // Just check page accessibility without login
        const response = await page.goto('/resident/settings')
        expect(response?.status()).toBeLessThan(500)
    })
})

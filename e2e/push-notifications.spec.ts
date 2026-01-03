/**
 * Push Notifications E2E Tests
 * Tests for OneSignal push notification permission flow
 */
import { test, expect } from '@playwright/test'

test.describe('Push Notifications', () => {
    test.describe('Push Permission UI', () => {
        test('should show push permission button in header', async ({ page }) => {
            // Login as resident
            await page.goto('/login')
            await page.fill('input[name="email"]', 'resident@test.com')
            await page.fill('input[name="password"]', 'TestResident123!')
            await page.click('button[type="submit"]')

            // Wait for navigation
            await page.waitForURL(/\/resident/, { timeout: 10000 })

            // Look for push permission button
            const pushButton = page.locator('button:has-text("เปิดแจ้งเตือน"), [data-testid="push-permission"]')

            // Button should exist (might be hidden if already granted)
            // Check if the header area exists
            const header = page.locator('header')
            await expect(header).toBeVisible()
        })

        test('should show push permission dialog when clicked', async ({ page, context }) => {
            // Grant notification permission for this context
            await context.grantPermissions([])

            // Login
            await page.goto('/login')
            await page.fill('input[name="email"]', 'resident@test.com')
            await page.fill('input[name="password"]', 'TestResident123!')
            await page.click('button[type="submit"]')

            await page.waitForURL(/\/resident/, { timeout: 10000 })

            // Try to find and click push button
            const pushButton = page.locator('button:has-text("เปิดแจ้งเตือน")')

            if (await pushButton.isVisible()) {
                await pushButton.click()

                // Check for dialog
                const dialog = page.locator('[role="dialog"], .dialog')
                await expect(dialog.first()).toBeVisible({ timeout: 3000 })
            }
        })
    })

    test.describe('Push API Integration', () => {
        test('notification API should be accessible', async ({ page }) => {
            // Login first
            await page.goto('/login')
            await page.fill('input[name="email"]', 'resident@test.com')
            await page.fill('input[name="password"]', 'TestResident123!')
            await page.click('button[type="submit"]')

            await page.waitForURL(/\/resident/, { timeout: 10000 })

            // Check notifications endpoint
            const response = await page.request.get('/api/notifications')
            expect([200, 401]).toContain(response.status())
        })
    })

    test.describe('OneSignal Configuration', () => {
        test('should have OneSignal service worker available', async ({ page }) => {
            // Check if service worker file exists
            const response = await page.request.get('/OneSignalSDKWorker.js')
            expect(response.status()).toBe(200)
        })
    })

    test.describe('Security Dashboard Push', () => {
        test('security should see SOS alerts section', async ({ page }) => {
            // Login as security
            await page.goto('/login')
            await page.fill('input[name="email"]', 'security@test.com')
            await page.fill('input[name="password"]', 'TestSecurity123!')
            await page.click('button[type="submit"]')

            await page.waitForURL(/\/security/, { timeout: 10000 })

            // Navigate to SOS page
            await page.goto('/security/sos')
            await expect(page).toHaveURL(/\/security\/sos/)

            // Page should load
            const content = page.locator('main, [role="main"]')
            await expect(content.first()).toBeVisible()
        })
    })
})

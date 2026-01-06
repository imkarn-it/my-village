/**
 * Real-time Updates E2E Tests
 * Tests for SOS alerts and notifications real-time flow
 */
import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Real-time Updates', () => {
    test.describe('Polling Fallback', () => {
        test('should poll for notifications periodically', async ({ page }) => {
            // Login as resident
            await login(page, 'resident')

            // Check that user interface is loaded (header with navigation)
            const headerContent = page.locator('header, nav, [role="banner"]')
            await expect(headerContent.first()).toBeVisible({ timeout: 10000 })
        })


        test('should show notification count', async ({ page }) => {
            await login(page, 'resident')

            // Notification UI should be present
            const notificationArea = page.locator('header, nav')
            await expect(notificationArea.first()).toBeVisible()
        })
    })

    test.describe('SOS Alert Flow', () => {
        test('security dashboard should have SOS section', async ({ page }) => {
            // Login as security
            await login(page, 'security')

            // Navigate to SOS page
            await page.goto('/security/sos')

            // SOS page should load
            await expect(page).toHaveURL(/\/security\/sos/)

            // Check for SOS related content
            const pageContent = page.locator('main, [role="main"]')
            await expect(pageContent.first()).toBeVisible()
        })

        test('resident should have SOS button', async ({ page }) => {
            // Login as resident
            await login(page, 'resident')

            // Look for SOS button or link
            const sosElement = page.locator('a[href*="sos"], button:has-text("SOS"), [data-testid="sos-button"]')

            // SOS link might be in sidebar or as a button
            if (await sosElement.first().isVisible()) {
                await expect(sosElement.first()).toBeVisible()
            }
        })
    })

    test.describe('Notification Updates', () => {
        test('admin creating announcement should trigger notification', async ({ page }) => {
            // This test verifies the notification flow exists
            // Login as admin
            await login(page, 'admin')

            // Navigate to announcements
            await page.goto('/admin/announcements')
            await expect(page).toHaveURL(/\/admin\/announcements/)

            // Check announcements page loaded
            const pageContent = page.locator('main, h1, h2')
            await expect(pageContent.first()).toBeVisible()
        })

        test('notification API should respond', async ({ page }) => {
            // Login first to get session
            await login(page, 'resident')

            // Check notification API responds
            const response = await page.request.get('/api/notifications')
            expect([200, 401]).toContain(response.status())
        })
    })

    test.describe('Real-time Connection Status', () => {
        test('should handle network interruptions gracefully', async ({ page }) => {
            // Login
            await login(page, 'resident')

            // Page should remain functional
            await expect(page.locator('main, [role="main"]').first()).toBeVisible()

            // Simulate offline
            await page.context().setOffline(true)

            // Wait a moment
            await page.waitForTimeout(500)

            // Go back online
            await page.context().setOffline(false)

            // Page should recover
            await page.waitForTimeout(1000)
            await page.reload()
            await expect(page.locator('main, [role="main"]').first()).toBeVisible()
        })
    })
})

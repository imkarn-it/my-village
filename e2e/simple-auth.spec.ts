/**
 * Simple E2E Auth Test - tests login using the helper
 */
import { test, expect } from '@playwright/test'
import { login, TEST_USERS } from './helpers/auth'

test.describe('Simple Login Test', () => {
    test('should login as admin and redirect to dashboard', async ({ page }) => {
        const success = await login(page, 'admin')

        expect(success).toBe(true)

        // Verify we're on admin dashboard
        const currentUrl = page.url()
        expect(currentUrl).toContain('/admin')
    })

    test('should login as resident and redirect to resident dashboard', async ({ page }) => {
        const success = await login(page, 'resident')

        expect(success).toBe(true)

        // Verify we're on resident dashboard
        const currentUrl = page.url()
        expect(currentUrl).toContain('/resident')
    })

    test('should login as security and redirect to security dashboard', async ({ page }) => {
        const success = await login(page, 'security')

        expect(success).toBe(true)

        const currentUrl = page.url()
        expect(currentUrl).toContain('/security')
    })

    test('should login as maintenance and redirect to maintenance dashboard', async ({ page }) => {
        const success = await login(page, 'maintenance')

        expect(success).toBe(true)

        const currentUrl = page.url()
        expect(currentUrl).toContain('/maintenance')
    })
})

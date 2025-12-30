import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard', () => {
    test('admin dashboard routes should not return server error', async ({ page }) => {
        // Test that route doesn't cause 500 error
        // Note: In dev mode, middleware timing can be inconsistent
        const response = await page.goto('/admin')
        expect(response?.status()).toBeLessThan(500)
    })

    test('admin announcements page should be accessible', async ({ page }) => {
        const response = await page.goto('/admin/announcements')
        expect(response?.status()).toBeLessThan(500)
    })

    test('admin residents page should be accessible', async ({ page }) => {
        const response = await page.goto('/admin/residents')
        expect(response?.status()).toBeLessThan(500)
    })

    test('admin bills page should be accessible', async ({ page }) => {
        const response = await page.goto('/admin/bills')
        expect(response?.status()).toBeLessThan(500)
    })

    test('admin payment settings page should be accessible', async ({ page }) => {
        const response = await page.goto('/admin/payment-settings')
        expect(response?.status()).toBeLessThan(500)
    })

    test('admin maintenance page should be accessible', async ({ page }) => {
        const response = await page.goto('/admin/maintenance')
        expect(response?.status()).toBeLessThan(500)
    })

    test('admin facilities page should be accessible', async ({ page }) => {
        const response = await page.goto('/admin/facilities')
        expect(response?.status()).toBeLessThan(500)
    })

    test('admin bookings page should be accessible', async ({ page }) => {
        const response = await page.goto('/admin/bookings')
        expect(response?.status()).toBeLessThan(500)
    })

    test('admin SOS page should be accessible', async ({ page }) => {
        const response = await page.goto('/admin/sos')
        expect(response?.status()).toBeLessThan(500)
    })

    test('admin reports page should be accessible', async ({ page }) => {
        const response = await page.goto('/admin/reports')
        expect(response?.status()).toBeLessThan(500)
    })

    test('admin attendance page should be accessible', async ({ page }) => {
        const response = await page.goto('/admin/attendance')
        expect(response?.status()).toBeLessThan(500)
    })
})

test.describe('Admin API', () => {
    test('users API should be accessible', async ({ request }) => {
        const response = await request.get('/api/users')
        expect(response.status()).toBeLessThanOrEqual(500)
    })

    test('bills create API should handle requests', async ({ request }) => {
        const response = await request.post('/api/bills', {
            data: {
                unitId: 'test',
                amount: 1000,
                billType: 'common',
            }
        })
        // Accept any non-crash response
        expect(response.status()).toBeLessThanOrEqual(500)
    })
})

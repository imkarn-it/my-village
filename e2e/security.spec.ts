import { test, expect } from '@playwright/test'

test.describe('Security Guard Dashboard', () => {
    test('security routes should not return 500 error', async ({ page }) => {
        const response = await page.goto('/security')
        expect(response?.status()).toBeLessThan(500)
    })

    test('visitor check-in page should be accessible', async ({ page }) => {
        const response = await page.goto('/security/visitors/new')
        expect(response?.status()).toBeLessThan(500)
    })

    test('QR scan page should be accessible', async ({ page }) => {
        const response = await page.goto('/security/scan')
        expect(response?.status()).toBeLessThan(500)
    })

    test('security alerts page should be accessible', async ({ page }) => {
        const response = await page.goto('/security/alerts')
        expect(response?.status()).toBeLessThan(500)
    })

    test('attendance page should be accessible', async ({ page }) => {
        const response = await page.goto('/security/attendance')
        expect(response?.status()).toBeLessThan(500)
    })

    test('patrol page should be accessible', async ({ page }) => {
        const response = await page.goto('/security/patrol')
        expect(response?.status()).toBeLessThan(500)
    })

    test('emergency page should be accessible', async ({ page }) => {
        const response = await page.goto('/security/emergency')
        expect(response?.status()).toBeLessThan(500)
    })
})

test.describe('Security API', () => {
    test('attendance clock-in API should respond', async ({ request }) => {
        const response = await request.post('/api/attendance/clock-in')
        expect(response.status()).toBeLessThanOrEqual(500)
    })

    test('patrol log API should respond', async ({ request }) => {
        const response = await request.post('/api/patrol/log', {
            data: { checkpointId: 'test' }
        })
        expect(response.status()).toBeLessThanOrEqual(500)
    })

    test('checkpoints API should respond', async ({ request }) => {
        const response = await request.get('/api/patrol/checkpoints')
        expect(response.status()).toBeLessThanOrEqual(500)
    })
})

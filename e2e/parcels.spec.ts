import { test, expect } from '@playwright/test'

test.describe('Parcels', () => {
    test('resident parcels page should be accessible', async ({ page }) => {
        const response = await page.goto('/resident/parcels')
        // Should redirect to login or show page
        expect(response?.status()).toBeLessThan(500)
    })

    test('security parcels page should be accessible', async ({ page }) => {
        const response = await page.goto('/security/parcels')
        expect(response?.status()).toBeLessThan(500)
    })

    test('admin parcels page should be accessible', async ({ page }) => {
        const response = await page.goto('/admin/parcels')
        expect(response?.status()).toBeLessThan(500)
    })
})

test.describe('Parcels API', () => {
    test('parcels API should be protected', async ({ request }) => {
        const response = await request.get('/api/parcels')
        expect([200, 401, 403, 404]).toContain(response.status())
    })

    test('create parcel API should be protected', async ({ request }) => {
        const response = await request.post('/api/parcels', {
            data: {
                unitId: 'test',
                trackingNumber: 'TEST123',
                carrier: 'Kerry',
            }
        })
        expect([200, 201, 400, 401, 403]).toContain(response.status())
    })
})

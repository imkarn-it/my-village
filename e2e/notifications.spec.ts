import { test, expect } from '@playwright/test'

test.describe('Notifications', () => {
    test('notifications API should return proper response', async ({ request }) => {
        // Test API endpoint exists
        const response = await request.get('/api/notifications')

        // Should return 401 (unauthorized) or 200
        expect([200, 401]).toContain(response.status())
    })

    test('mark-all-read API should exist', async ({ request }) => {
        const response = await request.post('/api/notifications/mark-all-read')

        // Should return 401 (unauthorized) or 200
        expect([200, 401, 405]).toContain(response.status())
    })
})

test.describe('PWA Features', () => {
    test('manifest.json should be accessible', async ({ request }) => {
        const response = await request.get('/manifest.json')

        expect(response.status()).toBe(200)

        const manifest = await response.json()
        expect(manifest.name).toBe('My Village')
        expect(manifest.short_name).toBe('Village')
        expect(manifest.display).toBe('standalone')
    })

    test('service worker should be accessible', async ({ request }) => {
        const response = await request.get('/sw.js')

        expect(response.status()).toBe(200)
        expect(response.headers()['content-type']).toContain('javascript')
    })
})

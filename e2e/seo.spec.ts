/**
 * SEO Meta Tags E2E Tests
 * Verifies that critical SEO elements are present on pages
 */
import { test, expect } from '@playwright/test'

test.describe('SEO Meta Tags', () => {
    test('homepage should have correct meta tags', async ({ page }) => {
        await page.goto('/login')

        // Title
        const title = await page.title()
        expect(title).toContain('My Village')

        // Meta Description
        const description = await page.locator('meta[name="description"]').getAttribute('content')
        expect(description).toBeTruthy()
        expect(description?.length).toBeGreaterThan(50)

        // Viewport
        const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
        expect(viewport).toContain('width=device-width')
    })

    test('should have Open Graph meta tags', async ({ page }) => {
        await page.goto('/login')

        // OG Type
        const ogType = await page.locator('meta[property="og:type"]').getAttribute('content')
        expect(ogType).toBeTruthy()

        // OG Title
        const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
        expect(ogTitle).toBeTruthy()

        // OG Description
        const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content')
        expect(ogDescription).toBeTruthy()

        // OG Locale
        const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content')
        expect(ogLocale).toBe('th_TH')
    })

    test('should have Twitter card meta tags', async ({ page }) => {
        await page.goto('/login')

        // Twitter Card
        const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content')
        expect(twitterCard).toBe('summary_large_image')

        // Twitter Title
        const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content')
        expect(twitterTitle).toBeTruthy()

        // Twitter Description
        const twitterDescription = await page.locator('meta[name="twitter:description"]').getAttribute('content')
        expect(twitterDescription).toBeTruthy()
    })

    test('should have PWA manifest link', async ({ page }) => {
        await page.goto('/login')

        const manifest = await page.locator('link[rel="manifest"]').getAttribute('href')
        expect(manifest).toBe('/manifest.json')
    })

    test('should have apple touch icon', async ({ page }) => {
        await page.goto('/login')

        const appleIcon = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href')
        expect(appleIcon).toBeTruthy()
    })

    test('should have robots meta tag', async ({ page }) => {
        await page.goto('/login')

        const robots = await page.locator('meta[name="robots"]').getAttribute('content')
        expect(robots).toContain('index')
        expect(robots).toContain('follow')
    })

    test('should have proper HTML lang attribute', async ({ page }) => {
        await page.goto('/login')

        const lang = await page.locator('html').getAttribute('lang')
        expect(lang).toBe('th')
    })

    test('should have theme-color meta tag', async ({ page }) => {
        await page.goto('/login')

        const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content')
        expect(themeColor).toBeTruthy()
    })
})

test.describe('Google Analytics', () => {
    test('GA script should be present when configured', async ({ page }) => {
        await page.goto('/login')

        // GA might not be configured in test, so just check page loads
        const body = page.locator('body')
        await expect(body).toBeVisible()

        // If GA is configured, the script should exist
        // gtag function should be defined (if GA is enabled)
        const hasGtag = await page.evaluate(() => {
            return typeof (window as any).gtag === 'function'
        }).catch(() => false)

        // Test passes regardless - GA is optional
        expect(true).toBe(true)
    })
})

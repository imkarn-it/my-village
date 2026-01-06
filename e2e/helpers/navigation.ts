import { Page } from '@playwright/test'

/**
 * Navigate to a URL, handling mobile sidebar if necessary.
 * This is useful when you want to simulate a user clicking a link in the navigation,
 * which might be hidden behind a hamburger menu on mobile.
 */
export async function navigateTo(page: Page, href: string) {
    // Check if the link is visible directly (Desktop)
    const link = page.locator(`a[href="${href}"]`).first()

    if (await link.isVisible()) {
        try {
            // Try clicking with a short timeout. If it fails (e.g. covered by overlay), fall through
            await link.click({ timeout: 2000 })
            return
        } catch {
            // Ignore error and try fallback
        }
    }

    // If not visible or click failed, try to open sidebar (Mobile)
    // Look for SidebarTrigger
    const trigger = page.locator('button[data-sidebar="trigger"]')

    if (await trigger.isVisible()) {
        try {
            await trigger.click({ timeout: 2000 })
            // Wait for sidebar to open animation
            await page.waitForTimeout(500)

            // Now try clicking the link again
            if (await link.isVisible()) {
                await link.click({ timeout: 2000 })
                return
            }
        } catch {
            // Ignore error and try fallback
        }
    }

    // Fallback: direct navigation if UI interaction fails or link is still not visible
    // This ensures the test can proceed even if the UI interaction is flaky
    await page.goto(href, { timeout: 60000, waitUntil: 'domcontentloaded' })
}

import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Visitor Management System', () => {

    test.describe('Resident Visitor Management', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, 'resident')
        })

        test('should display visitors page', async ({ page }) => {
            // Navigate to Visitors page
            await page.click('a[href="/resident/visitors"]', { timeout: 10000 })
            await page.waitForURL(/\/resident\/visitors/, { timeout: 10000 })

            // Verify page loaded
            await expect(page.locator('h1')).toContainText('ผู้มาติดต่อ', { timeout: 10000 })
            await expect(page.locator('text=จัดการและติดตามผู้มาติดต่อ')).toBeVisible()
        })

        test('should navigate to create visitor page', async ({ page }) => {
            // Navigate to Visitors page
            await page.click('a[href="/resident/visitors"]', { timeout: 10000 })
            await page.waitForURL(/\/resident\/visitors/, { timeout: 10000 })

            // Click Create QR Code link
            await page.click('a[href="/resident/visitors/new"]')
            await page.waitForURL(/\/resident\/visitors\/new/, { timeout: 10000 })

            // Verify we're on the create page
            await expect(page.locator('h1')).toContainText('สร้าง QR Code', { timeout: 10000 })
        })
    })

    test.describe('Security Visitor Check-in', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, 'security')
        })

        test('should display security visitors page', async ({ page }) => {
            // Navigate to Visitors page
            await page.click('a[href="/security/visitors"]', { timeout: 10000 })
            await page.waitForURL(/\/security\/visitors/, { timeout: 10000 })

            // Verify page loaded
            await expect(page.locator('h1')).toContainText('ผู้มาติดต่อ', { timeout: 10000 })
        })

        test('should navigate to check-in page', async ({ page }) => {
            // Navigate to Visitors page
            await page.click('a[href="/security/visitors"]', { timeout: 10000 })
            await page.waitForURL(/\/security\/visitors/, { timeout: 10000 })

            // Click Check-in link
            await page.click('a[href="/security/visitors/new"]')
            await page.waitForURL(/\/security\/visitors\/new/, { timeout: 10000 })

            // Verify we're on the check-in page
            await expect(page.locator('h1')).toContainText('Check-in', { timeout: 10000 })
        })
    })
})

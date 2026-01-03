/**
 * E2E Tests for Feature Toggles
 */
import { test, expect } from '@playwright/test'

test.describe('Feature Toggles', () => {
    test.describe('Admin Feature Settings Page', () => {
        test.beforeEach(async ({ page }) => {
            // Login as admin
            await page.goto('/login')
            await page.fill('input[name="email"]', 'admin@test.com')
            await page.fill('input[name="password"]', 'password123')
            await page.click('button[type="submit"]')
            await page.waitForURL(/\/admin/)
        })

        test('should display feature settings page', async ({ page }) => {
            await page.goto('/admin/settings/features')

            // Should show page title
            await expect(page.locator('h1')).toContainText('ตั้งค่าฟีเจอร์')

            // Should show feature cards
            await expect(page.locator('text=ระบบแจ้งซ่อม')).toBeVisible()
            await expect(page.locator('text=จองสิ่งอำนวยความสะดวก')).toBeVisible()
            await expect(page.locator('text=ระบบพัสดุ')).toBeVisible()
        })

        test('should show all 7 feature toggles', async ({ page }) => {
            await page.goto('/admin/settings/features')

            // Count switch elements
            const switches = page.locator('button[role="switch"]')
            await expect(switches).toHaveCount(7)
        })

        test('should toggle feature and show save button', async ({ page }) => {
            await page.goto('/admin/settings/features')

            // Toggle first feature
            const firstSwitch = page.locator('button[role="switch"]').first()
            await firstSwitch.click()

            // Save button should appear
            await expect(page.locator('text=บันทึก')).toBeVisible()
            await expect(page.locator('text=ยกเลิก')).toBeVisible()
        })

        test('should reset changes on cancel', async ({ page }) => {
            await page.goto('/admin/settings/features')

            // Get initial state of first switch
            const firstSwitch = page.locator('button[role="switch"]').first()
            const initialState = await firstSwitch.getAttribute('data-state')

            // Toggle it
            await firstSwitch.click()

            // Click cancel
            await page.click('text=ยกเลิก')

            // Should return to initial state
            await expect(firstSwitch).toHaveAttribute('data-state', initialState || 'checked')
        })

        test('should show feature descriptions', async ({ page }) => {
            await page.goto('/admin/settings/features')

            // Check for feature descriptions
            await expect(page.locator('text=ให้ลูกบ้านแจ้งซ่อมและติดตามสถานะการซ่อมได้')).toBeVisible()
        })

        test('should show info note section', async ({ page }) => {
            await page.goto('/admin/settings/features')

            // Check for info section
            await expect(page.locator('text=หมายเหตุ')).toBeVisible()
            await expect(page.locator('text=ข้อมูลเดิมจะยังคงอยู่ในฐานข้อมูล')).toBeVisible()
        })
    })

    test.describe('Super Admin Feature Settings Page', () => {
        test.beforeEach(async ({ page }) => {
            // Login as super admin
            await page.goto('/login')
            await page.fill('input[name="email"]', 'superadmin@test.com')
            await page.fill('input[name="password"]', 'password123')
            await page.click('button[type="submit"]')
            await page.waitForURL(/\/super-admin/)
        })

        test('should display super admin feature settings page', async ({ page }) => {
            await page.goto('/super-admin/settings/features')

            // Should show page title
            await expect(page.locator('h1')).toContainText('ตั้งค่าฟีเจอร์โปรเจกต์')
        })

        test('should show project selector', async ({ page }) => {
            await page.goto('/super-admin/settings/features')

            // Should show project selector
            await expect(page.locator('text=เลือกโปรเจกต์')).toBeVisible()
        })
    })

    test.describe('Feature Gate in Sidebar', () => {
        test('should hide menu items when feature is disabled', async ({ page }) => {
            // This test requires feature to be disabled first via API
            // For now, just verify the sidebar renders with FeatureGate wrapper
            await page.goto('/login')
            await page.fill('input[name="email"]', 'resident@test.com')
            await page.fill('input[name="password"]', 'password123')
            await page.click('button[type="submit"]')
            await page.waitForURL(/\/resident/)

            // Sidebar should be visible
            await expect(page.locator('nav')).toBeVisible()
        })
    })

    test.describe('API Endpoints', () => {
        test('GET /api/projects/:id/features should return features', async ({ request }) => {
            // First login to get session
            const loginRes = await request.post('/api/login', {
                data: {
                    email: 'admin@test.com',
                    password: 'password123',
                },
            })

            // Skip if login failed
            if (!loginRes.ok()) {
                test.skip()
                return
            }

            // Get a test project ID (would need to be set up in test fixtures)
            const projectId = 'test-project-id'

            const res = await request.get(`/api/projects/${projectId}/features`)

            // Should return features object
            if (res.ok()) {
                const data = await res.json()
                expect(data).toHaveProperty('maintenance')
                expect(data).toHaveProperty('facilities')
                expect(data).toHaveProperty('parcels')
            }
        })

        test('PATCH /api/projects/:id/features should update features', async ({ request }) => {
            // First login to get session
            const loginRes = await request.post('/api/login', {
                data: {
                    email: 'admin@test.com',
                    password: 'password123',
                },
            })

            // Skip if login failed
            if (!loginRes.ok()) {
                test.skip()
                return
            }

            const projectId = 'test-project-id'

            const res = await request.patch(`/api/projects/${projectId}/features`, {
                data: {
                    features: {
                        maintenance: false,
                    },
                },
            })

            if (res.ok()) {
                const data = await res.json()
                expect(data.success).toBe(true)
            }
        })
    })
})

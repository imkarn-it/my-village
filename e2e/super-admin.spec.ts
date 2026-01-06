import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.beforeEach(async ({ page }) => {
    await login(page, 'superadmin')
})

test.describe('Super Admin Dashboard', () => {
    test('super admin routes should not return 500 error', async ({ page }) => {
        const response = await page.goto('/super-admin')
        expect(response?.status()).toBeLessThan(500)
    })

    test('super admin projects page should be accessible', async ({ page }) => {
        const response = await page.goto('/super-admin/projects')
        expect(response?.status()).toBeLessThan(500)
    })

    test('super admin users page should be accessible', async ({ page }) => {
        const response = await page.goto('/super-admin/users')
        expect(response?.status()).toBeLessThan(500)
    })

    test('super admin permissions page should be accessible', async ({ page }) => {
        const response = await page.goto('/super-admin/permissions')
        expect(response?.status()).toBeLessThan(500)
    })

    test('super admin database page should be accessible', async ({ page }) => {
        const response = await page.goto('/super-admin/database')
        expect(response?.status()).toBeLessThan(500)
    })

    test('super admin audit page should be accessible', async ({ page }) => {
        const response = await page.goto('/super-admin/audit')
        expect(response?.status()).toBeLessThan(500)
    })

    test('super admin reports page should be accessible', async ({ page }) => {
        const response = await page.goto('/super-admin/reports')
        expect(response?.status()).toBeLessThan(500)
    })

    test('super admin settings page should be accessible', async ({ page }) => {
        const response = await page.goto('/super-admin/settings')
        expect(response?.status()).toBeLessThan(500)
    })

    test('super admin activity page should be accessible', async ({ page }) => {
        const response = await page.goto('/super-admin/activity')
        expect(response?.status()).toBeLessThan(500)
    })
})

test.describe('Super Admin - Database Management', () => {
    test('database tables page should be accessible', async ({ page }) => {
        const response = await page.goto('/super-admin/database/tables')
        expect(response?.status()).toBeLessThan(500)
    })

    test('database migrations page should be accessible', async ({ page }) => {
        const response = await page.goto('/super-admin/database/migrations')
        expect(response?.status()).toBeLessThan(500)
    })
})

test.describe('Super Admin - Project Management', () => {
    test('new project page should be accessible', async ({ page }) => {
        const response = await page.goto('/super-admin/projects/new')
        expect(response?.status()).toBeLessThan(500)
    })
})

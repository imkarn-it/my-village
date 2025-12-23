/**
 * Password Reset E2E Tests
 */
import { test, expect } from '@playwright/test'

test.describe('Password Reset Flow', () => {
    test.describe('Forgot Password Page', () => {
        test('should display forgot password form', async ({ page }) => {
            await page.goto('/forgot-password')

            await expect(page.getByRole('heading', { name: /ลืมรหัสผ่าน/i })).toBeVisible()
            await expect(page.getByPlaceholder('example@email.com')).toBeVisible()
            await expect(page.getByRole('button', { name: /ส่งลิงก์รีเซ็ต/i })).toBeVisible()
        })

        test('should have link back to login', async ({ page }) => {
            await page.goto('/forgot-password')

            const loginLink = page.getByRole('link', { name: /กลับไปหน้าเข้าสู่ระบบ/i })
            await expect(loginLink).toBeVisible()

            await loginLink.click()
            await expect(page).toHaveURL('/login')
        })

        test('should submit forgot password request', async ({ page }) => {
            await page.goto('/forgot-password')

            await page.getByPlaceholder('example@email.com').fill('test@example.com')
            await page.getByRole('button', { name: /ส่งลิงก์รีเซ็ต/i }).click()

            // Should show success message
            await expect(page.getByText(/ส่งอีเมลแล้ว|หากอีเมลถูกต้อง/i)).toBeVisible({ timeout: 10000 })
        })

        test('should validate email format', async ({ page }) => {
            await page.goto('/forgot-password')

            // Empty email
            const submitButton = page.getByRole('button', { name: /ส่งลิงก์รีเซ็ต/i })
            await submitButton.click()

            // HTML5 validation should prevent submission
            const emailInput = page.getByPlaceholder('example@email.com')
            await expect(emailInput).toBeFocused()
        })
    })

    test.describe('Reset Password Page', () => {
        test('should show invalid token error without token', async ({ page }) => {
            await page.goto('/reset-password')

            await expect(page.getByText(/ลิงก์ไม่ถูกต้อง|หมดอายุ/i)).toBeVisible({ timeout: 10000 })
        })

        test('should show invalid token error with invalid token', async ({ page }) => {
            await page.goto('/reset-password?token=invalid-token')

            await expect(page.getByText(/ลิงก์ไม่ถูกต้อง|หมดอายุ/i)).toBeVisible({ timeout: 10000 })
        })

        test('should have link to request new token', async ({ page }) => {
            await page.goto('/reset-password')

            await page.waitForLoadState('networkidle')

            const newLinkButton = page.getByRole('link', { name: /ขอลิงก์รีเซ็ตรหัสผ่านใหม่/i })
            // Wait for page to load and show error state
            await expect(newLinkButton).toBeVisible({ timeout: 10000 })
        })
    })

    test.describe('Login Page Links', () => {
        test('should have forgot password link', async ({ page }) => {
            await page.goto('/login')

            const forgotLink = page.getByRole('link', { name: /ลืมรหัสผ่าน/i })
            await expect(forgotLink).toBeVisible()

            await forgotLink.click()
            await expect(page).toHaveURL('/forgot-password')
        })
    })
})

import { Page, BrowserContext } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const STORAGE_STATE_DIR = '.playwright'

export const TEST_USERS = {
    resident: {
        email: 'resident@test.com',
        password: 'TestPass123!',
        dashboardUrl: '/resident',
    },
    admin: {
        email: 'admin@test.com',
        password: 'TestPass123!',
        dashboardUrl: '/admin',
    },
    security: {
        email: 'security@test.com',
        password: 'TestPass123!',
        dashboardUrl: '/security',
    },
    maintenance: {
        email: 'maintenance@test.com',
        password: 'TestPass123!',
        dashboardUrl: '/maintenance',
    },
    superadmin: {
        email: 'superadmin@test.com',
        password: 'TestPass123!',
        dashboardUrl: '/super-admin',
    },
}

export type UserType = keyof typeof TEST_USERS

/**
 * Get storage state path for a user type
 */
export function getStorageStatePath(userType: UserType): string {
    return path.join(process.cwd(), STORAGE_STATE_DIR, `${userType}.json`)
}

/**
 * Check if auth state exists for a user type
 */
export function hasAuthState(userType: UserType): boolean {
    const storagePath = getStorageStatePath(userType)
    return fs.existsSync(storagePath)
}

/**
 * Load auth state into a context
 */
export async function loadAuthState(context: BrowserContext, userType: UserType): Promise<boolean> {
    const storagePath = getStorageStatePath(userType)

    if (!fs.existsSync(storagePath)) {
        console.log(`[Auth] No stored auth for ${userType}`)
        return false
    }

    try {
        const storageState = JSON.parse(fs.readFileSync(storagePath, 'utf-8'))

        // Add cookies to context
        if (storageState.cookies && storageState.cookies.length > 0) {
            await context.addCookies(storageState.cookies)
            console.log(`[Auth] Loaded ${storageState.cookies.length} cookies for ${userType}`)
            return true
        }

        return false
    } catch (error) {
        console.log(`[Auth] Failed to load auth for ${userType}:`, error)
        return false
    }
}

/**
 * Login using stored auth state if available, otherwise login manually
 */
export async function login(page: Page, userType: UserType): Promise<boolean> {
    const user = TEST_USERS[userType]

    console.log(`[E2E] Logging in as ${userType} (${user.email})`)

    // Try using stored auth first
    if (hasAuthState(userType)) {
        const loaded = await loadAuthState(page.context(), userType)
        if (loaded) {
            // Navigate to dashboard to test if auth works
            await page.goto(user.dashboardUrl, { waitUntil: 'networkidle', timeout: 30000 })

            // Check if we're on the dashboard (not redirected to login)
            const currentUrl = page.url()
            if (!currentUrl.includes('/login')) {
                console.log(`[E2E] ✅ Auth restored from storage -> ${currentUrl}`)
                return true
            }
        }
    }

    // Fallback to manual login
    console.log(`[E2E] Manual login for ${userType}`)
    return await manualLogin(page, userType)
}

/**
 * Perform manual login via form with proper waits
 */
async function manualLogin(page: Page, userType: UserType): Promise<boolean> {
    const user = TEST_USERS[userType]

    try {
        // Step 1: Navigate to login page and wait for full load
        console.log(`[E2E] Step 1: Navigating to login page`)
        await page.goto('/login', { waitUntil: 'load', timeout: 30000 })

        // Step 2: Wait for React hydration - form must be interactive
        console.log(`[E2E] Step 2: Waiting for form hydration`)
        const emailInput = page.locator('input[name="email"]')
        await emailInput.waitFor({ state: 'visible', timeout: 20000 })

        // Wait a bit for hydration to complete
        await page.waitForTimeout(2000)

        // Step 3: Fill email - clear first, then type slowly to ensure React picks it up
        console.log(`[E2E] Step 3: Filling email`)
        await emailInput.click()
        await emailInput.fill('')
        await emailInput.pressSequentially(user.email, { delay: 100 })

        // Step 4: Fill password
        console.log(`[E2E] Step 4: Filling password`)
        const passwordInput = page.locator('input[name="password"]')
        await passwordInput.click()
        await passwordInput.fill('')
        await passwordInput.pressSequentially(user.password, { delay: 100 })

        // Step 5: Submit form and wait for response
        console.log(`[E2E] Step 5: Submitting form`)
        const submitButton = page.locator('button[type="submit"]')

        // Click and wait for navigation or network response
        await Promise.all([
            submitButton.click(),
            // Wait for the signIn API call to complete
            page.waitForResponse(
                (response) => response.url().includes('/api/auth/callback/credentials'),
                { timeout: 20000 }
            ).catch(() => null),
        ])

        // Step 6: Wait for toast or error message
        console.log(`[E2E] Step 6: Waiting for result`)

        // Try to detect success toast
        const successToastPromise = page.waitForSelector('text=เข้าสู่ระบบสำเร็จ', { timeout: 10000 })
            .then(() => 'success')
            .catch(() => null)

        // Try to detect error toast
        const errorToastPromise = page.waitForSelector('text=อีเมลหรือรหัสผ่านไม่ถูกต้อง', { timeout: 10000 })
            .then(() => 'error')
            .catch(() => null)

        const toastResult = await Promise.race([successToastPromise, errorToastPromise])

        if (toastResult === 'error') {
            console.log(`[E2E] ❌ Login failed: Invalid credentials toast appeared`)
            return false
        }

        // Step 7: Wait for window.location.href redirect
        console.log(`[E2E] Step 7: Waiting for redirect`)

        try {
            // Wait for navigation to root or dashboard
            await page.waitForURL((url) => {
                const pathname = url.pathname
                return pathname === '/' ||
                    pathname.startsWith('/resident') ||
                    pathname.startsWith('/admin') ||
                    pathname.startsWith('/security') ||
                    pathname.startsWith('/maintenance') ||
                    pathname.startsWith('/super-admin')
            }, { timeout: 20000 })
        } catch (e) {
            console.log(`[E2E] Redirect wait timed out, checking current URL: ${page.url()}`)
        }

        // Step 8: Verify we're on a dashboard
        await page.waitForLoadState('load', { timeout: 20000 })

        const finalUrl = page.url()
        console.log(`[E2E] Step 8: Final URL = ${finalUrl}`)

        if (finalUrl.includes('/login')) {
            console.log(`[E2E] ⚠️ Still on login page after all steps`)
            return false
        }

        console.log(`[E2E] ✅ Login successful -> ${finalUrl}`)
        return true

    } catch (error) {
        console.log(`[E2E] ❌ Login failed:`, (error as Error).message)
        return false
    }
}

/**
 * Logout current user
 */
export async function logout(page: Page): Promise<void> {
    try {
        // Navigate to signout endpoint
        await page.goto('/api/auth/signout', { waitUntil: 'networkidle', timeout: 10000 })

        // If there's a confirmation button, click it
        const confirmButton = page.locator('button:has-text("Sign out")')
        if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await confirmButton.click()
            await page.waitForURL('/login', { timeout: 10000 })
        }

        console.log(`[E2E] Logged out successfully`)
    } catch (error) {
        console.log(`[E2E] Logout error (navigating to login):`, (error as Error).message)
        // Force navigate to login
        await page.goto('/login', { waitUntil: 'networkidle', timeout: 10000 })
    }
}

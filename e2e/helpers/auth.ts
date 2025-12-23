import { Page } from '@playwright/test'

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
        dashboardUrl: '/maintenance',  // Maintenance staff have their own dashboard
    },
}

export async function login(page: Page, userType: keyof typeof TEST_USERS) {
    const user = TEST_USERS[userType]

    console.log(`[E2E] Logging in as ${userType} (${user.email})`)

    // Navigate to login page
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 })

    // Wait for network idle to ensure hydration might be ready
    await page.waitForLoadState('networkidle')
    console.log(`[E2E] Login page loaded`)

    // Wait for login form to be ready
    await page.waitForSelector('input[name="email"]', { state: 'visible', timeout: 10000 })

    // Fill login form
    await page.fill('input[name="email"]', user.email)
    await page.fill('input[name="password"]', user.password)
    console.log(`[E2E] Form filled with credentials`)

    // Wait for button to be enabled and visible
    const loginButton = page.locator('button[type="submit"]').first()
    await loginButton.waitFor({ state: 'visible', timeout: 5000 })

    // Click the login button
    await loginButton.click()
    console.log(`[E2E] Login button clicked`)

    // Wait for success toast (optional - may not always appear)
    try {
        await page.waitForSelector('text=เข้าสู่ระบบสำเร็จ', { timeout: 5000 })
        console.log(`[E2E] Success toast appeared`)
    } catch (e) {
        console.log(`[E2E] No success toast (continuing...)`)
    }

    // Wait for navigation to complete - could be '/' first then redirected to dashboard
    console.log(`[E2E] Waiting for redirect to dashboard...`)

    // Wait for URL to change away from login page
    await page.waitForURL((url) => {
        const pathname = url.pathname
        console.log(`[E2E] Current URL: ${pathname}`)

        // Check if we're NOT on login page anymore
        const notOnLoginPage = pathname !== '/' && pathname !== '/login' && pathname !== '/register'

        if (notOnLoginPage) {
            console.log(`[E2E] Redirected away from login to: ${pathname}`)
        }

        return notOnLoginPage
    }, { timeout: 60000, waitUntil: 'domcontentloaded' })

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    console.log(`[E2E] Login complete - now at ${page.url()}`)
}

export async function logout(page: Page) {
    // Click user menu button (look for button with user name)
    const userButton = page.locator('button:has-text("Test")')
    await userButton.click({ timeout: 10000 })

    // Wait a bit for menu to appear
    await page.waitForTimeout(500)

    // Click logout option
    await page.click('text=ออกจากระบบ', { timeout: 10000 })

    // Wait for redirect to login page
    await page.waitForURL('/', { timeout: 10000 })
}

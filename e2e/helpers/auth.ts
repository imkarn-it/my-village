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
        dashboardUrl: '/resident',  // Maintenance staff use resident dashboard
    },
}

export async function login(page: Page, userType: keyof typeof TEST_USERS) {
    const user = TEST_USERS[userType]

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Fill login form
    await page.fill('input[name="email"]', user.email)
    await page.fill('input[name="password"]', user.password)

    // Click submit and wait for redirect to dashboard
    await page.click('button[type="submit"]')

    // Wait for redirect to role-specific dashboard
    await page.waitForURL(new RegExp(user.dashboardUrl), { timeout: 15000 })
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

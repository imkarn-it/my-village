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
    await page.fill('input[name="email"]', user.email)
    await page.fill('input[name="password"]', user.password)
    await page.click('button[type="submit"]')

    // Wait for navigation to role-specific dashboard
    await page.waitForURL(new RegExp(user.dashboardUrl), { timeout: 15000 })
}

export async function logout(page: Page) {
    await page.click('[data-testid="user-menu-button"]')
    await page.click('text=ออกจากระบบ')
    await page.waitForURL('/')
}

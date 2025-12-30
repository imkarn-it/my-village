/**
 * Global Setup for Playwright E2E Tests
 * 
 * This file runs ONCE before all tests to:
 * 1. Authenticate test users
 * 2. Save session states for reuse
 */

import { chromium, FullConfig } from '@playwright/test'
import { TEST_USERS } from './helpers/auth'
import * as fs from 'fs'
import * as path from 'path'

const STORAGE_STATE_DIR = '.playwright'

async function globalSetup(config: FullConfig) {
    console.log('\n🔐 Global Setup: Authenticating test users...\n')

    // Create storage state directory
    const storageDir = path.join(process.cwd(), STORAGE_STATE_DIR)
    if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true })
    }

    const browser = await chromium.launch()

    // Authenticate each user type and save their session
    for (const [userType, userData] of Object.entries(TEST_USERS)) {
        console.log(`   Authenticating ${userType}...`)

        const context = await browser.newContext()
        const page = await context.newPage()

        try {
            // Navigate to login page
            await page.goto('http://localhost:3000/login', {
                waitUntil: 'networkidle',
                timeout: 30000
            })

            // Wait for form to be ready
            await page.waitForSelector('input[name="email"]', {
                state: 'visible',
                timeout: 10000
            })

            // Fill login form
            await page.fill('input[name="email"]', userData.email)
            await page.fill('input[name="password"]', userData.password)

            // Click submit button
            await page.click('button[type="submit"]')

            // Wait for navigation away from login page
            try {
                await page.waitForURL((url) => {
                    const pathname = url.pathname
                    return pathname !== '/login' && pathname !== '/'
                }, { timeout: 15000 })

                console.log(`   ✅ ${userType} authenticated -> ${page.url()}`)

                // Save storage state
                const storagePath = path.join(storageDir, `${userType}.json`)
                await context.storageState({ path: storagePath })

            } catch (e) {
                // Check if still on login page (credentials might be wrong)
                const currentUrl = page.url()
                if (currentUrl.includes('/login') || currentUrl === 'http://localhost:3000/') {
                    console.log(`   ⚠️ ${userType} login failed - check credentials in database`)
                } else {
                    console.log(`   ⚠️ ${userType} unexpected URL: ${currentUrl}`)
                }
            }

        } catch (error) {
            console.log(`   ❌ ${userType} error:`, (error as Error).message)
        }

        await context.close()
    }

    await browser.close()

    console.log('\n✅ Global Setup Complete\n')
}

export default globalSetup

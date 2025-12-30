/**
 * Debug script to verify test user credentials work
 */
import { db } from '../lib/db'
import { users } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

const TEST_PASSWORD = 'TestPass123!'

async function debugAuth() {
    console.log('🔍 Debugging Test User Authentication...\n')

    const testEmails = [
        'resident@test.com',
        'admin@test.com',
        'security@test.com',
        'maintenance@test.com',
        'superadmin@test.com',
    ]

    for (const email of testEmails) {
        console.log(`Testing: ${email}`)

        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
            columns: {
                id: true,
                email: true,
                name: true,
                password: true,
                role: true,
                isActive: true,
            },
        })

        if (!user) {
            console.log(`   ❌ User not found in database`)
            continue
        }

        console.log(`   ✅ User found: ${user.name} (${user.role})`)
        console.log(`   📋 isActive: ${user.isActive}`)

        if (!user.password) {
            console.log(`   ❌ No password hash stored`)
            continue
        }

        console.log(`   🔑 Password hash exists (length: ${user.password.length})`)

        // Try to verify password
        const isValid = await bcrypt.compare(TEST_PASSWORD, user.password)

        if (isValid) {
            console.log(`   ✅ Password verification: PASSED`)
        } else {
            console.log(`   ❌ Password verification: FAILED`)

            // Try rehashing to see expected hash
            const newHash = await bcrypt.hash(TEST_PASSWORD, 12)
            console.log(`   📝 Expected hash pattern: ${newHash.substring(0, 20)}...`)
            console.log(`   📝 Stored hash pattern: ${user.password.substring(0, 20)}...`)
        }

        console.log()
    }

    process.exit(0)
}

debugAuth()

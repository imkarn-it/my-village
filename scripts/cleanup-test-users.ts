/**
 * E2E Test User Cleanup Script
 * 
 * รันด้วย: bun run scripts/cleanup-test-users.ts
 * 
 * ลบ test users และ test data
 */

import { db } from '../lib/db'
import { users, projects, units } from '../lib/db/schema'
import { eq, like } from 'drizzle-orm'

async function cleanupTestUsers() {
    console.log('🧹 Starting E2E test user cleanup...\n')

    try {
        // 1. Delete test users
        console.log('👥 Deleting test users...')
        const deletedUsers = await db.delete(users)
            .where(like(users.email, '%@test.com'))
            .returning()
        console.log(`   ✅ Deleted ${deletedUsers.length} test users`)

        // 2. Delete test unit
        console.log('\n🏠 Deleting test unit...')
        const deletedUnits = await db.delete(units)
            .where(eq(units.unitNumber, 'A-101'))
            .returning()
        console.log(`   ✅ Deleted ${deletedUnits.length} test units`)

        // 3. Delete test project
        console.log('\n📁 Deleting test project...')
        const deletedProjects = await db.delete(projects)
            .where(eq(projects.name, 'Test Village'))
            .returning()
        console.log(`   ✅ Deleted ${deletedProjects.length} test projects`)

        console.log('\n✨ Cleanup complete!')

    } catch (error) {
        console.error('\n❌ Cleanup failed:', error)
        process.exit(1)
    }

    process.exit(0)
}

// Run cleanup
cleanupTestUsers()

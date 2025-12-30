/**
 * E2E Test User Seeding Script
 * 
 * รันด้วย: bun run scripts/seed-test-users.ts
 * 
 * สร้าง test users สำหรับ E2E tests:
 * - resident@test.com (resident)
 * - admin@test.com (admin)
 * - security@test.com (security)
 * - maintenance@test.com (maintenance)
 */

import { db } from '../lib/db'
import { users, projects, units } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import { hash } from 'bcryptjs'

const TEST_PASSWORD = 'TestPass123!'

const TEST_USERS = [
    {
        email: 'resident@test.com',
        name: 'Test Resident',
        role: 'resident',
        phone: '0891234567',
    },
    {
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin',
        phone: '0891234568',
    },
    {
        email: 'security@test.com',
        name: 'Test Security',
        role: 'security',
        phone: '0891234569',
    },
    {
        email: 'maintenance@test.com',
        name: 'Test Maintenance',
        role: 'maintenance',
        phone: '0891234570',
    },
    {
        email: 'superadmin@test.com',
        name: 'Test Super Admin',
        role: 'super_admin',
        phone: '0891234571',
    },
]

async function seedTestUsers() {
    console.log('🌱 Starting E2E test user seeding...\n')

    try {
        // 1. Create or get test project
        console.log('📁 Creating test project...')
        let testProject = await db.query.projects.findFirst({
            where: eq(projects.name, 'Test Village'),
        })

        if (!testProject) {
            const [newProject] = await db.insert(projects).values({
                name: 'Test Village',
                address: '123 Test Street, Bangkok',
                type: 'village',
                settings: {},
            }).returning()
            testProject = newProject
            console.log('   ✅ Created: Test Village')
        } else {
            console.log('   ⏭️ Already exists: Test Village')
        }

        // 2. Create or get test unit
        console.log('\n🏠 Creating test unit...')
        let testUnit = await db.query.units.findFirst({
            where: eq(units.unitNumber, 'A-101'),
        })

        if (!testUnit) {
            const [newUnit] = await db.insert(units).values({
                projectId: testProject.id,
                unitNumber: 'A-101',
                building: 'A',
                floor: 1,
                size: '150',
            }).returning()
            testUnit = newUnit
            console.log('   ✅ Created: Unit A-101')
        } else {
            console.log('   ⏭️ Already exists: Unit A-101')
        }

        // 3. Hash password once
        console.log('\n🔐 Hashing password...')
        const hashedPassword = await hash(TEST_PASSWORD, 12)
        console.log('   ✅ Password hashed')

        // 4. Create test users
        console.log('\n👥 Creating test users...')

        for (const userData of TEST_USERS) {
            const existingUser = await db.query.users.findFirst({
                where: eq(users.email, userData.email),
            })

            if (!existingUser) {
                await db.insert(users).values({
                    email: userData.email,
                    name: userData.name,
                    role: userData.role,
                    phone: userData.phone,
                    password: hashedPassword,
                    projectId: testProject.id,
                    unitId: userData.role === 'resident' ? testUnit.id : null,
                    isActive: true,
                })
                console.log(`   ✅ Created: ${userData.email} (${userData.role})`)
            } else {
                // Update password in case it changed
                await db.update(users)
                    .set({ password: hashedPassword, isActive: true })
                    .where(eq(users.email, userData.email))
                console.log(`   ⏭️ Updated: ${userData.email} (${userData.role})`)
            }
        }

        console.log('\n✨ Seeding complete!')
        console.log('\n📋 Test Credentials:')
        console.log('   Email: <role>@test.com')
        console.log('   Password: TestPass123!')
        console.log('\n   Available roles: resident, admin, security, maintenance, superadmin')

    } catch (error) {
        console.error('\n❌ Seeding failed:', error)
        process.exit(1)
    }

    process.exit(0)
}

// Run seeding
seedTestUsers()

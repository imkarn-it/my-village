/**
 * Setup script to create test users for E2E tests
 * Run this before running E2E tests: npm run test:e2e:setup
 */

import { db } from '../lib/db'
import { users, units, projects } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import * as bcrypt from 'bcryptjs'

const TEST_USERS = [
    {
        email: 'resident@test.com',
        password: 'TestPass123!',
        name: 'Test Resident',
        role: 'resident' as const,
    },
    {
        email: 'admin@test.com',
        password: 'TestPass123!',
        name: 'Test Admin',
        role: 'admin' as const,
    },
    {
        email: 'security@test.com',
        password: 'TestPass123!',
        name: 'Test Security',
        role: 'security' as const,
    },
    {
        email: 'maintenance@test.com',
        password: 'TestPass123!',
        name: 'Test Maintenance',
        role: 'maintenance' as const,
    },
]

async function setupTestData() {
    console.log('🚀 Setting up test data...')

    try {
        // 1. Create or get test project
        console.log('📦 Creating test project...')
        let project = await db.query.projects.findFirst({
            where: eq(projects.name, 'Test Village'),
        })

        if (!project) {
            const [newProject] = await db.insert(projects).values({
                name: 'Test Village',
                address: '123 Test Street',
                type: 'village',
            }).returning()
            project = newProject
        }

        console.log(`✅ Project: ${project!.name} (${project!.id})`)

        // 2. Create test units
        console.log('🏠 Creating test units...')
        const testUnits = []
        for (let i = 1; i <= 5; i++) {
            const existingUnit = await db.query.units.findFirst({
                where: eq(units.unitNumber, `A${i}`),
            })

            if (!existingUnit) {
                const [unit] = await db.insert(units).values({
                    projectId: project!.id,
                    unitNumber: `A${i}`,
                    building: 'A',
                    floor: Math.floor((i - 1) / 5) + 1,
                    size: '100',
                }).returning()
                testUnits.push(unit)
            } else {
                testUnits.push(existingUnit)
            }
        }

        console.log(`✅ Created ${testUnits.length} test units`)

        // 3. Create test users
        console.log('👥 Creating test users...')
        for (const userData of TEST_USERS) {
            // Check if user exists
            const existingUser = await db.query.users.findFirst({
                where: eq(users.email, userData.email),
            })

            if (existingUser) {
                console.log(`⏭️  User ${userData.email} already exists`)

                // Update password to ensure it matches
                const hashedPassword = await bcrypt.hash(userData.password, 10)
                await db.update(users)
                    .set({ password: hashedPassword })
                    .where(eq(users.id, existingUser.id))

                console.log(`✅ Updated password for ${userData.email}`)
            } else {
                // Create new user
                const hashedPassword = await bcrypt.hash(userData.password, 10)

                const [newUser] = await db.insert(users).values({
                    email: userData.email,
                    password: hashedPassword,
                    name: userData.name,
                    role: userData.role,
                    projectId: project!.id,
                    unitId: userData.role === 'resident' ? testUnits[0]?.id : null,
                }).returning()

                console.log(`✅ Created user: ${newUser.email} (${newUser.role})`)
            }
        }

        console.log('\n✨ Test data setup complete!')
        console.log('\nTest Users:')
        TEST_USERS.forEach(user => {
            console.log(`  - ${user.email} / ${user.password} (${user.role})`)
        })

    } catch (error) {
        console.error('❌ Error setting up test data:', error)
        throw error
    }
}

// Run if called directly
if (require.main === module) {
    setupTestData()
        .then(() => {
            console.log('\n✅ Done!')
            process.exit(0)
        })
        .catch((error) => {
            console.error('\n❌ Failed:', error)
            process.exit(1)
        })
}

export { setupTestData }

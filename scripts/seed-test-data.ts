/**
 * Comprehensive Seed Data Script
 * Creates 2 projects with all roles and related data for testing.
 */

import { db } from '../lib/db'
import {
  users, units, projects, announcements, facilities,
  bills, maintenanceRequests, parcels, visitors,
  paymentSettings, guardCheckpoints
} from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import * as bcrypt from 'bcryptjs'
import { ROLES, STATUS, PRIORITY, BILL_TYPES, MAINTENANCE_CATEGORIES } from '../lib/constants'

const PASSWORD = 'TestPass123!'

async function seed() {
  console.log('🚀 Starting comprehensive database seeding...')
  const hashedPassword = await bcrypt.hash(PASSWORD, 10)

  try {
    // 1. Create Projects
    console.log('📦 Creating projects...')
    const projectData = [
      {
        name: 'Green Village',
        address: '123 Nature Road, Bangkok',
        type: 'village',
      },
      {
        name: 'Blue Sky Condo',
        address: '456 City Center, Bangkok',
        type: 'condo',
      }
    ]

    const createdProjects = []
    for (const p of projectData) {
      let project = await db.query.projects.findFirst({
        where: eq(projects.name, p.name),
      })
      if (!project) {
        const [newProject] = await db.insert(projects).values(p).returning()
        project = newProject
      }
      createdProjects.push(project)
    }

    // 2. Create Units for each project
    console.log('🏠 Creating units...')
    const projectUnits: Record<string, any[]> = {}
    for (const project of createdProjects) {
      const unitsInProject = []
      const unitPrefix = project.type === 'village' ? 'V' : 'C'
      for (let i = 1; i <= 5; i++) {
        const unitNumber = `${unitPrefix}${100 + i}`
        let unit = await db.query.units.findFirst({
          where: eq(units.unitNumber, unitNumber),
        })
        if (!unit) {
          const [newUnit] = await db.insert(units).values({
            projectId: project.id,
            unitNumber,
            building: project.type === 'condo' ? 'A' : undefined,
            floor: project.type === 'condo' ? 1 : undefined,
            size: '120.50',
          }).returning()
          unit = newUnit
        }
        unitsInProject.push(unit)
      }
      projectUnits[project.id] = unitsInProject
    }

    // 3. Create Users for all roles in both projects
    console.log('👥 Creating users for all roles...')
    for (const project of createdProjects) {
      const projectNameSlug = project.name.toLowerCase().replace(' ', '-')
      const projectUsers = [
        {
          email: `admin@${projectNameSlug}.com`,
          name: `${project.name} Admin`,
          role: ROLES.ADMIN,
          projectId: project.id,
        },
        {
          email: `security@${projectNameSlug}.com`,
          name: `${project.name} Security`,
          role: ROLES.SECURITY,
          projectId: project.id,
        },
        {
          email: `maintenance@${projectNameSlug}.com`,
          name: `${project.name} Maintenance`,
          role: ROLES.MAINTENANCE,
          projectId: project.id,
        },
        {
          email: `resident1@${projectNameSlug}.com`,
          name: `${project.name} Resident 1`,
          role: ROLES.RESIDENT,
          projectId: project.id,
          unitId: projectUnits[project.id][0].id,
        },
        {
          email: `resident2@${projectNameSlug}.com`,
          name: `${project.name} Resident 2`,
          role: ROLES.RESIDENT,
          projectId: project.id,
          unitId: projectUnits[project.id][1].id,
        }
      ]

      for (const u of projectUsers) {
        const existing = await db.query.users.findFirst({
          where: eq(users.email, u.email),
        })
        if (!existing) {
          await db.insert(users).values({
            ...u,
            password: hashedPassword,
          })
        } else {
          await db.update(users).set({ password: hashedPassword }).where(eq(users.id, existing.id))
        }
      }
    }

    // Create Super Admin
    const superAdminEmail = 'superadmin@village.com'
    const existingSuper = await db.query.users.findFirst({
      where: eq(users.email, superAdminEmail),
    })
    if (!existingSuper) {
      await db.insert(users).values({
        email: superAdminEmail,
        name: 'Global Super Admin',
        role: ROLES.SUPER_ADMIN,
        password: hashedPassword,
      })
    }

    // 4. Create Mock Data for the first project (Green Village)
    const greenProject = createdProjects[0]
    const greenAdmin = await db.query.users.findFirst({ where: eq(users.email, 'admin@green-village.com') })
    const greenResident = await db.query.users.findFirst({ where: eq(users.email, 'resident1@green-village.com') })

    if (greenAdmin && greenResident) {
      console.log('📝 Creating mock data for Green Village...')

      // Announcements
      await db.insert(announcements).values([
        {
          projectId: greenProject.id,
          title: 'Welcome to Green Village',
          content: 'We are happy to have you here!',
          createdBy: greenAdmin.id,
          isPinned: true,
        },
        {
          projectId: greenProject.id,
          title: 'Monthly Meeting',
          content: 'Join us for the monthly meeting this Saturday at 10 AM.',
          createdBy: greenAdmin.id,
        }
      ])

      // Facilities
      const [gym] = await db.insert(facilities).values({
        projectId: greenProject.id,
        name: 'Village Gym',
        description: 'Open 24/7 for all residents.',
        openTime: '00:00:00',
        closeTime: '23:59:59',
        maxCapacity: 10,
      }).returning()

      // Bills
      await db.insert(bills).values([
        {
          unitId: greenResident.unitId!,
          billType: BILL_TYPES.COMMON_FEE,
          amount: '2500.00',
          dueDate: '2025-12-31',
          status: STATUS.PENDING,
        },
        {
          unitId: greenResident.unitId!,
          billType: BILL_TYPES.WATER,
          amount: '450.00',
          dueDate: '2025-12-25',
          status: STATUS.PENDING,
        }
      ])

      // Maintenance Request
      await db.insert(maintenanceRequests).values({
        unitId: greenResident.unitId!,
        title: 'Leaking Pipe',
        description: 'The pipe under the kitchen sink is leaking.',
        category: MAINTENANCE_CATEGORIES.PLUMBING,
        priority: PRIORITY.HIGH,
        status: STATUS.PENDING,
        createdBy: greenResident.id,
      })

      // Parcels
      await db.insert(parcels).values({
        unitId: greenResident.unitId!,
        trackingNumber: 'KERRY12345678',
        courier: 'Kerry',
        receivedBy: greenAdmin.id,
      })

      // Visitors
      await db.insert(visitors).values({
        unitId: greenResident.unitId!,
        visitorName: 'John Doe',
        purpose: 'Visiting friend',
        status: STATUS.PENDING,
      })

      // Payment Settings
      await db.insert(paymentSettings).values({
        projectId: greenProject.id,
        paymentMethod: 'self_qr',
        promptpayId: '0812345678',
        accountName: 'Green Village Management',
        bankName: 'Kasikorn Bank',
      })

      // Guard Checkpoints
      await db.insert(guardCheckpoints).values([
        {
          projectId: greenProject.id,
          name: 'Main Gate',
          location: 'Front Entrance',
        },
        {
          projectId: greenProject.id,
          name: 'Clubhouse',
          location: 'Center of Village',
        }
      ])
    }

    console.log('\n✨ Seeding completed successfully!')
    console.log('\nLogin Credentials (Password: ' + PASSWORD + '):')
    console.log('--------------------------------------------------')
    console.log('Super Admin: superadmin@village.com')
    console.log('Green Village:')
    console.log('  - Admin: admin@green-village.com')
    console.log('  - Security: security@green-village.com')
    console.log('  - Maintenance: maintenance@green-village.com')
    console.log('  - Resident: resident1@green-village.com')
    console.log('Blue Sky Condo:')
    console.log('  - Admin: admin@blue-sky-condo.com')
    console.log('  - Resident: resident1@blue-sky-condo.com')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
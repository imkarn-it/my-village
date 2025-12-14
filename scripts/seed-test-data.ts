/**
 * Seed test data for development and testing
 */

import { db } from '../lib/db'
import {
  users,
  projects,
  units,
  facilities,
  bookings,
  announcements,
  maintenanceRequests,
  supportTickets,
  parcels,
  visitors
} from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

async function seedTestData() {
  console.log('🌱 Seeding test data...')

  try {
    // Create test project
    const [project] = await db.insert(projects).values({
      name: 'Test Village Condo',
      address: '123 Test Street, Bangkok',
    }).onConflictDoUpdate({
      target: projects.name,
      set: {
        address: '123 Test Street, Bangkok',
      },
    }).returning()

    console.log(`✅ Created project: ${project.name}`)

    // Create test users
    const testUsers = [
      {
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin',
        projectId: project.id,
      },
      {
        email: 'resident@test.com',
        name: 'Test Resident',
        role: 'resident',
        projectId: project.id,
      },
      {
        email: 'security@test.com',
        name: 'Test Security',
        role: 'security',
        projectId: project.id,
      },
      {
        email: 'maintenance@test.com',
        name: 'Test Maintenance',
        role: 'maintenance',
        projectId: project.id,
      },
    ]

    for (const userData of testUsers) {
      const hashedPassword = await hashPassword('TestPass123!')

      await db.insert(users).values({
        ...userData,
        password: hashedPassword,
      }).onConflictDoUpdate({
        target: users.email,
        set: {
          name: userData.name,
          password: hashedPassword,
        },
      })

      console.log(`✅ Created user: ${userData.email}`)
    }

    // Get the resident and admin users for creating test data
    const [resident] = await db.select()
      .from(users)
      .where(eq(users.email, 'resident@test.com'))

    const [admin] = await db.select()
      .from(users)
      .where(eq(users.email, 'admin@test.com'))

    // Create test units
    const [unit] = await db.insert(units).values({
      projectId: project.id,
      unitNumber: 'A-101',
      size: '35',
      building: 'A',
      floor: 1,
    }).onConflictDoUpdate({
      target: units.unitNumber,
      set: {
        size: '35',
      },
    }).returning()

    console.log(`✅ Created unit: ${unit.unitNumber}`)

    // Create test facilities
    const [facility] = await db.insert(facilities).values({
      projectId: project.id,
      name: 'สระว่ายน้ำ',
      description: 'สระว่ายน้ำขนาด 25 เมตร',
      maxCapacity: 20,
      openTime: '06:00',
      closeTime: '22:00',
      requiresApproval: false,
      isActive: true,
    }).onConflictDoUpdate({
      target: [facilities.projectId, facilities.name],
      set: {
        description: 'สระว่ายน้ำขนาด 25 เมตร',
        maxCapacity: 20,
      },
    }).returning()

    console.log(`✅ Created facility: ${facility.name}`)

    // Create test bookings
    await db.insert(bookings).values({
      userId: resident.id,
      facilityId: facility.id,
      unitId: unit.id,
      bookingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow as YYYY-MM-DD
      startTime: '10:00',
      endTime: '11:00',
      status: 'approved',
    }).onConflictDoNothing()

    console.log('✅ Created test booking')

    // Create test announcements
    await db.insert(announcements).values({
      title: 'ทดสอบประกาศ',
      content: 'นี่คือประกาศทดสอบสำหรับระบบ',
      projectId: project.id,
      isPinned: false,
    }).onConflictDoNothing()

    console.log('✅ Created test announcement')

    // Create test maintenance requests
    await db.insert(maintenanceRequests).values({
      createdBy: resident.id,
      unitId: unit.id,
      title: 'ทดสอบแจ้งซ่อม',
      description: 'แอร์ไม่เย็น',
      category: 'air_conditioning',
      priority: 'normal',
      status: 'pending',
    }).onConflictDoNothing()

    console.log('✅ Created test maintenance request')

    // Create test support tickets
    await db.insert(supportTickets).values({
      userId: resident.id,
      unitId: unit.id,
      subject: 'ทดสอบตั๋วสนับสนุน',
      message: 'มีข้อสงสัยเกี่ยวกับการจองสิ่งอำนวยความสะดวก',
      status: 'open',
    }).onConflictDoNothing()

    console.log('✅ Created test support ticket')

    // Create test parcel
    await db.insert(parcels).values({
      unitId: unit.id,
      trackingNumber: 'TH123456789',
      courier: ' Kerry Express',
      receivedBy: admin.id,
    }).onConflictDoNothing()

    console.log('✅ Created test parcel')

    // Create test visitor
    await db.insert(visitors).values({
      unitId: unit.id,
      visitorName: 'Test Visitor',
      purpose: 'เยี่ยมเพื่อน',
      status: 'approved',
      approvedBy: resident.id,
    }).onConflictDoNothing()

    console.log('✅ Created test visitor')

    console.log('\n🎉 Test data seeding completed successfully!')
    console.log('\nTest credentials:')
    console.log('Admin: admin@test.com / TestPass123!')
    console.log('Resident: resident@test.com / TestPass123!')
    console.log('Security: security@test.com / TestPass123!')
    console.log('Maintenance: maintenance@test.com / TestPass123!')

  } catch (error) {
    console.error('❌ Error seeding test data:', error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.main) {
  seedTestData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { seedTestData }
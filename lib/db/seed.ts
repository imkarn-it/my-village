import { db } from './index'
import {
    projects,
    units,
    users,
    announcements,
    visitors,
    parcels,
    bills,
    maintenanceRequests,
    facilities,
    bookings,
    guardCheckpoints,
    guardPatrols,
    sosAlerts,
} from './schema'
import { ROLES, STATUS, PRIORITY, BILL_TYPES, MAINTENANCE_CATEGORIES } from '../constants'

async function seed() {
    console.log('🌱 Seeding database...')

    try {
        // 1. Create Project
        const [project] = await db
            .insert(projects)
            .values({
                name: 'My Village Condo',
                address: '123 Sukhumvit Road, Bangkok',
                type: 'condo',
                settings: { theme: 'modern' },
            })
            .returning()

        console.log('✅ Project created:', project.name)

        // 2. Create Units
        const unitsData = [
            { unitNumber: 'A101', building: 'A', floor: 1, size: '35.00', projectId: project.id },
            { unitNumber: 'A102', building: 'A', floor: 1, size: '35.00', projectId: project.id },
            { unitNumber: 'B201', building: 'B', floor: 2, size: '45.00', projectId: project.id },
            { unitNumber: 'C301', building: 'C', floor: 3, size: '55.00', projectId: project.id },
        ]

        const createdUnits = await db.insert(units).values(unitsData).returning()
        console.log('✅ Units created:', createdUnits.length)

        // 3. Create Users
        const usersData = [
            // Residents
            {
                email: 'demo@myvillage.com',
                name: 'สมชาย ใจดี',
                role: ROLES.RESIDENT,
                projectId: project.id,
                unitId: createdUnits[0].id,
            },
            {
                email: 'resident2@example.com',
                name: 'สมหญิง รักสงบ',
                role: ROLES.RESIDENT,
                projectId: project.id,
                unitId: createdUnits[1].id,
            },
            // Admin
            {
                email: 'admin@myvillage.com',
                name: 'นิติบุคคล',
                role: ROLES.ADMIN,
                projectId: project.id,
            },
            // Security
            {
                email: 'security@myvillage.com',
                name: 'รปภ. สมศักดิ์',
                role: ROLES.SECURITY,
                projectId: project.id,
            },
        ]

        const createdUsers = await db.insert(users).values(usersData).returning()
        console.log('✅ Users created:', createdUsers.length)

        // 4. Create Announcements
        const adminUser = createdUsers.find((u) => u.role === ROLES.ADMIN)
        if (adminUser) {
            await db.insert(announcements).values([
                {
                    projectId: project.id,
                    title: 'แจ้งปิดปรับปรุงสระว่ายน้ำ',
                    content: 'สระว่ายน้ำจะปิดปรับปรุงในวันที่ 15-16 ธ.ค. นี้ ขออภัยในความไม่สะดวก',
                    isPinned: true,
                    createdBy: adminUser.id,
                },
                {
                    projectId: project.id,
                    title: 'กำหนดการประชุมใหญ่สามัญประจำปี',
                    content: 'ขอเชิญลูกบ้านทุกท่านเข้าร่วมประชุมในวันที่ 20 ม.ค. เวลา 09:00 น. ณ ห้องประชุมชั้น 1',
                    isPinned: false,
                    createdBy: adminUser.id,
                },
            ])
            console.log('✅ Announcements created')
        }

        // 5. Create Facilities
        const [facility] = await db
            .insert(facilities)
            .values({
                projectId: project.id,
                name: 'Fitness Center',
                description: 'ห้องออกกำลังกายพร้อมอุปกรณ์ครบครัน',
                openTime: '06:00:00',
                closeTime: '22:00:00',
                maxCapacity: 20,
            })
            .returning()
        console.log('✅ Facilities created')

        // 6. Create Mock Data for Resident Dashboard
        const residentUser = createdUsers.find((u) => u.email === 'demo@myvillage.com')
        if (residentUser && residentUser.unitId) {
            // Parcels
            await db.insert(parcels).values([
                {
                    unitId: residentUser.unitId,
                    courier: 'Kerry Express',
                    trackingNumber: 'KER123456789',
                    receivedBy: adminUser?.id,
                },
                {
                    unitId: residentUser.unitId,
                    courier: 'Flash Express',
                    trackingNumber: 'TH012345678',
                    receivedBy: adminUser?.id,
                },
            ])

            // Bills
            await db.insert(bills).values([
                {
                    unitId: residentUser.unitId,
                    billType: BILL_TYPES.COMMON_FEE,
                    amount: '1500.00',
                    dueDate: '2025-12-31',
                    status: STATUS.PENDING,
                },
                {
                    unitId: residentUser.unitId,
                    billType: BILL_TYPES.WATER,
                    amount: '350.00',
                    dueDate: '2025-12-25',
                    status: STATUS.PENDING,
                },
            ])

            // Maintenance Request
            await db.insert(maintenanceRequests).values({
                unitId: residentUser.unitId,
                category: MAINTENANCE_CATEGORIES.PLUMBING,
                title: 'ก๊อกน้ำรั่ว',
                description: 'ก๊อกน้ำในห้องน้ำรั่วซึมตลอดเวลา',
                priority: PRIORITY.NORMAL,
                createdBy: residentUser.id,
            })

            // Booking
            await db.insert(bookings).values({
                facilityId: facility.id,
                unitId: residentUser.unitId,
                userId: residentUser.id,
                bookingDate: '2025-12-20',
                startTime: '18:00:00',
                endTime: '19:00:00',
                status: STATUS.APPROVED,
            })
        }

        console.log('🎉 Seeding completed successfully!')
    } catch (error) {
        console.error('❌ Seeding failed:', error)
        process.exit(1)
    } finally {
        process.exit(0)
    }
}

seed()

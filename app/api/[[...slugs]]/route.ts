import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { db } from '@/lib/db'
import {
    users, announcements, units, parcels, visitors, projects, equipment,
    bills, maintenanceRequests, facilities, bookings, sosAlerts, supportTickets, supportTicketResponses, paymentSettings, notifications
} from '@/lib/db/schema'
import { eq, desc, and, sql, asc } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { NotificationService } from '@/lib/services'

const app = new Elysia({ prefix: '/api' })
    .use(cors())
    .use(swagger())

    // Auth endpoints
    .post('/auth/register', async ({ body }) => {
        const { email, password, name } = body

        // Check if user exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email)
        })

        if (existingUser) {
            return { success: false, error: 'Email already exists' }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const [user] = await db.insert(users).values({
            email,
            password: hashedPassword,
            name,
            role: 'resident', // Default role
            projectId: 'default-project',
        }).returning()

        return { success: true, data: { id: user.id, email: user.email, name: user.name } }
    }, {
        body: t.Object({
            email: t.String(),
            password: t.String(),
            name: t.String(),
        }),
        detail: { tags: ['auth'], summary: 'Register new user' }
    })

    // Projects endpoints
    .get('/projects', async ({ query }) => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
            return { success: false, error: 'Forbidden' }
        }

        const data = await db.query.projects.findMany({
            limit: query.limit ? parseInt(query.limit) : 50,
            orderBy: desc(projects.createdAt),
            with: {
                users: {
                    columns: {
                        id: true,
                        role: true,
                        name: true,
                        email: true,
                    }
                }
            }
        })

        return { success: true, data }
    }, {
        query: t.Object({
            limit: t.Optional(t.String())
        }),
        detail: { tags: ['projects'], summary: 'Get all projects' }
    })

    .post('/projects', async ({ body }) => {
        const session = await auth()
        if (!session?.user || session.user.role !== 'super_admin') {
            return { success: false, error: 'Forbidden - Super Admin access required' }
        }

        const [project] = await db.insert(projects).values({
            name: body.name,
            type: body.type,
            address: body.address,
            settings: {}, // Default settings
        }).returning()

        return { success: true, data: project }
    }, {
        body: t.Object({
            name: t.String(),
            type: t.Optional(t.String()),
            address: t.Optional(t.String()),
        }),
        detail: { tags: ['projects'], summary: 'Create new project' }
    })

    .get('/projects/:id', async ({ params }) => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
            return { success: false, error: 'Forbidden' }
        }

        const project = await db.query.projects.findFirst({
            where: eq(projects.id, params.id),
            with: {
                users: {
                    columns: {
                        id: true,
                        role: true,
                        name: true,
                        email: true,
                    }
                }
            }
        })

        if (!project) {
            return { success: false, error: 'Project not found' }
        }

        return { success: true, data: project }
    }, {
        params: t.Object({
            id: t.String()
        }),
        detail: { tags: ['projects'], summary: 'Get project by ID' }
    })

    .patch('/projects/:id', async ({ params, body }) => {
        const session = await auth()
        if (!session?.user || session.user.role !== 'super_admin') {
            return { success: false, error: 'Forbidden - Super Admin access required' }
        }

        const [project] = await db.update(projects)
            .set({
                ...body,
                updatedAt: new Date(),
            })
            .where(eq(projects.id, params.id))
            .returning()

        return { success: true, data: project }
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            name: t.Optional(t.String()),
            type: t.Optional(t.String()),
            address: t.Optional(t.String()),
            status: t.Optional(t.String()),
            settings: t.Optional(t.Any()),
            totalUnits: t.Optional(t.Number()),
            description: t.Optional(t.String()),
        }),
        detail: { tags: ['projects'], summary: 'Update project' }
    })

    .delete('/projects/:id', async ({ params }) => {
        const session = await auth()
        if (!session?.user || session.user.role !== 'super_admin') {
            return { success: false, error: 'Forbidden - Super Admin access required' }
        }

        const [project] = await db.delete(projects)
            .where(eq(projects.id, params.id))
            .returning()

        return { success: true, data: project }
    }, {
        params: t.Object({
            id: t.String()
        }),
        detail: { tags: ['projects'], summary: 'Delete project' }
    })

    // Units endpoints
    .get('/units', async ({ query }) => {
        const data = await db.query.units.findMany({
            limit: query.limit ? parseInt(query.limit) : 100,
            orderBy: desc(units.unitNumber),
        })
        return { success: true, data }
    }, {
        query: t.Object({
            limit: t.Optional(t.String())
        }),
        detail: { tags: ['units'], summary: 'Get all units' }
    })

    // Users endpoints
    .get('/users/me', async () => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }
        return { success: true, data: session.user }
    }, {
        detail: { tags: ['users'], summary: 'Get current user' }
    })

    // Announcements endpoints
    .get('/announcements', async ({ query }) => {
        const data = await db.query.announcements.findMany({
            orderBy: [desc(announcements.isPinned), desc(announcements.createdAt)],
            limit: query.limit ? parseInt(query.limit) : 50,
            with: {
                author: {
                    columns: {
                        name: true,
                        role: true,
                    }
                }
            }
        })
        return { success: true, data }
    }, {
        query: t.Object({
            limit: t.Optional(t.String())
        }),
        detail: { tags: ['announcements'], summary: 'Get announcements' }
    })
    .post('/announcements', async ({ body }) => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
            return { success: false, error: 'Forbidden' }
        }
        const [result] = await db.insert(announcements).values({
            ...body,
            createdBy: session.user.id,
            projectId: (session.user as any).projectId || 'default-project',
        }).returning()

        // Notify all residents
        await NotificationService.createForRole('resident', {
            title: 'ประกาศใหม่จากนิติบุคคล',
            message: body.title,
            type: 'info',
            link: '/resident/announcements'
        })

        return { success: true, data: result }
    }, {
        body: t.Object({
            title: t.String(),
            content: t.String(),
            category: t.String(),
            isPinned: t.Optional(t.Boolean()),
        }),
        detail: { tags: ['announcements'], summary: 'Create announcement' }
    })
    .patch('/announcements/:id', async ({ params, body }) => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
            return { success: false, error: 'Forbidden' }
        }
        const [result] = await db.update(announcements)
            .set(body)
            .where(eq(announcements.id, params.id))
            .returning()
        return { success: true, data: result }
    }, {
        params: t.Object({ id: t.String() }),
        body: t.Object({
            title: t.Optional(t.String()),
            content: t.Optional(t.String()),
            category: t.Optional(t.String()),
            isPinned: t.Optional(t.Boolean()),
        }),
        detail: { tags: ['announcements'], summary: 'Update announcement' }
    })
    .delete('/announcements/:id', async ({ params }) => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
            return { success: false, error: 'Forbidden' }
        }
        await db.delete(announcements).where(eq(announcements.id, params.id))
        return { success: true, data: null }
    }, {
        params: t.Object({ id: t.String() }),
        detail: { tags: ['announcements'], summary: 'Delete announcement' }
    })

    // Users endpoints (Profile Update)
    .patch('/users/:id', async ({ params, body }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        // Allow if admin or self
        const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin'
        const isSelf = session.user.id === params.id

        if (!isAdmin && !isSelf) {
            return { success: false, error: 'Forbidden' }
        }

        const updateData: any = { ...body }
        if (body.password) {
            updateData.password = await bcrypt.hash(body.password, 10)
        }

        const [result] = await db.update(users)
            .set(updateData)
            .where(eq(users.id, params.id))
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                phone: users.phone,
                role: users.role,
                avatar: users.avatar
            })

        return { success: true, data: result }
    }, {
        params: t.Object({ id: t.String() }),
        body: t.Object({
            name: t.Optional(t.String()),
            phone: t.Optional(t.String()),
            password: t.Optional(t.String()),
            avatar: t.Optional(t.String()),
        }),
        detail: { tags: ['users'], summary: 'Update user profile' }
    })

    // Residents endpoints
    .get('/residents', async ({ query }) => {
        const data = await db.query.users.findMany({
            where: query.projectId
                ? eq(users.projectId, query.projectId)
                : undefined,
            limit: query.limit ? parseInt(query.limit as string) : 50,
        })

        return { success: true, data }
    }, {
        query: t.Object({
            projectId: t.Optional(t.String()),
            limit: t.Optional(t.String()),
        }),
        detail: { tags: ['residents'], summary: 'Get all residents' },
    })

    .post('/residents', async ({ body }) => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
            return { success: false, error: 'Forbidden - Admin access required' }
        }

        const [result] = await db.insert(users).values(body).returning()
        return { success: true, data: result }
    }, {
        body: t.Object({
            projectId: t.Optional(t.String()),
            unitId: t.Optional(t.String()),
            name: t.String(),
            email: t.String(),
            phone: t.Optional(t.String()),
            role: t.Optional(t.String()),
        }),
        detail: { tags: ['residents'], summary: 'Create resident (Admin only)' },
    })

    // Parcels endpoints
    .get('/parcels', async ({ query }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const data = await db.query.parcels.findMany({
            where: query.unitId
                ? eq(parcels.unitId, query.unitId)
                : undefined,
            orderBy: desc(parcels.receivedAt),
            limit: query.limit ? parseInt(query.limit as string) : 50,
            with: {
                unit: true,
            },
        })

        return { success: true, data }
    }, {
        query: t.Object({
            unitId: t.Optional(t.String()),
            limit: t.Optional(t.String()),
        }),
        detail: { tags: ['parcels'], summary: 'Get parcels' },
    })

    .post('/parcels', async ({ body }) => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'security' && session.user.role !== 'admin')) {
            return { success: false, error: 'Forbidden - Security or Admin access required' }
        }

        const [result] = await db.insert(parcels).values({
            ...body,
            receivedBy: session.user.id,
        }).returning()

        // Notify residents in the unit
        const residents = await db.query.users.findMany({
            where: eq(users.unitId, body.unitId)
        })

        for (const resident of residents) {
            await NotificationService.create({
                userId: resident.id,
                title: 'มีพัสดุมาใหม่',
                message: `มีพัสดุจาก ${body.courier || 'ไม่ระบุขนส่ง'} มาส่งถึงคุณ`,
                type: 'info',
                link: '/resident/parcels'
            })
        }

        return { success: true, data: result }
    }, {
        body: t.Object({
            unitId: t.String(),
            trackingNumber: t.Optional(t.String()),
            courier: t.Optional(t.String()),
            image: t.Optional(t.String()),
        }),
        detail: { tags: ['parcels'], summary: 'Create parcel (Security/Admin only)' },
    })

    .patch('/parcels/:id', async ({ params, body }) => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'security' && session.user.role !== 'admin')) {
            return { success: false, error: 'Forbidden' }
        }

        const [result] = await db.update(parcels)
            .set({
                pickedUpAt: body.pickedUp ? new Date() : undefined,
                pickedUpBy: body.pickedUp ? session.user.id : undefined,
            })
            .where(eq(parcels.id, params.id))
            .returning()

        if (!result) {
            return { success: false, error: 'Parcel not found' }
        }

        return { success: true, data: result }
    }, {
        params: t.Object({ id: t.String() }),
        body: t.Object({
            pickedUp: t.Boolean(),
        }),
        detail: { tags: ['parcels'], summary: 'Update parcel status (Mark as picked up)' },
    })

    // Visitors endpoints
    .get('/visitors', async ({ query }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const data = await db.query.visitors.findMany({
            where: query.unitId
                ? eq(visitors.unitId, query.unitId)
                : undefined,
            orderBy: desc(visitors.createdAt),
            limit: query.limit ? parseInt(query.limit as string) : 50,
            with: {
                unit: true,
            },
        })

        return { success: true, data }
    }, {
        query: t.Object({
            unitId: t.Optional(t.String()),
            limit: t.Optional(t.String()),
        }),
        detail: { tags: ['visitors'], summary: 'Get visitors' },
    })

    .post('/visitors', async ({ body }) => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'security' && session.user.role !== 'admin' && session.user.role !== 'resident')) {
            return { success: false, error: 'Forbidden - Access required' }
        }

        const [result] = await db.insert(visitors).values({
            ...body,
            qrCode: randomUUID(),
        }).returning()

        // Notify residents in the unit
        const residents = await db.query.users.findMany({
            where: eq(users.unitId, body.unitId)
        })

        for (const resident of residents) {
            await NotificationService.create({
                userId: resident.id,
                title: 'มีผู้มาติดต่อ',
                message: `คุณ ${body.visitorName} ได้เข้ามาติดต่อ (ทะเบียน: ${body.licensePlate || '-'})`,
                type: 'info',
                link: '/resident/visitors'
            })
        }

        return { success: true, data: result }
    }, {
        body: t.Object({
            unitId: t.String(),
            visitorName: t.String(),
            phone: t.Optional(t.String()),
            licensePlate: t.Optional(t.String()),
            purpose: t.Optional(t.String()),
        }),
        detail: { tags: ['visitors'], summary: 'Check-in visitor (Security/Admin only)' },
    })

    .patch('/visitors/:id', async ({ params, body }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const [result] = await db.update(visitors)
            .set({
                ...body,
                checkOutAt: body.status === 'checked_out' ? new Date() : undefined,
            })
            .where(eq(visitors.id, params.id))
            .returning()

        if (!result) {
            return { success: false, error: 'Visitor not found' }
        }

        return { success: true, data: result }
    }, {
        params: t.Object({ id: t.String() }),
        body: t.Object({
            status: t.Optional(t.String()),
        }),
        detail: { tags: ['visitors'], summary: 'Update visitor status' },
    })

    .get('/visitors/verify/:qrCode', async ({ params }) => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'security' && session.user.role !== 'admin')) {
            return { success: false, error: 'Forbidden' }
        }

        const visitor = await db.query.visitors.findFirst({
            where: eq(visitors.qrCode, params.qrCode),
            with: {
                unit: true,
            },
        })

        if (!visitor) {
            return { success: false, error: 'Invalid QR Code' }
        }

        return { success: true, data: visitor }
    }, {
        params: t.Object({ qrCode: t.String() }),
        detail: { tags: ['visitors'], summary: 'Verify visitor QR code' },
    })

    // Bills endpoints
    .get('/bills', async ({ query }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const data = await db.query.bills.findMany({
            where: query.unitId
                ? eq(bills.unitId, query.unitId)
                : undefined,
            orderBy: desc(bills.createdAt),
            limit: query.limit ? parseInt(query.limit as string) : 50,
            with: {
                unit: true,
            },
        })

        return { success: true, data }
    }, {
        query: t.Object({
            unitId: t.Optional(t.String()),
            limit: t.Optional(t.String()),
        }),
        detail: { tags: ['bills'], summary: 'Get bills' },
    })

    .post('/bills', async ({ body }) => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
            return { success: false, error: 'Forbidden - Admin access required' }
        }

        const [result] = await db.insert(bills).values(body).returning()

        // Notify residents in the unit
        const residents = await db.query.users.findMany({
            where: eq(users.unitId, body.unitId)
        })

        for (const resident of residents) {
            await NotificationService.create({
                userId: resident.id,
                title: 'บิลค่าใช้จ่ายใหม่',
                message: `มีบิลค่า ${body.billType} ยอด ${body.amount} บาท`,
                type: 'info',
                link: `/resident/bills/${result.id}`
            })
        }

        return { success: true, data: result }
    }, {
        body: t.Object({
            unitId: t.String(),
            billType: t.String(),
            amount: t.String(),
            dueDate: t.Optional(t.String()),
            status: t.Optional(t.String()),
        }),
        detail: { tags: ['bills'], summary: 'Create bill (Admin only)' },
    })

    .get('/bills/:id', async ({ params }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const bill = await db.query.bills.findFirst({
            where: eq(bills.id, params.id),
            with: {
                unit: true,
            },
        })

        if (!bill) {
            return { success: false, error: 'Bill not found' }
        }

        const settings = await db.query.paymentSettings.findFirst({
            where: eq(paymentSettings.projectId, bill.unit.projectId)
        })

        return {
            success: true,
            data: {
                ...bill,
                projectPaymentMethod: settings?.paymentMethod === 'gateway' ? 'bank_transfer' :
                    settings?.paymentMethod === 'self_qr' ? 'promptpay' :
                        settings?.paymentMethod || 'promptpay'
            }
        }
    }, {
        params: t.Object({
            id: t.String(),
        }),
        detail: { tags: ['bills'], summary: 'Get bill by ID' },
    })

    .patch('/bills/:id', async ({ params, body }) => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
            return { success: false, error: 'Unauthorized' }
        }

        const [result] = await db.update(bills)
            .set({
                ...body,
                paidAt: body.paidAt ? new Date(body.paidAt) : undefined,
            })
            .where(eq(bills.id, params.id))
            .returning()

        if (!result) {
            return { success: false, error: 'Bill not found' }
        }

        // Notify residents if status changed to paid
        if (body.status === 'paid') {
            const bill = await db.query.bills.findFirst({
                where: eq(bills.id, params.id),
                with: { unit: true }
            })

            if (bill) {
                const residents = await db.query.users.findMany({
                    where: eq(users.unitId, bill.unitId)
                })

                for (const resident of residents) {
                    await NotificationService.create({
                        userId: resident.id,
                        title: 'การชำระเงินสำเร็จ',
                        message: `บิลค่า ${bill.billType} ได้รับการยืนยันการชำระเงินแล้ว`,
                        type: 'success',
                        link: `/resident/bills/${bill.id}`
                    })
                }
            }
        }

        return { success: true, data: result }
    }, {
        params: t.Object({ id: t.String() }),
        body: t.Object({
            status: t.Optional(t.String()),
            paidAt: t.Optional(t.String()),
            paymentRef: t.Optional(t.String()),
        }),
        detail: { tags: ['bills'], summary: 'Update bill (Admin only)' },
    })

    .post('/bills/:id/generate-qr', async ({ params }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const bill = await db.query.bills.findFirst({
            where: eq(bills.id, params.id),
            with: { unit: true },
        })

        if (!bill) {
            return { success: false, error: 'Bill not found' }
        }

        const projectId = bill.unit.projectId
        console.log('🔍 Generate QR - Bill projectId:', projectId)

        const settings = await db.query.paymentSettings.findFirst({
            where: eq(paymentSettings.projectId, projectId)
        })

        console.log('🔍 Generate QR - Settings found:', settings ? 'YES' : 'NO')
        if (settings) {
            console.log('🔍 Settings data:', {
                paymentMethod: settings.paymentMethod,
                promptpayId: settings.promptpayId
            })
        } else {
            // Debug: check all settings
            const allSettings = await db.query.paymentSettings.findMany()
            console.log('🔍 All payment settings in DB:', allSettings.map(s => ({
                projectId: s.projectId,
                paymentMethod: s.paymentMethod
            })))
        }

        if (!settings) {
            return { success: false, error: 'Payment settings not configured' }
        }

        // Check payment method
        // 'gateway' is now used for 'Bank Transfer'
        if (settings.paymentMethod === 'gateway' || settings.paymentMethod === 'bank_transfer') {
            return {
                success: true,
                data: {
                    type: 'bank_transfer',
                    amount: bill.amount,
                    accountInfo: {
                        bankName: settings.bankName,
                        accountName: settings.accountName,
                        accountNumber: settings.gatewayMerchantId, // We stored account number here
                    },
                },
            }
        }

        // Default to PromptPay QR
        if (!settings.promptpayId) {
            return { success: false, error: 'PromptPay ID not configured' }
        }

        const { generatePromptPayQR } = await import('@/lib/qr-generator')
        const qr = await generatePromptPayQR({
            promptpayId: settings.promptpayId,
            amount: Number(bill.amount),
        })

        return {
            success: true,
            data: {
                type: 'promptpay',
                qrDataUrl: qr.dataUrl,
                amount: bill.amount,
                accountInfo: {
                    promptpayId: settings.promptpayId,
                    accountName: settings.accountName,
                    bankName: settings.bankName,
                },
            },
        }
    }, {
        params: t.Object({ id: t.String() }),
        detail: { tags: ['bills'], summary: 'Generate PromptPay QR code' },
    })

    .post('/bills/:id/upload-slip', async ({ params, body }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const [result] = await db.update(bills)
            .set({
                paymentSlipUrl: body.slipUrl,
                status: 'pending_verification',
            })
            .where(eq(bills.id, params.id))
            .returning()

        if (!result) {
            return { success: false, error: 'Bill not found' }
        }

        return { success: true, data: result }
    }, {
        params: t.Object({ id: t.String() }),
        body: t.Object({
            slipUrl: t.String(),
        }),
        detail: { tags: ['bills'], summary: 'Upload payment slip' },
    })

    // Maintenance endpoints
    .get('/maintenance', async ({ query }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const data = await db.query.maintenanceRequests.findMany({
            where: query.unitId
                ? eq(maintenanceRequests.unitId, query.unitId)
                : undefined,
            orderBy: desc(maintenanceRequests.createdAt),
            limit: query.limit ? parseInt(query.limit as string) : 50,
            with: {
                unit: true,
                createdBy: {
                    columns: {
                        name: true,
                        phone: true,
                    }
                }
            },
        })

        return { success: true, data }
    }, {
        query: t.Object({
            unitId: t.Optional(t.String()),
            status: t.Optional(t.String()),
            limit: t.Optional(t.String()),
        }),
        detail: { tags: ['maintenance'], summary: 'Get maintenance requests' },
    })

    .post('/maintenance', async ({ body }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const [result] = await db.insert(maintenanceRequests).values({
            ...body,
            createdBy: session.user.id,
        }).returning()

        // Notify Admins
        await NotificationService.createForRole('admin', {
            title: 'มีการแจ้งซ่อมใหม่',
            message: `เรื่อง: ${body.title} (ความเร่งด่วน: ${body.priority || 'ปกติ'})`,
            type: 'warning',
            link: '/admin/maintenance'
        })

        return { success: true, data: result }
    }, {
        body: t.Object({
            unitId: t.String(),
            category: t.Optional(t.String()),
            title: t.String(),
            description: t.Optional(t.String()),
            images: t.Optional(t.Any()),
            priority: t.Optional(t.String()),
        }),
        detail: { tags: ['maintenance'], summary: 'Create maintenance request' },
    })

    .patch('/maintenance/:id', async ({ params, body }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const [result] = await db.update(maintenanceRequests)
            .set({
                ...body,
                completedAt: body.completedAt ? new Date(body.completedAt) : undefined,
            })
            .where(eq(maintenanceRequests.id, params.id))
            .returning()

        if (!result) {
            return { success: false, error: 'Maintenance request not found' }
        }

        // Notify residents if status changed
        if (body.status) {
            const request = await db.query.maintenanceRequests.findFirst({
                where: eq(maintenanceRequests.id, params.id),
                with: { unit: true }
            })

            if (request) {
                const residents = await db.query.users.findMany({
                    where: eq(users.unitId, request.unitId)
                })

                const statusText =
                    body.status === 'in_progress' ? 'กำลังดำเนินการ' :
                        body.status === 'completed' ? 'ดำเนินการเสร็จสิ้น' :
                            body.status === 'cancelled' ? 'ถูกยกเลิก' : body.status

                for (const resident of residents) {
                    await NotificationService.create({
                        userId: resident.id,
                        title: 'อัปเดตสถานะการแจ้งซ่อม',
                        message: `เรื่อง "${request.title}" สถานะเป็น: ${statusText}`,
                        type: body.status === 'completed' ? 'success' : 'info',
                        link: '/resident/maintenance'
                    })
                }
            }
        }

        return { success: true, data: result }
    }, {
        params: t.Object({ id: t.String() }),
        body: t.Object({
            status: t.Optional(t.String()),
            assignedTo: t.Optional(t.String()),
            completedAt: t.Optional(t.String()),
        }),
        detail: { tags: ['maintenance'], summary: 'Update maintenance request' },
    })

    // Equipment endpoints
    .get('/equipment', async ({ query }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const data = await db.query.equipment.findMany({
            limit: query.limit ? parseInt(query.limit as string) : 50,
            orderBy: desc(equipment.createdAt),
        })

        return { success: true, data }
    }, {
        query: t.Object({
            limit: t.Optional(t.String()),
        }),
        detail: { tags: ['equipment'], summary: 'Get equipment' }
    })
    .post('/equipment', async ({ body }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const [newItem] = await db.insert(equipment).values({
            name: body.name,
            type: body.type,
            projectId: body.projectId,
            status: body.status || 'available',
            location: body.location,
            serialNumber: body.serialNumber,
            notes: body.notes,
        }).returning()

        return { success: true, data: newItem }
    }, {
        body: t.Object({
            name: t.String(),
            type: t.String(),
            projectId: t.String(),
            status: t.Optional(t.String()),
            location: t.Optional(t.String()),
            serialNumber: t.Optional(t.String()),
            notes: t.Optional(t.String()),
        }),
        detail: { tags: ['equipment'], summary: 'Create equipment' }
    })

    // Facilities endpoints
    .get('/facilities', async ({ query }) => {
        const data = await db.query.facilities.findMany({
            where: query.projectId
                ? eq(facilities.projectId, query.projectId)
                : undefined,
            limit: query.limit ? parseInt(query.limit as string) : 50,
        })

        return { success: true, data }
    }, {
        query: t.Object({
            projectId: t.Optional(t.String()),
            limit: t.Optional(t.String()),
        }),
        detail: { tags: ['facilities'], summary: 'Get all facilities (Public)' },
    })

    .post('/facilities', async ({ body }) => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
            return { success: false, error: 'Forbidden - Admin access required' }
        }

        const [result] = await db.insert(facilities).values(body).returning()
        return { success: true, data: result }
    }, {
        body: t.Object({
            projectId: t.String(),
            name: t.String(),
            description: t.Optional(t.String()),
            image: t.Optional(t.String()),
            openTime: t.Optional(t.String()),
            closeTime: t.Optional(t.String()),
            maxCapacity: t.Optional(t.Number()),
            requiresApproval: t.Optional(t.Boolean()),
        }),
        detail: { tags: ['facilities'], summary: 'Create facility (Admin only)' },
    })

    // Bookings endpoints
    .get('/bookings', async ({ query }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const data = await db.query.bookings.findMany({
            with: {
                facility: true,
                unit: true,
                user: {
                    columns: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            where: query.facilityId
                ? eq(bookings.facilityId, query.facilityId)
                : query.unitId
                    ? eq(bookings.unitId, query.unitId)
                    : undefined,
            orderBy: desc(bookings.createdAt),
            limit: query.limit ? parseInt(query.limit as string) : 50,
        })

        return { success: true, data }
    }, {
        query: t.Object({
            facilityId: t.Optional(t.String()),
            unitId: t.Optional(t.String()),
            limit: t.Optional(t.String()),
        }),
        detail: { tags: ['bookings'], summary: 'Get bookings' },
    })

    .post('/bookings', async ({ body }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const [booking] = await db.insert(bookings).values({
            ...body,
            userId: session.user.id as string,
        }).returning()

        // Fetch full booking data with relations
        const result = await db.query.bookings.findFirst({
            where: eq(bookings.id, booking.id),
            with: {
                facility: true,
                unit: true,
                user: {
                    columns: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        return { success: true, data: result }
    }, {
        body: t.Object({
            facilityId: t.String(),
            unitId: t.String(),
            bookingDate: t.String(),
            startTime: t.String(),
            endTime: t.String(),
        }),
        detail: { tags: ['bookings'], summary: 'Create booking' },
    })

    .patch('/bookings/:id', async ({ params, body }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        await db.update(bookings)
            .set(body)
            .where(eq(bookings.id, params.id))

        // Fetch full booking data with relations
        const result = await db.query.bookings.findFirst({
            where: eq(bookings.id, params.id),
            with: {
                facility: true,
                unit: true,
                user: {
                    columns: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        if (!result) {
            return { success: false, error: 'Booking not found' }
        }

        return { success: true, data: result }
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            status: t.Union([
                t.Literal('pending'),
                t.Literal('approved'),
                t.Literal('rejected'),
                t.Literal('cancelled')
            ])
        }),
        detail: { tags: ['bookings'], summary: 'Update booking status' }
    })

    // SOS Alerts endpoints
    .get('/sos', async () => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'security' && session.user.role !== 'super_admin')) {
            return { success: false, error: 'Forbidden - Admin/Security access required' }
        }

        const data = await db.query.sosAlerts.findMany({
            where: eq(sosAlerts.status, 'active'),
            orderBy: desc(sosAlerts.createdAt),
        })

        return { success: true, data }
    }, {
        detail: { tags: ['sos'], summary: 'Get active SOS alerts (Admin/Security)' },
    })

    .post('/sos', async ({ body }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const [result] = await db.insert(sosAlerts).values({
            ...body,
            userId: session.user.id as string,
        }).returning()

        // Notify Admins and Security
        const message = `มีการแจ้งเหตุฉุกเฉินจากลูกบ้าน (Unit ID: ${body.unitId})`

        await Promise.all([
            NotificationService.createForRole('admin', {
                title: '🚨 แจ้งเหตุฉุกเฉิน (SOS)',
                message: message,
                type: 'error',
                link: '/admin/sos'
            }),
            NotificationService.createForRole('security', {
                title: '🚨 แจ้งเหตุฉุกเฉิน (SOS)',
                message: message,
                type: 'error',
                link: '/security/sos'
            })
        ])

        return { success: true, data: result }
    }, {
        body: t.Object({
            unitId: t.String(),
            latitude: t.Optional(t.String()),
            longitude: t.Optional(t.String()),
            message: t.Optional(t.String()),
        }),
        detail: { tags: ['sos'], summary: 'Create SOS alert' },
    })

    .patch('/sos/:id', async ({ params, body }) => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'security')) {
            return { success: false, error: 'Forbidden' }
        }

        const [result] = await db.update(sosAlerts)
            .set({
                status: body.status,
                resolvedAt: body.status === 'resolved' ? new Date() : undefined,
                resolvedBy: session.user.id,
            })
            .where(eq(sosAlerts.id, params.id))
            .returning()

        return { success: true, data: result }
    }, {
        params: t.Object({ id: t.String() }),
        body: t.Object({
            status: t.String(),
        }),
        detail: { tags: ['sos'], summary: 'Update SOS alert status' },
    })

    // Support Tickets endpoints
    .get('/support', async ({ query }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const data = await db.query.supportTickets.findMany({
            where: query.userId
                ? eq(supportTickets.userId, query.userId)
                : undefined,
            orderBy: desc(supportTickets.createdAt),
            limit: query.limit ? parseInt(query.limit as string) : 50,
        })

        return { success: true, data }
    }, {
        query: t.Object({
            userId: t.Optional(t.String()),
            status: t.Optional(t.String()),
            limit: t.Optional(t.String()),
        }),
        detail: { tags: ['support'], summary: 'Get support tickets' },
    })

    .post('/support', async ({ body }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const [result] = await db.insert(supportTickets).values({
            ...body,
            userId: session.user.id as string,
        }).returning()

        return { success: true, data: result }
    }, {
        body: t.Object({
            unitId: t.String(),
            subject: t.String(),
            message: t.String(),
            priority: t.Optional(t.String()),
            category: t.Optional(t.String()),
            images: t.Optional(t.Array(t.String())),
        }),
        detail: { tags: ['support'], summary: 'Create support ticket' }
    })

    .get('/support/:id', async ({ params }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const ticket = await db.query.supportTickets.findFirst({
            where: eq(supportTickets.id, params.id),
            with: {
                responses: {
                    orderBy: asc(supportTicketResponses.createdAt)
                }
            }
        })

        if (!ticket) {
            return { success: false, error: 'Ticket not found' }
        }

        return { success: true, data: ticket }
    }, {
        params: t.Object({
            id: t.String()
        }),
        detail: { tags: ['support'], summary: 'Get support ticket by ID' }
    })

    .patch('/support/:id', async ({ params, body }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        // Check permissions (admin or owner)
        const ticket = await db.query.supportTickets.findFirst({
            where: eq(supportTickets.id, params.id)
        })

        if (!ticket) {
            return { success: false, error: 'Ticket not found' }
        }

        const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin'
        const isOwner = ticket.userId === session.user.id

        if (!isAdmin && !isOwner) {
            return { success: false, error: 'Forbidden' }
        }

        const [result] = await db.update(supportTickets)
            .set({
                ...body,
            })
            .where(eq(supportTickets.id, params.id))
            .returning()

        return { success: true, data: result }
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            status: t.Optional(t.String()),
            priority: t.Optional(t.String()),
            category: t.Optional(t.String()),
        }),
        detail: { tags: ['support'], summary: 'Update support ticket' }
    })

    .post('/support/:id/responses', async ({ params, body }) => {
        const session = await auth()
        if (!session?.user) {
            return { success: false, error: 'Unauthorized' }
        }

        const ticket = await db.query.supportTickets.findFirst({
            where: eq(supportTickets.id, params.id)
        })

        if (!ticket) {
            return { success: false, error: 'Support ticket not found' }
        }

        const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin'
        const isOwner = ticket.userId === session.user.id

        if (!isAdmin && !isOwner) {
            return { success: false, error: 'Forbidden - You can only respond to your own tickets' }
        }

        const [response] = await db.insert(supportTicketResponses).values({
            ticketId: params.id,
            message: body.message,
            isFromAdmin: isAdmin,
            createdBy: session.user.id!,
        }).returning()

        // Update ticket status to in_progress if it's still open and admin responded
        if (isAdmin && ticket.status === 'open') {
            await db.update(supportTickets)
                .set({
                    status: 'in_progress',
                    repliedAt: new Date(),
                    repliedBy: session.user.id!,
                })
                .where(eq(supportTickets.id, params.id))
        }

        return { success: true, data: response }
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            message: t.String(),
        }),
        detail: { tags: ['support'], summary: 'Add response to a support ticket' }
    })

    // Equipment endpoints
    .get('/equipment', async ({ query }) => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'maintenance' && session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
            return { success: false, error: 'Forbidden' }
        }

        const data = await db.query.equipment.findMany({
            limit: query.limit ? parseInt(query.limit) : 50,
            orderBy: desc(equipment.createdAt),
        })

        return { success: true, data }
    }, {
        query: t.Object({
            limit: t.Optional(t.String())
        }),
        detail: { tags: ['equipment'], summary: 'Get all equipment' }
    })

    .post('/equipment', async ({ body }) => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'maintenance' && session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
            return { success: false, error: 'Forbidden' }
        }

        const [newItem] = await db.insert(equipment).values({
            name: body.name,
            type: body.type,
            projectId: body.projectId,
            status: body.status || 'available',
            location: body.location,
            serialNumber: body.serialNumber,
            notes: body.notes,
        }).returning()

        return { success: true, data: newItem }
    }, {
        body: t.Object({
            name: t.String(),
            type: t.String(),
            projectId: t.String(),
            status: t.Optional(t.String()),
            location: t.String(),
            serialNumber: t.Optional(t.String()),
            notes: t.Optional(t.String()),
        }),
        detail: { tags: ['equipment'], summary: 'Create new equipment' }
    })

    .put('/equipment/:id', async ({ params, body }) => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'maintenance' && session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
            return { success: false, error: 'Forbidden' }
        }

        const [updatedItem] = await db.update(equipment)
            .set({
                ...body,
                ...(body.purchasePrice !== undefined ? { purchasePrice: String(body.purchasePrice) } : {}),
                updatedAt: new Date(),
            } as any)
            .where(eq(equipment.id, params.id))
            .returning()

        return { success: true, data: updatedItem }
    }, {
        params: t.Object({
            id: t.String()
        }),
        body: t.Object({
            name: t.Optional(t.String()),
            type: t.Optional(t.String()),
            status: t.Optional(t.String()),
            location: t.Optional(t.String()),
            serialNumber: t.Optional(t.String()),
            notes: t.Optional(t.String()),
            purchaseDate: t.Optional(t.String()),
            purchasePrice: t.Optional(t.Number()),
        }),
        detail: { tags: ['equipment'], summary: 'Update equipment' }
    })

    .delete('/equipment/:id', async ({ params }) => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'maintenance' && session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
            return { success: false, error: 'Forbidden' }
        }

        const [deletedItem] = await db.delete(equipment)
            .where(eq(equipment.id, params.id))
            .returning()

        return { success: true, data: deletedItem }
    }, {
        params: t.Object({
            id: t.String()
        }),
        detail: { tags: ['equipment'], summary: 'Delete equipment' }
    })

    // Payment Settings endpoints
    .get('/admin/payment-settings', async () => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
            return { success: false, error: 'Forbidden' }
        }

        const settings = await db.query.paymentSettings.findFirst()

        // Map backend fields to frontend interface
        if (settings) {
            return {
                success: true,
                data: {
                    ...settings,
                    // Map gatewayMerchantId to accountNumber for frontend
                    accountNumber: settings.gatewayMerchantId,
                    // Map backend values to frontend values
                    paymentMethod: settings.paymentMethod === 'gateway' ? 'bank_transfer' :
                        settings.paymentMethod === 'self_qr' ? 'promptpay' :
                            settings.paymentMethod,
                }
            }
        }

        return { success: true, data: null }
    }, {
        detail: { tags: ['admin'], summary: 'Get payment settings' },
    })

    .post('/admin/payment-settings', async ({ body }) => {
        const session = await auth()
        if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
            return { success: false, error: 'Forbidden' }
        }

        // Map frontend fields to backend schema
        const settingsData = {
            ...body,
            // Map accountNumber to gatewayMerchantId
            gatewayMerchantId: body.accountNumber,
            // Ensure paymentMethod is valid enum value
            paymentMethod: body.paymentMethod === 'bank_transfer' ? 'gateway' :
                body.paymentMethod === 'promptpay' ? 'self_qr' :
                    body.paymentMethod,
            // Ensure projectId is set (get first project or from session if available)
            // For now, assuming single project system, get the first project ID
        }

        // We need a projectId. Let's fetch the first project.
        const project = await db.query.projects.findFirst()
        if (!project) {
            return { success: false, error: 'No project found' }
        }

        const dataToSave = {
            ...settingsData,
            projectId: project.id,
            // Remove fields that are not in schema if necessary, but Drizzle usually ignores extra fields
            accountNumber: undefined, // Remove this as it's not in DB
        }

        // Check if settings exist
        const existing = await db.query.paymentSettings.findFirst({
            where: eq(paymentSettings.projectId, project.id)
        })

        let result;
        if (existing) {
            [result] = await db.update(paymentSettings)
                .set(dataToSave)
                .where(eq(paymentSettings.id, existing.id))
                .returning()
        } else {
            [result] = await db.insert(paymentSettings)
                .values(dataToSave)
                .returning()
        }

        return { success: true, data: result }
    }, {
        body: t.Object({
            paymentMethod: t.String(),
            promptpayType: t.Optional(t.String()),
            promptpayId: t.Optional(t.String()),
            accountName: t.Optional(t.String()),
            bankName: t.Optional(t.String()),
            accountNumber: t.Optional(t.String()), // Frontend sends this
            requireSlipUpload: t.Optional(t.Boolean()),
            autoVerifyPayment: t.Optional(t.Boolean()),
            // Allow other fields to pass through
            gatewayProvider: t.Optional(t.String()),
            gatewayPublicKey: t.Optional(t.String()),
            gatewaySecretKey: t.Optional(t.String()),
            gatewayMerchantId: t.Optional(t.String()),
        }),
        detail: { tags: ['admin'], summary: 'Update payment settings' },
    })

    // Notifications endpoints
    .get('/notifications', async () => {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const data = await db.query.notifications.findMany({
            where: eq(notifications.userId, session.user.id),
            orderBy: desc(notifications.createdAt),
            limit: 50,
        })

        return { success: true, data }
    }, {
        detail: { tags: ['notifications'], summary: 'Get user notifications' }
    })
    .get('/notifications/unread-count', async () => {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const [result] = await db.select({ count: sql<number>`count(*)` })
            .from(notifications)
            .where(and(
                eq(notifications.userId, session.user.id),
                eq(notifications.isRead, false)
            ))

        return { success: true, data: { count: Number(result.count) } }
    }, {
        detail: { tags: ['notifications'], summary: 'Get unread notifications count' }
    })
    .patch('/notifications/:id/read', async ({ params }) => {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        await db.update(notifications)
            .set({ isRead: true })
            .where(and(
                eq(notifications.id, params.id),
                eq(notifications.userId, session.user.id)
            ))

        return { success: true }
    }, {
        params: t.Object({
            id: t.String()
        }),
        detail: { tags: ['notifications'], summary: 'Mark notification as read' }
    })
    .patch('/notifications/read-all', async () => {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, session.user.id))

        return { success: true }
    }, {
        detail: { tags: ['notifications'], summary: 'Mark all notifications as read' }
    })

// Export type for Eden Treaty
export type App = typeof app

// Export HTTP methods for Next.js
export const GET = app.fetch
export const POST = app.fetch
export const PATCH = app.fetch
export const DELETE = app.fetch

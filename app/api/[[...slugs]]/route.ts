import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { db } from '@/lib/db'
import {
    users, announcements, units, parcels, visitors,
    bills, maintenanceRequests, facilities, bookings, sosAlerts, supportTickets
} from '@/lib/db/schema'
import { eq, desc, and, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

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
            where: query.facilityId
                ? eq(bookings.facilityId, query.facilityId)
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

        const [result] = await db.insert(bookings).values({
            ...body,
            userId: session.user.id as string,
        }).returning()

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
            message: t.Optional(t.String()),
        }),
        detail: { tags: ['support'], summary: 'Create support ticket' },
    })

// Export type for Eden Treaty
export type App = typeof app

// Export HTTP methods for Next.js
export const GET = app.fetch
export const POST = app.fetch
export const PATCH = app.fetch
export const DELETE = app.fetch

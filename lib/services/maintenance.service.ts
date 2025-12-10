import { db } from '@/lib/db'
import { maintenanceRequests } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { status } from 'elysia'

export type CreateMaintenanceInput = {
    unitId: string
    category?: string
    title: string
    description?: string
    images?: any
    priority?: string
    createdBy: string
}

export type UpdateMaintenanceInput = {
    status?: string
    assignedTo?: string
    completedAt?: string
}

/**
 * Service layer for Maintenance Requests
 */
export abstract class MaintenanceService {
    static async getAll(unitId?: string, statusFilter?: string, limit: number = 50) {
        const requests = await db.query.maintenanceRequests.findMany({
            where: unitId ? eq(maintenanceRequests.unitId, unitId) : undefined,
            orderBy: desc(maintenanceRequests.createdAt),
            limit,
        })

        if (statusFilter) {
            return requests.filter(r => r.status === statusFilter)
        }

        return requests
    }

    static async getById(id: string) {
        const result = await db.query.maintenanceRequests.findFirst({
            where: eq(maintenanceRequests.id, id),
        })

        if (!result) {
            throw status(404, 'Maintenance request not found')
        }

        return result
    }

    static async create(data: CreateMaintenanceInput) {
        const [result] = await db.insert(maintenanceRequests)
            .values({
                ...data,
                status: 'pending',
                priority: data.priority ?? 'normal',
            })
            .returning()

        return result
    }

    static async update(id: string, data: UpdateMaintenanceInput) {
        const updateData: any = { ...data }

        if (data.completedAt) {
            updateData.completedAt = new Date(data.completedAt)
        }

        const [result] = await db.update(maintenanceRequests)
            .set(updateData)
            .where(eq(maintenanceRequests.id, id))
            .returning()

        if (!result) {
            throw status(404, 'Maintenance request not found')
        }

        return result
    }

    static async assign(id: string, assignedTo: string) {
        return await this.update(id, {
            status: 'assigned',
            assignedTo,
        })
    }

    static async complete(id: string) {
        return await this.update(id, {
            status: 'completed',
            completedAt: new Date().toISOString(),
        })
    }

    static async getPending(unitId?: string) {
        const all = await this.getAll(unitId, 'pending')
        return all
    }
}

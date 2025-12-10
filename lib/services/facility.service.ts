import { db } from '@/lib/db'
import { facilities } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { status } from 'elysia'

export type CreateFacilityInput = {
    projectId: string
    name: string
    description?: string
    image?: string
    openTime?: string
    closeTime?: string
    maxCapacity?: number
    requiresApproval?: boolean
}

/**
 * Service layer for Facilities
 */
export abstract class FacilityService {
    static async getAll(projectId?: string, limit: number = 50) {
        return await db.query.facilities.findMany({
            where: projectId ? eq(facilities.projectId, projectId) : undefined,
            limit,
        })
    }

    static async getActive(projectId?: string) {
        const all = await this.getAll(projectId)
        return all.filter(f => f.isActive)
    }

    static async getById(id: string) {
        const result = await db.query.facilities.findFirst({
            where: eq(facilities.id, id),
        })

        if (!result) {
            throw status(404, 'Facility not found')
        }

        return result
    }

    static async create(data: CreateFacilityInput) {
        const [result] = await db.insert(facilities)
            .values({
                ...data,
                requiresApproval: data.requiresApproval ?? false,
                isActive: true,
            })
            .returning()

        return result
    }

    static async update(id: string, data: Partial<CreateFacilityInput>) {
        const [result] = await db.update(facilities)
            .set(data)
            .where(eq(facilities.id, id))
            .returning()

        if (!result) {
            throw status(404, 'Facility not found')
        }

        return result
    }

    static async toggleActive(id: string) {
        const facility = await this.getById(id)
        return await this.update(id, { isActive: !facility.isActive })
    }
}

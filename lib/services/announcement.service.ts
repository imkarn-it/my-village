import { db } from '@/lib/db'
import { announcements } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { status } from 'elysia'

/**
 * Service layer for Announcements
 * Separates business logic from API controllers
 */
export abstract class AnnouncementService {
    /**
     * Get all announcements for a project
     */
    static async getAll(projectId?: string, limit: number = 50) {
        return await db.query.announcements.findMany({
            where: projectId ? eq(announcements.projectId, projectId) : undefined,
            orderBy: [desc(announcements.isPinned), desc(announcements.createdAt)],
            limit,
        })
    }

    /**
     * Get single announcement by ID
     */
    static async getById(id: string) {
        const result = await db.query.announcements.findFirst({
            where: eq(announcements.id, id),
        })

        if (!result) {
            throw status(404, 'Announcement not found')
        }

        return result
    }

    /**
     * Create new announcement
     */
    static async create(data: {
        projectId: string
        title: string
        content: string
        image?: string
        isPinned?: boolean
        createdBy: string
    }) {
        const [result] = await db.insert(announcements)
            .values({
                ...data,
                isPinned: data.isPinned ?? false,
            })
            .returning()

        return result
    }

    /**
     * Update announcement
     */
    static async update(
        id: string,
        data: {
            title?: string
            content?: string
            image?: string
            isPinned?: boolean
        }
    ) {
        const [result] = await db.update(announcements)
            .set(data)
            .where(eq(announcements.id, id))
            .returning()

        if (!result) {
            throw status(404, 'Announcement not found')
        }

        return result
    }

    /**
     * Delete announcement
     */
    static async delete(id: string) {
        const result = await db.delete(announcements)
            .where(eq(announcements.id, id))
            .returning()

        if (!result.length) {
            throw status(404, 'Announcement not found')
        }

        return { success: true }
    }

    /**
     * Toggle pin status
     */
    static async togglePin(id: string) {
        const announcement = await this.getById(id)
        return await this.update(id, { isPinned: !announcement.isPinned })
    }
}

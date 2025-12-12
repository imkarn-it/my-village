import { db } from "@/lib/db"
import { notifications, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const NotificationService = {
    async create(data: {
        userId: string
        title: string
        message?: string
        type?: 'info' | 'success' | 'warning' | 'error'
        link?: string
    }) {
        const [notification] = await db.insert(notifications).values({
            userId: data.userId,
            title: data.title,
            message: data.message,
            type: data.type || 'info',
            link: data.link,
        }).returning()
        return notification
    },

    async createForRole(role: 'admin' | 'security' | 'resident', data: {
        title: string
        message?: string
        type?: 'info' | 'success' | 'warning' | 'error'
        link?: string
    }) {
        const targetUsers = await db.query.users.findMany({
            where: eq(users.role, role),
            columns: { id: true }
        })

        if (targetUsers.length === 0) return []

        const notificationsData = targetUsers.map(user => ({
            userId: user.id,
            title: data.title,
            message: data.message,
            type: data.type || 'info',
            link: data.link,
        }))

        return await db.insert(notifications).values(notificationsData).returning()
    }
}

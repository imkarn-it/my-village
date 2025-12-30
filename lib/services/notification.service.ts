import { db } from "@/lib/db"
import { notifications, users } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'sos' | 'bill' | 'parcel' | 'booking' | 'maintenance' | 'announcement' | 'visitor'

export const NotificationService = {
    /**
     * Create a single notification
     */
    async create(data: {
        userId: string
        title: string
        message?: string
        type?: NotificationType
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

    /**
     * Create notifications for a specific role
     */
    async createForRole(role: 'admin' | 'security' | 'resident' | 'maintenance' | 'super_admin', data: {
        title: string
        message?: string
        type?: NotificationType
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
    },

    /**
     * Get notifications for a user
     */
    async getByUserId(userId: string, options?: { limit?: number; unreadOnly?: boolean }) {
        const conditions = [eq(notifications.userId, userId)]

        if (options?.unreadOnly) {
            conditions.push(eq(notifications.isRead, false))
        }

        return await db.query.notifications.findMany({
            where: and(...conditions),
            orderBy: [desc(notifications.createdAt)],
            limit: options?.limit || 50,
        })
    },

    /**
     * Get unread count for a user
     */
    async getUnreadCount(userId: string): Promise<number> {
        const unread = await db.query.notifications.findMany({
            where: and(
                eq(notifications.userId, userId),
                eq(notifications.isRead, false)
            ),
            columns: { id: true },
        })
        return unread.length
    },

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string, userId: string) {
        const [updated] = await db.update(notifications)
            .set({ isRead: true })
            .where(and(
                eq(notifications.id, notificationId),
                eq(notifications.userId, userId)
            ))
            .returning()
        return updated
    },

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string) {
        return await db.update(notifications)
            .set({ isRead: true })
            .where(and(
                eq(notifications.userId, userId),
                eq(notifications.isRead, false)
            ))
            .returning()
    },

    /**
     * Delete a notification
     */
    async delete(notificationId: string, userId: string) {
        const [deleted] = await db.delete(notifications)
            .where(and(
                eq(notifications.id, notificationId),
                eq(notifications.userId, userId)
            ))
            .returning()
        return deleted
    },

    // ===== Convenience Methods =====

    /**
     * Send SOS alert to security
     */
    async sendSOS(message: string, link?: string) {
        return this.createForRole('security', {
            type: 'error',
            title: '🚨 แจ้งเหตุฉุกเฉิน SOS',
            message,
            link: link || '/security/sos',
        })
    },

    /**
     * Send bill reminder
     */
    async sendBillReminder(userId: string, billId: string, amount: number, dueDate: string) {
        return this.create({
            userId,
            type: 'warning',
            title: '📄 แจ้งเตือนบิลใกล้ครบกำหนด',
            message: `บิลจำนวน ฿${amount.toLocaleString()} ครบกำหนด ${dueDate}`,
            link: `/resident/bills/${billId}`,
        })
    },

    /**
     * Send parcel arrived notification
     */
    async sendParcelArrived(userId: string, trackingNumber: string) {
        return this.create({
            userId,
            type: 'info',
            title: '📦 พัสดุมาถึงแล้ว',
            message: `พัสดุหมายเลข ${trackingNumber} มาถึงแล้ว กรุณามารับที่ห้อง รปภ.`,
            link: '/resident/parcels',
        })
    },

    /**
     * Send booking status update
     */
    async sendBookingUpdate(userId: string, bookingId: string, facilityName: string, status: string) {
        const statusMessages: Record<string, string> = {
            approved: 'ได้รับการอนุมัติ ✅',
            rejected: 'ถูกปฏิเสธ ❌',
            cancelled: 'ถูกยกเลิก',
        }
        return this.create({
            userId,
            type: status === 'approved' ? 'success' : 'warning',
            title: '📅 อัปเดตการจอง',
            message: `การจอง ${facilityName} ${statusMessages[status] || status}`,
            link: `/resident/bookings/${bookingId}`,
        })
    },

    /**
     * Send maintenance update
     */
    async sendMaintenanceUpdate(userId: string, status: string) {
        const statusMessages: Record<string, string> = {
            in_progress: 'กำลังดำเนินการ 🔧',
            completed: 'เสร็จสิ้นแล้ว ✅',
            pending: 'รอดำเนินการ',
        }
        return this.create({
            userId,
            type: status === 'completed' ? 'success' : 'info',
            title: '🔧 อัปเดตงานซ่อม',
            message: `งานซ่อมของคุณ${statusMessages[status] || status}`,
            link: '/resident/maintenance',
        })
    },

    /**
     * Send visitor arrived notification
     */
    async sendVisitorArrived(userId: string, visitorName: string) {
        return this.create({
            userId,
            type: 'info',
            title: '👋 ผู้มาติดต่อมาถึงแล้ว',
            message: `${visitorName} มาถึงแล้ว กำลังรอที่ประตูหน้า`,
            link: '/resident/visitors',
        })
    },

    /**
     * Send announcement to all residents
     */
    async sendAnnouncement(title: string, preview: string) {
        return this.createForRole('resident', {
            type: 'info',
            title: '📢 ประกาศใหม่: ' + title,
            message: preview.substring(0, 100) + (preview.length > 100 ? '...' : ''),
            link: '/resident/announcements',
        })
    },
}

export default NotificationService

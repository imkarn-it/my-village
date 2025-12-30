/**
 * Push Notification Service - OneSignal Integration
 * Used for sending push notifications to users
 */

import * as OneSignal from '@onesignal/node-onesignal'

// OneSignal Configuration
const configuration = OneSignal.createConfiguration({
    restApiKey: process.env.ONESIGNAL_REST_API_KEY,
})

const client = new OneSignal.DefaultApi(configuration)
const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!

export type PushNotificationType =
    | 'sos'
    | 'bill'
    | 'parcel'
    | 'booking'
    | 'maintenance'
    | 'announcement'
    | 'visitor'
    | 'system'

interface SendPushParams {
    /** OneSignal external user IDs (typically our user IDs) */
    userIds: string[]
    /** Notification title */
    title: string
    /** Notification message */
    message: string
    /** Optional URL to open when clicked */
    url?: string
    /** Notification type for icon/styling */
    type?: PushNotificationType
    /** Additional data to send with notification */
    data?: Record<string, string>
}

/**
 * Get emoji for notification type
 */
function getTypeEmoji(type?: PushNotificationType): string {
    switch (type) {
        case 'sos': return '🚨'
        case 'bill': return '📄'
        case 'parcel': return '📦'
        case 'booking': return '📅'
        case 'maintenance': return '🔧'
        case 'announcement': return '📢'
        case 'visitor': return '👋'
        default: return '🔔'
    }
}

/**
 * Send push notification to specific users
 */
export async function sendPush(params: SendPushParams): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        // Check if OneSignal is configured
        if (!process.env.ONESIGNAL_REST_API_KEY || !APP_ID) {
            console.log('[Push] OneSignal not configured, skipping push notification')
            return { success: true, id: 'skipped' }
        }

        const emoji = getTypeEmoji(params.type)

        const notification = new OneSignal.Notification()
        notification.app_id = APP_ID
        // OneSignal v5 uses include_aliases with external_id
        notification.include_aliases = { external_id: params.userIds }
        notification.target_channel = 'push'
        notification.headings = { en: `${emoji} ${params.title}` }
        notification.contents = { en: params.message }

        if (params.url) {
            notification.url = params.url
        }

        if (params.data) {
            notification.data = params.data
        }

        const response = await client.createNotification(notification)

        console.log('[Push] Notification sent:', response.id)
        return { success: true, id: response.id }
    } catch (error) {
        console.error('[Push] Failed to send notification:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Send push notification to all users
 */
export async function sendPushToAll(params: Omit<SendPushParams, 'userIds'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        if (!process.env.ONESIGNAL_REST_API_KEY || !APP_ID) {
            console.log('[Push] OneSignal not configured, skipping push notification')
            return { success: true, id: 'skipped' }
        }

        const emoji = getTypeEmoji(params.type)

        const notification = new OneSignal.Notification()
        notification.app_id = APP_ID
        notification.included_segments = ['All']
        notification.headings = { en: `${emoji} ${params.title}` }
        notification.contents = { en: params.message }

        if (params.url) {
            notification.url = params.url
        }

        const response = await client.createNotification(notification)

        console.log('[Push] Broadcast notification sent:', response.id)
        return { success: true, id: response.id }
    } catch (error) {
        console.error('[Push] Failed to send broadcast:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

// ===== Convenience Methods =====

export const pushService = {
    /**
     * Send SOS alert to security
     */
    sendSOS: async (securityUserIds: string[], message: string, location?: string) => {
        return sendPush({
            userIds: securityUserIds,
            title: 'แจ้งเหตุฉุกเฉิน SOS',
            message: location ? `${message} (${location})` : message,
            type: 'sos',
            url: '/security/sos',
        })
    },

    /**
     * Send bill reminder
     */
    sendBillReminder: async (userId: string, billId: string, amount: number, dueDate: string) => {
        return sendPush({
            userIds: [userId],
            title: 'แจ้งเตือนบิลใกล้ครบกำหนด',
            message: `บิล ฿${amount.toLocaleString()} ครบกำหนด ${dueDate}`,
            type: 'bill',
            url: `/resident/bills/${billId}`,
        })
    },

    /**
     * Send parcel arrived notification
     */
    sendParcelArrived: async (userId: string, trackingNumber: string) => {
        return sendPush({
            userIds: [userId],
            title: 'พัสดุมาถึงแล้ว',
            message: `พัสดุ ${trackingNumber} รอรับที่ห้อง รปภ.`,
            type: 'parcel',
            url: '/resident/parcels',
        })
    },

    /**
     * Send booking update
     */
    sendBookingUpdate: async (userId: string, bookingId: string, facilityName: string, status: string) => {
        const statusText = status === 'approved' ? 'อนุมัติแล้ว' : status === 'rejected' ? 'ถูกปฏิเสธ' : status
        return sendPush({
            userIds: [userId],
            title: 'อัปเดตการจอง',
            message: `การจอง ${facilityName} ${statusText}`,
            type: 'booking',
            url: `/resident/bookings/${bookingId}`,
        })
    },

    /**
     * Send maintenance update
     */
    sendMaintenanceUpdate: async (userId: string, status: string) => {
        const statusText = status === 'completed' ? 'เสร็จสิ้น' : status === 'in_progress' ? 'กำลังดำเนินการ' : status
        return sendPush({
            userIds: [userId],
            title: 'อัปเดตงานซ่อม',
            message: `งานซ่อมของคุณ${statusText}`,
            type: 'maintenance',
            url: '/resident/maintenance',
        })
    },

    /**
     * Send visitor arrived notification
     */
    sendVisitorArrived: async (userId: string, visitorName: string) => {
        return sendPush({
            userIds: [userId],
            title: 'ผู้มาติดต่อมาถึง',
            message: `${visitorName} รออยู่ที่ประตู`,
            type: 'visitor',
            url: '/resident/visitors',
        })
    },

    /**
     * Broadcast announcement to all users
     */
    broadcastAnnouncement: async (title: string, preview: string) => {
        return sendPushToAll({
            title: 'ประกาศใหม่',
            message: preview.substring(0, 100) + (preview.length > 100 ? '...' : ''),
            type: 'announcement',
            url: '/resident/announcements',
        })
    },
}

export default pushService

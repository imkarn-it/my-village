import { describe, test, expect, vi, beforeEach } from 'vitest'

// Mock OneSignal module
vi.mock('@onesignal/node-onesignal', () => ({
    createConfiguration: vi.fn().mockReturnValue({}),
    DefaultApi: vi.fn().mockImplementation(() => ({
        createNotification: vi.fn().mockResolvedValue({ id: 'notification-123' })
    })),
    Notification: vi.fn().mockImplementation(() => ({
        app_id: '',
        include_aliases: {},
        target_channel: '',
        included_segments: [],
        headings: {},
        contents: {},
        url: '',
        data: {},
    })),
}))

// Import after mocking
import { sendPush, sendPushToAll, pushService } from '../push.service'

describe('Push Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Mock env vars
        process.env.ONESIGNAL_REST_API_KEY = 'test-api-key'
        process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID = 'test-app-id'
    })

    describe('sendPush', () => {
        test('should send push notification to users', async () => {
            const result = await sendPush({
                userIds: ['user-1', 'user-2'],
                title: 'Test Title',
                message: 'Test message',
            })

            expect(result.success).toBe(true)
        })

        test('should skip if OneSignal not configured', async () => {
            delete process.env.ONESIGNAL_REST_API_KEY

            const result = await sendPush({
                userIds: ['user-1'],
                title: 'Test',
                message: 'Test',
            })

            expect(result.success).toBe(true)
            expect(result.id).toBe('skipped')
        })
    })

    describe('sendPushToAll', () => {
        test('should send broadcast notification', async () => {
            const result = await sendPushToAll({
                title: 'Broadcast Test',
                message: 'Message to all users',
            })

            expect(result.success).toBe(true)
        })
    })

    describe('pushService convenience methods', () => {
        test('sendSOS should send SOS notification', async () => {
            const result = await pushService.sendSOS(
                ['security-1', 'security-2'],
                'Emergency at Building A',
                'Building A, Floor 3'
            )

            expect(result.success).toBe(true)
        })

        test('sendBillReminder should send bill notification', async () => {
            const result = await pushService.sendBillReminder(
                'user-123',
                'bill-456',
                1500,
                '2024-01-15'
            )

            expect(result.success).toBe(true)
        })

        test('sendParcelArrived should send parcel notification', async () => {
            const result = await pushService.sendParcelArrived(
                'user-123',
                'TH123456789'
            )

            expect(result.success).toBe(true)
        })

        test('sendBookingUpdate should send booking notification', async () => {
            const result = await pushService.sendBookingUpdate(
                'user-123',
                'booking-789',
                'ห้องประชุม A',
                'approved'
            )

            expect(result.success).toBe(true)
        })

        test('sendMaintenanceUpdate should send maintenance notification', async () => {
            const result = await pushService.sendMaintenanceUpdate(
                'user-123',
                'completed'
            )

            expect(result.success).toBe(true)
        })

        test('sendVisitorArrived should send visitor notification', async () => {
            const result = await pushService.sendVisitorArrived(
                'user-123',
                'สมชาย ใจดี'
            )

            expect(result.success).toBe(true)
        })

        test('broadcastAnnouncement should send to all users', async () => {
            const result = await pushService.broadcastAnnouncement(
                'Important Announcement',
                'This is the announcement preview text that might be very long and need truncation'
            )

            expect(result.success).toBe(true)
        })
    })
})

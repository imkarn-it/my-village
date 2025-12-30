import { describe, test, expect, vi } from 'vitest'

// Mock the database
vi.mock('@/lib/db', () => ({
    db: {
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{ id: 'test-id', title: 'Test' }])
            })
        }),
        update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ id: 'test-id', isRead: true }])
                })
            })
        }),
        delete: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{ id: 'test-id' }])
            })
        }),
        query: {
            notifications: {
                findMany: vi.fn().mockResolvedValue([]),
                findFirst: vi.fn().mockResolvedValue(null)
            },
            users: {
                findMany: vi.fn().mockResolvedValue([{ id: 'user-1' }, { id: 'user-2' }])
            }
        }
    }
}))

// Import after mocking
import { NotificationService } from '../notification.service'

describe('Notification Service', () => {
    describe('create', () => {
        test('should create a notification', async () => {
            const result = await NotificationService.create({
                userId: 'user-123',
                title: 'Test Notification',
                message: 'Test message',
                type: 'info',
            })
            expect(result).toBeDefined()
        })
    })

    describe('getUnreadCount', () => {
        test('should return unread count', async () => {
            const count = await NotificationService.getUnreadCount('user-123')
            expect(typeof count).toBe('number')
            expect(count).toBeGreaterThanOrEqual(0)
        })
    })

    describe('convenience methods', () => {
        test('sendSOS should create error-type notification', async () => {
            const result = await NotificationService.sendSOS('Emergency!')
            expect(result).toBeDefined()
        })

        test('sendBillReminder should create warning-type notification', async () => {
            const result = await NotificationService.sendBillReminder(
                'user-123',
                'bill-456',
                1500,
                '2024-01-15'
            )
            expect(result).toBeDefined()
        })

        test('sendParcelArrived should create info-type notification', async () => {
            const result = await NotificationService.sendParcelArrived(
                'user-123',
                'TH123456789'
            )
            expect(result).toBeDefined()
        })

        test('sendBookingUpdate should create notification with status', async () => {
            const result = await NotificationService.sendBookingUpdate(
                'user-123',
                'booking-789',
                'ห้องประชุม',
                'approved'
            )
            expect(result).toBeDefined()
        })

        test('sendMaintenanceUpdate should create notification with status', async () => {
            const result = await NotificationService.sendMaintenanceUpdate(
                'user-123',
                'completed'
            )
            expect(result).toBeDefined()
        })

        test('sendVisitorArrived should create visitor notification', async () => {
            const result = await NotificationService.sendVisitorArrived(
                'user-123',
                'สมชาย ใจดี'
            )
            expect(result).toBeDefined()
        })

        test('sendAnnouncement should create notifications for residents', async () => {
            const result = await NotificationService.sendAnnouncement(
                'ประกาศสำคัญ',
                'รายละเอียดประกาศ'
            )
            expect(result).toBeDefined()
        })
    })
})

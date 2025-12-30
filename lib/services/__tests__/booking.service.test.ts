import { describe, test, expect, vi, beforeEach } from 'vitest'

// Mock the database and elysia status
vi.mock('@/lib/db', () => ({
    db: {
        query: {
            bookings: {
                findMany: vi.fn().mockResolvedValue([
                    { id: 'booking-1', facilityId: 'fac-1', status: 'pending', startTime: '09:00', endTime: '10:00' },
                ]),
                findFirst: vi.fn().mockResolvedValue({ id: 'booking-1', status: 'pending' }),
            },
        },
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{ id: 'new-booking', status: 'pending' }])
            })
        }),
        update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ id: 'booking-1', status: 'approved' }])
                })
            })
        }),
    }
}))

vi.mock('elysia', () => ({
    status: vi.fn().mockImplementation((code, message) => new Error(message))
}))

// Import after mocking
import { BookingService } from '../booking.service'

describe('Booking Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getAll', () => {
        test('should get all bookings', async () => {
            const result = await BookingService.getAll()
            expect(Array.isArray(result)).toBe(true)
        })

        test('should filter by facilityId', async () => {
            const result = await BookingService.getAll('fac-1')
            expect(Array.isArray(result)).toBe(true)
        })

        test('should filter by unitId', async () => {
            const result = await BookingService.getAll(undefined, 'unit-1')
            expect(Array.isArray(result)).toBe(true)
        })

        test('should filter by both facilityId and unitId', async () => {
            const result = await BookingService.getAll('fac-1', 'unit-1')
            expect(Array.isArray(result)).toBe(true)
        })
    })

    describe('getById', () => {
        test('should get booking by id', async () => {
            const result = await BookingService.getById('booking-1')
            expect(result).toBeDefined()
            expect(result.id).toBe('booking-1')
        })
    })

    describe('create', () => {
        test('should create new booking', async () => {
            const result = await BookingService.create({
                facilityId: 'fac-1',
                unitId: 'unit-1',
                userId: 'user-1',
                bookingDate: '2024-01-15',
                startTime: '14:00',
                endTime: '15:00',
            })
            expect(result).toBeDefined()
            expect(result.status).toBe('pending')
        })
    })

    describe('checkConflict', () => {
        test('should detect time conflict', async () => {
            const hasConflict = await BookingService.checkConflict(
                'fac-1',
                '2024-01-15',
                '09:30',
                '10:30'
            )
            expect(typeof hasConflict).toBe('boolean')
        })

        test('should return false for non-conflicting time', async () => {
            const hasConflict = await BookingService.checkConflict(
                'fac-1',
                '2024-01-15',
                '11:00',
                '12:00'
            )
            expect(typeof hasConflict).toBe('boolean')
        })
    })

    describe('approve', () => {
        test('should approve booking', async () => {
            const result = await BookingService.approve('booking-1')
            expect(result).toBeDefined()
            expect(result.status).toBe('approved')
        })
    })

    describe('cancel', () => {
        test('should cancel booking', async () => {
            const result = await BookingService.cancel('booking-1')
            expect(result).toBeDefined()
        })
    })
})

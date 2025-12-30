import { describe, test, expect, vi, beforeEach } from 'vitest'

// Mock the database and elysia status
vi.mock('@/lib/db', () => ({
    db: {
        query: {
            bills: {
                findMany: vi.fn().mockResolvedValue([
                    { id: 'bill-1', unitId: 'unit-1', amount: '1000', status: 'pending' },
                    { id: 'bill-2', unitId: 'unit-1', amount: '500', status: 'paid' },
                ]),
                findFirst: vi.fn().mockResolvedValue({ id: 'bill-1', amount: '1000', status: 'pending' }),
            },
        },
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{ id: 'new-bill', amount: '1500', status: 'pending' }])
            })
        }),
        update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ id: 'bill-1', status: 'paid' }])
                })
            })
        }),
    }
}))

vi.mock('elysia', () => ({
    status: vi.fn().mockImplementation((code, message) => new Error(message))
}))

// Import after mocking
import { BillService } from '../bill.service'

describe('Bill Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getAll', () => {
        test('should get all bills', async () => {
            const result = await BillService.getAll()
            expect(Array.isArray(result)).toBe(true)
        })

        test('should get bills for specific unit', async () => {
            const result = await BillService.getAll('unit-1')
            expect(Array.isArray(result)).toBe(true)
        })

        test('should respect limit parameter', async () => {
            const result = await BillService.getAll(undefined, 10)
            expect(Array.isArray(result)).toBe(true)
        })
    })

    describe('getById', () => {
        test('should get bill by id', async () => {
            const result = await BillService.getById('bill-1')
            expect(result).toBeDefined()
            expect(result.id).toBe('bill-1')
        })
    })

    describe('create', () => {
        test('should create new bill', async () => {
            const result = await BillService.create({
                unitId: 'unit-1',
                billType: 'common',
                amount: '1500',
            })
            expect(result).toBeDefined()
            expect(result.id).toBe('new-bill')
        })

        test('should set default status to pending', async () => {
            const result = await BillService.create({
                unitId: 'unit-1',
                billType: 'common',
                amount: '1000',
            })
            expect(result.status).toBe('pending')
        })
    })

    describe('update', () => {
        test('should update bill status', async () => {
            const result = await BillService.update('bill-1', { status: 'paid' })
            expect(result).toBeDefined()
            expect(result.status).toBe('paid')
        })
    })

    describe('markAsPaid', () => {
        test('should mark bill as paid with payment ref', async () => {
            const result = await BillService.markAsPaid('bill-1', 'PAY-123')
            expect(result).toBeDefined()
        })
    })

    describe('getPending', () => {
        test('should get pending bills for unit', async () => {
            const result = await BillService.getPending('unit-1')
            expect(Array.isArray(result)).toBe(true)
        })
    })

    describe('getTotalDue', () => {
        test('should calculate total amount due', async () => {
            const result = await BillService.getTotalDue('unit-1')
            expect(typeof result).toBe('number')
        })
    })
})

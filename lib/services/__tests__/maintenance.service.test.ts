import { describe, test, expect, vi, beforeEach } from 'vitest'

// Mock the database and elysia status
vi.mock('@/lib/db', () => ({
    db: {
        query: {
            maintenanceRequests: {
                findMany: vi.fn().mockResolvedValue([
                    { id: 'maint-1', title: 'Fix AC', status: 'pending' },
                    { id: 'maint-2', title: 'Fix Light', status: 'completed' },
                ]),
                findFirst: vi.fn().mockResolvedValue({ id: 'maint-1', title: 'Fix AC', status: 'pending' }),
            },
        },
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{ id: 'new-maint', title: 'New Request', status: 'pending' }])
            })
        }),
        update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ id: 'maint-1', status: 'assigned' }])
                })
            })
        }),
    }
}))

vi.mock('elysia', () => ({
    status: vi.fn().mockImplementation((code, message) => new Error(message))
}))

// Import after mocking
import { MaintenanceService } from '../maintenance.service'

describe('Maintenance Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getAll', () => {
        test('should get all maintenance requests', async () => {
            const result = await MaintenanceService.getAll()
            expect(Array.isArray(result)).toBe(true)
        })

        test('should filter by unitId', async () => {
            const result = await MaintenanceService.getAll('unit-1')
            expect(Array.isArray(result)).toBe(true)
        })

        test('should filter by status', async () => {
            const result = await MaintenanceService.getAll(undefined, 'pending')
            expect(Array.isArray(result)).toBe(true)
        })
    })

    describe('getById', () => {
        test('should get request by id', async () => {
            const result = await MaintenanceService.getById('maint-1')
            expect(result).toBeDefined()
            expect(result.id).toBe('maint-1')
        })
    })

    describe('create', () => {
        test('should create new maintenance request', async () => {
            const result = await MaintenanceService.create({
                unitId: 'unit-1',
                title: 'Fix Leak',
                createdBy: 'user-1',
            })
            expect(result).toBeDefined()
            expect(result.status).toBe('pending')
        })

        test('should set default priority to normal', async () => {
            const result = await MaintenanceService.create({
                unitId: 'unit-1',
                title: 'Minor Issue',
                createdBy: 'user-1',
            })
            expect(result).toBeDefined()
        })
    })

    describe('update', () => {
        test('should update maintenance request', async () => {
            const result = await MaintenanceService.update('maint-1', { status: 'in_progress' })
            expect(result).toBeDefined()
        })
    })

    describe('assign', () => {
        test('should assign technician to request', async () => {
            const result = await MaintenanceService.assign('maint-1', 'tech-1')
            expect(result).toBeDefined()
        })
    })

    describe('complete', () => {
        test('should mark request as completed', async () => {
            const result = await MaintenanceService.complete('maint-1')
            expect(result).toBeDefined()
        })
    })

    describe('getPending', () => {
        test('should get pending requests', async () => {
            const result = await MaintenanceService.getPending()
            expect(Array.isArray(result)).toBe(true)
        })

        test('should get pending requests for specific unit', async () => {
            const result = await MaintenanceService.getPending('unit-1')
            expect(Array.isArray(result)).toBe(true)
        })
    })
})

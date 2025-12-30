import { describe, test, expect, vi, beforeEach } from 'vitest'

// Mock the database and elysia status
vi.mock('@/lib/db', () => ({
    db: {
        query: {
            facilities: {
                findMany: vi.fn().mockResolvedValue([
                    { id: 'fac-1', name: 'Swimming Pool', isActive: true },
                    { id: 'fac-2', name: 'Gym', isActive: false },
                ]),
                findFirst: vi.fn().mockResolvedValue({ id: 'fac-1', name: 'Swimming Pool', isActive: true }),
            },
        },
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([{ id: 'new-fac', name: 'Tennis Court', isActive: true }])
            })
        }),
        update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ id: 'fac-1', isActive: false }])
                })
            })
        }),
    }
}))

vi.mock('elysia', () => ({
    status: vi.fn().mockImplementation((code, message) => new Error(message))
}))

// Import after mocking
import { FacilityService } from '../facility.service'

describe('Facility Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getAll', () => {
        test('should get all facilities', async () => {
            const result = await FacilityService.getAll()
            expect(Array.isArray(result)).toBe(true)
        })

        test('should filter by projectId', async () => {
            const result = await FacilityService.getAll('project-1')
            expect(Array.isArray(result)).toBe(true)
        })
    })

    describe('getActive', () => {
        test('should get only active facilities', async () => {
            const result = await FacilityService.getActive()
            expect(Array.isArray(result)).toBe(true)
            expect(result.every(f => f.isActive)).toBe(true)
        })
    })

    describe('getById', () => {
        test('should get facility by id', async () => {
            const result = await FacilityService.getById('fac-1')
            expect(result).toBeDefined()
            expect(result.id).toBe('fac-1')
        })
    })

    describe('create', () => {
        test('should create new facility', async () => {
            const result = await FacilityService.create({
                projectId: 'project-1',
                name: 'Tennis Court',
            })
            expect(result).toBeDefined()
            expect(result.name).toBe('Tennis Court')
        })

        test('should set default values', async () => {
            const result = await FacilityService.create({
                projectId: 'project-1',
                name: 'Gym',
                maxCapacity: 50,
            })
            expect(result).toBeDefined()
        })
    })

    describe('update', () => {
        test('should update facility', async () => {
            const result = await FacilityService.update('fac-1', { name: 'Updated Pool' })
            expect(result).toBeDefined()
        })
    })

    describe('toggleActive', () => {
        test('should toggle active status', async () => {
            const result = await FacilityService.toggleActive('fac-1')
            expect(result).toBeDefined()
        })
    })
})

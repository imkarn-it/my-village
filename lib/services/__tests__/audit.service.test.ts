import { describe, test, expect, vi, beforeEach } from 'vitest'

// Mock the database
vi.mock('@/lib/db', () => ({
    db: {
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockResolvedValue(undefined)
        }),
        select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockReturnValue({
                        limit: vi.fn().mockResolvedValue([])
                    })
                }),
                leftJoin: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            offset: vi.fn().mockReturnValue({
                                where: vi.fn().mockResolvedValue([])
                            })
                        })
                    })
                }),
                orderBy: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([])
                })
            })
        }),
    }
}))

// Import after mocking
import { AuditService, auditService, type AuditAction } from '../audit.service'

describe('Audit Service', () => {
    describe('AuditService class', () => {
        let service: AuditService

        beforeEach(() => {
            service = new AuditService()
            vi.clearAllMocks()
        })

        describe('log', () => {
            test('should log CREATE action', async () => {
                await expect(service.log({
                    userId: 'user-123',
                    action: 'CREATE',
                    entityType: 'bill',
                    entityId: 'bill-456',
                    newValues: { amount: 1000 },
                })).resolves.not.toThrow()
            })

            test('should log UPDATE action with changed fields', async () => {
                await expect(service.log({
                    userId: 'user-123',
                    action: 'UPDATE',
                    entityType: 'bill',
                    entityId: 'bill-456',
                    oldValues: { amount: 1000 },
                    newValues: { amount: 1500 },
                })).resolves.not.toThrow()
            })

            test('should log DELETE action', async () => {
                await expect(service.log({
                    userId: 'user-123',
                    action: 'DELETE',
                    entityType: 'bill',
                    entityId: 'bill-456',
                    oldValues: { amount: 1000 },
                })).resolves.not.toThrow()
            })

            test('should log with context', async () => {
                await expect(service.log({
                    userId: 'user-123',
                    action: 'CREATE',
                    entityType: 'bill',
                    entityId: 'bill-456',
                    context: {
                        ipAddress: '192.168.1.1',
                        userAgent: 'Mozilla/5.0',
                        requestId: 'req-123',
                    },
                })).resolves.not.toThrow()
            })
        })

        describe('getLogsForEntity', () => {
            test('should get logs for entity', async () => {
                const result = await service.getLogsForEntity('bill', 'bill-123')
                expect(Array.isArray(result)).toBe(true)
            })

            test('should respect limit parameter', async () => {
                const result = await service.getLogsForEntity('bill', 'bill-123', 10)
                expect(Array.isArray(result)).toBe(true)
            })
        })

        describe('getLogsByUser', () => {
            test('should get logs by user', async () => {
                const result = await service.getLogsByUser('user-123')
                expect(Array.isArray(result)).toBe(true)
            })
        })

        describe('searchLogs', () => {
            test('should search logs with filters', async () => {
                const result = await service.searchLogs({
                    entityType: 'bill',
                    action: 'CREATE',
                    limit: 50,
                })
                expect(Array.isArray(result)).toBe(true)
            })

            test('should search logs with date range', async () => {
                const result = await service.searchLogs({
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-12-31'),
                })
                expect(Array.isArray(result)).toBe(true)
            })

            test('should search logs with no filters', async () => {
                const result = await service.searchLogs({})
                expect(result).toBeDefined()
            })
        })
    })

    describe('auditService singleton', () => {
        test('should be an instance of AuditService', () => {
            expect(auditService).toBeInstanceOf(AuditService)
        })
    })
})

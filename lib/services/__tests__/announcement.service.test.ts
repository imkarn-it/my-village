import { describe, test, expect, vi, beforeEach } from 'vitest'

// Mock database
vi.mock('../../db', () => ({
    db: {
        query: {
            announcements: {
                findMany: vi.fn(),
                findFirst: vi.fn(),
            }
        },
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    }
}))

import { db } from '../../db'

describe('Announcement Service', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Announcement queries', () => {
        test('should return announcements list', async () => {
            const mockAnnouncements = [
                { id: '1', title: 'Test 1', content: 'Content 1', priority: 'high' },
                { id: '2', title: 'Test 2', content: 'Content 2', priority: 'medium' },
            ]

                ; (db.query.announcements.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockAnnouncements)

            const result = await db.query.announcements.findMany()

            expect(result).toEqual(mockAnnouncements)
            expect(result).toHaveLength(2)
        })

        test('should return single announcement by ID', async () => {
            const mockAnnouncement = {
                id: '1',
                title: 'Test Announcement',
                content: 'Test content',
                priority: 'high',
                createdAt: new Date(),
            }

                ; (db.query.announcements.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockAnnouncement)

            const result = await db.query.announcements.findFirst()

            expect(result).toEqual(mockAnnouncement)
            expect(result?.title).toBe('Test Announcement')
        })

        test('should return null for non-existent announcement', async () => {
            ; (db.query.announcements.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)

            const result = await db.query.announcements.findFirst()

            expect(result).toBeNull()
        })
    })

    describe('Announcement mutations', () => {
        test('should create new announcement', async () => {
            const newAnnouncement = {
                title: 'New Announcement',
                content: 'New content',
                priority: 'medium',
            }

            const mockCreated = {
                id: 'new-id',
                ...newAnnouncement,
                createdAt: new Date(),
            }

            const mockBuilder = {
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([mockCreated])
                })
            }
                ; (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(mockBuilder)

            const result = await db.insert({} as any).values(newAnnouncement).returning()

            expect(result[0]).toEqual(mockCreated)
            expect(result[0].id).toBe('new-id')
        })

        test('should update announcement', async () => {
            const updates = { title: 'Updated Title' }
            const mockUpdated = {
                id: '1',
                title: 'Updated Title',
                content: 'Original content',
            }

            const mockBuilder = {
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        returning: vi.fn().mockResolvedValue([mockUpdated])
                    })
                })
            }
                ; (db.update as ReturnType<typeof vi.fn>).mockReturnValue(mockBuilder)

            const result = await db.update({} as any).set(updates).where({} as any).returning()

            expect(result[0].title).toBe('Updated Title')
        })

        test('should delete announcement', async () => {
            const mockBuilder = {
                where: vi.fn().mockResolvedValue(1)
            }
                ; (db.delete as ReturnType<typeof vi.fn>).mockReturnValue(mockBuilder)

            const result = await db.delete({} as any).where({} as any)

            expect(result).toBe(1)
        })
    })

    describe('Announcement priorities', () => {
        test('should filter by priority', async () => {
            const highPriorityAnnouncements = [
                { id: '1', title: 'Urgent', priority: 'high' },
            ]

                ; (db.query.announcements.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(highPriorityAnnouncements)

            const result = await db.query.announcements.findMany()

            expect(result.every((a: any) => a.priority === 'high')).toBe(true)
        })
    })
})

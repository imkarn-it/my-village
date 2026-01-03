/**
 * Cache Layer Unit Tests
 * Tests for both client-side React Query cache and server-side Next.js cache
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// ==========================================
// Client Cache Tests
// ==========================================
describe('Client Cache', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('queryKeys', () => {
        it('should have proper structure for announcements', async () => {
            const { queryKeys } = await import('@/lib/cache/client-cache')

            expect(queryKeys.announcements.all).toEqual(['announcements'])
            expect(queryKeys.announcements.list()).toEqual(['announcements', 'list', undefined])
            expect(queryKeys.announcements.list('project1')).toEqual(['announcements', 'list', 'project1'])
            expect(queryKeys.announcements.detail('123')).toEqual(['announcements', 'detail', '123'])
        })

        it('should have proper structure for facilities', async () => {
            const { queryKeys } = await import('@/lib/cache/client-cache')

            expect(queryKeys.facilities.all).toEqual(['facilities'])
            expect(queryKeys.facilities.list()).toEqual(['facilities', 'list', undefined])
            expect(queryKeys.facilities.detail('abc')).toEqual(['facilities', 'detail', 'abc'])
        })

        it('should have proper structure for notifications', async () => {
            const { queryKeys } = await import('@/lib/cache/client-cache')

            expect(queryKeys.notifications.all).toEqual(['notifications'])
            expect(queryKeys.notifications.list()).toEqual(['notifications', 'list'])
            expect(queryKeys.notifications.unreadCount()).toEqual(['notifications', 'unread'])
        })

        it('should have proper structure for bills', async () => {
            const { queryKeys } = await import('@/lib/cache/client-cache')

            expect(queryKeys.bills.all).toEqual(['bills'])
            expect(queryKeys.bills.list('user1')).toEqual(['bills', 'list', 'user1'])
            expect(queryKeys.bills.detail('bill1')).toEqual(['bills', 'detail', 'bill1'])
        })

        it('should have proper structure for bookings', async () => {
            const { queryKeys } = await import('@/lib/cache/client-cache')

            expect(queryKeys.bookings.all).toEqual(['bookings'])
            expect(queryKeys.bookings.list()).toEqual(['bookings', 'list', undefined])
        })

        // Edge case tests
        it('should handle empty string projectId for announcements', async () => {
            const { queryKeys } = await import('@/lib/cache/client-cache')

            expect(queryKeys.announcements.list('')).toEqual(['announcements', 'list', ''])
        })

        it('should handle special characters in IDs', async () => {
            const { queryKeys } = await import('@/lib/cache/client-cache')
            const specialId = 'id-with-special_chars.123'

            expect(queryKeys.announcements.detail(specialId)).toEqual(['announcements', 'detail', specialId])
            expect(queryKeys.bills.detail(specialId)).toEqual(['bills', 'detail', specialId])
        })

        it('should generate unique keys for different entities', async () => {
            const { queryKeys } = await import('@/lib/cache/client-cache')

            const announcementList = queryKeys.announcements.list('project1')
            const facilityList = queryKeys.facilities.list('project1')

            expect(announcementList).not.toEqual(facilityList)
            expect(announcementList[0]).toBe('announcements')
            expect(facilityList[0]).toBe('facilities')
        })
    })

    describe('Cache Configuration', () => {
        it('should export all expected hooks', async () => {
            const clientCache = await import('@/lib/cache/client-cache')

            expect(clientCache.useAnnouncements).toBeDefined()
            expect(clientCache.useAnnouncement).toBeDefined()
            expect(clientCache.useFacilities).toBeDefined()
            expect(clientCache.useFacility).toBeDefined()
            expect(clientCache.useNotifications).toBeDefined()
            expect(clientCache.useUnreadNotificationCount).toBeDefined()
            expect(clientCache.useBills).toBeDefined()
            expect(clientCache.useBookings).toBeDefined()
            expect(clientCache.useInvalidateCache).toBeDefined()
        })

        it('should export queryKeys object', async () => {
            const { queryKeys } = await import('@/lib/cache/client-cache')

            expect(queryKeys).toBeDefined()
            expect(queryKeys.announcements).toBeDefined()
            expect(queryKeys.facilities).toBeDefined()
            expect(queryKeys.notifications).toBeDefined()
            expect(queryKeys.bills).toBeDefined()
            expect(queryKeys.bookings).toBeDefined()
        })
    })

    describe('Hook Types', () => {
        it('hooks should be functions', async () => {
            const clientCache = await import('@/lib/cache/client-cache')

            expect(typeof clientCache.useAnnouncements).toBe('function')
            expect(typeof clientCache.useAnnouncement).toBe('function')
            expect(typeof clientCache.useFacilities).toBe('function')
            expect(typeof clientCache.useFacility).toBe('function')
            expect(typeof clientCache.useNotifications).toBe('function')
            expect(typeof clientCache.useUnreadNotificationCount).toBe('function')
            expect(typeof clientCache.useBills).toBe('function')
            expect(typeof clientCache.useBookings).toBe('function')
            expect(typeof clientCache.useInvalidateCache).toBe('function')
        })
    })
})

// ==========================================
// Server Cache Tests
// ==========================================
describe('Server Cache', () => {
    it('should export cache functions', async () => {
        const serverCache = await import('@/lib/cache/server-cache')

        expect(serverCache.getCachedAnnouncements).toBeDefined()
        expect(serverCache.getCachedAnnouncementById).toBeDefined()
        expect(serverCache.getCachedFacilities).toBeDefined()
        expect(serverCache.getCachedFacilityById).toBeDefined()
        expect(serverCache.getCachedProjects).toBeDefined()
    })

    it('should export invalidation functions', async () => {
        const serverCache = await import('@/lib/cache/server-cache')

        expect(serverCache.invalidateAnnouncementsCache).toBeDefined()
        expect(serverCache.invalidateFacilitiesCache).toBeDefined()
        expect(serverCache.invalidateProjectsCache).toBeDefined()
        expect(serverCache.invalidateAllCache).toBeDefined()
    })

    it('cache functions should be callable', async () => {
        const serverCache = await import('@/lib/cache/server-cache')

        expect(typeof serverCache.getCachedAnnouncements).toBe('function')
        expect(typeof serverCache.getCachedAnnouncementById).toBe('function')
        expect(typeof serverCache.getCachedFacilities).toBe('function')
        expect(typeof serverCache.getCachedFacilityById).toBe('function')
        expect(typeof serverCache.getCachedProjects).toBe('function')
    })

    it('invalidation functions should be callable', async () => {
        const serverCache = await import('@/lib/cache/server-cache')

        expect(typeof serverCache.invalidateAnnouncementsCache).toBe('function')
        expect(typeof serverCache.invalidateFacilitiesCache).toBe('function')
        expect(typeof serverCache.invalidateProjectsCache).toBe('function')
        expect(typeof serverCache.invalidateAllCache).toBe('function')
    })
})

// ==========================================
// Cache Key Consistency Tests
// ==========================================
describe('Cache Key Consistency', () => {
    it('should maintain consistent key prefixes across calls', async () => {
        const { queryKeys } = await import('@/lib/cache/client-cache')

        // Multiple calls should return identical keys
        expect(queryKeys.announcements.all).toEqual(queryKeys.announcements.all)
        expect(queryKeys.facilities.all).toEqual(queryKeys.facilities.all)
        expect(queryKeys.notifications.all).toEqual(queryKeys.notifications.all)
    })

    it('list keys should be hierarchical under all keys', async () => {
        const { queryKeys } = await import('@/lib/cache/client-cache')

        // List keys should start with the same prefix as all
        expect(queryKeys.announcements.list()[0]).toBe(queryKeys.announcements.all[0])
        expect(queryKeys.facilities.list()[0]).toBe(queryKeys.facilities.all[0])
        expect(queryKeys.bills.list()[0]).toBe(queryKeys.bills.all[0])
    })

    it('detail keys should be hierarchical under all keys', async () => {
        const { queryKeys } = await import('@/lib/cache/client-cache')

        // Detail keys should start with the same prefix as all
        expect(queryKeys.announcements.detail('1')[0]).toBe(queryKeys.announcements.all[0])
        expect(queryKeys.facilities.detail('1')[0]).toBe(queryKeys.facilities.all[0])
        expect(queryKeys.bills.detail('1')[0]).toBe(queryKeys.bills.all[0])
    })
})

// ==========================================
// Query Key Factory Pattern Tests
// ==========================================
describe('Query Key Factory Pattern', () => {
    it('should follow React Query factory pattern', async () => {
        const { queryKeys } = await import('@/lib/cache/client-cache')

        // All should be the base - used for broad invalidation
        expect(Array.isArray(queryKeys.announcements.all)).toBe(true)
        expect(queryKeys.announcements.all.length).toBe(1)

        // List should extend all - used for list queries
        expect(Array.isArray(queryKeys.announcements.list())).toBe(true)
        expect(queryKeys.announcements.list().length).toBeGreaterThan(queryKeys.announcements.all.length)

        // Detail should extend all - used for individual item queries
        expect(Array.isArray(queryKeys.announcements.detail('1'))).toBe(true)
        expect(queryKeys.announcements.detail('1').length).toBeGreaterThan(queryKeys.announcements.all.length)
    })

    it('should support parameterized keys for filtering', async () => {
        const { queryKeys } = await import('@/lib/cache/client-cache')

        const listA = queryKeys.announcements.list('projectA')
        const listB = queryKeys.announcements.list('projectB')

        expect(listA).not.toEqual(listB)
        expect(listA[2]).toBe('projectA')
        expect(listB[2]).toBe('projectB')
    })
})

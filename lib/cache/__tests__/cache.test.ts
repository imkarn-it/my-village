/**
 * Client Cache Hooks Unit Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

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
    })
})

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
})

// Server-side caching (unstable_cache)
export {
    getCachedAnnouncements,
    getCachedAnnouncementById,
    getCachedFacilities,
    getCachedFacilityById,
    getCachedProjects,
    invalidateAnnouncementsCache,
    invalidateFacilitiesCache,
    invalidateProjectsCache,
    invalidateAllCache,
} from './server-cache'

// Client-side caching (React Query)
export {
    queryKeys,
    useAnnouncements,
    useAnnouncement,
    useFacilities,
    useFacility,
    useNotifications,
    useUnreadNotificationCount,
    useBills,
    useBookings,
    useInvalidateCache,
} from './client-cache'

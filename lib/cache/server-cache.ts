import { unstable_cache } from 'next/cache'
import { db } from '@/lib/db'
import { announcements, facilities, projects } from '@/lib/db/schema'
import { eq, desc, and, isNull, gte } from 'drizzle-orm'

// ==========================================
// Announcements Cache (5 minutes)
// ==========================================
export const getCachedAnnouncements = unstable_cache(
    async (projectId?: string) => {
        const query = db
            .select()
            .from(announcements)
            .where(
                and(
                    isNull(announcements.deletedAt),
                    projectId ? eq(announcements.projectId, projectId) : undefined
                )
            )
            .orderBy(desc(announcements.createdAt))
            .limit(20)

        return await query
    },
    ['announcements'],
    {
        revalidate: 300, // 5 minutes
        tags: ['announcements'],
    }
)

export const getCachedAnnouncementById = unstable_cache(
    async (id: string) => {
        const result = await db
            .select()
            .from(announcements)
            .where(
                and(
                    eq(announcements.id, id),
                    isNull(announcements.deletedAt)
                )
            )
            .limit(1)

        return result[0] || null
    },
    ['announcement'],
    {
        revalidate: 300,
        tags: ['announcements'],
    }
)

// ==========================================
// Facilities Cache (10 minutes - rarely changes)
// ==========================================
export const getCachedFacilities = unstable_cache(
    async (projectId?: string) => {
        const query = db
            .select()
            .from(facilities)
            .where(
                and(
                    isNull(facilities.deletedAt),
                    projectId ? eq(facilities.projectId, projectId) : undefined
                )
            )
            .orderBy(facilities.name)

        return await query
    },
    ['facilities'],
    {
        revalidate: 600, // 10 minutes
        tags: ['facilities'],
    }
)

export const getCachedFacilityById = unstable_cache(
    async (id: string) => {
        const result = await db
            .select()
            .from(facilities)
            .where(
                and(
                    eq(facilities.id, id),
                    isNull(facilities.deletedAt)
                )
            )
            .limit(1)

        return result[0] || null
    },
    ['facility'],
    {
        revalidate: 600,
        tags: ['facilities'],
    }
)

// ==========================================
// Projects Cache (30 minutes - very rarely changes)
// ==========================================
export const getCachedProjects = unstable_cache(
    async () => {
        return await db
            .select()
            .from(projects)
            .where(isNull(projects.deletedAt))
            .orderBy(projects.name)
    },
    ['projects'],
    {
        revalidate: 1800, // 30 minutes
        tags: ['projects'],
    }
)

// ==========================================
// Cache Invalidation Helpers
// ==========================================
import { revalidateTag } from 'next/cache'

export function invalidateAnnouncementsCache() {
    revalidateTag('announcements', 'max')
}

export function invalidateFacilitiesCache() {
    revalidateTag('facilities', 'max')
}

export function invalidateProjectsCache() {
    revalidateTag('projects', 'max')
}

export function invalidateAllCache() {
    revalidateTag('announcements', 'max')
    revalidateTag('facilities', 'max')
    revalidateTag('projects', 'max')
}


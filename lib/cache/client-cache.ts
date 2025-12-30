'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ==========================================
// Query Keys
// ==========================================
export const queryKeys = {
    announcements: {
        all: ['announcements'] as const,
        list: (projectId?: string) => [...queryKeys.announcements.all, 'list', projectId] as const,
        detail: (id: string) => [...queryKeys.announcements.all, 'detail', id] as const,
    },
    facilities: {
        all: ['facilities'] as const,
        list: (projectId?: string) => [...queryKeys.facilities.all, 'list', projectId] as const,
        detail: (id: string) => [...queryKeys.facilities.all, 'detail', id] as const,
    },
    notifications: {
        all: ['notifications'] as const,
        list: () => [...queryKeys.notifications.all, 'list'] as const,
        unreadCount: () => [...queryKeys.notifications.all, 'unread'] as const,
    },
    bills: {
        all: ['bills'] as const,
        list: (userId?: string) => [...queryKeys.bills.all, 'list', userId] as const,
        detail: (id: string) => [...queryKeys.bills.all, 'detail', id] as const,
    },
    bookings: {
        all: ['bookings'] as const,
        list: (userId?: string) => [...queryKeys.bookings.all, 'list', userId] as const,
        detail: (id: string) => [...queryKeys.bookings.all, 'detail', id] as const,
    },
}

// ==========================================
// Announcements Hooks
// ==========================================
export function useAnnouncements(projectId?: string) {
    return useQuery({
        queryKey: queryKeys.announcements.list(projectId),
        queryFn: async () => {
            const res = await fetch(`/api/announcements${projectId ? `?projectId=${projectId}` : ''}`)
            if (!res.ok) throw new Error('Failed to fetch announcements')
            return res.json()
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

export function useAnnouncement(id: string) {
    return useQuery({
        queryKey: queryKeys.announcements.detail(id),
        queryFn: async () => {
            const res = await fetch(`/api/announcements/${id}`)
            if (!res.ok) throw new Error('Failed to fetch announcement')
            return res.json()
        },
        enabled: !!id,
    })
}

// ==========================================
// Facilities Hooks
// ==========================================
export function useFacilities(projectId?: string) {
    return useQuery({
        queryKey: queryKeys.facilities.list(projectId),
        queryFn: async () => {
            const res = await fetch(`/api/facilities${projectId ? `?projectId=${projectId}` : ''}`)
            if (!res.ok) throw new Error('Failed to fetch facilities')
            return res.json()
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    })
}

export function useFacility(id: string) {
    return useQuery({
        queryKey: queryKeys.facilities.detail(id),
        queryFn: async () => {
            const res = await fetch(`/api/facilities/${id}`)
            if (!res.ok) throw new Error('Failed to fetch facility')
            return res.json()
        },
        enabled: !!id,
    })
}

// ==========================================
// Notifications Hooks
// ==========================================
export function useNotifications() {
    return useQuery({
        queryKey: queryKeys.notifications.list(),
        queryFn: async () => {
            const res = await fetch('/api/notifications')
            if (!res.ok) throw new Error('Failed to fetch notifications')
            return res.json()
        },
        staleTime: 1 * 60 * 1000, // 1 minute (more frequent updates)
    })
}

export function useUnreadNotificationCount() {
    return useQuery({
        queryKey: queryKeys.notifications.unreadCount(),
        queryFn: async () => {
            const res = await fetch('/api/notifications?unreadOnly=true')
            if (!res.ok) return { count: 0 }
            const data = await res.json()
            return { count: Array.isArray(data) ? data.length : 0 }
        },
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 60 * 1000, // Refetch every minute
    })
}

// ==========================================
// Bills Hooks
// ==========================================
export function useBills(userId?: string) {
    return useQuery({
        queryKey: queryKeys.bills.list(userId),
        queryFn: async () => {
            const res = await fetch(`/api/bills${userId ? `?userId=${userId}` : ''}`)
            if (!res.ok) throw new Error('Failed to fetch bills')
            return res.json()
        },
        staleTime: 5 * 60 * 1000,
    })
}

// ==========================================
// Bookings Hooks
// ==========================================
export function useBookings(userId?: string) {
    return useQuery({
        queryKey: queryKeys.bookings.list(userId),
        queryFn: async () => {
            const res = await fetch(`/api/bookings${userId ? `?userId=${userId}` : ''}`)
            if (!res.ok) throw new Error('Failed to fetch bookings')
            return res.json()
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
    })
}

// ==========================================
// Invalidation Hooks
// ==========================================
export function useInvalidateCache() {
    const queryClient = useQueryClient()

    return {
        invalidateAnnouncements: () =>
            queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all }),
        invalidateFacilities: () =>
            queryClient.invalidateQueries({ queryKey: queryKeys.facilities.all }),
        invalidateNotifications: () =>
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
        invalidateBills: () =>
            queryClient.invalidateQueries({ queryKey: queryKeys.bills.all }),
        invalidateBookings: () =>
            queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all }),
        invalidateAll: () => queryClient.invalidateQueries(),
    }
}

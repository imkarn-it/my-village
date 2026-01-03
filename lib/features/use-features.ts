'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import type { FeatureKey } from '@/lib/db/schema'

// ==========================================
// Types
// ==========================================

export interface ProjectFeaturesMap {
    maintenance: boolean
    facilities: boolean
    parcels: boolean
    transport: boolean
    sos: boolean
    visitors: boolean
    support: boolean
}

// ==========================================
// Query Keys
// ==========================================

export const featureQueryKeys = {
    all: ['project-features'] as const,
    byProject: (projectId: string) => ['project-features', projectId] as const,
}

// ==========================================
// Default Features
// ==========================================

const DEFAULT_FEATURES: ProjectFeaturesMap = {
    maintenance: true,
    facilities: true,
    parcels: true,
    transport: true,
    sos: true,
    visitors: true,
    support: true,
}

// ==========================================
// Hooks
// ==========================================

/**
 * Hook to get all features for current project
 */
export function useProjectFeatures() {
    const { data: session } = useSession()
    const projectId = (session?.user as { projectId?: string })?.projectId

    return useQuery({
        queryKey: featureQueryKeys.byProject(projectId || 'default'),
        queryFn: async (): Promise<ProjectFeaturesMap> => {
            if (!projectId) {
                return DEFAULT_FEATURES
            }

            const res = await fetch(`/api/projects/${projectId}/features`)
            if (!res.ok) {
                console.warn('[Features] Failed to fetch, using defaults')
                return DEFAULT_FEATURES
            }

            return await res.json()
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        enabled: !!projectId,
        placeholderData: DEFAULT_FEATURES,
    })
}

/**
 * Hook to check if a specific feature is enabled
 */
export function useFeatureEnabled(feature: FeatureKey): boolean {
    const { data: features } = useProjectFeatures()
    return features?.[feature] ?? true
}

/**
 * Hook to get multiple feature states at once
 */
export function useFeatures(...featureKeys: FeatureKey[]): Record<FeatureKey, boolean> {
    const { data: features } = useProjectFeatures()

    const result = {} as Record<FeatureKey, boolean>
    for (const key of featureKeys) {
        result[key] = features?.[key] ?? true
    }
    return result
}

/**
 * Hook to update project features (for Admin/Super Admin)
 */
export function useUpdateProjectFeatures() {
    const queryClient = useQueryClient()
    const { data: session } = useSession()
    const projectId = (session?.user as { projectId?: string })?.projectId

    return useMutation({
        mutationFn: async ({
            targetProjectId,
            features,
        }: {
            targetProjectId?: string
            features: Partial<ProjectFeaturesMap>
        }) => {
            const id = targetProjectId || projectId
            if (!id) throw new Error('No project ID')

            const res = await fetch(`/api/projects/${id}/features`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ features }),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message || 'Failed to update features')
            }

            return await res.json()
        },
        onSuccess: (_, variables) => {
            const id = variables.targetProjectId || projectId
            if (id) {
                queryClient.invalidateQueries({ queryKey: featureQueryKeys.byProject(id) })
            }
        },
    })
}

/**
 * Hook for feature-gated component rendering
 */
export function useFeatureGate(feature: FeatureKey): {
    isEnabled: boolean
    isLoading: boolean
} {
    const { data: features, isLoading } = useProjectFeatures()
    return {
        isEnabled: features?.[feature] ?? true,
        isLoading,
    }
}

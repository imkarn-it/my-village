/**
 * Feature Protection Middleware
 * Check if a feature is enabled for a project before allowing API access
 */
import type { FeatureKey } from '@/lib/db/schema'
import { isFeatureEnabled } from '@/lib/services/feature.service'

/**
 * Check if a feature is enabled for the given project
 * Returns an error response if the feature is disabled
 */
export async function requireFeature(
    projectId: string | undefined,
    featureKey: FeatureKey
): Promise<{ allowed: true } | { allowed: false; error: string }> {
    if (!projectId) {
        return { allowed: false, error: 'Project ID is required' }
    }

    const enabled = await isFeatureEnabled(projectId, featureKey)

    if (!enabled) {
        return {
            allowed: false,
            error: `Feature '${featureKey}' is not enabled for this project`
        }
    }

    return { allowed: true }
}

/**
 * Higher-order function to wrap an API handler with feature protection
 */
export function withFeatureProtection<T>(
    featureKey: FeatureKey,
    getProjectId: (context: T) => string | undefined
) {
    return async (context: T): Promise<{ success: false; error: string } | null> => {
        const projectId = getProjectId(context)
        const result = await requireFeature(projectId, featureKey)

        if (!result.allowed) {
            return { success: false, error: result.error }
        }

        return null // Continue with the handler
    }
}

/**
 * Feature-to-endpoints mapping for documentation
 */
export const FEATURE_PROTECTED_ENDPOINTS: Record<FeatureKey, string[]> = {
    maintenance: [
        '/api/maintenance',
        '/api/maintenance/:id',
    ],
    facilities: [
        '/api/facilities',
        '/api/facilities/:id',
        '/api/bookings',
        '/api/bookings/:id',
    ],
    parcels: [
        '/api/parcels',
        '/api/parcels/:id',
    ],
    transport: [
        '/api/transport',
        '/api/transport/:id',
    ],
    sos: [
        '/api/sos',
        '/api/sos/:id',
    ],
    visitors: [
        '/api/visitors',
        '/api/visitors/:id',
    ],
    support: [
        '/api/support',
        '/api/support/:id',
    ],
}

'use client'

import type { FeatureKey } from '@/lib/db/schema'
import { useFeatureEnabled } from './use-features'

interface FeatureGateProps {
    feature: FeatureKey
    children: React.ReactNode
    fallback?: React.ReactNode
}

/**
 * Component that conditionally renders children based on feature toggle
 * 
 * @example
 * <FeatureGate feature="maintenance">
 *   <MaintenanceMenu />
 * </FeatureGate>
 */
export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
    const isEnabled = useFeatureEnabled(feature)

    if (!isEnabled) {
        return <>{fallback}</>
    }

    return <>{children}</>
}

/**
 * Higher-order component for feature gating
 * 
 * @example
 * const MaintenancePage = withFeatureGate('maintenance')(MaintenancePageComponent)
 */
export function withFeatureGate<P extends object>(feature: FeatureKey, FallbackComponent?: React.ComponentType) {
    return function WithFeatureGate(WrappedComponent: React.ComponentType<P>) {
        return function FeatureGatedComponent(props: P) {
            const isEnabled = useFeatureEnabled(feature)

            if (!isEnabled) {
                if (FallbackComponent) {
                    return <FallbackComponent />
                }
                return null
            }

            return <WrappedComponent {...props} />
        }
    }
}

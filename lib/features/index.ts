/**
 * Feature Toggles Module
 * Export all feature toggle related utilities
 */

// Types (re-export from schema)
export type { FeatureKey, ProjectFeature, NewProjectFeature } from '@/lib/db/schema'

// React hooks
export {
    useProjectFeatures,
    useFeatureEnabled,
    useFeatures,
    useUpdateProjectFeatures,
    useFeatureGate,
    featureQueryKeys,
    type ProjectFeaturesMap,
} from './use-features'

// Components
export { FeatureGate, withFeatureGate } from './feature-gate'
export { withFeaturePage, FeatureDisabledPage, useFeaturePageAccess } from './with-feature-page'

// Feature metadata (will be imported from service when needed server-side)
export const FEATURE_KEYS = [
    'maintenance',
    'facilities',
    'parcels',
    'transport',
    'sos',
    'visitors',
    'support',
] as const

export const FEATURE_LABELS: Record<string, string> = {
    maintenance: 'ระบบแจ้งซ่อม',
    facilities: 'จองสิ่งอำนวยความสะดวก',
    parcels: 'ระบบพัสดุ',
    transport: 'บริการรถเรียก',
    sos: 'แจ้งเหตุฉุกเฉิน',
    visitors: 'ผู้มาติดต่อ',
    support: 'ติดต่อนิติบุคคล',
}

export const FEATURE_ICONS: Record<string, string> = {
    maintenance: '🔧',
    facilities: '🏊',
    parcels: '📦',
    transport: '🚕',
    sos: '🚨',
    visitors: '👋',
    support: '💬',
}

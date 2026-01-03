/**
 * Feature Service
 * Server-side service for managing project feature toggles
 */
import { db } from '@/lib/db'
import { projectFeatures, projects, type FeatureKey, type ProjectFeature } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// ==========================================
// Types
// ==========================================

export interface FeatureInfo {
    key: FeatureKey
    name: string
    description: string
    icon: string
    roles: string[]
}

export interface ProjectFeaturesMap {
    maintenance: boolean
    facilities: boolean
    parcels: boolean
    transport: boolean
    sos: boolean
    visitors: boolean
    support: boolean
}

export interface FeatureConfig {
    [key: string]: unknown
}

// ==========================================
// Feature Metadata
// ==========================================

export const FEATURE_INFO: Record<FeatureKey, FeatureInfo> = {
    maintenance: {
        key: 'maintenance',
        name: 'ระบบแจ้งซ่อม',
        description: 'ให้ลูกบ้านแจ้งซ่อมและติดตามสถานะได้',
        icon: '🔧',
        roles: ['resident', 'admin', 'maintenance'],
    },
    facilities: {
        key: 'facilities',
        name: 'จองสิ่งอำนวยความสะดวก',
        description: 'จองห้องประชุม สระว่ายน้ำ ฟิตเนส ฯลฯ',
        icon: '🏊',
        roles: ['resident', 'admin'],
    },
    parcels: {
        key: 'parcels',
        name: 'ระบบพัสดุ',
        description: 'บันทึกและแจ้งเตือนพัสดุที่มาถึง',
        icon: '📦',
        roles: ['resident', 'security', 'admin'],
    },
    transport: {
        key: 'transport',
        name: 'บริการรถเรียก',
        description: 'เรียกแท็กซี่หรือมอเตอร์ไซค์',
        icon: '🚕',
        roles: ['resident'],
    },
    sos: {
        key: 'sos',
        name: 'แจ้งเหตุฉุกเฉิน',
        description: 'ปุ่ม SOS พร้อม GPS',
        icon: '🚨',
        roles: ['resident', 'security', 'admin'],
    },
    visitors: {
        key: 'visitors',
        name: 'ผู้มาติดต่อ',
        description: 'ลงทะเบียนแขกและสร้าง QR Code',
        icon: '👋',
        roles: ['resident', 'security'],
    },
    support: {
        key: 'support',
        name: 'ติดต่อนิติบุคคล',
        description: 'ส่ง Ticket สอบถามหรือร้องเรียน',
        icon: '💬',
        roles: ['resident', 'admin'],
    },
}

export const ALL_FEATURE_KEYS: FeatureKey[] = [
    'maintenance',
    'facilities',
    'parcels',
    'transport',
    'sos',
    'visitors',
    'support',
]

// ==========================================
// Service Functions
// ==========================================

/**
 * Get all features for a project
 */
export async function getProjectFeatures(projectId: string): Promise<ProjectFeaturesMap> {
    const features = await db
        .select()
        .from(projectFeatures)
        .where(eq(projectFeatures.projectId, projectId))

    // Build map with defaults (all enabled if not configured)
    const map: ProjectFeaturesMap = {
        maintenance: true,
        facilities: true,
        parcels: true,
        transport: true,
        sos: true,
        visitors: true,
        support: true,
    }

    for (const feature of features) {
        map[feature.featureKey] = feature.enabled
    }

    return map
}

/**
 * Check if a specific feature is enabled for a project
 */
export async function isFeatureEnabled(projectId: string, featureKey: FeatureKey): Promise<boolean> {
    const feature = await db
        .select()
        .from(projectFeatures)
        .where(
            and(
                eq(projectFeatures.projectId, projectId),
                eq(projectFeatures.featureKey, featureKey)
            )
        )
        .limit(1)

    // Default to enabled if not configured
    if (feature.length === 0) {
        return true
    }

    return feature[0].enabled
}

/**
 * Update a feature's enabled status
 */
export async function updateFeature(
    projectId: string,
    featureKey: FeatureKey,
    enabled: boolean,
    updatedBy?: string,
    config?: FeatureConfig
): Promise<ProjectFeature> {
    // Check if feature exists
    const existing = await db
        .select()
        .from(projectFeatures)
        .where(
            and(
                eq(projectFeatures.projectId, projectId),
                eq(projectFeatures.featureKey, featureKey)
            )
        )
        .limit(1)

    if (existing.length > 0) {
        // Update existing
        const [updated] = await db
            .update(projectFeatures)
            .set({
                enabled,
                config: config ?? existing[0].config,
                updatedBy,
                updatedAt: new Date(),
            })
            .where(eq(projectFeatures.id, existing[0].id))
            .returning()

        return updated
    } else {
        // Create new
        const [created] = await db
            .insert(projectFeatures)
            .values({
                projectId,
                featureKey,
                enabled,
                config,
                updatedBy,
            })
            .returning()

        return created
    }
}

/**
 * Bulk update features for a project
 */
export async function updateProjectFeatures(
    projectId: string,
    features: Partial<ProjectFeaturesMap>,
    updatedBy?: string
): Promise<ProjectFeaturesMap> {
    const entries = Object.entries(features) as [FeatureKey, boolean][]

    for (const [featureKey, enabled] of entries) {
        await updateFeature(projectId, featureKey, enabled, updatedBy)
    }

    return getProjectFeatures(projectId)
}

/**
 * Initialize default features for a new project
 */
export async function initializeProjectFeatures(
    projectId: string,
    defaults?: Partial<ProjectFeaturesMap>
): Promise<void> {
    for (const featureKey of ALL_FEATURE_KEYS) {
        const enabled = defaults?.[featureKey] ?? true

        await db
            .insert(projectFeatures)
            .values({
                projectId,
                featureKey,
                enabled,
            })
            .onConflictDoNothing()
    }
}

/**
 * Get feature config (for features with additional settings)
 */
export async function getFeatureConfig(
    projectId: string,
    featureKey: FeatureKey
): Promise<FeatureConfig | null> {
    const feature = await db
        .select()
        .from(projectFeatures)
        .where(
            and(
                eq(projectFeatures.projectId, projectId),
                eq(projectFeatures.featureKey, featureKey)
            )
        )
        .limit(1)

    if (feature.length === 0) {
        return null
    }

    return (feature[0].config as FeatureConfig) ?? null
}

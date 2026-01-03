/**
 * Feature Toggle Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    FEATURE_KEYS,
    FEATURE_LABELS,
    FEATURE_ICONS,
} from '../index'

// Mock next-auth
vi.mock('next-auth/react', () => ({
    useSession: () => ({
        data: {
            user: {
                id: 'test-user-id',
                projectId: 'test-project-id',
            },
        },
        status: 'authenticated',
    }),
}))

// Mock react-query
vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn().mockReturnValue({
        data: {
            maintenance: true,
            facilities: false,
            parcels: true,
            transport: true,
            sos: true,
            visitors: true,
            support: true,
        },
        isLoading: false,
    }),
    useQueryClient: vi.fn().mockReturnValue({
        invalidateQueries: vi.fn(),
    }),
    useMutation: vi.fn().mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
    }),
}))

describe('Feature Toggle Constants', () => {
    describe('FEATURE_KEYS', () => {
        it('should contain all expected feature keys', () => {
            expect(FEATURE_KEYS).toContain('maintenance')
            expect(FEATURE_KEYS).toContain('facilities')
            expect(FEATURE_KEYS).toContain('parcels')
            expect(FEATURE_KEYS).toContain('transport')
            expect(FEATURE_KEYS).toContain('sos')
            expect(FEATURE_KEYS).toContain('visitors')
            expect(FEATURE_KEYS).toContain('support')
        })

        it('should have exactly 7 feature keys', () => {
            expect(FEATURE_KEYS).toHaveLength(7)
        })

        it('should be readonly array', () => {
            expect(Array.isArray(FEATURE_KEYS)).toBe(true)
        })
    })

    describe('FEATURE_LABELS', () => {
        it('should have Thai labels for all features', () => {
            expect(FEATURE_LABELS.maintenance).toBe('ระบบแจ้งซ่อม')
            expect(FEATURE_LABELS.facilities).toBe('จองสิ่งอำนวยความสะดวก')
            expect(FEATURE_LABELS.parcels).toBe('ระบบพัสดุ')
            expect(FEATURE_LABELS.transport).toBe('บริการรถเรียก')
            expect(FEATURE_LABELS.sos).toBe('แจ้งเหตุฉุกเฉิน')
            expect(FEATURE_LABELS.visitors).toBe('ผู้มาติดต่อ')
            expect(FEATURE_LABELS.support).toBe('ติดต่อนิติบุคคล')
        })

        it('should have labels for all feature keys', () => {
            for (const key of FEATURE_KEYS) {
                expect(FEATURE_LABELS[key]).toBeDefined()
                expect(typeof FEATURE_LABELS[key]).toBe('string')
                expect(FEATURE_LABELS[key].length).toBeGreaterThan(0)
            }
        })
    })

    describe('FEATURE_ICONS', () => {
        it('should have emoji icons for all features', () => {
            expect(FEATURE_ICONS.maintenance).toBe('🔧')
            expect(FEATURE_ICONS.facilities).toBe('🏊')
            expect(FEATURE_ICONS.parcels).toBe('📦')
            expect(FEATURE_ICONS.transport).toBe('🚕')
            expect(FEATURE_ICONS.sos).toBe('🚨')
            expect(FEATURE_ICONS.visitors).toBe('👋')
            expect(FEATURE_ICONS.support).toBe('💬')
        })

        it('should have icons for all feature keys', () => {
            for (const key of FEATURE_KEYS) {
                expect(FEATURE_ICONS[key]).toBeDefined()
            }
        })

        it('should have emoji character icons', () => {
            for (const key of FEATURE_KEYS) {
                expect(FEATURE_ICONS[key].length).toBeGreaterThan(0)
            }
        })
    })
})

describe('Feature Toggle Hooks', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('useProjectFeatures', () => {
        it('should export useProjectFeatures hook', async () => {
            const { useProjectFeatures } = await import('../use-features')
            expect(useProjectFeatures).toBeDefined()
            expect(typeof useProjectFeatures).toBe('function')
        })

        it('should return features data', async () => {
            const { useProjectFeatures } = await import('../use-features')
            const result = useProjectFeatures()
            expect(result.data).toBeDefined()
            expect(result.data?.maintenance).toBe(true)
            expect(result.data?.facilities).toBe(false)
        })
    })

    describe('useFeatureEnabled', () => {
        it('should export useFeatureEnabled hook', async () => {
            const { useFeatureEnabled } = await import('../use-features')
            expect(useFeatureEnabled).toBeDefined()
            expect(typeof useFeatureEnabled).toBe('function')
        })

        it('should return boolean for enabled feature', async () => {
            const { useFeatureEnabled } = await import('../use-features')
            const isEnabled = useFeatureEnabled('maintenance')
            expect(typeof isEnabled).toBe('boolean')
        })

        it('should return true for enabled feature', async () => {
            const { useFeatureEnabled } = await import('../use-features')
            const isEnabled = useFeatureEnabled('maintenance')
            expect(isEnabled).toBe(true)
        })

        it('should return false for disabled feature', async () => {
            const { useFeatureEnabled } = await import('../use-features')
            const isEnabled = useFeatureEnabled('facilities')
            expect(isEnabled).toBe(false)
        })
    })

    describe('useFeatures', () => {
        it('should export useFeatures hook', async () => {
            const { useFeatures } = await import('../use-features')
            expect(useFeatures).toBeDefined()
            expect(typeof useFeatures).toBe('function')
        })

        it('should return multiple feature states', async () => {
            const { useFeatures } = await import('../use-features')
            const features = useFeatures('maintenance', 'facilities', 'parcels')
            expect(features.maintenance).toBe(true)
            expect(features.facilities).toBe(false)
            expect(features.parcels).toBe(true)
        })
    })

    describe('useUpdateProjectFeatures', () => {
        it('should export useUpdateProjectFeatures hook', async () => {
            const { useUpdateProjectFeatures } = await import('../use-features')
            expect(useUpdateProjectFeatures).toBeDefined()
            expect(typeof useUpdateProjectFeatures).toBe('function')
        })

        it('should return mutation object', async () => {
            const { useUpdateProjectFeatures } = await import('../use-features')
            const mutation = useUpdateProjectFeatures()
            expect(mutation).toBeDefined()
        })
    })

    describe('useFeatureGate', () => {
        it('should export useFeatureGate hook', async () => {
            const { useFeatureGate } = await import('../use-features')
            expect(useFeatureGate).toBeDefined()
            expect(typeof useFeatureGate).toBe('function')
        })

        it('should return isEnabled and isLoading', async () => {
            const { useFeatureGate } = await import('../use-features')
            const gate = useFeatureGate('maintenance')
            expect(typeof gate.isEnabled).toBe('boolean')
            expect(typeof gate.isLoading).toBe('boolean')
        })
    })
})

describe('Feature Gate Component', () => {
    it('should export FeatureGate component', async () => {
        const { FeatureGate } = await import('../feature-gate')
        expect(FeatureGate).toBeDefined()
        expect(typeof FeatureGate).toBe('function')
    })

    it('should export withFeatureGate HOC', async () => {
        const { withFeatureGate } = await import('../feature-gate')
        expect(withFeatureGate).toBeDefined()
        expect(typeof withFeatureGate).toBe('function')
    })

    it('withFeatureGate should return a function', async () => {
        const { withFeatureGate } = await import('../feature-gate')
        const wrapper = withFeatureGate('maintenance')
        expect(typeof wrapper).toBe('function')
    })
})

describe('Feature Query Keys', () => {
    it('should export featureQueryKeys', async () => {
        const { featureQueryKeys } = await import('../use-features')
        expect(featureQueryKeys).toBeDefined()
    })

    it('should have all query key', async () => {
        const { featureQueryKeys } = await import('../use-features')
        expect(featureQueryKeys.all).toEqual(['project-features'])
    })

    it('should have byProject query key factory', async () => {
        const { featureQueryKeys } = await import('../use-features')
        expect(featureQueryKeys.byProject('test-id')).toEqual(['project-features', 'test-id'])
    })
})

describe('Feature Service Types', () => {
    it('should export ProjectFeaturesMap type', async () => {
        const module = await import('../use-features')
        expect(module.useProjectFeatures).toBeDefined()
    })

    it('should have correct default feature structure', async () => {
        const { useProjectFeatures } = await import('../use-features')
        const result = useProjectFeatures()

        expect(result.data).toHaveProperty('maintenance')
        expect(result.data).toHaveProperty('facilities')
        expect(result.data).toHaveProperty('parcels')
        expect(result.data).toHaveProperty('transport')
        expect(result.data).toHaveProperty('sos')
        expect(result.data).toHaveProperty('visitors')
        expect(result.data).toHaveProperty('support')
    })
})

describe('Feature Index Exports', () => {
    it('should export FeatureGate from index', async () => {
        const module = await import('../index')
        expect(module.FeatureGate).toBeDefined()
    })

    it('should export withFeatureGate from index', async () => {
        const module = await import('../index')
        expect(module.withFeatureGate).toBeDefined()
    })

    it('should export useProjectFeatures from index', async () => {
        const module = await import('../index')
        expect(module.useProjectFeatures).toBeDefined()
    })

    it('should export useFeatureEnabled from index', async () => {
        const module = await import('../index')
        expect(module.useFeatureEnabled).toBeDefined()
    })

    it('should export FEATURE_KEYS from index', async () => {
        const module = await import('../index')
        expect(module.FEATURE_KEYS).toBeDefined()
        expect(module.FEATURE_KEYS).toHaveLength(7)
    })

    it('should export FEATURE_LABELS from index', async () => {
        const module = await import('../index')
        expect(module.FEATURE_LABELS).toBeDefined()
    })

    it('should export FEATURE_ICONS from index', async () => {
        const module = await import('../index')
        expect(module.FEATURE_ICONS).toBeDefined()
    })
})

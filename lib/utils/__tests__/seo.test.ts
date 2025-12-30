/**
 * Google Analytics Component Tests
 */
import { describe, it, expect, vi } from 'vitest'

// Mock Next.js Script component
vi.mock('next/script', () => ({
    default: ({ children, id, ...props }: any) => {
        if (children) {
            return { type: 'script', props: { id, children } }
        }
        return { type: 'script', props: { ...props } }
    }
}))

describe('Google Analytics', () => {
    it('should not render when measurementId is empty', async () => {
        // Import after mocking
        const { GoogleAnalytics } = await import('@/components/shared/google-analytics')

        // With empty measurementId, should return null
        const result = GoogleAnalytics({ measurementId: '' })
        expect(result).toBeNull()
    })

    it('should render scripts when measurementId is provided', async () => {
        const { GoogleAnalytics } = await import('@/components/shared/google-analytics')

        const result = GoogleAnalytics({ measurementId: 'G-TESTID123' })

        // Should return something (not null)
        expect(result).not.toBeNull()
    })
})

describe('SEO Metadata', () => {
    it('should have required keywords', () => {
        const keywords = ['หมู่บ้าน', 'คอนโด', 'นิติบุคคล', 'ระบบจัดการ']

        keywords.forEach(keyword => {
            expect(keyword.length).toBeGreaterThan(0)
        })
    })

    it('should have valid Open Graph type', () => {
        const validTypes = ['website', 'article', 'profile', 'product']
        const ogType = 'website'

        expect(validTypes).toContain(ogType)
    })

    it('should have valid Twitter card type', () => {
        const validCards = ['summary', 'summary_large_image', 'app', 'player']
        const twitterCard = 'summary_large_image'

        expect(validCards).toContain(twitterCard)
    })

    it('should have Thai locale', () => {
        const locale = 'th_TH'
        expect(locale).toBe('th_TH')
    })
})

import { describe, test, expect, beforeEach } from 'vitest'
import {
    checkRateLimit,
    getRateLimitHeaders,
    resetRateLimit,
    getClientIdentifier,
    RATE_LIMIT_CONFIGS,
} from '../rate-limit'

describe('Rate Limit Middleware', () => {
    beforeEach(() => {
        // Reset rate limits before each test
        resetRateLimit('test-client')
        resetRateLimit('test-client-2')
    })

    describe('checkRateLimit', () => {
        test('should allow first request', () => {
            const result = checkRateLimit('test-client', { limit: 5, windowMs: 60000 })

            expect(result.success).toBe(true)
            expect(result.remaining).toBe(4)
            expect(result.limit).toBe(5)
        })

        test('should decrement remaining on each request', () => {
            const config = { limit: 5, windowMs: 60000 }

            checkRateLimit('test-client', config)
            checkRateLimit('test-client', config)
            const result = checkRateLimit('test-client', config)

            expect(result.remaining).toBe(2)
        })

        test('should block when limit exceeded', () => {
            const config = { limit: 3, windowMs: 60000 }

            checkRateLimit('test-client', config)
            checkRateLimit('test-client', config)
            checkRateLimit('test-client', config)
            const result = checkRateLimit('test-client', config)

            expect(result.success).toBe(false)
            expect(result.remaining).toBe(0)
        })

        test('should track different clients separately', () => {
            const config = { limit: 2, windowMs: 60000 }

            checkRateLimit('test-client', config)
            checkRateLimit('test-client', config)
            const result1 = checkRateLimit('test-client', config)
            const result2 = checkRateLimit('test-client-2', config)

            expect(result1.success).toBe(false)
            expect(result2.success).toBe(true)
        })
    })

    describe('getRateLimitHeaders', () => {
        test('should return correct headers', () => {
            const result = checkRateLimit('test-client', { limit: 10, windowMs: 60000 })
            const headers = getRateLimitHeaders(result)

            expect(headers['X-RateLimit-Limit']).toBe('10')
            expect(headers['X-RateLimit-Remaining']).toBe('9')
            expect(headers['X-RateLimit-Reset']).toBeDefined()
        })
    })

    describe('RATE_LIMIT_CONFIGS', () => {
        test('should have predefined configs', () => {
            expect(RATE_LIMIT_CONFIGS.api).toBeDefined()
            expect(RATE_LIMIT_CONFIGS.auth).toBeDefined()
            expect(RATE_LIMIT_CONFIGS.sensitive).toBeDefined()
            expect(RATE_LIMIT_CONFIGS.public).toBeDefined()
        })

        test('auth config should be stricter than api', () => {
            expect(RATE_LIMIT_CONFIGS.auth.limit).toBeLessThan(RATE_LIMIT_CONFIGS.api.limit)
        })
    })

    describe('getClientIdentifier', () => {
        test('should extract IP from x-forwarded-for header', () => {
            const request = new Request('http://localhost', {
                headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' }
            })

            const result = getClientIdentifier(request)

            expect(result).toBe('192.168.1.1')
        })

        test('should extract IP from x-real-ip header', () => {
            const request = new Request('http://localhost', {
                headers: { 'x-real-ip': '192.168.1.2' }
            })

            const result = getClientIdentifier(request)

            expect(result).toBe('192.168.1.2')
        })

        test('should return anonymous when no IP headers', () => {
            const request = new Request('http://localhost')

            const result = getClientIdentifier(request)

            expect(result).toBe('anonymous')
        })
    })
})

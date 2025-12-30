/**
 * Rate Limiting Middleware
 * ป้องกัน API abuse ด้วย sliding window algorithm
 */

type RateLimitRecord = {
    count: number
    resetTime: number
}

// In-memory store (สำหรับ single instance)
// Production ควรใช้ Redis หรือ Upstash
const rateLimitStore = new Map<string, RateLimitRecord>()

export type RateLimitConfig = {
    /** จำนวน requests ที่อนุญาต */
    limit: number
    /** ช่วงเวลา (milliseconds) */
    windowMs: number
}

// Default configs for different use cases
export const RATE_LIMIT_CONFIGS = {
    /** API ทั่วไป: 100 requests / 15 นาที */
    api: { limit: 100, windowMs: 15 * 60 * 1000 },
    /** Auth endpoints: 10 requests / 15 นาที */
    auth: { limit: 10, windowMs: 15 * 60 * 1000 },
    /** Sensitive actions: 5 requests / 15 นาที */
    sensitive: { limit: 5, windowMs: 15 * 60 * 1000 },
    /** Public endpoints: 200 requests / 15 นาที */
    public: { limit: 200, windowMs: 15 * 60 * 1000 },
} as const

export type RateLimitResult = {
    success: boolean
    limit: number
    remaining: number
    reset: number
}

/**
 * Check rate limit for a given identifier
 * @param identifier - Unique identifier (usually IP or user ID)
 * @param config - Rate limit configuration
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig = RATE_LIMIT_CONFIGS.api
): RateLimitResult {
    const now = Date.now()
    const record = rateLimitStore.get(identifier)

    // Clean up expired records periodically
    if (Math.random() < 0.01) {
        cleanupExpiredRecords()
    }

    // No existing record or expired
    if (!record || now > record.resetTime) {
        const newRecord: RateLimitRecord = {
            count: 1,
            resetTime: now + config.windowMs,
        }
        rateLimitStore.set(identifier, newRecord)

        return {
            success: true,
            limit: config.limit,
            remaining: config.limit - 1,
            reset: newRecord.resetTime,
        }
    }

    // Check if limit exceeded
    if (record.count >= config.limit) {
        return {
            success: false,
            limit: config.limit,
            remaining: 0,
            reset: record.resetTime,
        }
    }

    // Increment count
    record.count++

    return {
        success: true,
        limit: config.limit,
        remaining: config.limit - record.count,
        reset: record.resetTime,
    }
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
    }
}

/**
 * Clean up expired records from store
 */
function cleanupExpiredRecords(): void {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
        if (now > record.resetTime) {
            rateLimitStore.delete(key)
        }
    }
}

/**
 * Reset rate limit for testing purposes
 */
export function resetRateLimit(identifier: string): void {
    rateLimitStore.delete(identifier)
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
    // Try to get real IP from various headers
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')

    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }

    if (realIp) {
        return realIp
    }

    // Fallback to a default identifier
    return 'anonymous'
}

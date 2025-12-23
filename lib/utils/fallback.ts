/**
 * Fallback and Graceful Degradation Utilities
 * ใช้ fallback เมื่อ primary operation fail
 */

/**
 * Execute with fallback
 * ลอง primary ก่อน ถ้า fail ใช้ fallback
 */
export async function withFallback<T>(
    primary: () => Promise<T>,
    fallback: () => T | Promise<T>
): Promise<T> {
    try {
        return await primary()
    } catch {
        return await fallback()
    }
}

/**
 * Execute with timeout
 * ยกเลิก operation ที่ใช้เวลานานเกินไป
 */
export async function withTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number = 10000,
    timeoutError?: Error
): Promise<T> {
    return Promise.race([
        fn(),
        new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(timeoutError ?? new TimeoutError(`Operation timed out after ${timeoutMs}ms`))
            }, timeoutMs)
        }),
    ])
}

/**
 * Execute with both fallback and timeout
 */
export async function withFallbackAndTimeout<T>(
    primary: () => Promise<T>,
    fallback: () => T | Promise<T>,
    timeoutMs: number = 10000
): Promise<T> {
    return withFallback(
        () => withTimeout(primary, timeoutMs),
        fallback
    )
}

/**
 * Timeout error
 */
export class TimeoutError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'TimeoutError'
    }
}

/**
 * Cache with fallback
 * ลอง fetch ใหม่ ถ้า fail ใช้ cached data
 */
export function createCacheWithFallback<T>() {
    let cachedData: T | undefined

    return {
        async fetch(fetchFn: () => Promise<T>): Promise<T> {
            try {
                cachedData = await fetchFn()
                return cachedData
            } catch {
                if (cachedData !== undefined) {
                    return cachedData
                }
                throw new Error('No cached data available')
            }
        },

        getCached(): T | undefined {
            return cachedData
        },

        clearCache(): void {
            cachedData = undefined
        },
    }
}

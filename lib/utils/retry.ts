/**
 * Retry utility with exponential backoff
 * ลองทำซ้ำเมื่อ fail พร้อม exponential backoff
 */

export type RetryOptions = {
    maxAttempts?: number
    delayMs?: number
    backoff?: 'linear' | 'exponential'
    onRetry?: (attempt: number, error: Error) => void
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
    maxAttempts: 3,
    delayMs: 1000,
    backoff: 'exponential',
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    let lastError: Error | undefined

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error))

            if (attempt === opts.maxAttempts) {
                break
            }

            // Calculate delay
            const delay = opts.backoff === 'exponential'
                ? opts.delayMs * Math.pow(2, attempt - 1)
                : opts.delayMs * attempt

            // Call onRetry callback
            opts.onRetry?.(attempt, lastError)

            // Wait before next attempt
            await sleep(delay)
        }
    }

    throw lastError
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

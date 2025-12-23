/**
 * Resilient API Client
 * Wraps external API calls with retry, circuit breaker, and timeout
 */
import { withRetry } from '@/lib/utils/retry'
import { CircuitBreaker } from '@/lib/utils/circuit-breaker'
import { withFallbackAndTimeout } from '@/lib/utils/fallback'

// Circuit breakers for different external services
const circuitBreakers = new Map<string, CircuitBreaker>()

/**
 * Get or create a circuit breaker for a service
 */
function getCircuitBreaker(serviceName: string): CircuitBreaker {
    if (!circuitBreakers.has(serviceName)) {
        circuitBreakers.set(serviceName, new CircuitBreaker({
            failureThreshold: 5,
            recoveryTimeout: 30000, // 30 seconds
        }))
    }
    return circuitBreakers.get(serviceName)!
}

/**
 * Configuration for resilient fetch
 */
export interface ResilientFetchConfig {
    /** Service name for circuit breaker isolation */
    serviceName: string
    /** Request timeout in milliseconds */
    timeout?: number
    /** Maximum retry attempts */
    maxRetries?: number
    /** Fallback value if all attempts fail */
    fallback?: unknown
    /** Headers to include */
    headers?: HeadersInit
}

/**
 * Make a resilient HTTP request with retry, circuit breaker, and timeout
 */
export async function resilientFetch<T>(
    url: string,
    options: RequestInit & { config: ResilientFetchConfig }
): Promise<T> {
    const { config, ...fetchOptions } = options
    const circuitBreaker = getCircuitBreaker(config.serviceName)

    const makeRequest = async (): Promise<T> => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), config.timeout ?? 10000)

        try {
            const response = await fetch(url, {
                ...fetchOptions,
                headers: {
                    'Content-Type': 'application/json',
                    ...config.headers,
                    ...fetchOptions.headers,
                },
                signal: controller.signal,
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            return await response.json()
        } catch (error) {
            clearTimeout(timeoutId)
            throw error
        }
    }

    // Wrap with circuit breaker
    const circuitBreakerRequest = async () => circuitBreaker.execute(makeRequest)

    // Wrap with retry
    const retryConfig = {
        maxAttempts: config.maxRetries ?? 3,
        delayMs: 1000,
        backoff: 'exponential' as const,
    }

    if (config.fallback !== undefined) {
        // With fallback
        return await withFallbackAndTimeout(
            () => withRetry(circuitBreakerRequest, retryConfig),
            async () => config.fallback as T,
            config.timeout ?? 30000
        )
    } else {
        // Without fallback - let errors propagate
        return await withRetry(circuitBreakerRequest, retryConfig)
    }
}

/**
 * Resilient GET request
 */
export async function resilientGet<T>(
    url: string,
    config: ResilientFetchConfig
): Promise<T> {
    return resilientFetch<T>(url, {
        method: 'GET',
        config,
    })
}

/**
 * Resilient POST request
 */
export async function resilientPost<T>(
    url: string,
    body: unknown,
    config: ResilientFetchConfig
): Promise<T> {
    return resilientFetch<T>(url, {
        method: 'POST',
        body: JSON.stringify(body),
        config,
    })
}

/**
 * Get circuit breaker status for monitoring
 */
export function getCircuitBreakerStatus(serviceName: string) {
    const cb = circuitBreakers.get(serviceName)
    if (!cb) {
        return { serviceName, state: 'UNKNOWN', failureCount: 0 }
    }
    return {
        serviceName,
        state: cb.getState(),
        failureCount: (cb as any).failureCount ?? 0,
    }
}

/**
 * Get all circuit breaker statuses
 */
export function getAllCircuitBreakerStatuses() {
    const statuses: ReturnType<typeof getCircuitBreakerStatus>[] = []
    for (const serviceName of circuitBreakers.keys()) {
        statuses.push(getCircuitBreakerStatus(serviceName))
    }
    return statuses
}

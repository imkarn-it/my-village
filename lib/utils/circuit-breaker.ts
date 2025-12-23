/**
 * Circuit Breaker Pattern
 * หยุดเรียก API ที่ล้มเหลวซ้ำๆ ป้องกัน cascade failure
 */

export type CircuitBreakerOptions = {
    failureThreshold: number    // จำนวนครั้งที่ fail ก่อนเปิด circuit
    recoveryTimeout: number     // มิลลิวินาทีที่รอก่อนลอง half-open
    onStateChange?: (state: CircuitState) => void
}

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

export class CircuitBreaker {
    private state: CircuitState = 'CLOSED'
    private failures = 0
    private lastFailureTime?: number
    private readonly options: CircuitBreakerOptions

    constructor(options: CircuitBreakerOptions) {
        this.options = options
    }

    /**
     * Execute function through circuit breaker
     */
    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'OPEN') {
            // Check if recovery timeout has passed
            if (this.shouldAttemptReset()) {
                this.transitionTo('HALF_OPEN')
            } else {
                throw new CircuitOpenError('Circuit is OPEN')
            }
        }

        try {
            const result = await fn()
            this.onSuccess()
            return result
        } catch (error) {
            this.onFailure()
            throw error
        }
    }

    /**
     * Get current state
     */
    getState(): CircuitState {
        return this.state
    }

    /**
     * Get failure count
     */
    getFailureCount(): number {
        return this.failures
    }

    /**
     * Manually reset the circuit
     */
    reset(): void {
        this.failures = 0
        this.lastFailureTime = undefined
        this.transitionTo('CLOSED')
    }

    private onSuccess(): void {
        this.failures = 0
        if (this.state === 'HALF_OPEN') {
            this.transitionTo('CLOSED')
        }
    }

    private onFailure(): void {
        this.failures++
        this.lastFailureTime = Date.now()

        if (this.state === 'HALF_OPEN') {
            this.transitionTo('OPEN')
        } else if (this.failures >= this.options.failureThreshold) {
            this.transitionTo('OPEN')
        }
    }

    private shouldAttemptReset(): boolean {
        if (!this.lastFailureTime) return true
        return Date.now() - this.lastFailureTime >= this.options.recoveryTimeout
    }

    private transitionTo(newState: CircuitState): void {
        if (this.state !== newState) {
            this.state = newState
            this.options.onStateChange?.(newState)
        }
    }
}

/**
 * Error thrown when circuit is open
 */
export class CircuitOpenError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'CircuitOpenError'
    }
}

/**
 * Create a circuit breaker with default settings
 */
export function createCircuitBreaker(options?: Partial<CircuitBreakerOptions>): CircuitBreaker {
    return new CircuitBreaker({
        failureThreshold: options?.failureThreshold ?? 5,
        recoveryTimeout: options?.recoveryTimeout ?? 30000,
        onStateChange: options?.onStateChange,
    })
}

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { CircuitBreaker, CircuitOpenError, createCircuitBreaker } from '../circuit-breaker'

describe('Circuit Breaker', () => {
    describe('CircuitBreaker class', () => {
        let breaker: CircuitBreaker

        beforeEach(() => {
            breaker = new CircuitBreaker({
                failureThreshold: 3,
                recoveryTimeout: 100,
            })
        })

        test('should start in CLOSED state', () => {
            expect(breaker.getState()).toBe('CLOSED')
            expect(breaker.getFailureCount()).toBe(0)
        })

        test('should execute successfully in CLOSED state', async () => {
            const fn = vi.fn().mockResolvedValue('success')

            const result = await breaker.execute(fn)

            expect(result).toBe('success')
            expect(breaker.getState()).toBe('CLOSED')
        })

        test('should increment failure count on error', async () => {
            const fn = vi.fn().mockRejectedValue(new Error('fail'))

            await expect(breaker.execute(fn)).rejects.toThrow('fail')

            expect(breaker.getFailureCount()).toBe(1)
            expect(breaker.getState()).toBe('CLOSED')
        })

        test('should open circuit after threshold failures', async () => {
            const fn = vi.fn().mockRejectedValue(new Error('fail'))

            // Fail 3 times (threshold)
            await expect(breaker.execute(fn)).rejects.toThrow()
            await expect(breaker.execute(fn)).rejects.toThrow()
            await expect(breaker.execute(fn)).rejects.toThrow()

            expect(breaker.getState()).toBe('OPEN')
        })

        test('should throw CircuitOpenError when OPEN', async () => {
            const fn = vi.fn().mockRejectedValue(new Error('fail'))

            // Open the circuit
            for (let i = 0; i < 3; i++) {
                await expect(breaker.execute(fn)).rejects.toThrow()
            }

            // Next call should throw CircuitOpenError
            await expect(breaker.execute(fn))
                .rejects.toThrow(CircuitOpenError)
        })

        test('should transition to HALF_OPEN after recovery timeout', async () => {
            const onStateChange = vi.fn()
            const breakerWithCallback = new CircuitBreaker({
                failureThreshold: 2,
                recoveryTimeout: 50,
                onStateChange,
            })

            const failFn = vi.fn().mockRejectedValue(new Error('fail'))

            // Open the circuit
            await expect(breakerWithCallback.execute(failFn)).rejects.toThrow()
            await expect(breakerWithCallback.execute(failFn)).rejects.toThrow()

            expect(breakerWithCallback.getState()).toBe('OPEN')

            // Wait for recovery timeout
            await new Promise(resolve => setTimeout(resolve, 60))

            // Next call should transition to HALF_OPEN
            const successFn = vi.fn().mockResolvedValue('success')
            await breakerWithCallback.execute(successFn)

            expect(onStateChange).toHaveBeenCalledWith('HALF_OPEN')
            expect(onStateChange).toHaveBeenCalledWith('CLOSED')
        })

        test('should reset failure count on success', async () => {
            const failFn = vi.fn().mockRejectedValue(new Error('fail'))
            const successFn = vi.fn().mockResolvedValue('success')

            await expect(breaker.execute(failFn)).rejects.toThrow()
            await expect(breaker.execute(failFn)).rejects.toThrow()

            expect(breaker.getFailureCount()).toBe(2)

            await breaker.execute(successFn)

            expect(breaker.getFailureCount()).toBe(0)
        })

        test('should manually reset', async () => {
            const fn = vi.fn().mockRejectedValue(new Error('fail'))

            // Open the circuit
            for (let i = 0; i < 3; i++) {
                await expect(breaker.execute(fn)).rejects.toThrow()
            }

            expect(breaker.getState()).toBe('OPEN')

            breaker.reset()

            expect(breaker.getState()).toBe('CLOSED')
            expect(breaker.getFailureCount()).toBe(0)
        })
    })

    describe('CircuitOpenError', () => {
        test('should be instance of Error', () => {
            const error = new CircuitOpenError('test')
            expect(error).toBeInstanceOf(Error)
            expect(error.name).toBe('CircuitOpenError')
            expect(error.message).toBe('test')
        })
    })

    describe('createCircuitBreaker', () => {
        test('should create with default options', () => {
            const breaker = createCircuitBreaker()
            expect(breaker.getState()).toBe('CLOSED')
        })

        test('should create with custom options', () => {
            const onStateChange = vi.fn()
            const breaker = createCircuitBreaker({
                failureThreshold: 10,
                recoveryTimeout: 60000,
                onStateChange,
            })
            expect(breaker.getState()).toBe('CLOSED')
        })
    })
})

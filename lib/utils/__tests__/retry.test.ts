import { describe, test, expect, vi } from 'vitest'
import { withRetry, type RetryOptions } from '../retry'

describe('Retry Utility', () => {
    describe('withRetry', () => {
        test('should succeed on first attempt', async () => {
            const fn = vi.fn().mockResolvedValue('success')

            const result = await withRetry(fn)

            expect(result).toBe('success')
            expect(fn).toHaveBeenCalledTimes(1)
        })

        test('should retry on failure and eventually succeed', async () => {
            const fn = vi.fn()
                .mockRejectedValueOnce(new Error('fail 1'))
                .mockRejectedValueOnce(new Error('fail 2'))
                .mockResolvedValue('success')

            const result = await withRetry(fn, { delayMs: 10 })

            expect(result).toBe('success')
            expect(fn).toHaveBeenCalledTimes(3)
        })

        test('should throw after max attempts', async () => {
            const fn = vi.fn().mockRejectedValue(new Error('always fail'))

            await expect(withRetry(fn, { maxAttempts: 3, delayMs: 10 }))
                .rejects.toThrow('always fail')
            expect(fn).toHaveBeenCalledTimes(3)
        })

        test('should call onRetry callback on each retry', async () => {
            const fn = vi.fn()
                .mockRejectedValueOnce(new Error('fail 1'))
                .mockRejectedValueOnce(new Error('fail 2'))
                .mockResolvedValue('success')
            const onRetry = vi.fn()

            await withRetry(fn, { delayMs: 10, onRetry })

            expect(onRetry).toHaveBeenCalledTimes(2)
            expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error))
            expect(onRetry).toHaveBeenCalledWith(2, expect.any(Error))
        })

        test('should use linear backoff when specified', async () => {
            const fn = vi.fn()
                .mockRejectedValueOnce(new Error('fail'))
                .mockResolvedValue('success')

            const start = Date.now()
            await withRetry(fn, { backoff: 'linear', delayMs: 50 })
            const elapsed = Date.now() - start

            // Linear backoff: delay * attempt = 50 * 1 = 50ms
            expect(elapsed).toBeGreaterThanOrEqual(40)
        })

        test('should convert non-Error to Error', async () => {
            const fn = vi.fn().mockRejectedValue('string error')

            await expect(withRetry(fn, { maxAttempts: 1, delayMs: 10 }))
                .rejects.toThrow('string error')
        })
    })
})

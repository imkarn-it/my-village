import { describe, test, expect, vi } from 'vitest'
import {
    withFallback,
    withTimeout,
    withFallbackAndTimeout,
    TimeoutError,
    createCacheWithFallback
} from '../fallback'

describe('Fallback Utilities', () => {
    describe('withFallback', () => {
        test('should return primary result on success', async () => {
            const primary = vi.fn().mockResolvedValue('primary')
            const fallback = vi.fn().mockReturnValue('fallback')

            const result = await withFallback(primary, fallback)

            expect(result).toBe('primary')
            expect(fallback).not.toHaveBeenCalled()
        })

        test('should return fallback on primary failure', async () => {
            const primary = vi.fn().mockRejectedValue(new Error('fail'))
            const fallback = vi.fn().mockReturnValue('fallback')

            const result = await withFallback(primary, fallback)

            expect(result).toBe('fallback')
            expect(fallback).toHaveBeenCalled()
        })

        test('should support async fallback', async () => {
            const primary = vi.fn().mockRejectedValue(new Error('fail'))
            const fallback = vi.fn().mockResolvedValue('async fallback')

            const result = await withFallback(primary, fallback)

            expect(result).toBe('async fallback')
        })
    })

    describe('withTimeout', () => {
        test('should return result if completes before timeout', async () => {
            const fn = vi.fn().mockResolvedValue('fast')

            const result = await withTimeout(fn, 1000)

            expect(result).toBe('fast')
        })

        test('should throw TimeoutError if exceeds timeout', async () => {
            const fn = () => new Promise(resolve => setTimeout(() => resolve('slow'), 200))

            await expect(withTimeout(fn, 50))
                .rejects.toThrow(TimeoutError)
        })

        test('should throw custom error if provided', async () => {
            const fn = () => new Promise(resolve => setTimeout(() => resolve('slow'), 200))
            const customError = new Error('Custom timeout')

            await expect(withTimeout(fn, 50, customError))
                .rejects.toThrow('Custom timeout')
        })
    })

    describe('withFallbackAndTimeout', () => {
        test('should return primary result on success within timeout', async () => {
            const primary = vi.fn().mockResolvedValue('primary')
            const fallback = vi.fn().mockReturnValue('fallback')

            const result = await withFallbackAndTimeout(primary, fallback, 1000)

            expect(result).toBe('primary')
        })

        test('should return fallback on timeout', async () => {
            const primary = () => new Promise(resolve => setTimeout(() => resolve('slow'), 200))
            const fallback = vi.fn().mockReturnValue('fallback')

            const result = await withFallbackAndTimeout(primary, fallback, 50)

            expect(result).toBe('fallback')
        })
    })

    describe('TimeoutError', () => {
        test('should be an instance of Error', () => {
            const error = new TimeoutError('test')
            expect(error).toBeInstanceOf(Error)
            expect(error.name).toBe('TimeoutError')
        })
    })

    describe('createCacheWithFallback', () => {
        test('should fetch and cache data', async () => {
            const cache = createCacheWithFallback<string>()
            const fetchFn = vi.fn().mockResolvedValue('data')

            const result = await cache.fetch(fetchFn)

            expect(result).toBe('data')
            expect(cache.getCached()).toBe('data')
        })

        test('should return cached data on fetch failure', async () => {
            const cache = createCacheWithFallback<string>()

            // First successful fetch
            await cache.fetch(() => Promise.resolve('cached'))

            // Second failed fetch should return cached
            const fetchFn = vi.fn().mockRejectedValue(new Error('fail'))
            const result = await cache.fetch(fetchFn)

            expect(result).toBe('cached')
        })

        test('should throw if no cache and fetch fails', async () => {
            const cache = createCacheWithFallback<string>()
            const fetchFn = vi.fn().mockRejectedValue(new Error('fail'))

            await expect(cache.fetch(fetchFn))
                .rejects.toThrow('No cached data available')
        })

        test('should clear cache', async () => {
            const cache = createCacheWithFallback<string>()
            await cache.fetch(() => Promise.resolve('data'))

            cache.clearCache()

            expect(cache.getCached()).toBeUndefined()
        })
    })
})

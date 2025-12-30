"use client"

import { useEffect, useState, useRef, ReactNode } from "react"

interface LazyLoadProps {
    children: ReactNode
    placeholder?: ReactNode
    rootMargin?: string
    threshold?: number
}

/**
 * Lazy Load Component
 * Only renders children when in viewport
 */
export function LazyLoad({
    children,
    placeholder,
    rootMargin = "100px",
    threshold = 0.1,
}: LazyLoadProps) {
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            { rootMargin, threshold }
        )

        observer.observe(element)

        return () => observer.disconnect()
    }, [rootMargin, threshold])

    return (
        <div ref={ref}>
            {isVisible ? children : placeholder}
        </div>
    )
}

/**
 * Infinite Scroll Hook
 */
export function useInfiniteScroll(
    callback: () => void,
    options: {
        threshold?: number
        rootMargin?: string
        enabled?: boolean
    } = {}
) {
    const { threshold = 0.1, rootMargin = "100px", enabled = true } = options
    const observerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!enabled) return

        const element = observerRef.current
        if (!element) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    callback()
                }
            },
            { threshold, rootMargin }
        )

        observer.observe(element)

        return () => observer.disconnect()
    }, [callback, threshold, rootMargin, enabled])

    return observerRef
}

/**
 * Debounce Hook
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debouncedValue
}

/**
 * Throttle Hook
 */
export function useThrottle<T>(value: T, interval: number): T {
    const [throttledValue, setThrottledValue] = useState(value)
    const lastUpdated = useRef(Date.now())

    useEffect(() => {
        const now = Date.now()

        if (now - lastUpdated.current >= interval) {
            lastUpdated.current = now
            setThrottledValue(value)
        } else {
            const timer = setTimeout(() => {
                lastUpdated.current = Date.now()
                setThrottledValue(value)
            }, interval - (now - lastUpdated.current))

            return () => clearTimeout(timer)
        }
    }, [value, interval])

    return throttledValue
}

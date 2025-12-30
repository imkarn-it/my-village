"use client"

import Image, { ImageProps } from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
    fallback?: string
    showSkeleton?: boolean
}

/**
 * Optimized Image Component
 * - Automatic lazy loading
 * - Skeleton while loading
 * - Fallback on error
 * - Blur placeholder
 */
export function OptimizedImage({
    src,
    alt,
    className,
    fallback = "/images/placeholder.png",
    showSkeleton = true,
    ...props
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)

    return (
        <div className={cn("relative overflow-hidden", className)}>
            {/* Skeleton */}
            {showSkeleton && isLoading && (
                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse" />
            )}

            <Image
                src={error ? fallback : src}
                alt={alt}
                className={cn(
                    "transition-opacity duration-300",
                    isLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setError(true)
                    setIsLoading(false)
                }}
                loading="lazy"
                {...props}
            />
        </div>
    )
}

/**
 * Avatar Image with fallback to initials
 */
export function AvatarImage({
    src,
    name,
    className,
    size = 40,
}: {
    src?: string | null
    name: string
    className?: string
    size?: number
}) {
    const [error, setError] = useState(false)
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    if (!src || error) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold",
                    className
                )}
                style={{ width: size, height: size, fontSize: size * 0.4 }}
            >
                {initials}
            </div>
        )
    }

    return (
        <Image
            src={src}
            alt={name}
            width={size}
            height={size}
            className={cn("rounded-full object-cover", className)}
            onError={() => setError(true)}
        />
    )
}

/**
 * Responsive image sizes helper
 */
export function getImageSizes(type: 'card' | 'thumbnail' | 'hero' | 'full'): string {
    switch (type) {
        case 'thumbnail':
            return '(max-width: 768px) 100px, 150px'
        case 'card':
            return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        case 'hero':
            return '100vw'
        case 'full':
            return '(max-width: 768px) 100vw, 80vw'
        default:
            return '100vw'
    }
}

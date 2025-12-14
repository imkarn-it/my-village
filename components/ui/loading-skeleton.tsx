"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

// ==========================================
// Types
// ==========================================

type SkeletonVariant = "pulse" | "shimmer" | "wave"

type LoadingSkeletonProps = {
    readonly className?: string
    readonly variant?: SkeletonVariant
}

type PageLoadingProps = {
    readonly message?: string
    readonly className?: string
}

type CardSkeletonProps = {
    readonly count?: number
    readonly className?: string
}

type TableSkeletonProps = {
    readonly rows?: number
    readonly columns?: number
    readonly className?: string
}

type ListSkeletonProps = {
    readonly count?: number
    readonly showAvatar?: boolean
    readonly className?: string
}

// ==========================================
// Animation Variants
// ==========================================

const shimmerAnimation = {
    x: ["-100%", "100%"],
}

const shimmerTransition = {
    duration: 1.5,
    repeat: Infinity,
    ease: "linear" as const,
}

const pulseAnimation = {
    opacity: [0.6, 1, 0.6],
}

const pulseTransition = {
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut" as const,
}

// ==========================================
// Base Components
// ==========================================

/**
 * Base skeleton component with multiple animation variants
 */
export function LoadingSkeleton({
    className,
    variant = "shimmer",
}: LoadingSkeletonProps): React.JSX.Element {
    if (variant === "pulse") {
        return (
            <motion.div
                className={cn("bg-slate-200 dark:bg-slate-700/50 rounded-md", className)}
                animate={pulseAnimation}
                transition={pulseTransition}
            />
        )
    }

    if (variant === "wave") {
        return (
            <motion.div
                className={cn("bg-slate-200 dark:bg-slate-700/50 rounded-md", className)}
                animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                style={{
                    background: "linear-gradient(90deg, var(--tw-bg-slate-200) 25%, var(--tw-bg-slate-300) 50%, var(--tw-bg-slate-200) 75%)",
                    backgroundSize: "200% 100%",
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
        )
    }

    // Default: shimmer
    return (
        <div className={cn("relative overflow-hidden bg-slate-200 dark:bg-slate-700/50 rounded-md", className)}>
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"
                animate={shimmerAnimation}
                transition={shimmerTransition}
            />
        </div>
    )
}

// ==========================================
// Page Loading Component
// ==========================================

/**
 * Full page loading spinner with optional message
 * Use when entire page is loading
 */
export function PageLoading({ message = "กำลังโหลด...", className }: PageLoadingProps): React.JSX.Element {
    return (
        <motion.div
            className={cn("flex flex-col items-center justify-center min-h-[400px] gap-4", className)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
                <Loader2 className="w-10 h-10 text-slate-400" />
            </motion.div>
            <motion.p
                className="text-slate-500 dark:text-slate-400 text-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {message}
            </motion.p>
        </motion.div>
    )
}

/**
 * Inline loading spinner
 * Use for buttons, small areas
 */
export function InlineLoading({ className }: { className?: string }): React.JSX.Element {
    return (
        <motion.div
            className={cn("flex items-center gap-2", className)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <Loader2 className="w-4 h-4 animate-spin text-current" />
            <span className="text-sm">กำลังโหลด...</span>
        </motion.div>
    )
}

// ==========================================
// Card Skeleton
// ==========================================

/**
 * Skeleton for dashboard cards
 */
export function CardSkeleton({ count = 1, className }: CardSkeletonProps): React.JSX.Element {
    return (
        <div className={cn("grid gap-4", className)}>
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    className="bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <LoadingSkeleton className="h-4 w-24" />
                            <LoadingSkeleton className="h-8 w-8 rounded-lg" />
                        </div>
                        <LoadingSkeleton className="h-8 w-20" />
                        <LoadingSkeleton className="h-3 w-32" />
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

/**
 * Grid of card skeletons for dashboard
 */
export function DashboardCardSkeleton({ count = 4 }: { count?: number }): React.JSX.Element {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    className="bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 backdrop-blur-sm"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <LoadingSkeleton className="h-4 w-20" />
                        <LoadingSkeleton className="h-10 w-10 rounded-xl" />
                    </div>
                    <LoadingSkeleton className="h-8 w-16 mb-2" />
                    <LoadingSkeleton className="h-3 w-24" />
                </motion.div>
            ))}
        </div>
    )
}

// ==========================================
// Table Skeleton
// ==========================================

/**
 * Skeleton for tables
 */
export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps): React.JSX.Element {
    return (
        <div className={cn("bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm", className)}>
            {/* Header */}
            <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 py-4 flex gap-6">
                {Array.from({ length: columns }).map((_, i) => (
                    <LoadingSkeleton key={i} className="h-4 flex-1" />
                ))}
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <motion.div
                    key={rowIndex}
                    className="px-6 py-4 flex gap-6 border-t border-slate-100 dark:border-slate-800"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: rowIndex * 0.05 }}
                >
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <LoadingSkeleton
                            key={colIndex}
                            className={cn("h-5 flex-1", colIndex === 0 && "max-w-[200px]")}
                        />
                    ))}
                </motion.div>
            ))}
        </div>
    )
}

// ==========================================
// List Skeleton
// ==========================================

/**
 * Skeleton for lists with optional avatar
 */
export function ListSkeleton({ count = 5, showAvatar = true, className }: ListSkeletonProps): React.JSX.Element {
    return (
        <div className={cn("space-y-3", className)}>
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                >
                    {showAvatar && (
                        <LoadingSkeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                    )}
                    <div className="flex-1 space-y-2">
                        <LoadingSkeleton className="h-4 w-3/4" />
                        <LoadingSkeleton className="h-3 w-1/2" />
                    </div>
                    <LoadingSkeleton className="h-8 w-20 rounded-md" />
                </motion.div>
            ))}
        </div>
    )
}

// ==========================================
// Form Skeleton
// ==========================================

/**
 * Skeleton for forms
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }): React.JSX.Element {
    return (
        <div className="space-y-6">
            {Array.from({ length: fields }).map((_, i) => (
                <motion.div
                    key={i}
                    className="space-y-2"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <LoadingSkeleton className="h-4 w-24" />
                    <LoadingSkeleton className="h-12 w-full rounded-lg" />
                </motion.div>
            ))}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: fields * 0.1 }}
            >
                <LoadingSkeleton className="h-12 w-32 rounded-lg mt-4" />
            </motion.div>
        </div>
    )
}

// ==========================================
// Stats Skeleton
// ==========================================

/**
 * Skeleton for stats/metrics display
 */
export function StatsSkeleton({ count = 4 }: { count?: number }): React.JSX.Element {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <LoadingSkeleton className="h-8 w-16 mx-auto mb-2" />
                    <LoadingSkeleton className="h-4 w-20 mx-auto" />
                </motion.div>
            ))}
        </div>
    )
}

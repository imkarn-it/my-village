"use client"

import { motion, AnimatePresence, type HTMLMotionProps } from "framer-motion"
import type { ReactNode } from "react"

// ==========================================
// Types
// ==========================================

type PageTransitionProps = {
    readonly children: ReactNode
    readonly className?: string
}

type FadeInProps = HTMLMotionProps<"div"> & {
    readonly children: ReactNode
    readonly delay?: number
    readonly duration?: number
    readonly className?: string
}

type SlideInProps = HTMLMotionProps<"div"> & {
    readonly children: ReactNode
    readonly direction?: "up" | "down" | "left" | "right"
    readonly delay?: number
    readonly duration?: number
    readonly className?: string
}

type StaggerContainerProps = {
    readonly children: ReactNode
    readonly staggerDelay?: number
    readonly className?: string
}

type StaggerItemProps = HTMLMotionProps<"div"> & {
    readonly children: ReactNode
    readonly className?: string
}

type ScaleInProps = HTMLMotionProps<"div"> & {
    readonly children: ReactNode
    readonly delay?: number
    readonly duration?: number
    readonly className?: string
}

// ==========================================
// Animation Variants
// ==========================================

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut",
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.2,
            ease: "easeIn",
        },
    },
}

const fadeVariants = {
    initial: { opacity: 0 },
    animate: (delay: number) => ({
        opacity: 1,
        transition: {
            duration: 0.4,
            delay,
            ease: "easeOut",
        },
    }),
}

const slideVariants = {
    up: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } },
    down: { initial: { opacity: 0, y: -30 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 } },
}

const staggerContainer = {
    animate: (staggerDelay: number) => ({
        transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
        },
    }),
}

const staggerItem = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: "easeOut",
        },
    },
}

const scaleVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: (delay: number) => ({
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    }),
}

// ==========================================
// Components
// ==========================================

/**
 * Wraps page content with enter/exit animations
 * Use at the top of page components for smooth transitions
 */
export function PageTransition({ children, className }: PageTransitionProps): React.JSX.Element {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

/**
 * Simple fade-in animation
 * Good for headers, text content
 */
export function FadeIn({
    children,
    delay = 0,
    duration = 0.4,
    className,
    ...props
}: FadeInProps): React.JSX.Element {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration, delay, ease: "easeOut" }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

/**
 * Slide-in animation from specified direction
 * Good for cards, panels, side content
 */
export function SlideIn({
    children,
    direction = "up",
    delay = 0,
    duration = 0.4,
    className,
    ...props
}: SlideInProps): React.JSX.Element {
    const variants = slideVariants[direction]

    return (
        <motion.div
            initial={variants.initial}
            animate={{
                ...variants.animate,
                transition: { duration, delay, ease: "easeOut" },
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

/**
 * Container for staggered list animations
 * Wrap around a list of StaggerItem components
 */
export function StaggerContainer({
    children,
    staggerDelay = 0.1,
    className,
}: StaggerContainerProps): React.JSX.Element {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            custom={staggerDelay}
            className={className}
        >
            {children}
        </motion.div>
    )
}

/**
 * Individual item in a staggered list
 * Must be used inside a StaggerContainer
 */
export function StaggerItem({ children, className, ...props }: StaggerItemProps): React.JSX.Element {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

/**
 * Scale-in animation
 * Good for modals, dialogs, cards
 */
export function ScaleIn({
    children,
    delay = 0,
    duration = 0.3,
    className,
    ...props
}: ScaleInProps): React.JSX.Element {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
                opacity: 1,
                scale: 1,
                transition: { duration, delay, ease: "easeOut" },
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

/**
 * Animated presence wrapper for conditional rendering
 * Enables exit animations
 */
export function AnimatedPresence({ children }: { children: ReactNode }): React.JSX.Element {
    return <AnimatePresence mode="wait">{children}</AnimatePresence>
}

// ==========================================
// Card & List Animations (Presets)
// ==========================================

/**
 * Animated Card - use for dashboard cards, info panels
 */
export function AnimatedCard({
    children,
    delay = 0,
    className,
    ...props
}: FadeInProps): React.JSX.Element {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                    duration: 0.4,
                    delay,
                    ease: "easeOut",
                },
            }}
            whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 },
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

/**
 * Animated List Item - use for list items, cards in a list
 */
export function AnimatedListItem({
    children,
    delay = 0,
    className,
    ...props
}: FadeInProps): React.JSX.Element {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{
                opacity: 1,
                x: 0,
                transition: {
                    duration: 0.3,
                    delay,
                    ease: "easeOut",
                },
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}

// ==========================================
// Loading Animation Components
// ==========================================

/**
 * Pulsing skeleton loader with smooth animation
 */
export function SkeletonPulse({ className }: { className?: string }): React.JSX.Element {
    return (
        <motion.div
            className={`bg-slate-200 dark:bg-slate-700 rounded-md ${className}`}
            animate={{
                opacity: [0.5, 1, 0.5],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
    )
}

/**
 * Shimmer effect loader
 */
export function SkeletonShimmer({ className }: { className?: string }): React.JSX.Element {
    return (
        <div className={`relative overflow-hidden bg-slate-200 dark:bg-slate-700 rounded-md ${className}`}>
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                    x: ["-100%", "100%"],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
        </div>
    )
}

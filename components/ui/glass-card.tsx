"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription, CardAction } from "./card";

/**
 * GlassCard - Card component with glassmorphism effect built-in
 * 
 * Usage:
 * ```tsx
 * <GlassCard>
 *   <GlassCardHeader>
 *     <GlassCardTitle>Title</GlassCardTitle>
 *   </GlassCardHeader>
 *   <GlassCardContent>
 *     Content here
 *   </GlassCardContent>
 * </GlassCard>
 * ```
 * 
 * Variants:
 * - default: Standard glassmorphism
 * - elevated: More prominent shadow
 * - gradient: With gradient border
 */

type GlassCardVariant = "default" | "elevated" | "gradient";

interface GlassCardProps extends React.ComponentProps<"div"> {
    variant?: GlassCardVariant;
}

const glassCardVariants: Record<GlassCardVariant, string> = {
    default: "bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm",
    elevated: "bg-white/90 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/50 backdrop-blur-md shadow-lg",
    gradient: "bg-white/80 dark:bg-slate-900/50 border-transparent dark:border-slate-700/30 backdrop-blur-sm bg-gradient-to-br from-white/90 to-white/70 dark:from-slate-900/60 dark:to-slate-800/40",
};

function GlassCard({ className, variant = "default", ...props }: GlassCardProps) {
    return (
        <Card
            className={cn(
                glassCardVariants[variant],
                className
            )}
            {...props}
        />
    );
}

// Re-export card subcomponents with Glass prefix for consistency
const GlassCardHeader = CardHeader;
const GlassCardContent = CardContent;
const GlassCardFooter = CardFooter;
const GlassCardTitle = CardTitle;
const GlassCardDescription = CardDescription;
const GlassCardAction = CardAction;

export {
    GlassCard,
    GlassCardHeader,
    GlassCardContent,
    GlassCardFooter,
    GlassCardTitle,
    GlassCardDescription,
    GlassCardAction,
    type GlassCardVariant,
};

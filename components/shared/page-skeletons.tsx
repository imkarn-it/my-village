"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

/**
 * Dashboard Skeleton - สำหรับหน้า dashboard ทุก role
 */
export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                                <Skeleton className="h-12 w-12 rounded-full" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full rounded-lg" />
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full rounded-lg" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

/**
 * Table Skeleton - สำหรับหน้าที่มี data table
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-9 w-24" />
            </CardHeader>
            <CardContent>
                {/* Table Header */}
                <div className="flex gap-4 mb-4 pb-4 border-b">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-4 flex-1" />
                    ))}
                </div>
                {/* Table Rows */}
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex gap-4 py-4 border-b last:border-0">
                        {[1, 2, 3, 4, 5].map((j) => (
                            <Skeleton key={j} className="h-4 flex-1" />
                        ))}
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

/**
 * Card Grid Skeleton - สำหรับ card list (bills, bookings, etc.)
 */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <Card key={i} className="border-0 shadow-lg overflow-hidden">
                    <Skeleton className="h-40 w-full" />
                    <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex gap-2 pt-2">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-20" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

/**
 * Form Skeleton - สำหรับ form pages
 */
export function FormSkeleton() {
    return (
        <Card className="border-0 shadow-lg max-w-2xl mx-auto">
            <CardHeader>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-72 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Form Fields */}
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                ))}
                {/* Textarea */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-24 w-full rounded-md" />
                </div>
                {/* Submit Button */}
                <Skeleton className="h-10 w-full rounded-md" />
            </CardContent>
        </Card>
    )
}

/**
 * List Skeleton - สำหรับ simple list
 */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-8" />
                </div>
            ))}
        </div>
    )
}

/**
 * Profile Skeleton - สำหรับ profile pages
 */
export function ProfileSkeleton() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Avatar & Name */}
            <Card className="border-0 shadow-lg">
                <CardContent className="p-6 flex flex-col items-center gap-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-32" />
                </CardContent>
            </Card>
            {/* Info Cards */}
            <Card className="border-0 shadow-lg">
                <CardContent className="p-6 space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}

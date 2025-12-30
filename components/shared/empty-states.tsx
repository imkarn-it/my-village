"use client"

import { Button } from "@/components/ui/button"
import {
    Inbox,
    Search,
    Bell,
    FileX,
    Calendar,
    Package,
    Users,
    Wrench,
    type LucideIcon
} from "lucide-react"
import Link from "next/link"

interface EmptyStateProps {
    icon?: LucideIcon
    title: string
    description?: string
    action?: {
        label: string
        href?: string
        onClick?: () => void
    }
}

/**
 * Generic Empty State Component
 */
export function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    action
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                    {description}
                </p>
            )}
            {action && (
                action.href ? (
                    <Link href={action.href}>
                        <Button>{action.label}</Button>
                    </Link>
                ) : (
                    <Button onClick={action.onClick}>{action.label}</Button>
                )
            )}
        </div>
    )
}

/**
 * No Search Results
 */
export function NoSearchResults({ query }: { query?: string }) {
    return (
        <EmptyState
            icon={Search}
            title="ไม่พบผลการค้นหา"
            description={query
                ? `ไม่พบข้อมูลที่ตรงกับ "${query}" ลองค้นหาด้วยคำอื่น`
                : "ลองค้นหาด้วยคำอื่น หรือเปลี่ยนตัวกรอง"
            }
        />
    )
}

/**
 * No Notifications
 */
export function NoNotifications() {
    return (
        <EmptyState
            icon={Bell}
            title="ไม่มีการแจ้งเตือน"
            description="เมื่อมีการแจ้งเตือนใหม่ จะแสดงที่นี่"
        />
    )
}

/**
 * No Data
 */
export function NoData({ type = "ข้อมูล" }: { type?: string }) {
    return (
        <EmptyState
            icon={FileX}
            title={`ยังไม่มี${type}`}
            description={`ยังไม่มี${type}ในระบบ`}
        />
    )
}

/**
 * No Bills
 */
export function NoBills() {
    return (
        <EmptyState
            icon={FileX}
            title="ไม่มีบิลค้างชำระ"
            description="คุณไม่มีบิลที่ต้องชำระในขณะนี้"
        />
    )
}

/**
 * No Bookings
 */
export function NoBookings() {
    return (
        <EmptyState
            icon={Calendar}
            title="ยังไม่มีการจอง"
            description="คุณยังไม่มีการจองสิ่งอำนวยความสะดวก"
            action={{
                label: "จองเลย",
                href: "/resident/facilities"
            }}
        />
    )
}

/**
 * No Parcels
 */
export function NoParcels() {
    return (
        <EmptyState
            icon={Package}
            title="ไม่มีพัสดุ"
            description="ยังไม่มีพัสดุที่รอรับในขณะนี้"
        />
    )
}

/**
 * No Visitors
 */
export function NoVisitors() {
    return (
        <EmptyState
            icon={Users}
            title="ยังไม่มีผู้มาติดต่อ"
            description="เพิ่มผู้มาติดต่อเพื่อสร้าง QR Code สำหรับเข้าหมู่บ้าน"
            action={{
                label: "เพิ่มผู้มาติดต่อ",
                href: "/resident/visitors/new"
            }}
        />
    )
}

/**
 * No Maintenance Requests
 */
export function NoMaintenanceRequests() {
    return (
        <EmptyState
            icon={Wrench}
            title="ไม่มีงานซ่อม"
            description="ยังไม่มีคำขอแจ้งซ่อมในขณะนี้"
            action={{
                label: "แจ้งซ่อม",
                href: "/resident/maintenance/new"
            }}
        />
    )
}

/**
 * Error State
 */
export function ErrorState({
    message = "เกิดข้อผิดพลาด",
    onRetry
}: {
    message?: string
    onRetry?: () => void
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <FileX className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                เกิดข้อผิดพลาด
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                {message}
            </p>
            {onRetry && (
                <Button variant="outline" onClick={onRetry}>
                    ลองใหม่
                </Button>
            )}
        </div>
    )
}

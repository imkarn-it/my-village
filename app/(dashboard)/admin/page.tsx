export const dynamic = 'force-dynamic'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Users,
    Package,
    CreditCard,
    Wrench,
    Bell,
    TrendingUp,
    TrendingDown,
    Clock,
    AlertTriangle,
    type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { db } from "@/lib/db"
import { users, parcels, bills, maintenanceRequests } from "@/lib/db/schema"
import { eq, isNull, count, sum, desc } from "drizzle-orm"
import { ROLES, STATUS } from "@/lib/constants"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"

// ==========================================
// Types
// ==========================================

type TrendDirection = "up" | "down" | "neutral"

type DashboardStat = {
    readonly title: string
    readonly value: string
    readonly change: string
    readonly trend: TrendDirection
    readonly icon: LucideIcon
    readonly color: string
    readonly href: string
}

type ActivityItem = {
    readonly id: string
    readonly type: string
    readonly message: string
    readonly time: string
    readonly icon: LucideIcon
    readonly color: string
    readonly timestamp: number
}

type TaskPriority = "high" | "normal" | "low"

type PendingTask = {
    readonly id: number
    readonly title: string
    readonly priority: TaskPriority
    readonly dueDate: string
}

type QuickAction = {
    readonly label: string
    readonly href: string
    readonly icon: LucideIcon
    readonly hoverColor: string
}

// ==========================================
// Constants
// ==========================================

const QUICK_ACTIONS = [
    {
        label: "สร้างประกาศ",
        href: "/admin/announcements/new",
        icon: Bell,
        hoverColor: "hover:border-purple-500/50",
    },
    {
        label: "รับพัสดุ",
        href: "/admin/parcels/new",
        icon: Package,
        hoverColor: "hover:border-emerald-500/50",
    },
    {
        label: "ออกบิล",
        href: "/admin/bills/new",
        icon: CreditCard,
        hoverColor: "hover:border-amber-500/50",
    },
    {
        label: "เพิ่มลูกบ้าน",
        href: "/admin/residents/new",
        icon: Users,
        hoverColor: "hover:border-cyan-500/50",
    },
] as const satisfies readonly QuickAction[]

const MOCK_PENDING_TASKS: readonly PendingTask[] = [
    {
        id: 1,
        title: "ตรวจสอบการชำระเงินประจำเดือน",
        priority: "high",
        dueDate: "วันนี้",
    },
    {
        id: 2,
        title: "อนุมัติผู้ใช้งานใหม่",
        priority: "normal",
        dueDate: "พรุ่งนี้",
    },
] as const

// ==========================================
// Helper Functions
// ==========================================

function formatRelativeTime(date: Date | null): string {
    if (!date) return ""
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: th })
}

function getPriorityColor(priority: TaskPriority): string {
    switch (priority) {
        case "high":
            return "bg-red-500"
        case "normal":
            return "bg-amber-500"
        case "low":
            return "bg-slate-400"
    }
}

function getPriorityBadgeClass(priority: TaskPriority): string {
    if (priority === "high") {
        return "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20"
    }
    return "bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20"
}

// ==========================================
// Component
// ==========================================

export default async function AdminDashboard(): Promise<React.JSX.Element> {
    const [
        totalResidents,
        pendingParcels,
        pendingBills,
        pendingMaintenance,
        recentParcels,
        recentMaintenance,
    ] = await Promise.all([
        db.select({ count: count() }).from(users).where(eq(users.role, ROLES.RESIDENT)),
        db.select({ count: count() }).from(parcels).where(isNull(parcels.pickedUpAt)),
        db.select({ total: sum(bills.amount) }).from(bills).where(eq(bills.status, STATUS.PENDING)),
        db.select({ count: count() }).from(maintenanceRequests).where(eq(maintenanceRequests.status, STATUS.PENDING)),
        db.select().from(parcels).orderBy(desc(parcels.receivedAt)).limit(3),
        db.select().from(maintenanceRequests).orderBy(desc(maintenanceRequests.createdAt)).limit(3),
    ])

    const stats: readonly DashboardStat[] = [
        {
            title: "ลูกบ้านทั้งหมด",
            value: totalResidents[0].count.toString(),
            change: "คน",
            trend: "neutral",
            icon: Users,
            color: "from-blue-400 to-indigo-500",
            href: "/admin/residents",
        },
        {
            title: "พัสดุรอรับ",
            value: pendingParcels[0].count.toString(),
            change: "ชิ้น",
            trend: "neutral",
            icon: Package,
            color: "from-emerald-400 to-cyan-500",
            href: "/admin/parcels",
        },
        {
            title: "บิลค้างชำระ",
            value: `฿${Number(pendingBills[0].total ?? 0).toLocaleString()}`,
            change: "บาท",
            trend: "neutral",
            icon: CreditCard,
            color: "from-amber-400 to-orange-500",
            href: "/admin/bills",
        },
        {
            title: "งานซ่อมค้าง",
            value: pendingMaintenance[0].count.toString(),
            change: "งาน",
            trend: "neutral",
            icon: Wrench,
            color: "from-red-400 to-pink-500",
            href: "/admin/maintenance",
        },
    ]

    const activities: readonly ActivityItem[] = [
        ...recentParcels.map((p: typeof recentParcels[number]) => ({
            id: `parcel-${p.id}`,
            type: "parcel",
            message: `พัสดุใหม่ - ${p.courier} (${p.trackingNumber})`,
            time: formatRelativeTime(p.receivedAt),
            icon: Package,
            color: "text-emerald-500 dark:text-emerald-400",
            timestamp: p.receivedAt ? new Date(p.receivedAt).getTime() : 0,
        })),
        ...recentMaintenance.map((m: typeof recentMaintenance[number]) => ({
            id: `maintenance-${m.id}`,
            type: "maintenance",
            message: `แจ้งซ่อมใหม่ - ${m.title}`,
            time: formatRelativeTime(m.createdAt),
            icon: Wrench,
            color: "text-orange-500 dark:text-orange-400",
            timestamp: m.createdAt ? new Date(m.createdAt).getTime() : 0,
        })),
    ]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">ภาพรวมการจัดการหมู่บ้าน</p>
                </div>
                <Link href="/admin/announcements/new">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02]">
                        <Bell className="w-5 h-5 mr-2" />
                        สร้างประกาศใหม่
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const IconComponent = stat.icon
                    return (
                        <Link key={stat.title} href={stat.href}>
                            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/5">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                                                {stat.title}
                                            </p>
                                            <p className="text-3xl font-bold text-slate-900 dark:text-white">
                                                {stat.value}
                                            </p>
                                            <div className="flex items-center gap-1">
                                                {stat.trend === "up" && (
                                                    <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                                                )}
                                                {stat.trend === "down" && (
                                                    <TrendingDown className="w-4 h-4 text-red-500 dark:text-red-400" />
                                                )}
                                                <span className="text-slate-500 text-sm">{stat.change}</span>
                                            </div>
                                        </div>
                                        <div
                                            className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                        >
                                            <IconComponent className="w-7 h-7 text-white" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-700/50">
                        <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                            กิจกรรมล่าสุด
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {activities.length > 0 ? (
                            activities.map((activity, index) => {
                                const ActivityIcon = activity.icon
                                return (
                                    <div
                                        key={activity.id}
                                        className={`flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${index !== activities.length - 1
                                            ? "border-b border-slate-200 dark:border-slate-700/30"
                                            : ""
                                            }`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                            <ActivityIcon className={`w-5 h-5 ${activity.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-slate-900 dark:text-white text-base">
                                                {activity.message}
                                            </p>
                                            <p className="text-slate-500 text-sm mt-1">{activity.time}</p>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="p-8 text-center text-slate-500">ยังไม่มีกิจกรรมล่าสุด</div>
                        )}
                    </CardContent>
                </Card>

                {/* Pending Tasks */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-700/50">
                        <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                            งานที่ต้องทำ
                        </CardTitle>
                        <Badge className="bg-amber-100 dark:bg-gradient-to-r dark:from-amber-500/10 dark:to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20">
                            {MOCK_PENDING_TASKS.length} รายการ
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        {MOCK_PENDING_TASKS.map((task, index) => (
                            <div
                                key={task.id}
                                className={`flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${index !== MOCK_PENDING_TASKS.length - 1
                                    ? "border-b border-slate-200 dark:border-slate-700/30"
                                    : ""
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                                    <span className="text-slate-900 dark:text-white text-base">{task.title}</span>
                                </div>
                                <Badge variant="outline" className={getPriorityBadgeClass(task.priority)}>
                                    {task.dueDate}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700/50">
                    <CardTitle className="text-xl text-slate-900 dark:text-white">การดำเนินการด่วน</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {QUICK_ACTIONS.map((action) => {
                            const ActionIcon = action.icon
                            return (
                                <Link key={action.href} href={action.href} className="contents">
                                    <Button
                                        variant="outline"
                                        className={`h-24 flex-col gap-2 border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 ${action.hoverColor} transition-all duration-300`}
                                    >
                                        <ActionIcon className="w-6 h-6" />
                                        <span className="text-base">{action.label}</span>
                                    </Button>
                                </Link>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

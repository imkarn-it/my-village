"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import {
    Building2,
    LayoutDashboard,
    Bell,
    Users,
    Package,
    Wrench,
    CreditCard,
    CalendarDays,
    AlertTriangle,
    MessageSquare,
    Settings,
    User,
    type LucideIcon,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import type { ReactNode } from "react"
import dynamic from "next/dynamic"
import { NotificationBell } from "@/components/dashboard/notification-bell"

// ==========================================
// Types
// ==========================================

type MenuItem = {
    readonly title: string
    readonly icon: LucideIcon
    readonly href: string
}

type DashboardLayoutProps = {
    readonly children: ReactNode
}

// ==========================================
// Constants
// ==========================================

const RESIDENT_MENU_ITEMS = [
    {
        title: "หน้าหลัก",
        icon: LayoutDashboard,
        href: "/resident",
    },
    {
        title: "ประกาศ",
        icon: Bell,
        href: "/resident/announcements",
    },
    {
        title: "ผู้มาติดต่อ",
        icon: Users,
        href: "/resident/visitors",
    },
    {
        title: "พัสดุ",
        icon: Package,
        href: "/resident/parcels",
    },
    {
        title: "แจ้งซ่อม",
        icon: Wrench,
        href: "/resident/maintenance",
    },
    {
        title: "บิล/ชำระเงิน",
        icon: CreditCard,
        href: "/resident/bills",
    },
    {
        title: "จองพื้นที่ส่วนกลาง",
        icon: CalendarDays,
        href: "/resident/facilities",
    },
    {
        title: "ติดต่อนิติบุคคล",
        icon: MessageSquare,
        href: "/resident/support",
    },
] as const satisfies readonly MenuItem[]

// ==========================================
// Helper Functions
// ==========================================

function getMenuItemClassName(isActive: boolean): string {
    return cn(
        "w-full justify-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-300",
        isActive
            ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10 border border-emerald-500/20"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
    )
}

// ==========================================
// Components
// ==========================================

function SidebarLogo(): React.JSX.Element {
    return (
        <Link href="/resident" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all duration-300 group-hover:scale-105">
                <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
                <h1 className="font-bold text-lg bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                    My Village
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">ลูกบ้าน</p>
            </div>
        </Link>
    )
}

function SosButton(): React.JSX.Element {
    return (
        <div className="px-3 mt-4">
            <Button
                variant="destructive"
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 hover:scale-[1.02] border-0"
            >
                <AlertTriangle className="w-5 h-5 mr-2 animate-pulse" />
                SOS ฉุกเฉิน
            </Button>
        </div>
    )
}

const UserMenu = dynamic(() => import("@/components/dashboard/user-menu").then(mod => mod.UserMenu), {
    ssr: false,
    loading: () => (
        <div className="w-full h-14 bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse" />
    )
})

export function AppSidebar(): React.JSX.Element {
    const pathname = usePathname()

    return (
        <Sidebar className="border-r border-slate-200 dark:border-slate-700/50 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900/80 dark:to-slate-900/80 dark:backdrop-blur-xl">
            <SidebarHeader className="border-b border-slate-200 dark:border-slate-700/50 p-4">
                <SidebarLogo />
            </SidebarHeader>

            <SidebarContent className="p-2">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-slate-500 dark:text-slate-500 text-xs uppercase tracking-wider px-3 py-2">
                        เมนูหลัก
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {RESIDENT_MENU_ITEMS.map((item) => {
                                const isActive = pathname === item.href
                                const IconComponent = item.icon

                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            className={getMenuItemClassName(isActive)}
                                        >
                                            <Link href={item.href}>
                                                <IconComponent
                                                    className={cn(
                                                        "w-5 h-5 transition-transform duration-300",
                                                        isActive && "scale-110"
                                                    )}
                                                />
                                                <span className="font-medium">{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SosButton />
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-200 dark:border-slate-700/50 p-4">
                <UserMenu />
            </SidebarFooter>
        </Sidebar>
    )
}

export function DashboardLayout({ children }: DashboardLayoutProps): React.JSX.Element {
    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-slate-50 dark:bg-slate-950">
                {/* Background decoration */}
                <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-0 dark:opacity-20" />
                <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <AppSidebar />
                <main className="flex-1 flex flex-col relative z-10">
                    {/* Header */}
                    <header className="h-16 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between px-6 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">หน้าหลัก</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <NotificationBell />
                        </div>
                    </header>

                    {/* Content */}
                    <div className="flex-1 p-6">{children}</div>
                </main>
            </div>
        </SidebarProvider>
    )
}

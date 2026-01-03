"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
// Avatar, AvatarFallback, AvatarImage - handled by HeaderUserMenu
// DropdownMenu handled by HeaderUserMenu component
import {
    Wrench,
    LayoutDashboard,
    CheckCircle,
    Clock,
    Users,
    Settings,
    Menu,
    X,
    AlertTriangle,
    Package,
    BarChart3,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "next-auth/react";
// getInitials used for fallback initialization
import { HeaderUserMenu } from "@/components/dashboard/header-user-menu";
import { FeatureGatedMenuItem, MENU_COLORS, type MenuItem } from "@/components/shared/feature-gated-menu-item";

interface MaintenanceLayoutProps {
    children: ReactNode;
}

const menuItems: MenuItem[] = [
    {
        label: "Dashboard",
        href: "/maintenance",
        icon: LayoutDashboard,
    },
    {
        label: "งานที่รอดำเนินการ",
        href: "/maintenance/pending",
        icon: Clock,
        count: 12,
        featureKey: "maintenance",
    },
    {
        label: "งานที่กำลังดำเนินการ",
        href: "/maintenance/in-progress",
        icon: Wrench,
        count: 5,
        featureKey: "maintenance",
    },
    {
        label: "งานที่เสร็จแล้ว",
        href: "/maintenance/completed",
        icon: CheckCircle,
        featureKey: "maintenance",
    },
    {
        label: "ประวัติการซ่อม",
        href: "/maintenance/history",
        icon: Users,
        featureKey: "maintenance",
    },
    {
        label: "จัดการตั๋ว้",
        href: "/maintenance/tickets",
        icon: AlertTriangle,
        featureKey: "support",
    },
    {
        label: "คงคลังอะไหล่",
        href: "/maintenance/parts",
        icon: Package,
        count: 3,
    },
    {
        label: "วิเคราะห์ข้อมูล",
        href: "/maintenance/analytics",
        icon: BarChart3,
    },
];

export default function MaintenanceLayout({ children }: MaintenanceLayoutProps): React.JSX.Element {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { data: session } = useSession();
    const user = session?.user;
    // initials available for user display if needed
    const _initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'ช';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative">
            {/* Background decoration */}
            <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-0 dark:opacity-50" />
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Mobile sidebar overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 z-50 h-full w-72 transform border-r border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700/50">
                    <Link href="/maintenance" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-all duration-300 group-hover:scale-105">
                            <Wrench className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                            Maintenance
                        </span>
                    </Link>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <FeatureGatedMenuItem
                                key={item.href}
                                item={item}
                                isActive={isActive}
                                onClick={() => setIsSidebarOpen(false)}
                                colorClass={MENU_COLORS.maintenance}
                            />
                        );
                    })}
                </nav>

                {/* SOS Button */}
                <div className="px-4 mt-6">
                    <Button
                        variant="destructive"
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 hover:scale-[1.02] border-0"
                    >
                        <AlertTriangle className="w-5 h-5 mr-2 animate-pulse" />
                        แจ้งเหตุฉุกเฉิน
                    </Button>
                </div>

                {/* Settings */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700/50">
                    <Link
                        href="/maintenance/settings"
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-300"
                    >
                        <Settings className="w-5 h-5" />
                        <span>ตั้งค่า</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-72">
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl px-4 lg:px-6">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Right side */}
                    <div className="flex items-center gap-4 ml-auto">
                        <ThemeToggle />

                        {/* User Menu */}
                        <HeaderUserMenu role="maintenance" />
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-6 relative z-10">{children}</main>
            </div>
        </div>
    );
}
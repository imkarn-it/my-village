"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Shield,
    LayoutDashboard,
    Building2,
    Users,
    Database,
    Settings,
    Menu,
    X,
    Activity,
    BarChart3,
    Lock,
    Globe,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut, useSession } from "next-auth/react";
import { getInitials } from "@/lib/utils";
import { HeaderUserMenu } from "@/components/dashboard/header-user-menu";

interface SuperAdminLayoutProps {
    children: ReactNode;
}

const menuItems = [
    {
        label: "Dashboard",
        href: "/super-admin",
        icon: LayoutDashboard,
    },
    {
        label: "โครงการทั้งหมด",
        href: "/super-admin/projects",
        icon: Building2,
    },
    {
        label: "ผู้ใช้ทั้งหมด",
        href: "/super-admin/users",
        icon: Users,
    },
    {
        label: "ฐานข้อมูล",
        href: "/super-admin/database",
        icon: Database,
    },
    {
        label: "กิจกรรมระบบ",
        href: "/super-admin/activity",
        icon: Activity,
        count: 23, // Mock count for recent activities
    },
    {
        label: "รายงานทั่วระบบ",
        href: "/super-admin/reports",
        icon: BarChart3,
    },
    {
        label: "การเข้าถึงข้อมูล",
        href: "/super-admin/permissions",
        icon: Lock,
    },
    {
        label: "การตั้งค่าระบบ",
        href: "/super-admin/settings",
        icon: Settings,
    },
];

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps): React.JSX.Element {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { data: session } = useSession();
    const user = session?.user;
    const initials = getInitials(user?.name || "Super Admin");

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative">
            {/* Background decoration */}
            <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-0 dark:opacity-50" />
            <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

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
                    "fixed left-0 top-0 z-50 h-full w-80 transform border-r border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700/50">
                    <Link href="/super-admin" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-105">
                            <Globe className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                Super Admin
                            </span>
                            <p className="text-xs text-slate-500 dark:text-slate-400">ระบบจัดการหลายโครงการ</p>
                        </div>
                    </Link>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Current Project Selector */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/50">
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                        <div>
                            <p className="text-xs font-medium text-purple-600 dark:text-purple-400">โครงการปัจจุบัน</p>
                            <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">My Village</p>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs">
                            เปลี่ยน
                        </Button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={cn(
                                    "flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-all duration-300",
                                    isActive
                                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-white shadow-lg shadow-purple-500/10 border border-purple-500/20"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon
                                        className={cn(
                                            "w-5 h-5 transition-colors",
                                            isActive ? "text-purple-500 dark:text-purple-400" : "text-slate-500"
                                        )}
                                    />
                                    <span>{item.label}</span>
                                </div>
                                {item.count && item.count > 0 && (
                                    <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {item.count}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* System Info */}
                <div className="px-4 mt-6 mb-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">สถานะระบบ</p>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Version</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300">v2.1.0</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">Uptime</span>
                                <span className="text-green-600">99.9%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700/50">
                    <Link
                        href="/super-admin/profile"
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-300"
                    >
                        <Settings className="w-5 h-5" />
                        <span>ตั้งค่าส่วนตัว</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-80">
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
                        <HeaderUserMenu role="super_admin" />
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-6 relative z-10">{children}</main>
            </div>
        </div>
    );
}
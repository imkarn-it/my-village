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
    Users,
    Bell,
    Package,
    CreditCard,
    Wrench,
    Home,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    UserCog,
    FileText,
    BarChart3,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "next-auth/react";

interface AdminLayoutProps {
    children: ReactNode;
}

const menuItems = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        label: "ประกาศ",
        href: "/admin/announcements",
        icon: Bell,
    },
    {
        label: "ลูกบ้าน",
        href: "/admin/residents",
        icon: Users,
    },
    {
        label: "พัสดุ",
        href: "/admin/parcels",
        icon: Package,
    },
    {
        label: "บิล/ชำระเงิน",
        href: "/admin/bills",
        icon: CreditCard,
    },
    {
        label: "แจ้งซ่อม",
        href: "/admin/maintenance",
        icon: Wrench,
    },
    {
        label: "หน่วยที่พัก",
        href: "/admin/units",
        icon: Home,
    },
    {
        label: "รายงาน",
        href: "/admin/reports",
        icon: BarChart3,
    },
];

export default function AdminLayout({ children }: AdminLayoutProps): React.JSX.Element {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative">
            {/* Background decoration */}
            <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-0 dark:opacity-50" />
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

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
                    "fixed left-0 top-0 z-50 h-full w-72 transform border-r border-slate-200 dark:border-slate-700/50 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900/80 dark:to-slate-900/80 dark:backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-700/50">
                    <Link href="/admin" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-105">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                            Admin Panel
                        </span>
                    </Link>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
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
                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all duration-300",
                                    isActive
                                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-white shadow-lg shadow-purple-500/10 border border-purple-500/20"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "w-5 h-5 transition-colors",
                                        isActive ? "text-purple-500 dark:text-purple-400" : "text-slate-500"
                                    )}
                                />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Settings */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700/50">
                    <Link
                        href="/admin/settings"
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

                        {/* Notifications */}
                        <Button variant="ghost" size="icon" className="relative text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-xs text-white flex items-center justify-center font-medium shadow-lg shadow-red-500/25">
                                5
                            </span>
                        </Button>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800/50">
                                    <Avatar className="w-8 h-8 ring-2 ring-purple-500/30">
                                        <AvatarImage src="" />
                                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-semibold">
                                            A
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden sm:block text-slate-700 dark:text-slate-300 text-sm font-medium">Admin</span>
                                    <ChevronDown className="w-4 h-4 text-slate-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900/95 border-slate-200 dark:border-slate-700/50 dark:backdrop-blur-xl">
                                <DropdownMenuLabel className="text-slate-500 dark:text-slate-300">บัญชีของฉัน</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700/50" />
                                <DropdownMenuItem asChild className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800/50 focus:text-slate-900 dark:focus:text-white cursor-pointer">
                                    <Link href="/admin/profile">
                                        <UserCog className="w-4 h-4 mr-2" />
                                        โปรไฟล์
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800/50 focus:text-slate-900 dark:focus:text-white cursor-pointer">
                                    <Link href="/admin/settings">
                                        <Settings className="w-4 h-4 mr-2" />
                                        ตั้งค่า
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700/50" />
                                <DropdownMenuItem
                                    onClick={() => signOut()}
                                    className="text-red-500 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-400 cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    ออกจากระบบ
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-6 relative z-10">{children}</main>
            </div>
        </div>
    );
}

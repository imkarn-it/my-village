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
    Car,
    AlertTriangle,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronDown,
    UserCog,
    QrCode,
    Camera,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "next-auth/react";

interface SecurityLayoutProps {
    children: ReactNode;
}

const menuItems = [
    {
        label: "Dashboard",
        href: "/security",
        icon: LayoutDashboard,
    },
    {
        label: "ผู้มาติดต่อ",
        href: "/security/visitors",
        icon: Users,
    },
    {
        label: "รับพัสดุ",
        href: "/security/parcels",
        icon: Package,
    },
    {
        label: "ยานพาหนะ",
        href: "/security/vehicles",
        icon: Car,
    },
    {
        label: "สแกน QR",
        href: "/security/scan",
        icon: QrCode,
    },
    {
        label: "กล้องวงจรปิด",
        href: "/security/cctv",
        icon: Camera,
    },
];

export default function SecurityLayout({ children }: SecurityLayoutProps): React.JSX.Element {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative">
            {/* Background decoration */}
            <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-0 dark:opacity-50" />
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

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
                    <Link href="/security" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                            Security
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
                                        ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-white shadow-lg shadow-blue-500/10 border border-blue-500/20"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "w-5 h-5 transition-colors",
                                        isActive ? "text-blue-500 dark:text-blue-400" : "text-slate-500"
                                    )}
                                />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Emergency Button */}
                <div className="absolute bottom-20 left-0 right-0 p-4">
                    <Button className="w-full h-14 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold text-lg shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 animate-pulse">
                        <AlertTriangle className="w-6 h-6 mr-2" />
                        ฉุกเฉิน SOS
                    </Button>
                </div>

                {/* Settings */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700/50">
                    <Link
                        href="/security/settings"
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
                                3
                            </span>
                        </Button>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800/50">
                                    <Avatar className="w-8 h-8 ring-2 ring-blue-500/30">
                                        <AvatarImage src="" />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-sm font-semibold">
                                            S
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden sm:block text-slate-700 dark:text-slate-300 text-sm font-medium">รปภ. สมศักดิ์</span>
                                    <ChevronDown className="w-4 h-4 text-slate-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900/95 border-slate-200 dark:border-slate-700/50 dark:backdrop-blur-xl">
                                <DropdownMenuLabel className="text-slate-500 dark:text-slate-300">บัญชีของฉัน</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700/50" />
                                <DropdownMenuItem asChild className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800/50 focus:text-slate-900 dark:focus:text-white cursor-pointer">
                                    <Link href="/security/profile">
                                        <UserCog className="w-4 h-4 mr-2" />
                                        โปรไฟล์
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

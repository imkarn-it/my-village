"use client"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronUp, LogOut, Settings, User } from "lucide-react"
import { getInitials } from "@/lib/utils"

import { useEffect, useState } from "react"

export function UserMenu(): React.JSX.Element {
    const { data: session } = useSession()
    const [userProfile, setUserProfile] = useState<{
        id: string;
        name: string;
        email: string;
        role: string;
        avatar?: string;
        unit?: {
            unitNumber: string;
            building: string;
        };
    } | null>(null)

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await fetch('/api/users/me')
                if (res.ok) {
                    const data = await res.json()
                    if (data.success) {
                        setUserProfile(data.data)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user profile", error)
            }
        }

        if (session?.user) {
            fetchUserProfile()
        }
    }, [session])

    const user = userProfile || session?.user
    const initials = getInitials(user?.name || "User")
    const avatarUrl = userProfile?.avatar || session?.user?.image || ""

    const handleLogout = (): void => {
        void signOut({ callbackUrl: '/login' })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 p-2 h-auto hover:bg-slate-200/50 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-300"
                >
                    <Avatar className="w-9 h-9 ring-2 ring-emerald-500/30">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-white font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {user?.name || "กำลังโหลด..."}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user?.email || ""}
                        </p>
                    </div>
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 bg-white dark:bg-slate-900/95 dark:backdrop-blur-xl border-slate-200 dark:border-slate-700/50"
            >
                <DropdownMenuLabel className="text-slate-500 dark:text-slate-400">
                    บัญชีของฉัน
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700/50" />
                <DropdownMenuItem asChild className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800/50 focus:text-slate-900 dark:focus:text-white cursor-pointer rounded-lg">
                    <Link href="/resident/profile">
                        <User className="mr-2 h-4 w-4" />
                        โปรไฟล์
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800/50 focus:text-slate-900 dark:focus:text-white cursor-pointer rounded-lg">
                    <Link href="/resident/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        ตั้งค่า
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700/50" />
                <DropdownMenuItem
                    className="text-red-500 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-400 cursor-pointer rounded-lg"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    ออกจากระบบ
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

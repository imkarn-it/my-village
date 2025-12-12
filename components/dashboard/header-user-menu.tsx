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
import { ChevronDown, LogOut, Settings, User, UserCog } from "lucide-react"
import { getInitials } from "@/lib/utils"
import { useEffect, useState, useId } from "react"

interface HeaderUserMenuProps {
    role?: "admin" | "security" | "resident"
}

export function HeaderUserMenu({ role = "admin" }: HeaderUserMenuProps): React.JSX.Element {
    const { data: session } = useSession()
    const [userProfile, setUserProfile] = useState<any>(null)

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
    const initials = getInitials(user?.name || (role === "admin" ? "Admin" : "Security"))
    const avatarUrl = userProfile?.avatar || user?.image || ""

    const handleLogout = (): void => {
        void signOut({ callbackUrl: '/login' })
    }

    const profileLink = `/${role}/profile`
    const settingsLink = `/${role}/settings`
    const ringColor = role === "admin" ? "ring-purple-500/30" : "ring-blue-500/30"
    const gradientFrom = role === "admin" ? "from-purple-500" : "from-blue-500"
    const gradientTo = role === "admin" ? "to-pink-500" : "to-indigo-500"

    const menuId = useId()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild id={menuId}>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800/50">
                    <Avatar className={`w-8 h-8 ring-2 ${ringColor}`}>
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white text-sm font-semibold`}>
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-slate-700 dark:text-slate-300 text-sm font-medium">
                        {user?.name || (role === "admin" ? "Admin" : "Security")}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900/95 border-slate-200 dark:border-slate-700/50 dark:backdrop-blur-xl">
                <DropdownMenuLabel className="text-slate-500 dark:text-slate-300">บัญชีของฉัน</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700/50" />
                <DropdownMenuItem asChild className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800/50 focus:text-slate-900 dark:focus:text-white cursor-pointer">
                    <Link href={profileLink}>
                        {role === "admin" ? <UserCog className="w-4 h-4 mr-2" /> : <User className="w-4 h-4 mr-2" />}
                        โปรไฟล์
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-slate-800/50 focus:text-slate-900 dark:focus:text-white cursor-pointer">
                    <Link href={settingsLink}>
                        <Settings className="w-4 h-4 mr-2" />
                        ตั้งค่า
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700/50" />
                <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-500 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-400 cursor-pointer"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    ออกจากระบบ
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

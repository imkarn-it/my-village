"use client"

import { useState, useEffect, useId } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { api } from "@/lib/api/client"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { createClient } from "@/lib/supabase/client"

type Notification = {
    id: string
    title: string
    message: string | null
    type: string | null
    link: string | null
    isRead: boolean | null
    createdAt: Date | string | null
}

export function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const menuId = useId()
    const { data: session } = useSession()
    const userId = session?.user?.id

    const fetchUnreadCount = async () => {
        try {
            const { data } = await api.notifications["unread-count"].get()
            if (data && data.success && data.data) {
                setUnreadCount(data.data.count)
            }
        } catch (error) {
            console.error("Failed to fetch unread count", error)
        }
    }

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            const { data } = await api.notifications.get()
            if (data && data.success) {
                setNotifications(data.data as Notification[])
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id: string) => {
        try {
            await api.notifications({ id }).read.patch()
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
            fetchUnreadCount()
        } catch (error) {
            console.error("Failed to mark as read", error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await api.notifications["read-all"].patch()
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error("Failed to mark all as read", error)
        }
    }

    useEffect(() => {
        fetchUnreadCount()
        // Poll every minute as fallback
        const interval = setInterval(fetchUnreadCount, 60000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (!userId) return

        const supabase = createClient()
        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                () => {
                    setUnreadCount(prev => prev + 1)
                    if (isOpen) {
                        fetchNotifications()
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId, isOpen])

    useEffect(() => {
        if (isOpen) {
            fetchNotifications()
        }
    }, [isOpen])

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild id={menuId}>
                <Button variant="ghost" size="icon" className="relative text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-xs text-white flex items-center justify-center font-medium shadow-lg shadow-red-500/25">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 sm:w-96 bg-white dark:bg-slate-900/95 border-slate-200 dark:border-slate-700/50 dark:backdrop-blur-xl">
                <div className="flex items-center justify-between px-4 py-2">
                    <DropdownMenuLabel className="text-slate-500 dark:text-slate-300">การแจ้งเตือน</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); markAllAsRead(); }} className="text-xs text-purple-500 hover:text-purple-600 h-auto py-1 px-2">
                            อ่านทั้งหมด
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700/50" />
                <div className="max-h-[400px] overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-slate-500">กำลังโหลด...</div>
                    ) : notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800/50",
                                    !notification.isRead && "bg-purple-50/50 dark:bg-purple-500/5"
                                )}
                                onClick={() => {
                                    if (!notification.isRead) markAsRead(notification.id)
                                    if (notification.link) {
                                        setIsOpen(false)
                                        router.push(notification.link)
                                    }
                                }}
                            >
                                <div className="flex w-full justify-between gap-2">
                                    <span className={cn("font-medium text-sm", !notification.isRead ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400")}>
                                        {notification.title}
                                    </span>
                                    {!notification.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                                    )}
                                </div>
                                {notification.message && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                        {notification.message}
                                    </p>
                                )}
                                <span className="text-[10px] text-slate-400 mt-1">
                                    {notification.createdAt && format(new Date(notification.createdAt), 'd MMM HH:mm', { locale: th })}
                                </span>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="p-8 text-center text-sm text-slate-500">
                            ไม่มีการแจ้งเตือน
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

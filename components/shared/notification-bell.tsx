"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, Check, Trash2, CheckCheck, Loader2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/utils/format"
import Link from "next/link"

interface Notification {
    id: string
    title: string
    message: string | null
    type: string
    link: string | null
    isRead: boolean
    createdAt: string
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/notifications')
            const data = await res.json()
            if (data.success) {
                setNotifications(data.data || [])
                setUnreadCount(data.data?.filter((n: Notification) => !n.isRead).length || 0)
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchNotifications()
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [fetchNotifications])

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Failed to mark as read:', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/mark-all-read', { method: 'POST' })
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error('Failed to mark all as read:', error)
        }
    }

    const deleteNotification = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
            setNotifications(prev => prev.filter(n => n.id !== id))
            const notification = notifications.find(n => n.id === id)
            if (notification && !notification.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1))
            }
        } catch (error) {
            console.error('Failed to delete notification:', error)
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'error':
            case 'sos':
                return '🚨'
            case 'success':
                return '✅'
            case 'warning':
                return '⚠️'
            case 'bill':
                return '📄'
            case 'parcel':
                return '📦'
            case 'booking':
                return '📅'
            case 'maintenance':
                return '🔧'
            case 'visitor':
                return '👋'
            case 'announcement':
                return '📢'
            default:
                return '🔔'
        }
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>การแจ้งเตือน</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={(e) => {
                                e.preventDefault()
                                markAllAsRead()
                            }}
                        >
                            <CheckCheck className="h-3 w-3 mr-1" />
                            อ่านทั้งหมด
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <ScrollArea className="h-[300px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>ไม่มีการแจ้งเตือน</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-3 cursor-pointer",
                                    !notification.isRead && "bg-muted/50"
                                )}
                                onClick={() => {
                                    if (!notification.isRead) {
                                        markAsRead(notification.id)
                                    }
                                    if (notification.link) {
                                        setOpen(false)
                                    }
                                }}
                                asChild={!!notification.link}
                            >
                                {notification.link ? (
                                    <Link href={notification.link}>
                                        <div className="flex items-start gap-2 w-full">
                                            <span className="text-lg">{getTypeIcon(notification.type)}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">
                                                    {notification.title}
                                                </p>
                                                {notification.message && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatRelativeTime(new Date(notification.createdAt))}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                {!notification.isRead && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            e.stopPropagation()
                                                            markAsRead(notification.id)
                                                        }}
                                                    >
                                                        <Check className="h-3 w-3" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-destructive"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        deleteNotification(notification.id)
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="flex items-start gap-2 w-full">
                                        <span className="text-lg">{getTypeIcon(notification.type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">
                                                {notification.title}
                                            </p>
                                            {notification.message && (
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {notification.message}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatRelativeTime(new Date(notification.createdAt))}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            {!notification.isRead && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        markAsRead(notification.id)
                                                    }}
                                                >
                                                    <Check className="h-3 w-3" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-destructive"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    deleteNotification(notification.id)
                                                }}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

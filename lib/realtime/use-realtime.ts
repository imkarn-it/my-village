'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { WebSocketClient, createWebSocketUrl, type WebSocketMessage, type SOSMessage, type NotificationMessage } from './websocket-client'
import { useNotificationStore, useSOSStore } from '@/lib/stores'

// ==========================================
// Types
// ==========================================
export interface UseRealtimeOptions {
    /**
     * Enable SOS alerts channel
     */
    enableSOS?: boolean
    /**
     * Enable notifications channel
     */
    enableNotifications?: boolean
    /**
     * User ID for personalized notifications
     */
    userId?: string
    /**
     * User role for SOS channel (security, admin)
     */
    role?: string
    /**
     * Callback when new SOS alert received
     */
    onSOSAlert?: (alert: SOSMessage['payload']) => void
    /**
     * Callback when new notification received
     */
    onNotification?: (notification: NotificationMessage['payload']) => void
}

export interface UseRealtimeReturn {
    /**
     * Whether WebSocket is connected
     */
    isConnected: boolean
    /**
     * Manually reconnect
     */
    reconnect: () => void
    /**
     * Manually disconnect
     */
    disconnect: () => void
}

// ==========================================
// Polling Fallback for Vercel
// ==========================================
async function pollNotifications(): Promise<NotificationMessage['payload'][]> {
    try {
        const res = await fetch('/api/notifications?unreadOnly=true')
        if (!res.ok) return []
        return await res.json()
    } catch {
        return []
    }
}

async function pollSOSAlerts(): Promise<SOSMessage['payload'][]> {
    try {
        const res = await fetch('/api/sos?status=active')
        if (!res.ok) return []
        const data = await res.json()
        return data.data || []
    } catch {
        return []
    }
}

// ==========================================
// Main Hook
// ==========================================
/**
 * React hook for real-time updates via WebSocket with polling fallback
 */
export function useRealtimeUpdates(options: UseRealtimeOptions = {}): UseRealtimeReturn {
    const {
        enableSOS = false,
        enableNotifications = true,
        userId,
        role,
        onSOSAlert,
        onNotification,
    } = options

    const [isConnected, setIsConnected] = useState(false)
    const wsRef = useRef<WebSocketClient | null>(null)
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const lastSOSIds = useRef<Set<string>>(new Set())
    const lastNotificationCount = useRef<number>(0)

    // Zustand stores
    const { incrementUnread, setUnreadCount } = useNotificationStore()
    const { addAlert } = useSOSStore()

    // Handle incoming WebSocket message
    const handleMessage = useCallback(
        (message: WebSocketMessage) => {
            switch (message.type) {
                case 'sos':
                    if (enableSOS) {
                        const sosPayload = (message as SOSMessage).payload
                        addAlert({
                            id: sosPayload.id,
                            userId: sosPayload.userId,
                            userName: sosPayload.userName,
                            unit: sosPayload.unit,
                            location: sosPayload.location,
                            createdAt: new Date(sosPayload.createdAt),
                        })
                        onSOSAlert?.(sosPayload)
                    }
                    break

                case 'notification':
                    if (enableNotifications) {
                        const notifPayload = (message as NotificationMessage).payload
                        incrementUnread()
                        onNotification?.(notifPayload)
                    }
                    break
            }
        },
        [enableSOS, enableNotifications, addAlert, incrementUnread, onSOSAlert, onNotification]
    )

    // Initialize WebSocket or Polling
    useEffect(() => {
        // Check if WebSocket is available (not on Vercel serverless)
        const useWebSocket = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_WEBSOCKET === 'true'

        if (useWebSocket) {
            // WebSocket mode
            const wsUrl = createWebSocketUrl(`/api/ws?userId=${userId || ''}&role=${role || ''}`)

            wsRef.current = new WebSocketClient({
                url: wsUrl,
                onMessage: handleMessage,
                onConnect: () => setIsConnected(true),
                onDisconnect: () => setIsConnected(false),
            })

            wsRef.current.connect()
        } else {
            // Polling fallback mode
            const pollInterval = 30000 // 30 seconds

            const poll = async () => {
                if (enableNotifications) {
                    const notifications = await pollNotifications()
                    const count = notifications.length
                    if (count !== lastNotificationCount.current) {
                        setUnreadCount(count)
                        lastNotificationCount.current = count
                    }
                }

                if (enableSOS && (role === 'security' || role === 'admin')) {
                    const alerts = await pollSOSAlerts()
                    for (const alert of alerts) {
                        if (!lastSOSIds.current.has(alert.id)) {
                            lastSOSIds.current.add(alert.id)
                            addAlert({
                                id: alert.id,
                                userId: alert.userId,
                                userName: alert.userName,
                                unit: alert.unit,
                                location: alert.location,
                                createdAt: new Date(alert.createdAt),
                            })
                            onSOSAlert?.(alert)
                        }
                    }
                }
            }

            // Initial poll
            poll()

            // Set up interval
            pollingRef.current = setInterval(poll, pollInterval)
            setIsConnected(true) // Polling is always "connected"
        }

        return () => {
            wsRef.current?.disconnect()
            if (pollingRef.current) {
                clearInterval(pollingRef.current)
            }
        }
    }, [userId, role, enableSOS, enableNotifications, handleMessage, addAlert, setUnreadCount, onSOSAlert])

    const reconnect = useCallback(() => {
        wsRef.current?.disconnect()
        wsRef.current?.connect()
    }, [])

    const disconnect = useCallback(() => {
        wsRef.current?.disconnect()
        if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
        }
        setIsConnected(false)
    }, [])

    return {
        isConnected,
        reconnect,
        disconnect,
    }
}

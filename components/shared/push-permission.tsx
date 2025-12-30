"use client"

import { useEffect, useState } from 'react'
import { Bell, BellRing } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface PushPermissionProps {
    userId?: string
}

export function PushPermission({ userId }: PushPermissionProps) {
    const [showDialog, setShowDialog] = useState(false)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        // Check if already subscribed
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setIsSubscribed(Notification.permission === 'granted')
        }
    }, [])

    const initOneSignal = async () => {
        const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
        if (!appId) {
            console.warn('[Push] OneSignal App ID not configured')
            return false
        }

        try {
            // Dynamically import OneSignal
            const OneSignalModule = await import('react-onesignal')
            const OneSignal = OneSignalModule.default

            await OneSignal.init({
                appId,
                allowLocalhostAsSecureOrigin: true,
            })

            // Set external user ID for targeting
            if (userId) {
                await OneSignal.login(userId)
            }

            return true
        } catch (error) {
            console.error('[Push] Failed to initialize OneSignal:', error)
            return false
        }
    }

    const requestPermission = async () => {
        setIsLoading(true)
        try {
            const initialized = await initOneSignal()
            if (!initialized) {
                throw new Error('Failed to initialize OneSignal')
            }

            // Request permission
            const permission = await Notification.requestPermission()
            setIsSubscribed(permission === 'granted')
            setShowDialog(false)
        } catch (error) {
            console.error('[Push] Permission request failed:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Don't show if already subscribed or no Notification API
    if (isSubscribed || typeof window === 'undefined' || !('Notification' in window)) {
        return null
    }

    // Don't show if permission was denied
    if (Notification.permission === 'denied') {
        return null
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowDialog(true)}
            >
                <BellRing className="h-4 w-4" />
                เปิดแจ้งเตือน
            </Button>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            เปิดการแจ้งเตือน
                        </DialogTitle>
                        <DialogDescription>
                            รับการแจ้งเตือนเมื่อมีข้อมูลสำคัญ เช่น:
                        </DialogDescription>
                    </DialogHeader>

                    <ul className="space-y-2 py-4 text-sm">
                        <li className="flex items-center gap-2">
                            🚨 <span>แจ้งเหตุฉุกเฉิน SOS</span>
                        </li>
                        <li className="flex items-center gap-2">
                            📄 <span>แจ้งเตือนบิลใกล้ครบกำหนด</span>
                        </li>
                        <li className="flex items-center gap-2">
                            📦 <span>พัสดุมาถึง</span>
                        </li>
                        <li className="flex items-center gap-2">
                            📢 <span>ประกาศสำคัญ</span>
                        </li>
                        <li className="flex items-center gap-2">
                            👋 <span>แจ้งเตือนผู้มาติดต่อ</span>
                        </li>
                    </ul>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            ไว้ทีหลัง
                        </Button>
                        <Button onClick={requestPermission} disabled={isLoading}>
                            {isLoading ? 'กำลังเปิด...' : 'เปิดการแจ้งเตือน'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

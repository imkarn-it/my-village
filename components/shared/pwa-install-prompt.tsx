"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * PWA Install Prompt Component
 * แสดงปุ่มติดตั้ง app เมื่อพร้อม
 */
export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showPrompt, setShowPrompt] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
            return
        }

        // Listen for install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setShowPrompt(true)
        }

        // Listen for app installed
        const handleAppInstalled = () => {
            setIsInstalled(true)
            setShowPrompt(false)
            setDeferredPrompt(null)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            console.log('[PWA] User accepted install')
        } else {
            console.log('[PWA] User dismissed install')
        }

        setDeferredPrompt(null)
        setShowPrompt(false)
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        // Store dismissal in localStorage to not show again for a while
        localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
    }

    // Don't show if already installed or dismissed recently
    if (isInstalled || !showPrompt) return null

    // Check if dismissed recently (within 7 days)
    const dismissedAt = localStorage.getItem('pwa-prompt-dismissed')
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < 7 * 24 * 60 * 60 * 1000) {
        return null
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                            ติดตั้ง My Village
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            ติดตั้งแอปเพื่อเข้าถึงได้เร็วขึ้นและรับการแจ้งเตือน
                        </p>
                        <div className="flex gap-2 mt-3">
                            <Button size="sm" onClick={handleInstall}>
                                ติดตั้ง
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleDismiss}>
                                ไว้ทีหลัง
                            </Button>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

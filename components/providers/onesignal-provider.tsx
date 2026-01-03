'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

/**
 * OneSignal Provider Component
 * Initializes OneSignal SDK and sets external user ID for push notifications
 */
export function OneSignalProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession()
    const initialized = useRef(false)

    useEffect(() => {
        // Only initialize once and only on client
        if (typeof window === 'undefined' || initialized.current) {
            return
        }

        const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID
        if (!appId) {
            console.log('[OneSignal] App ID not configured, skipping initialization')
            return
        }

        const initOneSignal = async () => {
            try {
                // Dynamic import to avoid SSR issues
                const OneSignalModule = await import('react-onesignal')
                const OneSignal = OneSignalModule.default

                await OneSignal.init({
                    appId,
                    allowLocalhostAsSecureOrigin: true,
                    serviceWorkerPath: '/OneSignalSDKWorker.js',
                })

                initialized.current = true
                console.log('[OneSignal] Initialized successfully')

                // Set external user ID if logged in
                if (session?.user?.id) {
                    await OneSignal.login(session.user.id)
                    console.log('[OneSignal] User logged in:', session.user.id)
                }
            } catch (error) {
                console.error('[OneSignal] Initialization failed:', error)
            }
        }

        initOneSignal()
    }, [session?.user?.id])

    // Update user when session changes
    useEffect(() => {
        if (!initialized.current) return

        const updateUser = async () => {
            try {
                const OneSignalModule = await import('react-onesignal')
                const OneSignal = OneSignalModule.default

                if (session?.user?.id) {
                    await OneSignal.login(session.user.id)
                } else {
                    await OneSignal.logout()
                }
            } catch (error) {
                console.error('[OneSignal] Error updating user:', error)
            }
        }

        updateUser()
    }, [session?.user?.id])

    return <>{children}</>
}

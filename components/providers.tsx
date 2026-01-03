"use client"

import { SessionProvider } from "next-auth/react"
import { QueryProvider } from "@/components/providers/query-provider"
import { OneSignalProvider } from "@/components/providers/onesignal-provider"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <QueryProvider>
                <OneSignalProvider>
                    {children}
                </OneSignalProvider>
            </QueryProvider>
        </SessionProvider>
    )
}


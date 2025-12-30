"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertOctagon, RotateCcw } from "lucide-react"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        Sentry.captureException(error)
    }, [error])

    return (
        <html lang="th">
            <body>
                <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-50 dark:bg-slate-950">
                    <div className="max-w-md w-full text-center">
                        {/* Error Icon */}
                        <div className="w-24 h-24 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <AlertOctagon className="w-12 h-12 text-red-500" />
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                            เกิดข้อผิดพลาดร้ายแรง
                        </h1>

                        {/* Description */}
                        <p className="text-slate-500 dark:text-slate-400 mb-8">
                            ขออภัย ระบบเกิดข้อผิดพลาดร้ายแรง กรุณาลองรีเฟรชหน้านี้
                        </p>

                        {/* Error Details */}
                        {process.env.NODE_ENV === "development" && (
                            <div className="mb-8 p-4 bg-white dark:bg-slate-800 rounded-lg text-left border border-red-200 dark:border-red-800">
                                <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
                                    {error.message}
                                </p>
                                {error.digest && (
                                    <p className="text-xs font-mono text-slate-500 mt-2">
                                        Digest: {error.digest}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Retry Button */}
                        <Button
                            onClick={reset}
                            size="lg"
                            className="gap-2"
                        >
                            <RotateCcw className="w-5 h-5" />
                            ลองใหม่
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    )
}

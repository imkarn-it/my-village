"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, RotateCcw } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("[Error Boundary]", error)
    }, [error])

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Error Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    เกิดข้อผิดพลาด
                </h1>

                {/* Description */}
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                    ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
                </p>

                {/* Error Details (development only) */}
                {process.env.NODE_ENV === "development" && (
                    <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-left">
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

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={reset}
                        className="gap-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        ลองใหม่
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = "/"}
                        className="gap-2"
                    >
                        <Home className="w-4 h-4" />
                        กลับหน้าแรก
                    </Button>
                </div>
            </div>
        </div>
    )
}

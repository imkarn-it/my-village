"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Loader2, CheckCircle2, XCircle, Mail } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { api } from "@/lib/api/client"

function VerifyEmailContent(): React.JSX.Element {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setMessage('ไม่พบ token สำหรับยืนยันอีเมล')
            return
        }

        async function verifyEmail() {
            try {
                const { data, error } = await api.user["verify-email"].get({
                    query: { token: token! }
                })

                if (data?.success) {
                    setStatus('success')
                    setMessage('ยืนยันอีเมลสำเร็จ! คุณสามารถเข้าสู่ระบบได้แล้ว')
                    toast.success('ยืนยันอีเมลสำเร็จ')
                    setTimeout(() => router.push('/login'), 3000)
                } else {
                    setStatus('error')
                    setMessage(error?.value ? String(error.value) : 'ไม่สามารถยืนยันอีเมลได้')
                }
            } catch {
                setStatus('error')
                setMessage('เกิดข้อผิดพลาดในการยืนยันอีเมล')
            }
        }

        verifyEmail()
    }, [token, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none" />
            <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />

            <Card className="w-full max-w-md bg-slate-900/50 border-slate-700/50 backdrop-blur-xl shadow-2xl relative z-10">
                <CardHeader className="space-y-3 text-center pb-4">
                    <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-2 ${status === 'verifying'
                        ? 'bg-gradient-to-br from-blue-400 to-cyan-400'
                        : status === 'success'
                            ? 'bg-gradient-to-br from-emerald-400 to-cyan-400'
                            : 'bg-gradient-to-br from-red-400 to-orange-400'
                        }`}>
                        {status === 'verifying' ? (
                            <Loader2 className="w-9 h-9 text-white animate-spin" />
                        ) : status === 'success' ? (
                            <CheckCircle2 className="w-9 h-9 text-white" />
                        ) : (
                            <XCircle className="w-9 h-9 text-white" />
                        )}
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">
                        {status === 'verifying' ? 'กำลังยืนยันอีเมล...'
                            : status === 'success' ? 'ยืนยันอีเมลสำเร็จ!'
                                : 'ยืนยันอีเมลไม่สำเร็จ'}
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-base">
                        {message}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {status === 'success' && (
                        <div className="flex items-center justify-center gap-2 text-emerald-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">กำลังนำคุณไปหน้าเข้าสู่ระบบ...</span>
                        </div>
                    )}
                    {status === 'error' && (
                        <Button
                            asChild
                            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                        >
                            <Link href="/login">กลับไปหน้าเข้าสู่ระบบ</Link>
                        </Button>
                    )}
                </CardContent>

                {status !== 'verifying' && (
                    <CardFooter className="justify-center pt-2">
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            หากมีปัญหา กรุณาติดต่อเจ้าหน้าที่
                        </p>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}

export default function VerifyEmailPage(): React.JSX.Element {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    )
}

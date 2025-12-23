"use client"

import Link from "next/link"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Lock, Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"

function ResetPasswordContent(): React.JSX.Element {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [isPending, setIsPending] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    useEffect(() => {
        if (!token) {
            setIsValidToken(false)
            return
        }

        // Verify token
        async function verifyToken() {
            try {
                const response = await fetch(`/api/auth/verify-reset-token?token=${token}`)
                const data = await response.json()
                setIsValidToken(data.valid)
            } catch {
                setIsValidToken(false)
            }
        }

        verifyToken()
    }, [token])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error("รหัสผ่านไม่ตรงกัน")
            return
        }

        if (password.length < 6) {
            toast.error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
            return
        }

        setIsPending(true)

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            })

            const data = await response.json()

            if (data.success) {
                setIsSuccess(true)
                toast.success("รีเซ็ตรหัสผ่านสำเร็จ")
                setTimeout(() => router.push("/login"), 3000)
            } else {
                toast.error(data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่")
            }
        } catch {
            toast.error("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน")
        } finally {
            setIsPending(false)
        }
    }

    // Loading state
    if (isValidToken === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
        )
    }

    // Invalid token
    if (!isValidToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none" />
                <div className="absolute top-1/4 -left-20 w-72 h-72 bg-red-500/20 rounded-full blur-3xl" />

                <Card className="w-full max-w-md bg-slate-900/50 border-slate-700/50 backdrop-blur-xl shadow-2xl relative z-10">
                    <CardHeader className="space-y-3 text-center pb-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg mb-2">
                            <XCircle className="w-9 h-9 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">
                            ลิงก์ไม่ถูกต้อง
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-base">
                            ลิงก์สำหรับรีเซ็ตรหัสผ่านหมดอายุหรือไม่ถูกต้อง กรุณาขอลิงก์ใหม่
                        </CardDescription>
                    </CardHeader>

                    <CardFooter className="justify-center pt-2">
                        <Link
                            href="/forgot-password"
                            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                        >
                            ขอลิงก์รีเซ็ตรหัสผ่านใหม่
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    // Success state
    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none" />
                <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl" />

                <Card className="w-full max-w-md bg-slate-900/50 border-slate-700/50 backdrop-blur-xl shadow-2xl relative z-10">
                    <CardHeader className="space-y-3 text-center pb-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg mb-2">
                            <CheckCircle2 className="w-9 h-9 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">
                            รีเซ็ตรหัสผ่านสำเร็จ!
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-base">
                            คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว
                            กำลังนำคุณไปหน้าเข้าสู่ระบบ...
                        </CardDescription>
                    </CardHeader>

                    <CardFooter className="justify-center pt-2">
                        <Loader2 className="w-5 h-5 text-emerald-400 animate-spin mr-2" />
                        <span className="text-slate-400">กำลังเปลี่ยนหน้า...</span>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none" />
            <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />

            <Card className="w-full max-w-md bg-slate-900/50 border-slate-700/50 backdrop-blur-xl shadow-2xl relative z-10">
                <CardHeader className="space-y-3 text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-2">
                        <Building2 className="w-9 h-9 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">
                        ตั้งรหัสผ่านใหม่
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-base">
                        กรุณากรอกรหัสผ่านใหม่ของคุณ
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300 text-base">
                                รหัสผ่านใหม่
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isPending}
                                    className="pl-11 pr-11 h-12 text-base bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-slate-300 text-base">
                                ยืนยันรหัสผ่าน
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isPending}
                                    className="pl-11 pr-11 h-12 text-base bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.02]"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    กำลังบันทึก...
                                </>
                            ) : (
                                "ตั้งรหัสผ่านใหม่"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function ResetPasswordPage(): React.JSX.Element {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    )
}

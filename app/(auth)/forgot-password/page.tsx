"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api/client"

export default function ForgotPasswordPage(): React.JSX.Element {
    const [isPending, setIsPending] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [email, setEmail] = useState("")

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsPending(true)

        try {
            const { data, error } = await api.user["forgot-password"].post({ email })

            if (data?.success) {
                setIsSuccess(true)
                toast.success("ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว")
            } else {
                toast.error(error?.value ? String(error.value) : "เกิดข้อผิดพลาด กรุณาลองใหม่")
            }
        } catch {
            toast.error("เกิดข้อผิดพลาดในการส่งคำขอ")
        } finally {
            setIsPending(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none" />
                <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />

                <Card className="w-full max-w-md bg-slate-900/50 border-slate-700/50 backdrop-blur-xl shadow-2xl relative z-10">
                    <CardHeader className="space-y-3 text-center pb-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-2">
                            <CheckCircle2 className="w-9 h-9 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white">
                            ส่งอีเมลแล้ว!
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-base">
                            เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปที่ <span className="text-emerald-400">{email}</span> แล้ว
                            กรุณาตรวจสอบอีเมลของคุณ
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <p className="text-sm text-slate-500 text-center">
                            ไม่ได้รับอีเมล? ตรวจสอบโฟลเดอร์สแปม หรือ
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => setIsSuccess(false)}
                            className="w-full h-12 border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800/50"
                        >
                            ส่งอีเมลอีกครั้ง
                        </Button>
                    </CardContent>

                    <CardFooter className="justify-center pt-2">
                        <Link
                            href="/login"
                            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            กลับไปหน้าเข้าสู่ระบบ
                        </Link>
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
                        ลืมรหัสผ่าน?
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-base">
                        กรอกอีเมลของคุณเพื่อรับลิงก์สำหรับรีเซ็ตรหัสผ่าน
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300 text-base">
                                อีเมล
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="example@email.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isPending}
                                    className="pl-11 h-12 text-base bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300"
                                />
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
                                    กำลังส่ง...
                                </>
                            ) : (
                                "ส่งลิงก์รีเซ็ตรหัสผ่าน"
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="justify-center pt-2">
                    <Link
                        href="/login"
                        className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        กลับไปหน้าเข้าสู่ระบบ
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}

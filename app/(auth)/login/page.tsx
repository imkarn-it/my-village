"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function LoginPage(): React.JSX.Element {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isGoogleLoading, setIsGoogleLoading] = useState(false)

    async function handleGoogleSignIn(): Promise<void> {
        setIsGoogleLoading(true)
        try {
            await signIn("google", { callbackUrl: "/" })
        } catch {
            toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
            setIsGoogleLoading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsPending(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                toast.error("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
            } else {
                toast.success("เข้าสู่ระบบสำเร็จ")
                router.push("/")
                router.refresh()
            }
        } catch {
            toast.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ")
        } finally {
            setIsPending(false)
        }
    }

    function togglePasswordVisibility(): void {
        setShowPassword((prev) => !prev)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none" />
            <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

            <Card className="w-full max-w-md bg-slate-900/50 border-slate-700/50 backdrop-blur-xl shadow-2xl relative z-10">
                <CardHeader className="space-y-3 text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-2">
                        <Building2 className="w-9 h-9 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold">
                        <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            My Village
                        </span>
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-base">
                        เข้าสู่ระบบเพื่อจัดการหมู่บ้านของคุณ
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
                                    disabled={isPending}
                                    className="pl-11 h-12 text-base bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300 text-base">
                                รหัสผ่าน
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    disabled={isPending}
                                    className="pl-11 pr-11 h-12 text-base bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300"
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="text-right">
                            <Link
                                href="/forgot-password"
                                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                ลืมรหัสผ่าน?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.02]"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    กำลังเข้าสู่ระบบ...
                                </>
                            ) : (
                                "เข้าสู่ระบบ"
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-700/50" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-slate-900/50 text-slate-500">หรือ</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGoogleSignIn}
                            disabled={isGoogleLoading || isPending}
                            className="w-full h-12 text-base border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800/50 hover:border-slate-600 transition-all duration-300"
                        >
                            {isGoogleLoading ? (
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                            )}
                            เข้าสู่ระบบด้วย Google
                        </Button>
                    </div>
                </CardContent>

                <CardFooter className="justify-center pt-2">
                    <p className="text-base text-slate-400">
                        ยังไม่มีบัญชี?{" "}
                        <Link
                            href="/register"
                            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                        >
                            สมัครสมาชิก
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}

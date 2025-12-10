"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Save, Pin, ArrowLeft, Type, FileText, AlertCircle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api/client"

export default function NewAnnouncementPage(): React.JSX.Element {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsPending(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const title = formData.get("title") as string
        const content = formData.get("content") as string
        const isPinned = formData.get("isPinned") === "on"

        try {
            // Call Elysia API
            const { data, error: apiError } = await api.announcements.post({
                title,
                content,
                isPinned,
                image: null, // TODO: Add image upload
                projectId: "default-project", // TODO: Get from auth context
            })

            if (apiError) {
                throw new Error(apiError.value ? String(apiError.value) : "Failed to create announcement")
            }

            if (data && data.success) {
                toast.success("สร้างประกาศเรียบร้อยแล้ว")
                router.push("/admin/announcements")
                router.refresh()
            }
        } catch (err) {
            console.error(err)
            const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสร้างประกาศ"
            setError(message)
            toast.error(message)
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/announcements">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        สร้างประกาศใหม่
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        แจ้งข่าวสารให้ลูกบ้านทราบ
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="space-y-6 pt-6">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    หัวข้อประกาศ <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="ระบุหัวข้อประกาศ"
                                        className="pl-10"
                                        required
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">
                                    เนื้อหาประกาศ <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                    <Textarea
                                        id="content"
                                        name="content"
                                        placeholder="ระบุรายละเอียด..."
                                        className="pl-10 min-h-[150px]"
                                        required
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox id="isPinned" name="isPinned" disabled={isPending} />
                                <Label htmlFor="isPinned" className="cursor-pointer flex items-center gap-2">
                                    <Pin className="w-4 h-4 text-slate-500" />
                                    ปักหมุดประกาศนี้ไว้ด้านบน
                                </Label>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/25"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        สร้างประกาศ
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Save, ArrowLeft, Wrench, AlertCircle, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api/client"
import { ImageUpload } from "@/components/shared/image-upload"

const CATEGORIES = [
    { value: "plumbing", label: "ประปา" },
    { value: "electrical", label: "ไฟฟ้า" },
    { value: "ac", label: "เครื่องปรับอากาศ" },
    { value: "structural", label: "โครงสร้าง" },
    { value: "other", label: "อื่นๆ" },
] as const

const PRIORITIES = [
    { value: "low", label: "ต่ำ" },
    { value: "normal", label: "ปกติ" },
    { value: "high", label: "สูง" },
    { value: "urgent", label: "เร่งด่วน" },
] as const

export default function NewMaintenancePage(): React.JSX.Element {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [units, setUnits] = useState<any[]>([])
    const [imageUrl, setImageUrl] = useState<string | null>(null)

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const { data } = await api.units.get()
                if (data && data.success && Array.isArray(data.data)) {
                    setUnits(data.data)
                }
            } catch (error) {
                console.error("Failed to fetch units:", error)
            }
        }
        fetchUnits()
    }, [])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsPending(true)

        const formData = new FormData(e.currentTarget)
        const title = formData.get("title") as string
        const description = formData.get("description") as string
        const category = formData.get("category") as string
        const priority = formData.get("priority") as string
        const unitId = formData.get("unitId") as string

        try {
            const { error } = await api.maintenance.post({
                title,
                description,
                category,
                priority,
                unitId,
                images: imageUrl ? [imageUrl] : [],
            })

            if (error) {
                toast.error(error.value ? String(error.value) : "เกิดข้อผิดพลาดในการบันทึก")
            } else {
                toast.success("แจ้งซ่อมสำเร็จ")
                router.push("/resident/maintenance")
                router.refresh()
            }
        } catch (error) {
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/resident/maintenance">
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        แจ้งซ่อมใหม่
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        กรอกรายละเอียดปัญหาที่ต้องการแจ้งซ่อม
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                หัวข้อปัญหา <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="เช่น ท่อน้ำรั่ว, ไฟดับ"
                                required
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="unitId">
                                ยูนิต <span className="text-red-500">*</span>
                            </Label>
                            <Select name="unitId" required disabled={isPending}>
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกยูนิต" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.map((unit) => (
                                        <SelectItem key={unit.id} value={unit.id}>
                                            {unit.unitNumber}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="category">
                                    หมวดหมู่ <span className="text-red-500">*</span>
                                </Label>
                                <Select name="category" required disabled={isPending}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกหมวดหมู่" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">
                                    ความเร่งด่วน <span className="text-red-500">*</span>
                                </Label>
                                <Select name="priority" required disabled={isPending}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกระดับความเร่งด่วน" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRIORITIES.map((p) => (
                                            <SelectItem key={p.value} value={p.value}>
                                                {p.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">
                                รายละเอียด <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="อธิบายรายละเอียดปัญหาเพิ่มเติม..."
                                className="min-h-[120px]"
                                required
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>รูปภาพประกอบ</Label>
                            <ImageUpload
                                value={imageUrl}
                                onChange={setImageUrl}
                                bucket="maintenance"
                                disabled={isPending}
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                * รองรับไฟล์รูปภาพขนาดไม่เกิน 5MB
                            </p>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/25"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        บันทึกแจ้งซ่อม
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

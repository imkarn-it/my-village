"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Save, User, Car, Home, FileText, ArrowLeft, Camera } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api/client"

const VISITOR_PURPOSES = [
    "มาเยี่ยมญาติ",
    "ส่งของ/อาหาร",
    "ติดต่อธุระ",
    "ซ่อมแซม/ติดตั้ง",
    "ดูบ้าน",
    "อื่นๆ",
] as const

export default function NewVisitorPage(): React.JSX.Element {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [units, setUnits] = useState<{ id: string; unitNumber: string }[]>([])

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const { data } = await api.units.get()
                if (data && data.success && data.data) {
                    setUnits(data.data)
                }
            } catch (error) {
                console.error("Failed to fetch units:", error)
                toast.error("ไม่สามารถดึงข้อมูลห้องพักได้")
            }
        }
        fetchUnits()
    }, [])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsPending(true)

        const formData = new FormData(e.currentTarget)
        const visitorName = formData.get("visitorName") as string
        const unitId = formData.get("unitId") as string
        const licensePlate = formData.get("licensePlate") as string
        const purpose = formData.get("purpose") as string

        try {
            const { error } = await api.visitors.post({
                visitorName,
                unitId,
                licensePlate,
                purpose,
            })

            if (error) {
                toast.error(error.value ? String(error.value) : "เกิดข้อผิดพลาดในการบันทึก")
            } else {
                toast.success("บันทึกข้อมูลสำเร็จ")
                router.push("/security/visitors")
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
                <Link href="/security/visitors">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Check-in ผู้มาติดต่อ
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        บันทึกข้อมูลผู้มาติดต่อเข้าโครงการ
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="visitorName">
                                    ชื่อ-นามสกุล <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="visitorName"
                                        name="visitorName"
                                        placeholder="ระบุชื่อผู้มาติดต่อ"
                                        className="pl-10"
                                        required
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unitId">
                                    ติดต่อห้อง <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                                    <Select name="unitId" required disabled={isPending}>
                                        <SelectTrigger className="pl-10 w-full">
                                            <SelectValue placeholder="เลือกห้อง" />
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
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="licensePlate">ทะเบียนรถ</Label>
                                <div className="relative">
                                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="licensePlate"
                                        name="licensePlate"
                                        placeholder="เช่น กข 1234"
                                        className="pl-10"
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="purpose">
                                    วัตถุประสงค์ <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                                    <Select name="purpose" required disabled={isPending}>
                                        <SelectTrigger className="pl-10 w-full">
                                            <SelectValue placeholder="เลือกวัตถุประสงค์" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {VISITOR_PURPOSES.map((purpose) => (
                                                <SelectItem key={purpose} value={purpose}>
                                                    {purpose}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label>ถ่ายรูปบัตรประชาชน/ใบขับขี่</Label>
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                                    <Camera className="w-8 h-8 mb-2" />
                                    <span className="text-sm">คลิกเพื่อถ่ายรูป หรืออัปโหลดรูปภาพ</span>
                                    <Input type="file" name="idCardImage" className="hidden" accept="image/*" disabled={isPending} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        บันทึก Check-in
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

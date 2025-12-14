"use client"

import { useState, useEffect } from "react"

type Unit = {
    id: string;
    unitNumber: string;
    building: string | null;
    floor: number | null;
};
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
import { Loader2, Save, ArrowLeft, User, Car, Phone, QrCode } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api/client"

export default function NewVisitorPage(): React.JSX.Element {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [units, setUnits] = useState<Unit[]>([])

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
        const unitId = formData.get("unitId") as string
        const visitorName = formData.get("visitorName") as string
        const phone = formData.get("phone") as string
        const licensePlate = formData.get("licensePlate") as string
        const purpose = formData.get("purpose") as string

        try {
            const { data, error } = await api.visitors.post({
                unitId,
                visitorName,
                phone,
                licensePlate,
                purpose,
            })

            if (error) {
                toast.error(error.value ? String(error.value) : "เกิดข้อผิดพลาดในการบันทึก")
            } else if (data && data.success) {
                toast.success("สร้าง QR Code เรียบร้อยแล้ว")
                router.push("/resident/visitors")
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to create visitor:", error)
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/resident/visitors">
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                            <QrCode className="w-5 h-5 text-white" />
                        </div>
                        สร้าง QR Code ผู้มาติดต่อ
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        ลงทะเบียนล่วงหน้าสำหรับผู้มาติดต่อ
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="space-y-6 pt-6">
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

                        <div className="space-y-2">
                            <Label htmlFor="visitorName">
                                ชื่อผู้มาติดต่อ <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    id="visitorName"
                                    name="visitorName"
                                    placeholder="ระบุชื่อ-นามสกุล"
                                    className="pl-10"
                                    required
                                    disabled={isPending}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="phone">
                                    เบอร์โทรศัพท์
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        placeholder="08x-xxx-xxxx"
                                        className="pl-10"
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="licensePlate">
                                    ทะเบียนรถ
                                </Label>
                                <div className="relative">
                                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="licensePlate"
                                        name="licensePlate"
                                        placeholder="กข 1234"
                                        className="pl-10"
                                        disabled={isPending}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="purpose">
                                วัตถุประสงค์ <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="purpose"
                                name="purpose"
                                placeholder="เช่น มาหาเพื่อน, ส่งของ"
                                required
                                disabled={isPending}
                            />
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
                                        กำลังสร้าง...
                                    </>
                                ) : (
                                    <>
                                        <QrCode className="w-4 h-4 mr-2" />
                                        สร้าง QR Code
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

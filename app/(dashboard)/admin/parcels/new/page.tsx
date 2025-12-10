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
import { Loader2, Save, Package, Truck, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api/client"

const COURIERS = [
    "Kerry Express",
    "Flash Express",
    "J&T Express",
    "Thailand Post",
    "DHL",
    "Ninja Van",
    "Best Express",
    "Shopee Xpress",
    "Lazada Express",
    "Other",
] as const

export default function NewParcelPage(): React.JSX.Element {
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
        const trackingNumber = formData.get("trackingNumber") as string
        const unitId = formData.get("unitId") as string
        const courier = formData.get("courier") as string

        try {
            const { error } = await api.parcels.post({
                trackingNumber,
                unitId,
                courier,
            })

            if (error) {
                toast.error(error.value ? String(error.value) : "เกิดข้อผิดพลาดในการบันทึก")
            } else {
                toast.success("บันทึกพัสดุสำเร็จ")
                router.push("/admin/parcels")
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
                <Link href="/admin/parcels">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        รับพัสดุเข้า
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        บันทึกข้อมูลพัสดุใหม่เข้าระบบ
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="trackingNumber">
                                    เลขพัสดุ <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="trackingNumber"
                                        name="trackingNumber"
                                        placeholder="ระบุเลขพัสดุ"
                                        className="pl-10"
                                        required
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unitId">
                                    เลขห้อง <span className="text-red-500">*</span>
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

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="courier">
                                    บริษัทขนส่ง <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                                    <Select name="courier" required disabled={isPending}>
                                        <SelectTrigger className="pl-10 w-full">
                                            <SelectValue placeholder="เลือกบริษัทขนส่ง" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COURIERS.map((courier) => (
                                                <SelectItem key={courier} value={courier}>
                                                    {courier}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
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
                                        บันทึกพัสดุ
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

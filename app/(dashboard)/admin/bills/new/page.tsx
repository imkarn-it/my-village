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
import { Loader2, Save, ArrowLeft, FileText, Calendar } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api/client"
import type { Unit } from "@/types"

const BILL_TYPES = [
    { value: "water", label: "ค่าน้ำ" },
    { value: "electric", label: "ค่าไฟ" },
    { value: "common_fee", label: "ค่าส่วนกลาง" },
    { value: "other", label: "อื่นๆ" },
] as const

export default function NewBillPage(): React.JSX.Element {
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
        const billType = formData.get("billType") as string
        const amount = formData.get("amount") as string
        const dueDate = formData.get("dueDate") as string

        try {
            const { data, error } = await api.bills.post({
                unitId,
                billType,
                amount,
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
                status: "pending",
            })

            if (error) {
                toast.error(error.value ? String(error.value) : "เกิดข้อผิดพลาดในการบันทึก")
            } else if (data && data.success) {
                toast.success("สร้างบิลเรียบร้อยแล้ว")
                router.push("/admin/bills")
                router.refresh()
            }
        } catch (error) {
            console.error("Failed to create bill:", error)
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/bills">
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        สร้างบิลใหม่
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        ออกใบแจ้งหนี้สำหรับลูกบ้าน
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

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="billType">
                                    ประเภทบิล <span className="text-red-500">*</span>
                                </Label>
                                <Select name="billType" required disabled={isPending}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกประเภท" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BILL_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.label}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount">
                                    ยอดชำระ (บาท) <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="pl-10"
                                        required
                                        disabled={isPending}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dueDate">
                                กำหนดชำระ <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    id="dueDate"
                                    name="dueDate"
                                    type="date"
                                    className="pl-10"
                                    required
                                    disabled={isPending}
                                />
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
                                        สร้างบิล
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

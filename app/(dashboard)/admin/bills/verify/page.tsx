"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    CheckCircle2,
    XCircle,
    Clock,
    Image as ImageIcon,
    CreditCard,
    Loader2,
    AlertCircle,
    CalendarDays,
    Building2,
    Sparkles
} from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api/client"
import Image from "next/image"

export default function AdminBillVerificationPage() {
    const [loading, setLoading] = useState(true)
    const [pendingBills, setPendingBills] = useState<any[]>([])
    const [allBills, setAllBills] = useState<any[]>([])
    const [processing, setProcessing] = useState<string | null>(null)

    useEffect(() => {
        fetchBills()
    }, [])

    const fetchBills = async () => {
        try {
            setLoading(true)
            const { data, error } = await api.bills.get()

            if (error) {
                toast.error("ไม่สามารถโหลดข้อมูลได้")
                return
            }

            if (data?.success && data.data) {
                const bills = data.data
                setAllBills(bills)
                setPendingBills(bills.filter((b: any) => b.status === "pending_verification"))
            }
        } catch (err) {
            console.error("Failed to fetch bills:", err)
            toast.error("เกิดข้อผิดพลาด")
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async (billId: string, approved: boolean) => {
        try {
            setProcessing(billId)
            // @ts-ignore
            const { data, error } = await api.bills(billId)["verify-payment"].post({ approved })

            if (error) {
                throw new Error(String(error.value))
            }

            if (data?.success) {
                toast.success(approved ? "อนุมัติการชำระเงินแล้ว" : "ปฏิเสธการชำระเงินแล้ว")
                fetchBills()
            }
        } catch (err) {
            console.error("Failed to verify payment:", err)
            toast.error("ไม่สามารถดำเนินการได้")
        } finally {
            setProcessing(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    ตรวจสอบการชำระเงิน
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    ตรวจสอบและอนุมัติสลิปการโอนเงิน
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">รอตรวจสอบ</p>
                                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                                    {pendingBills.length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-amber-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">จำนวนตรงกัน</p>
                                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                    {pendingBills.filter(b => b.paymentSlipUrl).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-emerald-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">ทั้งหมด</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                                    {allBills.length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-slate-500/10 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-slate-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Bills List */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">
                        บิลรอตรวจสอบ ({pendingBills.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {pendingBills.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 font-medium">
                                ไม่มีบิลรอตรวจสอบ
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                บิลทั้งหมดได้รับการตรวจสอบเรียบร้อยแล้ว
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingBills.map((bill) => (
                                <Card
                                    key={bill.id}
                                    className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 overflow-hidden"
                                >
                                    <div className="grid md:grid-cols-2 gap-6 p-6">
                                        {/* Left: Bill Info */}
                                        <div className="space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 mb-2">
                                                        {bill.billType}
                                                    </Badge>
                                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                        บิล #{bill.id.slice(0, 8)}
                                                    </h3>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                        ฿{Number(bill.amount).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <p className="text-slate-500">Unit</p>
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        {bill.unitId}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 flex items-center gap-1">
                                                        <CalendarDays className="w-3 h-3" />
                                                        กำหนดชำระ
                                                    </p>
                                                    <p className="font-medium text-slate-900 dark:text-white">
                                                        {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString("th-TH") : "-"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Auto-Suggest Badge */}
                                            {bill.paymentSlipUrl && (
                                                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                        <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                                                            แนะนำให้อนุมัติ
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                                                        มีสลิปการโอนเงินแนบมาแล้ว
                                                    </p>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex gap-3 pt-2">
                                                <Button
                                                    onClick={() => handleVerify(bill.id, true)}
                                                    disabled={processing === bill.id}
                                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg"
                                                >
                                                    {processing === bill.id ? (
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    )}
                                                    อนุมัติ
                                                </Button>
                                                <Button
                                                    onClick={() => handleVerify(bill.id, false)}
                                                    disabled={processing === bill.id}
                                                    variant="outline"
                                                    className="flex-1 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    ปฏิเสธ
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Right: Slip Image */}
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                                <ImageIcon className="w-4 h-4" />
                                                สลิปการโอนเงิน
                                            </p>
                                            {bill.paymentSlipUrl ? (
                                                <div className="relative aspect-[3/4] bg-slate-200 dark:bg-slate-700 rounded-xl overflow-hidden border-2 border-slate-300 dark:border-slate-600">
                                                    <Image
                                                        src={bill.paymentSlipUrl}
                                                        alt="Payment Slip"
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                                                    <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
                                                    <p className="text-sm text-slate-500">ยังไม่มีสลิป</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

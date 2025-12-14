"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, MoreHorizontal, FileText, CheckCircle2, Clock, AlertCircle, Home, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { api } from "@/lib/api/client"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { toast } from "sonner"
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/page-transition"
import { PageLoading, TableSkeleton } from "@/components/ui/loading-skeleton"

type Bill = {
    id: string
    billType: string
    amount: number | string
    dueDate: string | null
    paidAt: Date | null
    status: string | null
    paymentRef: string | null
    paymentSlipUrl: string | null
    unit: {
        unitNumber: string
    } | null
}

export default function AdminBillsPage(): React.JSX.Element {
    const [bills, setBills] = useState<Bill[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [verifyingBill, setVerifyingBill] = useState<Bill | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchBills = async () => {
        try {
            setIsLoading(true)
            const { data, error } = await api.bills.get()

            if (error) {
                console.error("API Error:", error)
                toast.error("ไม่สามารถดึงข้อมูลบิลได้")
                return
            }

            if (data && data.success && data.data) {
                setBills(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch bills:", error)
            toast.error("ไม่สามารถดึงข้อมูลบิลได้")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchBills()
    }, [])

    const handleVerify = async (status: 'paid' | 'pending', billId: string) => {
        try {
            setIsSubmitting(true)
            const { data, error } = await api.bills({ id: billId }).patch({
                status: status,
                paidAt: status === 'paid' ? new Date().toISOString() : undefined
            })

            if (error) {
                throw new Error(String(error.value))
            }

            if (data?.success) {
                toast.success(status === 'paid' ? "อนุมัติการชำระเงินแล้ว" : "ปฏิเสธการชำระเงินแล้ว")
                setVerifyingBill(null)
                fetchBills()
            }
        } catch (error) {
            console.error("Failed to update bill:", error)
            toast.error("เกิดข้อผิดพลาดในการอัพเดทสถานะ")
        } finally {
            setIsSubmitting(false)
        }
    }

    const filteredBills = bills.filter(bill =>
        bill.billType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.unit?.unitNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading) {
        return (
            <PageTransition className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="h-9 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    </div>
                    <div className="h-11 w-36 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                </div>
                <div className="h-12 w-96 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                <TableSkeleton rows={5} columns={6} />
            </PageTransition>
        )
    }

    return (
        <PageTransition className="space-y-8">
            {/* Header */}
            <FadeIn>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            จัดการบิล/ค่าใช้จ่าย
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            รายการเรียกเก็บเงินทั้งหมด {filteredBills.length} รายการ
                        </p>
                    </div>
                    <Link href="/admin/bills/new">
                        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02]">
                            <Plus className="w-5 h-5 mr-2" />
                            สร้างบิลใหม่
                        </Button>
                    </Link>
                </div>
            </FadeIn>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="ค้นหาเลขห้อง, ประเภทบิล..."
                        className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-blue-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                        <TableRow>
                            <TableHead>รายการ</TableHead>
                            <TableHead>ห้อง</TableHead>
                            <TableHead>ยอดชำระ</TableHead>
                            <TableHead>กำหนดชำระ</TableHead>
                            <TableHead>สถานะ</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredBills.length > 0 ? (
                            filteredBills.map((bill) => (
                                <TableRow key={bill.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{bill.billType}</p>
                                                <p className="text-xs text-slate-500">Ref: {bill.paymentRef || '-'}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Home className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-600 dark:text-slate-400">
                                                {bill.unit?.unitNumber || '-'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            ฿{Number(bill.amount).toLocaleString()}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-slate-600 dark:text-slate-400">
                                            {bill.dueDate ? format(new Date(bill.dueDate), 'd MMM yyyy', { locale: th }) : '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {bill.status === 'paid' ? (
                                            <Badge className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                ชำระแล้ว
                                            </Badge>
                                        ) : bill.status === 'pending_verification' ? (
                                            <Badge className="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20">
                                                <Clock className="w-3 h-3 mr-1" />
                                                รอตรวจสอบ
                                            </Badge>
                                        ) : bill.status === 'overdue' ? (
                                            <Badge variant="destructive" className="bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20">
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                เกินกำหนด
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                                                <Clock className="w-3 h-3 mr-1" />
                                                รอชำระ
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {bill.status === 'pending_verification' ? (
                                            <Button
                                                size="sm"
                                                onClick={() => setVerifyingBill(bill)}
                                                className="bg-amber-500 hover:bg-amber-600 text-white"
                                            >
                                                ตรวจสอบ
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <MoreHorizontal className="w-4 h-4 text-slate-500" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    ไม่พบรายการบิล
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Verification Dialog */}
            {verifyingBill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                ตรวจสอบการชำระเงิน
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">
                                ห้อง {verifyingBill.unit?.unitNumber} - {verifyingBill.billType}
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <span className="text-slate-600 dark:text-slate-400">ยอดที่ต้องชำระ</span>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">
                                    ฿{Number(verifyingBill.amount).toLocaleString()}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                    หลักฐานการโอนเงิน
                                </span>
                                {verifyingBill.paymentSlipUrl ? (
                                    <div className="relative aspect-[3/4] w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                                        <Image
                                            src={verifyingBill.paymentSlipUrl}
                                            alt="Payment Slip"
                                            className="object-contain w-full h-full"
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-48 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400">
                                        ไม่พบรูปภาพสลิป
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3 justify-end bg-slate-50 dark:bg-slate-800/50">
                            <Button
                                variant="outline"
                                onClick={() => setVerifyingBill(null)}
                                disabled={isSubmitting}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => handleVerify('pending', verifyingBill.id)}
                                disabled={isSubmitting}
                            >
                                ปฏิเสธ
                            </Button>
                            <Button
                                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                onClick={() => handleVerify('paid', verifyingBill.id)}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        อนุมัติ
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </PageTransition>
    );
}

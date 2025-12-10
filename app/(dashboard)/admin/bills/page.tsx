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
import Link from "next/link"
import { api } from "@/lib/api/client"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { toast } from "sonner"

export default function AdminBillsPage(): React.JSX.Element {
    const [bills, setBills] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const { data } = await api.bills.get()
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
        fetchBills()
    }, [])

    const filteredBills = bills.filter(bill =>
        bill.billType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.unit?.unitNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
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
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02]">
                        <Plus className="w-5 h-5 mr-2" />
                        สร้างบิลใหม่
                    </Button>
                </Link>
            </div>

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
                                        <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800">
                                            <MoreHorizontal className="w-4 h-4 text-slate-500" />
                                        </Button>
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
        </div>
    );
}

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
import { Search, Plus, Package, CheckCircle2, Clock, Home, Loader2 } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api/client"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { toast } from "sonner"

export default function SecurityParcelsPage(): React.JSX.Element {
    const [parcels, setParcels] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const fetchParcels = async () => {
        setIsLoading(true)
        try {
            const { data } = await api.parcels.get()
            if (data && data.success && data.data) {
                setParcels(data.data)
            }
        } catch (error) {
            console.error("Failed to fetch parcels:", error)
            toast.error("ไม่สามารถดึงข้อมูลพัสดุได้")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchParcels()
    }, [])

    const handleDeliver = async (id: string) => {
        try {
            const { data, error } = await api.parcels({ id }).patch({
                pickedUp: true
            })

            if (error) {
                toast.error("ไม่สามารถอัปเดตสถานะได้")
                return
            }

            if (data && data.success) {
                toast.success("ส่งมอบพัสดุเรียบร้อยแล้ว")
                fetchParcels()
            }
        } catch (error) {
            console.error("Failed to update parcel:", error)
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ")
        }
    }

    const filteredParcels = parcels.filter(p =>
        !p.pickedUpAt && ( // Only show pending
            p.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.courier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.unit?.unitNumber.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        พัสดุรอรับ (Pending Parcels)
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        รายการพัสดุที่ยังตกค้าง {filteredParcels.length} ชิ้น
                    </p>
                </div>
                <Link href="/security/parcels/new">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02]">
                        <Plus className="w-5 h-5 mr-2" />
                        รับพัสดุเข้า
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="ค้นหาเลขพัสดุ, ขนส่ง, ห้อง..."
                        className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-purple-500/20"
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
                            <TableHead>พัสดุ</TableHead>
                            <TableHead>ห้อง</TableHead>
                            <TableHead>วันที่รับเข้า</TableHead>
                            <TableHead>สถานะ</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredParcels.length > 0 ? (
                            filteredParcels.map((parcel) => (
                                <TableRow key={parcel.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{parcel.courier}</p>
                                                <p className="text-xs text-slate-500 font-mono">{parcel.trackingNumber}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Home className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-600 dark:text-slate-400">
                                                {parcel.unit?.unitNumber || '-'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-slate-600 dark:text-slate-400">
                                            {parcel.receivedAt ? format(new Date(parcel.receivedAt), 'd MMM HH:mm', { locale: th }) : '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20">
                                            <Clock className="w-3 h-3 mr-1" />
                                            รอรับ
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                            onClick={() => handleDeliver(parcel.id)}
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-1" />
                                            ส่งมอบ
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                    ไม่พบพัสดุค้างส่ง
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

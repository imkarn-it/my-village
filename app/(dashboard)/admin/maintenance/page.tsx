"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Wrench,
    Search,
    Clock,
    CheckCircle2,
    Calendar,
    Filter,
    MoreHorizontal,
    Loader2,
    AlertCircle,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { api } from "@/lib/api/client"
import { toast } from "sonner"
import { format } from "date-fns"
import { th } from "date-fns/locale"

const getStatusBadge = (status: string) => {
    switch (status) {
        case "pending":
            return (
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                    รอดำเนินการ
                </Badge>
            );
        case "in_progress":
            return (
                <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                    กำลังซ่อม
                </Badge>
            );
        case "completed":
            return (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                    เสร็จสิ้น
                </Badge>
            );
        case "cancelled":
            return (
                <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/20">
                    ยกเลิก
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const getPriorityBadge = (priority: string) => {
    switch (priority) {
        case "urgent":
            return <span className="text-red-600 dark:text-red-400 font-medium">เร่งด่วน</span>;
        case "high":
            return <span className="text-orange-600 dark:text-orange-400 font-medium">สูง</span>;
        case "normal":
            return <span className="text-slate-600 dark:text-slate-400">ปกติ</span>;
        case "low":
            return <span className="text-slate-500">ต่ำ</span>;
        default:
            return <span>{priority}</span>;
    }
};

export default function AdminMaintenancePage(): React.JSX.Element {
    const [requests, setRequests] = useState<any[]>([])
    const [units, setUnits] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [reqRes, unitRes] = await Promise.all([
                    api.maintenance.get(),
                    api.units.get()
                ])

                if (unitRes.data?.success && Array.isArray(unitRes.data.data)) {
                    const unitMap: Record<string, string> = {}
                    unitRes.data.data.forEach((u: any) => {
                        unitMap[u.id] = u.unitNumber
                    })
                    setUnits(unitMap)
                }

                if (reqRes.data?.success && Array.isArray(reqRes.data.data)) {
                    setRequests(reqRes.data.data)
                }
            } catch (error) {
                console.error("Failed to fetch data:", error)
                toast.error("ไม่สามารถดึงข้อมูลได้")
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const { data, error } = await api.maintenance({ id }).patch({
                status: newStatus,
                completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
            })

            if (error) {
                toast.error("อัปเดตสถานะไม่สำเร็จ")
                return
            }

            if (data?.success) {
                toast.success("อัปเดตสถานะเรียบร้อย")
                setRequests(prev => prev.map(r =>
                    r.id === id ? { ...r, status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : r.completedAt } : r
                ))
            }
        } catch (error) {
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ")
        }
    }

    const filteredRequests = requests.filter(r => {
        const matchesStatus = filterStatus === "all" || r.status === filterStatus
        const matchesSearch =
            r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            units[r.unitId]?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesStatus && matchesSearch
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        จัดการการแจ้งซ่อม
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        รายการแจ้งซ่อมทั้งหมดจากลูกบ้าน
                    </p>
                </div>
            </div>

            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                placeholder="ค้นหาตามหัวข้อ, รายละเอียด, หรือเลขห้อง..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="w-4 h-4 mr-2 text-slate-500" />
                                <SelectValue placeholder="สถานะ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                <SelectItem value="pending">รอดำเนินการ</SelectItem>
                                <SelectItem value="in_progress">กำลังซ่อม</SelectItem>
                                <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                                <SelectItem value="cancelled">ยกเลิก</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-md border border-slate-200 dark:border-slate-700">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>วันที่แจ้ง</TableHead>
                                    <TableHead>ห้อง</TableHead>
                                    <TableHead>หัวข้อ</TableHead>
                                    <TableHead>หมวดหมู่</TableHead>
                                    <TableHead>ความเร่งด่วน</TableHead>
                                    <TableHead>สถานะ</TableHead>
                                    <TableHead className="text-right">จัดการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.length > 0 ? (
                                    filteredRequests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell className="whitespace-nowrap">
                                                {format(new Date(request.createdAt), "d MMM yyyy", { locale: th })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-slate-50/50">
                                                    {units[request.unitId] || "Unknown"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {request.title}
                                                <div className="text-xs text-slate-500 truncate max-w-[200px]">
                                                    {request.description}
                                                </div>
                                            </TableCell>
                                            <TableCell>{request.category}</TableCell>
                                            <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>เปลี่ยนสถานะ</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(request.id, "pending")}>
                                                            <Clock className="w-4 h-4 mr-2" /> รอดำเนินการ
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(request.id, "in_progress")}>
                                                            <Wrench className="w-4 h-4 mr-2" /> กำลังซ่อม
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(request.id, "completed")}>
                                                            <CheckCircle2 className="w-4 h-4 mr-2" /> เสร็จสิ้น
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(request.id, "cancelled")} className="text-red-600">
                                                            <AlertCircle className="w-4 h-4 mr-2" /> ยกเลิก
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            ไม่พบข้อมูล
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

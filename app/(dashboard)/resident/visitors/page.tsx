"use client"

import { useState, useEffect } from "react"

type Visitor = {
    id: string;
    visitorName: string;
    purpose: string | null;
    expectedArrival: string;
    status: string | null;
    unitId: string;
    createdAt: Date | null;
    phone: string | null;
    licensePlate: string | null;
    qrCode: string | null;
    approvedBy: string | null;
    checkInAt: Date | null;
    checkOutAt: Date | null;
    unit: any;
};

type Unit = {
    id: string;
    unitNumber: string;
    building: string | null;
    floor: number | null;
};
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Users,
    Search,
    Clock,
    CheckCircle2,
    QrCode,
    Calendar,
    Car,
    Phone,
    Loader2,
} from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api/client"
import { toast } from "sonner"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { QRCodeDisplay } from "@/components/ui/qr-code-display"

const getStatusBadge = (status: string) => {
    switch (status) {
        case "pending":
            return (
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                    <Clock className="w-3 h-3 mr-1" />
                    รออนุมัติ
                </Badge>
            );
        case "approved":
            return (
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    อยู่ในพื้นที่
                </Badge>
            );
        case "checked_out":
            return (
                <Badge className="bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20">
                    ออกแล้ว
                </Badge>
            );
        default:
            return null;
    }
};

export default function VisitorsPage(): React.JSX.Element {
    const [visitors, setVisitors] = useState<Visitor[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [units, setUnits] = useState<Unit[]>([])
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const { data } = await api.units.get()
                if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
                    setUnits(data.data)
                    setSelectedUnitId(data.data[0].id)
                } else {
                    setIsLoading(false)
                }
            } catch (error) {
                console.error("Failed to fetch units:", error)
                setIsLoading(false)
            }
        }
        fetchUnits()
    }, [])

    useEffect(() => {
        const fetchVisitors = async () => {
            if (!selectedUnitId) return
            setIsLoading(true)
            try {
                const { data } = await api.visitors.get({ query: { unitId: selectedUnitId } })
                if (data && data.success && data.data) {
                    setVisitors(data.data as unknown as Visitor[])
                }
            } catch (error) {
                console.error("Failed to fetch visitors:", error)
                toast.error("ไม่สามารถดึงข้อมูลผู้มาติดต่อได้")
            } finally {
                setIsLoading(false)
            }
        }
        fetchVisitors()
    }, [selectedUnitId])

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            const { data, error } = await api.visitors({ id }).patch({
                status
            })

            if (error) {
                toast.error("ไม่สามารถอัปเดตสถานะได้")
                return
            }

            if (data && data.success) {
                toast.success(status === 'approved' ? "อนุมัติเรียบร้อยแล้ว" : "ปฏิเสธเรียบร้อยแล้ว")
                // Refresh list
                if (selectedUnitId) {
                    const { data: newData } = await api.visitors.get({ query: { unitId: selectedUnitId } })
                    if (newData && newData.success && newData.data) {
                        setVisitors(newData.data as unknown as Visitor[])
                    }
                }
            }
        } catch (error) {
            console.error("Failed to update status:", error)
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ")
        }
    }

    const filteredVisitors = visitors.filter(v =>
        v.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.purpose?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const pendingVisitors = filteredVisitors.filter((v) => v.status === "pending")
    const activeVisitors = filteredVisitors.filter((v) => v.status === "approved")
    const historyVisitors = filteredVisitors.filter((v) => v.status === "checked_out")

    if (isLoading && units.length === 0) {
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
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        ผู้มาติดต่อ
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        จัดการและติดตามผู้มาติดต่อ
                    </p>
                </div>
                <div className="flex gap-2">
                    {units.length > 1 && (
                        <Select
                            value={selectedUnitId || ""}
                            onValueChange={setSelectedUnitId}
                        >
                            <SelectTrigger className="w-[180px]">
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
                    )}
                    <Link href="/resident/visitors/new">
                        <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.02]">
                            <QrCode className="w-4 h-4 mr-2" />
                            สร้าง QR Code
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                    placeholder="ค้นหาผู้มาติดต่อ..."
                    className="pl-10 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="pending" className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-1">
                    <TabsTrigger
                        value="pending"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 data-[state=active]:shadow-sm transition-all duration-300"
                    >
                        <Clock className="w-4 h-4 mr-2" />
                        รออนุมัติ ({pendingVisitors.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="active"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all duration-300"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        อยู่ในพื้นที่ ({activeVisitors.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="history"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-slate-600 dark:data-[state=active]:text-slate-300 data-[state=active]:shadow-sm transition-all duration-300"
                    >
                        ประวัติ ({historyVisitors.length})
                    </TabsTrigger>
                </TabsList>

                {/* Pending Visitors */}
                <TabsContent value="pending" className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : pendingVisitors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pendingVisitors.map((visitor) => (
                                <Card
                                    key={visitor.id}
                                    className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm hover:border-amber-500/50 transition-all duration-300 group hover:shadow-xl hover:shadow-amber-500/5"
                                >
                                    <CardContent className="p-5">
                                        <div className="space-y-4">
                                            {getStatusBadge(visitor.status || 'pending')}

                                            <div className="space-y-2">
                                                <h3 className="font-semibold text-slate-900 dark:text-white text-lg group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">
                                                    {visitor.visitorName}
                                                </h3>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                                    {visitor.purpose}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-4 h-4" />
                                                    {visitor.phone || "-"}
                                                </span>
                                                {visitor.licensePlate && (
                                                    <span className="flex items-center gap-1">
                                                        <Car className="w-4 h-4" />
                                                        {visitor.licensePlate}
                                                    </span>
                                                )}
                                                {visitor.qrCode && (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm" className="h-6 text-xs">
                                                                <QrCode className="w-3 h-3 mr-1" />
                                                                QR Code
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>QR Code สำหรับผู้มาติดต่อ</DialogTitle>
                                                                <DialogDescription>
                                                                    แสดง QR Code นี้ให้เจ้าหน้าที่รักษาความปลอดภัยสแกนเพื่อเข้าโครงการ
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="flex flex-col items-center justify-center p-4 space-y-4">
                                                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                                                    {/* We need to generate the QR image here. 
                                                                        Since we stored the UUID in DB, we need to generate it on the fly or fetch it.
                                                                        For simplicity, let's use a client-side QR generator component or just use the API if we had one.
                                                                        Wait, I can use the qrcode library on client side too if I import it.
                                                                        Or I can create a simple component that takes text and renders QR.
                                                                     */}
                                                                    <QRCodeDisplay text={visitor.qrCode} />
                                                                </div>
                                                                <div className="text-center space-y-1">
                                                                    <p className="font-medium">{visitor.visitorName}</p>
                                                                    <p className="text-sm text-muted-foreground">ทะเบียน: {visitor.licensePlate || '-'}</p>
                                                                </div>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleUpdateStatus(visitor.id, 'approved')}
                                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/25 transition-all duration-300"
                                                >
                                                    อนุมัติ
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleUpdateStatus(visitor.id, 'rejected')}
                                                    className="flex-1 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300"
                                                >
                                                    ปฏิเสธ
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    ไม่มีผู้รออนุมัติ
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
                                    ไม่มีผู้มาติดต่อที่รอการอนุมัติ
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Active Visitors */}
                <TabsContent value="active" className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : activeVisitors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeVisitors.map((visitor) => (
                                <Card
                                    key={visitor.id}
                                    className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm border-l-4 border-l-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group"
                                >
                                    <CardContent className="p-5">
                                        <div className="space-y-4">
                                            {getStatusBadge(visitor.status || 'pending')}

                                            <div className="space-y-2">
                                                <h3 className="font-semibold text-slate-900 dark:text-white text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                                                    {visitor.visitorName}
                                                </h3>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                                    {visitor.purpose}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-4 h-4" />
                                                    {visitor.phone || "-"}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    เข้า: {format(new Date(visitor.createdAt || new Date()), "d MMM HH:mm", { locale: th })}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                                    <Users className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    ไม่มีผู้อยู่ในพื้นที่
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
                                    ไม่มีผู้มาติดต่อที่อยู่ในพื้นที่ขณะนี้
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* History */}
                <TabsContent value="history" className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : historyVisitors.length > 0 ? (
                        <div className="space-y-4">
                            {historyVisitors.map((visitor) => (
                                <Card
                                    key={visitor.id}
                                    className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm opacity-75 hover:opacity-100 transition-all duration-300"
                                >
                                    <CardContent className="p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(visitor.status || 'pending')}
                                                </div>
                                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                                    {visitor.visitorName}
                                                </h3>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                                    {visitor.purpose}
                                                </p>
                                            </div>
                                            <div className="text-sm text-slate-500 space-y-1">
                                                <p>เข้า: {format(new Date(visitor.createdAt || new Date()), "d MMM HH:mm", { locale: th })}</p>
                                                {visitor.checkOutAt && (
                                                    <p>ออก: {format(new Date(visitor.checkOutAt), "d MMM HH:mm", { locale: th })}</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                                    <Users className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    ไม่มีประวัติ
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
                                    ยังไม่มีประวัติผู้มาติดต่อ
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

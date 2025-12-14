"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
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
    Wrench,
    Search,
    Clock,
    CheckCircle2,
    Calendar,
    Plus,
    Image as ImageIcon,
    Loader2,
} from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api/client"
import { toast } from "sonner"
import { format } from "date-fns"
import { th } from "date-fns/locale"

interface MaintenanceRequest {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    category: string;
    createdAt: string;
    completedAt?: string;
    image?: string;
}

interface Unit {
    id: string;
    unitNumber: string;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case "pending":
            return (
                <Badge className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                    <Clock className="w-3 h-3 mr-1" />
                    รอดำเนินการ
                </Badge>
            );
        case "in_progress":
            return (
                <Badge className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                    <Wrench className="w-3 h-3 mr-1" />
                    กำลังซ่อม
                </Badge>
            );
        case "completed":
            return (
                <Badge className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
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
            return null;
    }
};

const getPriorityBadge = (priority: string) => {
    switch (priority) {
        case "urgent":
            return (
                <Badge variant="outline" className="bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-600 dark:text-red-400 border-red-500/20">
                    เร่งด่วน
                </Badge>
            );
        case "high":
            return (
                <Badge variant="outline" className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">
                    สูง
                </Badge>
            );
        case "normal":
            return (
                <Badge variant="outline" className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20">
                    ปกติ
                </Badge>
            );
        case "low":
            return (
                <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/20">
                    ต่ำ
                </Badge>
            );
        default:
            return null;
    }
};

const getCategoryStyle = (category: string) => {
    switch (category) {
        case "plumbing":
            return "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
        case "electrical":
            return "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
        case "ac":
            return "bg-gradient-to-r from-cyan-500/10 to-teal-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
        default:
            return "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20";
    }
};

const getCategoryLabel = (category: string) => {
    const map: Record<string, string> = {
        plumbing: "ประปา",
        electrical: "ไฟฟ้า",
        ac: "แอร์",
        structural: "โครงสร้าง",
        other: "อื่นๆ"
    }
    return map[category] || category
}

export default function MaintenancePage(): React.JSX.Element {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [units, setUnits] = useState<Unit[]>([])
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const { data } = await api.units.get()
                // @ts-ignore API response structure mismatch - using type assertion for data.data
                if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
                    // @ts-ignore API response structure mismatch - using type assertion for units array
                    setUnits(data.data as Unit[])
                    // @ts-ignore TypeScript can't infer array index type - using type assertion for ID
                    setSelectedUnitId((data.data[0] as { id: string }).id)
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
        const fetchRequests = async () => {
            if (!selectedUnitId) return
            setIsLoading(true)
            try {
                // @ts-ignore API response structure mismatch - dynamic API endpoint access
                const { data } = await api.maintenance.get({ query: { unitId: selectedUnitId } })
                // @ts-ignore API response data type mismatch - unknown structure from server
                if (data && data.success && data.data) {
                    // @ts-ignore Type assertion needed for maintenance requests array
                    setRequests(data.data as unknown)
                }
            } catch (error) {
                console.error("Failed to fetch maintenance requests:", error)
                toast.error("ไม่สามารถดึงข้อมูลการแจ้งซ่อมได้")
            } finally {
                setIsLoading(false)
            }
        }
        fetchRequests()
    }, [selectedUnitId])

    const filteredRequests = requests.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const activeRequests = filteredRequests.filter(
        (r) => r.status === "pending" || r.status === "in_progress"
    )
    const completedRequests = filteredRequests.filter(
        (r) => r.status === "completed" || r.status === "cancelled"
    )

    if (isLoading && units.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                            <Wrench className="w-5 h-5 text-white" />
                        </div>
                        แจ้งซ่อม
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        แจ้งปัญหาและติดตามสถานะการซ่อม
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
                    <Link href="/resident/maintenance/new">
                        <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.02]">
                            <Plus className="w-4 h-4 mr-2" />
                            แจ้งซ่อมใหม่
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                    placeholder="ค้นหาการแจ้งซ่อม..."
                    className="pl-10 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="active" className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-1">
                    <TabsTrigger
                        value="active"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 data-[state=active]:shadow-sm transition-all duration-300"
                    >
                        <Clock className="w-4 h-4 mr-2" />
                        กำลังดำเนินการ ({activeRequests.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="completed"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all duration-300"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        เสร็จสิ้น ({completedRequests.length})
                    </TabsTrigger>
                </TabsList>

                {/* Active Requests */}
                <TabsContent value="active" className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : activeRequests.length > 0 ? (
                        <div className="space-y-4">
                            {activeRequests.map((request) => (
                                <Card
                                    key={request.id}
                                    className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm hover:border-orange-500/50 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-orange-500/5"
                                >
                                    <CardContent className="p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="space-y-3 flex-1">
                                                {/* Badges */}
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {getStatusBadge(request.status)}
                                                    {getPriorityBadge(request.priority)}
                                                    <Badge
                                                        variant="outline"
                                                        className={getCategoryStyle(request.category)}
                                                    >
                                                        {getCategoryLabel(request.category)}
                                                    </Badge>
                                                </div>

                                                {/* Title & Description */}
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                                                        {request.title}
                                                    </h3>
                                                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                                                        {request.description}
                                                    </p>
                                                </div>

                                                {/* Meta */}
                                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {format(new Date(request.createdAt), "d MMM yyyy", { locale: th })}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Image placeholder */}
                                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 overflow-hidden relative">
                                                {request.image ? (
                                                    <Image src={request.image} alt="Request" fill className="object-cover" />
                                                ) : (
                                                    <ImageIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
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
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    ไม่มีงานซ่อมที่รอดำเนินการ
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-4">
                                    คุณไม่มีงานซ่อมที่รอดำเนินการในขณะนี้
                                </p>
                                <Link href="/resident/maintenance/new">
                                    <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/25">
                                        <Plus className="w-4 h-4 mr-2" />
                                        แจ้งซ่อมใหม่
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Completed Requests */}
                <TabsContent value="completed" className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : completedRequests.length > 0 ? (
                        <div className="space-y-4">
                            {completedRequests.map((request) => (
                                <Card
                                    key={request.id}
                                    className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm opacity-75 hover:opacity-100 transition-all duration-300 group"
                                >
                                    <CardContent className="p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                            <div className="space-y-3 flex-1">
                                                {/* Badges */}
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {getStatusBadge(request.status)}
                                                    <Badge
                                                        variant="outline"
                                                        className={getCategoryStyle(request.category)}
                                                    >
                                                        {getCategoryLabel(request.category)}
                                                    </Badge>
                                                </div>

                                                {/* Title & Description */}
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                                                        {request.title}
                                                    </h3>
                                                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                                                        {request.description}
                                                    </p>
                                                </div>

                                                {/* Meta */}
                                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        แจ้งเมื่อ: {format(new Date(request.createdAt), "d MMM yyyy", { locale: th })}
                                                    </span>
                                                    {request.completedAt && (
                                                        <span className="flex items-center gap-1">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            เสร็จเมื่อ: {format(new Date(request.completedAt), "d MMM yyyy", { locale: th })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center mb-4">
                                    <Wrench className="w-8 h-8 text-orange-500 dark:text-orange-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    ไม่มีประวัติ
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
                                    คุณยังไม่มีประวัติการแจ้งซ่อม
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

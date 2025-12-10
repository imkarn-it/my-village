"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
    Package,
    Search,
    Clock,
    CheckCircle2,
    Camera,
    Calendar,
    Loader2,
} from "lucide-react"
import { api } from "@/lib/api/client"
import { toast } from "sonner"
import { format } from "date-fns"
import { th } from "date-fns/locale"

export default function ParcelsPage(): React.JSX.Element {
    const [parcels, setParcels] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [units, setUnits] = useState<any[]>([])
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
        const fetchParcels = async () => {
            if (!selectedUnitId) return
            setIsLoading(true)
            try {
                const { data } = await api.parcels.get({ query: { unitId: selectedUnitId } })
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
        fetchParcels()
    }, [selectedUnitId])

    const filteredParcels = parcels.filter(p =>
        p.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.courier?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const pendingParcels = filteredParcels.filter((p) => p.status === "pending")
    const pickedUpParcels = filteredParcels.filter((p) => p.status === "picked_up")

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
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        พัสดุ
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        รายการพัสดุทั้งหมดของคุณ
                    </p>
                </div>
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
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                    placeholder="ค้นหาด้วยเลขพัสดุ..."
                    className="pl-10 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="pending" className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-1">
                    <TabsTrigger
                        value="pending"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all duration-300"
                    >
                        <Clock className="w-4 h-4 mr-2" />
                        รอรับ ({pendingParcels.length})
                    </TabsTrigger>
                    <TabsTrigger
                        value="picked_up"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all duration-300"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        รับแล้ว ({pickedUpParcels.length})
                    </TabsTrigger>
                </TabsList>

                {/* Pending Parcels */}
                <TabsContent value="pending" className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : pendingParcels.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pendingParcels.map((parcel) => (
                                <Card
                                    key={parcel.id}
                                    className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-emerald-500/5"
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-4">
                                            {/* Image placeholder */}
                                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                                                {parcel.image ? (
                                                    <img src={parcel.image} alt="Parcel" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Camera className="w-8 h-8 text-slate-400" />
                                                )}
                                            </div>

                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        รอรับ
                                                    </Badge>
                                                </div>

                                                <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                                                    {parcel.courier || "ไม่ระบุขนส่ง"}
                                                </h3>

                                                <p className="text-sm text-slate-500 font-mono">
                                                    {parcel.trackingNumber || "-"}
                                                </p>

                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    รับเข้า: {format(new Date(parcel.receivedAt), "d MMM yyyy HH:mm", { locale: th })}
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
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mb-4">
                                    <Package className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    ไม่มีพัสดุรอรับ
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
                                    คุณไม่มีพัสดุที่รอรับในขณะนี้
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Picked Up Parcels */}
                <TabsContent value="picked_up" className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : pickedUpParcels.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pickedUpParcels.map((parcel) => (
                                <Card
                                    key={parcel.id}
                                    className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm opacity-75 hover:opacity-100 transition-all duration-300"
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-4">
                                            {/* Image placeholder */}
                                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {parcel.image ? (
                                                    <img src={parcel.image} alt="Parcel" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Camera className="w-8 h-8 text-slate-400" />
                                                )}
                                            </div>

                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        รับแล้ว
                                                    </Badge>
                                                </div>

                                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                                    {parcel.courier || "ไม่ระบุขนส่ง"}
                                                </h3>

                                                <p className="text-sm text-slate-500 font-mono">
                                                    {parcel.trackingNumber || "-"}
                                                </p>

                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    รับเมื่อ: {parcel.pickedUpAt ? format(new Date(parcel.pickedUpAt), "d MMM yyyy HH:mm", { locale: th }) : "-"}
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
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mb-4">
                                    <Package className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    ไม่มีประวัติ
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
                                    คุณยังไม่มีประวัติการรับพัสดุ
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    CalendarDays,
    Search,
    Clock,
    Users,
    Plus,
    ChevronRight,
    Dumbbell,
    Waves,
    PartyPopper,
    Car,
    MapPin,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { withFeaturePage } from "@/lib/features";

type Facility = {
    id: string;
    name: string;
    description?: string;
    image?: string;
    openTime?: string;
    closeTime?: string;
    maxCapacity?: number;
    requiresApproval?: boolean;
    isActive?: boolean;
};

const getIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("ฟิตเนส") || lowerName.includes("fitness") || lowerName.includes("gym")) {
        return Dumbbell;
    }
    if (lowerName.includes("สระ") || lowerName.includes("pool") || lowerName.includes("ว่ายน้ำ")) {
        return Waves;
    }
    if (lowerName.includes("ประชุม") || lowerName.includes("จัดเลี้ยง") || lowerName.includes("party") || lowerName.includes("meeting")) {
        return PartyPopper;
    }
    if (lowerName.includes("จอดรถ") || lowerName.includes("parking") || lowerName.includes("รถ")) {
        return Car;
    }
    return MapPin;
};

const getColor = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("ฟิตเนส") || lowerName.includes("fitness") || lowerName.includes("gym")) {
        return "from-orange-400 to-red-500";
    }
    if (lowerName.includes("สระ") || lowerName.includes("pool") || lowerName.includes("ว่ายน้ำ")) {
        return "from-cyan-400 to-blue-500";
    }
    if (lowerName.includes("ประชุม") || lowerName.includes("จัดเลี้ยง") || lowerName.includes("party") || lowerName.includes("meeting")) {
        return "from-purple-400 to-pink-500";
    }
    if (lowerName.includes("จอดรถ") || lowerName.includes("parking") || lowerName.includes("รถ")) {
        return "from-gray-600 to-gray-800";
    }
    return "from-green-400 to-emerald-500";
};

function FacilitiesPage() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = async () => {
        try {
            setLoading(true);
            const response = await api.facilities.get() as { data: Facility[] | null };
            const { data } = response;
            if (data && Array.isArray(data)) {
                // Filter only active facilities
                const activeFacilities = data.filter((f: Facility) => f.isActive !== false);
                setFacilities(activeFacilities);
            }
        } catch {
            setError("ไม่สามารถโหลดข้อมูลสิ่งอำนวยความสะดวกได้");
        } finally {
            setLoading(false);
        }
    };

    const filteredFacilities = facilities.filter(facility =>
        facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (facility.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">สิ่งอำนวยความสะดวก</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">จองใช้สิ่งอำนวยความสะดวกในโครงการ</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="animate-pulse bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardHeader className="pb-3">
                                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mt-2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded mt-4"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">สิ่งอำนวยความสะดวก</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">จองใช้สิ่งอำนวยความสะดวกในโครงการ</p>
                    </div>
                </div>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-red-200 dark:border-red-500/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <p className="text-red-800 dark:text-red-400">{error}</p>
                        <Button onClick={fetchFacilities} variant="outline" className="mt-2 border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
                            ลองใหม่
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">สิ่งอำนวยความสะดวก</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">จองใช้สิ่งอำนวยความสะดวกในโครงการ</p>
                </div>
                <Link href="/resident/bookings">
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-[1.02]">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        การจองของฉัน
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                    placeholder="ค้นหาสิ่งอำนวยความสะดวก..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-cyan-500/20"
                />
            </div>

            {/* Facilities Grid */}
            {filteredFacilities.length === 0 ? (
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="pt-6 text-center">
                        <div className="text-slate-500">
                            {searchQuery ? "ไม่พบสิ่งอำนวยความสะดวกที่ค้นหา" : "ไม่มีสิ่งอำนวยความสะดวกในขณะนี้"}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFacilities.map((facility) => {
                        const Icon = getIcon(facility.name);
                        const color = getColor(facility.name);

                        return (
                            <Card key={facility.id} className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-cyan-500/10 dark:hover:shadow-cyan-500/5">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className={`p-3 rounded-lg bg-gradient-to-br ${color} shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {facility.requiresApproval && (
                                                <Badge variant="outline" className="text-xs">
                                                    ต้องอนุมัติ
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl text-slate-900 dark:text-white">{facility.name}</CardTitle>
                                    {facility.description && (
                                        <p className="text-slate-600 dark:text-slate-400 text-sm">{facility.description}</p>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {facility.openTime && facility.closeTime && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <Clock className="h-4 w-4" />
                                                <span>{facility.openTime} - {facility.closeTime}</span>
                                            </div>
                                        )}
                                        {facility.maxCapacity && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <Users className="h-4 w-4" />
                                                <span>ความจุ {facility.maxCapacity} คน</span>
                                            </div>
                                        )}
                                        {facility.image && (
                                            <div className="relative h-32 w-full mt-3">
                                                <Image
                                                    src={facility.image}
                                                    alt={facility.name}
                                                    fill
                                                    className="object-cover rounded-md"
                                                />
                                            </div>
                                        )}
                                        <Link href={`/resident/facilities/${facility.id}`}>
                                            <Button className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-[1.02]">
                                                <Plus className="h-4 w-4 mr-2" />
                                                จองเลย
                                                <ChevronRight className="h-4 w-4 ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default withFeaturePage('facilities')(FacilitiesPage);
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MoreHorizontal, Clock, Users, Edit, Trash2, Power, PowerOff } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api/client";
import Image from "next/image";

type Facility = {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    image?: string;
    openTime?: string;
    closeTime?: string;
    maxCapacity?: number;
    requiresApproval?: boolean;
    isActive?: boolean;
};

export default function FacilitiesPage() {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchFacilities = async () => {
        try {
            setLoading(true);
            const { data } = await api.facilities.get();
            if (data && Array.isArray(data)) {
                setFacilities(data);
            }
        } catch {
            setError("ไม่สามารถโหลดข้อมูลสิ่งอำนวยความสะดวกได้");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFacilities();
    }, []);

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            // @ts-expect-error - Eden Treaty type inference issue
            await api.facilities({ id }).patch({ isActive: !currentStatus });
            await fetchFacilities();
        } catch {
            setError("ไม่สามารถเปลี่ยนสถานะได้");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสิ่งอำนวยความสะดวกนี้?")) return;
        try {
            // @ts-expect-error - Eden Treaty type inference issue
            await api.facilities({ id }).delete();
            await fetchFacilities();
        } catch {
            setError("ไม่สามารถลบได้");
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
                        <p className="text-slate-600 dark:text-slate-400 mt-1">จัดการสิ่งอำนวยความสะดวกในโครงการ</p>
                    </div>
                    <Link href="/admin/facilities/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            เพิ่มสิ่งอำนวยความสะดวก
                        </Button>
                    </Link>
                </div>
                <div className="grid gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="pb-3">
                                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mt-2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
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
                        <p className="text-slate-600 dark:text-slate-400 mt-1">จัดการสิ่งอำนวยความสะดวกในโครงการ</p>
                    </div>
                    <Link href="/admin/facilities/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            เพิ่มสิ่งอำนวยความสะดวก
                        </Button>
                    </Link>
                </div>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-800">{error}</p>
                        <Button onClick={fetchFacilities} variant="outline" className="mt-2">
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
                    <p className="text-slate-600 dark:text-slate-400 mt-1">จัดการสิ่งอำนวยความสะดวกในโครงการ</p>
                </div>
                <Link href="/admin/facilities/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        เพิ่มสิ่งอำนวยความสะดวก
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
                    <Input
                        placeholder="ค้นหาสิ่งอำนวยความสะดวก..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Facilities List */}
            <div className="grid gap-6">
                {filteredFacilities.length === 0 ? (
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="pt-6 text-center">
                            <div className="text-slate-500 dark:text-slate-400">
                                {searchQuery ? "ไม่พบสิ่งอำนวยความสะดวกที่ค้นหา" : "ยังไม่มีสิ่งอำนวยความสะดวก"}
                            </div>
                            {!searchQuery && (
                                <Link href="/admin/facilities/new">
                                    <Button className="mt-4">
                                        <Plus className="h-4 w-4 mr-2" />
                                        เพิ่มสิ่งอำนวยความสะดวกแรก
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    filteredFacilities.map((facility) => (
                        <Card key={facility.id} className={!facility.isActive ? "opacity-60" : ""}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-xl">{facility.name}</CardTitle>
                                        {facility.description && (
                                            <p className="text-slate-600 dark:text-slate-400 mt-1">{facility.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={facility.isActive ? "default" : "secondary"}>
                                            {facility.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                                        </Badge>
                                        {facility.requiresApproval && (
                                            <Badge variant="outline">ต้องการอนุมัติ</Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {facility.openTime && facility.closeTime && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                {facility.openTime} - {facility.closeTime}
                                            </span>
                                        </div>
                                    )}
                                    {facility.maxCapacity && (
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                ความจุ {facility.maxCapacity} คน
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {facility.image && (
                                    <div className="mt-4 relative h-32 w-full">
                                        <Image
                                            src={facility.image}
                                            alt={facility.name}
                                            fill
                                            className="object-cover rounded-md"
                                        />
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="pt-3">
                                <div className="flex items-center justify-between w-full">
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        ID: {facility.id.slice(0, 8)}...
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/facilities/${facility.id}/edit`}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    แก้ไข
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleToggleActive(facility.id, facility.isActive || false)}
                                            >
                                                {facility.isActive ? (
                                                    <>
                                                        <PowerOff className="h-4 w-4 mr-2" />
                                                        ปิดใช้งาน
                                                    </>
                                                ) : (
                                                    <>
                                                        <Power className="h-4 w-4 mr-2" />
                                                        เปิดใช้งาน
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(facility.id)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                ลบ
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
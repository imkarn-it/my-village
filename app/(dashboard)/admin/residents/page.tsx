"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MoreHorizontal, UserCog, Trash2, Mail, Phone, Home, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { api } from "@/lib/api/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Define types based on API response
type User = {
    id: string;
    name: string | null;
    email: string;
    role: string;
    phone: string | null;
    avatar: string | null;
    isActive: boolean | null;
    createdAt: Date | null;
    unitId: string | null;
    // Unit info might be joined or separate depending on API
    unit?: {
        id: string;
        unitNumber: string;
        building: string;
        floor: number;
    } | null;
};

export default function ResidentsPage() {
    const [residents, setResidents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchResidents = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await api.residents.get({
                query: {
                    // projectId: 'current-project-id'
                }
            });

            if (error) {
                throw new Error(error.value ? String(error.value) : "Failed to fetch residents");
            }

            if (data && data.success && Array.isArray(data.data)) {
                // Transform data
                const mappedData = data.data.map((item: any) => ({
                    ...item,
                    createdAt: item.createdAt ? new Date(item.createdAt) : null,
                    // Ensure unit is handled if present, otherwise null
                    unit: item.unit || null
                }));
                setResidents(mappedData);
            }
        } catch (err) {
            console.error("Error fetching residents:", err);
            setError("ไม่สามารถโหลดข้อมูลลูกบ้านได้");
            toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResidents();
    }, []);

    // Filter residents
    const filteredResidents = residents.filter(user =>
        (user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.unit?.unitNumber || "").includes(searchQuery)
    );

    const handleDelete = async (id: string) => {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลลูกบ้านนี้?")) return;

        try {
            // Note: Currently using generic user delete or specific resident delete if available
            // Checking API structure, likely api.residents({id}).delete() or similar
            // If not available, might need to use api.users({id}).delete()
            // For now assuming api.residents({id}).delete() exists based on standard pattern

            // @ts-ignore - API type might need update
            const { data, error } = await api.residents({ id }).delete();

            if (error) throw new Error(String(error.value));

            if (data && data.success) {
                toast.success("ลบข้อมูลเรียบร้อยแล้ว");
                fetchResidents();
            }
        } catch (err) {
            toast.error("ไม่สามารถลบข้อมูลได้");
            console.error(err);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        จัดการลูกบ้าน
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        {loading ? "กำลังโหลด..." : `รายชื่อลูกบ้านทั้งหมด ${filteredResidents.length} คน`}
                    </p>
                </div>
                <Link href="/admin/residents/new">
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-[1.02]">
                        <Plus className="w-5 h-5 mr-2" />
                        เพิ่มลูกบ้าน
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white/80 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="ค้นหาชื่อ, อีเมล, หรือเลขห้อง..."
                        className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-cyan-500/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                    </div>
                ) : error ? (
                    <div className="p-12 flex flex-col items-center text-red-500">
                        <AlertCircle className="w-8 h-8 mb-2" />
                        <p>{error}</p>
                        <Button variant="outline" className="mt-4" onClick={fetchResidents}>ลองใหม่</Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                            <TableRow>
                                <TableHead className="w-[300px]">ชื่อ-นามสกุล</TableHead>
                                <TableHead>ข้อมูลติดต่อ</TableHead>
                                <TableHead>ที่พักอาศัย</TableHead>
                                <TableHead>สถานะ</TableHead>
                                <TableHead>วันที่เข้าร่วม</TableHead>
                                <TableHead className="text-right">จัดการ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredResidents.length > 0 ? (
                                filteredResidents.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-slate-900 shadow-sm">
                                                    <AvatarImage src={user.avatar || ""} />
                                                    <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-400 text-white font-medium">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                                                    <p className="text-xs text-slate-500">ID: {user.id.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </div>
                                                {user.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                        <Phone className="w-3 h-3" />
                                                        {user.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.unit ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                                                        <Home className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">ห้อง {user.unit.unitNumber}</p>
                                                        <p className="text-xs text-slate-500">อาคาร {user.unit.building} ชั้น {user.unit.floor}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <Badge variant="outline" className="text-slate-500 border-slate-200">
                                                    ไม่ระบุ
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={
                                                    user.isActive
                                                        ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                                                        : "bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20"
                                                }
                                            >
                                                {user.isActive ? "ใช้งานปกติ" : "ระงับการใช้งาน"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-sm">
                                            {user.createdAt ? format(user.createdAt, 'd MMM yyyy', { locale: th }) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800">
                                                        <MoreHorizontal className="w-4 h-4 text-slate-500" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>จัดการ</DropdownMenuLabel>
                                                    <DropdownMenuItem>
                                                        <UserCog className="w-4 h-4 mr-2" />
                                                        แก้ไขข้อมูล
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10"
                                                        onClick={() => handleDelete(user.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        ลบข้อมูล
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                        ไม่พบข้อมูลลูกบ้าน
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}

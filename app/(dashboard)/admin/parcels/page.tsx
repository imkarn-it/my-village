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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MoreHorizontal, Package, CheckCircle2, Clock, Trash2, Home } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { parcels, units, users } from "@/lib/db/schema";
import { eq, like, or, and, desc, isNull, isNotNull } from "drizzle-orm";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { ParcelActions } from "./parcel-actions";

interface ParcelsPageProps {
    searchParams: Promise<{
        q?: string;
        status?: string;
    }>;
}

export default async function ParcelsPage({ searchParams }: ParcelsPageProps): Promise<React.JSX.Element> {
    const { q, status: statusParam } = await searchParams;
    const query = q || "";
    const status = statusParam || "all"; // all, pending, picked_up

    // Build query conditions
    const conditions = [
        query ? or(
            like(parcels.trackingNumber, `%${query}%`),
            like(parcels.courier, `%${query}%`),
            like(units.unitNumber, `%${query}%`)
        ) : undefined,
        status === "pending" ? isNull(parcels.pickedUpAt) : undefined,
        status === "picked_up" ? isNotNull(parcels.pickedUpAt) : undefined,
    ].filter(Boolean);

    // Fetch parcels with unit info
    const parcelsData = await db.select({
        parcel: parcels,
        unit: units,
        receiver: users, // User who picked up (optional)
    })
        .from(parcels)
        .innerJoin(units, eq(parcels.unitId, units.id))
        .leftJoin(users, eq(parcels.pickedUpBy, users.id))
        .where(and(...conditions))
        .orderBy(desc(parcels.receivedAt));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        จัดการพัสดุ
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        รายการพัสดุทั้งหมด {parcelsData.length} ชิ้น
                    </p>
                </div>
                <Link href="/admin/parcels/new">
                    <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.02]">
                        <Plus className="w-5 h-5 mr-2" />
                        รับพัสดุเข้า
                    </Button>
                </Link>
            </div>

            {/* Filters & Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Tabs defaultValue={status} className="w-full md:w-auto">
                    <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                        <Link href="/admin/parcels" className="contents">
                            <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
                        </Link>
                        <Link href="/admin/parcels?status=pending" className="contents">
                            <TabsTrigger value="pending">รอรับ</TabsTrigger>
                        </Link>
                        <Link href="/admin/parcels?status=picked_up" className="contents">
                            <TabsTrigger value="picked_up">รับแล้ว</TabsTrigger>
                        </Link>
                    </TabsList>
                </Tabs>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <form>
                        <input type="hidden" name="status" value={status} />
                        <Input
                            name="q"
                            placeholder="ค้นหาเลขพัสดุ, ขนส่ง, ห้อง..."
                            className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-emerald-500/20"
                            defaultValue={query}
                        />
                    </form>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                        <TableRow>
                            <TableHead className="w-[300px]">รายละเอียดพัสดุ</TableHead>
                            <TableHead>ห้อง</TableHead>
                            <TableHead>วันที่รับเข้า</TableHead>
                            <TableHead>สถานะ</TableHead>
                            <TableHead>ผู้รับไป</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {parcelsData.length > 0 ? (
                            parcelsData.map(({ parcel, unit, receiver }) => (
                                <TableRow key={parcel.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
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
                                            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                                                {unit.unitNumber}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-slate-600 dark:text-slate-400">
                                            {parcel.receivedAt ? format(new Date(parcel.receivedAt), 'd MMM HH:mm', { locale: th }) : '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {parcel.pickedUpAt ? (
                                            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                รับแล้ว
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20">
                                                <Clock className="w-3 h-3 mr-1" />
                                                รอรับ
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {receiver ? (
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-6 h-6">
                                                    <AvatarImage src={receiver.avatar || ""} />
                                                    <AvatarFallback className="text-[10px]">{receiver.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm text-slate-600 dark:text-slate-400">{receiver.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <ParcelActions parcelId={parcel.id} isPickedUp={!!parcel.pickedUpAt} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    ไม่พบรายการพัสดุ
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

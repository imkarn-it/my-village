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
import { Badge } from "@/components/ui/badge";
import { Search, Plus, LogOut, Car, User, Home, Clock } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { visitors, units } from "@/lib/db/schema";
import { eq, like, or, and, desc } from "drizzle-orm";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface VisitorsPageProps {
    searchParams: {
        q?: string;
        type?: string; // vehicle, walk_in
    };
}

export default async function VisitorsPage({ searchParams }: VisitorsPageProps): Promise<React.JSX.Element> {
    const query = searchParams.q || "";
    const type = searchParams.type;

    const visitorsData = await db.select({
        visitor: visitors,
        unit: units,
    })
        .from(visitors)
        .leftJoin(units, eq(visitors.unitId, units.id))
        .where(and(
            query ? or(
                like(visitors.visitorName, `%${query}%`),
                like(visitors.licensePlate, `%${query}%`),
                like(units.unitNumber, `%${query}%`)
            ) : undefined,
            type === "vehicle" ? like(visitors.licensePlate, "%") : undefined // Simple check for now
        ))
        .orderBy(desc(visitors.checkInAt));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        ผู้มาติดต่อ (Visitors)
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        รายการผู้มาติดต่อทั้งหมด {visitorsData.length} รายการ
                    </p>
                </div>
                <Link href="/security/visitors/new">
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02]">
                        <Plus className="w-5 h-5 mr-2" />
                        Check-in ผู้มาติดต่อ
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <form>
                        <Input
                            name="q"
                            placeholder="ค้นหาชื่อ, ทะเบียนรถ, ห้อง..."
                            className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-blue-500/20"
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
                            <TableHead>ผู้มาติดต่อ</TableHead>
                            <TableHead>ทะเบียนรถ</TableHead>
                            <TableHead>ติดต่อห้อง</TableHead>
                            <TableHead>เวลาเข้า</TableHead>
                            <TableHead>เวลาออก</TableHead>
                            <TableHead>สถานะ</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visitorsData.length > 0 ? (
                            visitorsData.map(({ visitor, unit }) => (
                                <TableRow key={visitor.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{visitor.visitorName}</p>
                                                <p className="text-xs text-slate-500">{visitor.purpose}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {visitor.licensePlate ? (
                                            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                                                <Car className="w-3 h-3 mr-1" />
                                                {visitor.licensePlate}
                                            </Badge>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Home className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-600 dark:text-slate-400">
                                                {unit ? unit.unitNumber : 'ไม่ระบุ'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <Clock className="w-4 h-4 text-emerald-500" />
                                            {visitor.checkInAt ? format(new Date(visitor.checkInAt), 'HH:mm', { locale: th }) : '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <Clock className="w-4 h-4 text-orange-500" />
                                            {visitor.checkOutAt ? format(new Date(visitor.checkOutAt), 'HH:mm', { locale: th }) : '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={
                                                visitor.status === "checked_in"
                                                    ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                                                    : "bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20"
                                            }
                                        >
                                            {visitor.status === "checked_in" ? "อยู่ในพื้นที่" : "ออกแล้ว"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {visitor.status === "checked_in" && (
                                            <Button size="sm" variant="destructive" className="h-8">
                                                <LogOut className="w-4 h-4 mr-1" />
                                                Check-out
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                    ไม่พบข้อมูลผู้มาติดต่อ
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

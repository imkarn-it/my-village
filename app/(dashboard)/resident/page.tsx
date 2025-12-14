import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Bell,
    Package,
    CreditCard,
    CalendarDays,
    ChevronRight,
    AlertTriangle,
    Sparkles,
    ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { announcements, parcels, bills, bookings, users } from "@/lib/db/schema";
import { eq, desc, and, gte, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default async function ResidentDashboard(): Promise<React.JSX.Element> {
    const session = await auth();

    // TODO: Remove this mock when auth is fully working
    const userId = session?.user?.id;
    const _userEmail = session?.user?.email;
    const userName = session?.user?.name;

    /*
    if (!userId) {
        // Fallback to demo user for development
        const demoUser = await db.query.users.findFirst({
            where: eq(users.email, 'demo@myvillage.com')
        });
        if (demoUser) {
            userId = demoUser.id;
            userEmail = demoUser.email;
            userName = demoUser.name;
        }
    }
    */

    // Validate User ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!userId || !uuidRegex.test(userId)) {
        // If no user or invalid ID format, redirect to login
        redirect("/login");
    }

    // Fetch data
    const [
        latestAnnouncements,
        pendingParcels,
        pendingBills,
        upcomingBookings
    ] = await Promise.all([
        // Announcements (Global + Project specific)
        db.select().from(announcements)
            .orderBy(desc(announcements.isPinned), desc(announcements.createdAt))
            .limit(5),

        // Parcels (Pending only)
        userId ? db.select().from(parcels)
            .innerJoin(users, eq(parcels.unitId, users.unitId))
            .where(and(eq(users.id, userId), isNull(parcels.pickedUpAt))) : [],

        // Bills (Pending only)
        userId ? db.select().from(bills)
            .innerJoin(users, eq(bills.unitId, users.unitId))
            .where(and(eq(users.id, userId), eq(bills.status, 'pending'))) : [],

        // Bookings (Upcoming)
        userId ? db.select().from(bookings)
            .innerJoin(users, eq(bookings.userId, users.id))
            .where(and(
                eq(users.id, userId),
                gte(bookings.bookingDate, new Date().toISOString().split('T')[0])
            ))
            .orderBy(bookings.bookingDate, bookings.startTime)
            .limit(5) : []
    ]);

    // Calculate totals
    const totalParcels = pendingParcels.length;
    const totalBillsAmount = pendingBills.reduce((sum, item) => sum + Number(item.bills.amount), 0);
    const totalBillsCount = pendingBills.length;
    const totalBookings = upcomingBookings.length;

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            สวัสดี, {userName || 'ลูกบ้าน'}
                        </h1>
                        <Sparkles className="w-6 h-6 text-amber-500 dark:text-amber-400 animate-pulse" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                        ยินดีต้อนรับเข้าสู่ระบบ My Village
                    </p>
                </div>
                <Button
                    size="lg"
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300 hover:scale-[1.02]"
                >
                    <AlertTriangle className="w-5 h-5 mr-2 animate-pulse" />
                    SOS ฉุกเฉิน
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/resident/parcels">
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                พัสดุรอรับ
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalParcels}</div>
                                    <p className="text-xs text-slate-500 mt-1">รายการ</p>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-emerald-500 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/resident/bills">
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm hover:border-amber-500/50 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-amber-500/10 dark:hover:shadow-amber-500/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                บิลค้างชำระ
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform duration-300">
                                <CreditCard className="w-5 h-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-3xl font-bold text-slate-900 dark:text-white">฿{totalBillsAmount.toLocaleString()}</div>
                                    <p className="text-xs text-slate-500 mt-1">{totalBillsCount} รายการ</p>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-amber-500 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/resident/facilities">
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-cyan-500/10 dark:hover:shadow-cyan-500/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                การจองที่จะถึง
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform duration-300">
                                <CalendarDays className="w-5 h-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalBookings}</div>
                                    <p className="text-xs text-slate-500 mt-1">รายการ</p>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-cyan-500 dark:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/resident/announcements">
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                ประกาศใหม่
                            </CardTitle>
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-300">
                                <Bell className="w-5 h-5 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{latestAnnouncements.length}</div>
                                    <p className="text-xs text-slate-500 mt-1">รายการ</p>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-purple-500 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Announcements */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-700/50">
                        <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                                <Bell className="w-4 h-4 text-white" />
                            </div>
                            ประกาศล่าสุด
                        </CardTitle>
                        <Link href="/resident/announcements">
                            <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50">
                                ดูทั้งหมด
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        {latestAnnouncements.map((item, index) => (
                            <div
                                key={item.id}
                                className={`flex items-start justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${index !== latestAnnouncements.length - 1 ? "border-b border-slate-200 dark:border-slate-700/30" : ""
                                    }`}
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        {item.isPinned && (
                                            <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs border-amber-200 dark:border-amber-500/20">
                                                ปักหมุด
                                            </Badge>
                                        )}
                                        <span className="font-medium text-slate-900 dark:text-white">{item.title}</span>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {item.createdAt ? format(new Date(item.createdAt), 'd MMM yyyy', { locale: th }) : '-'}
                                    </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-600 flex-shrink-0" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Parcels */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-700/50">
                        <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
                                <Package className="w-4 h-4 text-white" />
                            </div>
                            พัสดุรอรับ
                        </CardTitle>
                        <Link href="/resident/parcels">
                            <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50">
                                ดูทั้งหมด
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        {pendingParcels.map((item, index) => (
                            <div
                                key={item.parcels.id}
                                className={`flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${index !== pendingParcels.length - 1 ? "border-b border-slate-200 dark:border-slate-700/30" : ""
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                        <Package className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{item.parcels.courier}</p>
                                        <p className="text-xs text-slate-500">
                                            รับเมื่อ {item.parcels.receivedAt ? format(new Date(item.parcels.receivedAt), 'HH:mm', { locale: th }) : '-'}
                                        </p>
                                    </div>
                                </div>
                                <Badge className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20">
                                    รอรับ
                                </Badge>
                            </div>
                        ))}
                        {pendingParcels.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                ไม่มีพัสดุค้างรับ
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bills */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-700/50">
                        <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-4 h-4 text-white" />
                            </div>
                            บิลค้างชำระ
                        </CardTitle>
                        <Link href="/resident/bills">
                            <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50">
                                ดูทั้งหมด
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        {pendingBills.map((item, index) => (
                            <div
                                key={item.bills.id}
                                className={`flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${index !== pendingBills.length - 1 ? "border-b border-slate-200 dark:border-slate-700/30" : ""
                                    }`}
                            >
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {item.bills.billType === 'common_fee' ? 'ค่าส่วนกลาง' :
                                            item.bills.billType === 'water' ? 'ค่าน้ำ' :
                                                item.bills.billType === 'electricity' ? 'ค่าไฟ' : item.bills.billType}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        ครบกำหนด {item.bills.dueDate ? format(new Date(item.bills.dueDate), 'd MMM yyyy', { locale: th }) : '-'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-amber-600 dark:text-amber-400">฿{Number(item.bills.amount).toLocaleString()}</p>
                                    <Button size="sm" className="mt-1 h-7 text-xs bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/25">
                                        ชำระเงิน
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {pendingBills.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                ไม่มียอดค้างชำระ
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bookings */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-700/50">
                        <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-lg flex items-center justify-center">
                                <CalendarDays className="w-4 h-4 text-white" />
                            </div>
                            การจองที่จะถึง
                        </CardTitle>
                        <Link href="/resident/facilities">
                            <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50">
                                ดูทั้งหมด
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        {upcomingBookings.map((item, index) => (
                            <div
                                key={item.bookings.id}
                                className={`flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${index !== upcomingBookings.length - 1 ? "border-b border-slate-200 dark:border-slate-700/30" : ""
                                    }`}
                            >
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Fitness Center</p>
                                    <p className="text-xs text-slate-500">
                                        {item.bookings.bookingDate ? format(new Date(item.bookings.bookingDate), 'd MMM', { locale: th }) : '-'} • {item.bookings.startTime} - {item.bookings.endTime}
                                    </p>
                                </div>
                                <Badge className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20">
                                    อนุมัติแล้ว
                                </Badge>
                            </div>
                        ))}
                        {upcomingBookings.length === 0 && (
                            <div className="text-center py-8 text-slate-500">
                                ไม่มีการจองที่จะถึง
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

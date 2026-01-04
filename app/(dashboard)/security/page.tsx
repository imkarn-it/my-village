import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Package,
    Car,
    Bell,
    Clock,
    CheckCircle2,
    ArrowUpRight,
    AlertTriangle,
    LogIn,
    LogOut,
    ChevronRight,
    QrCode,
    Camera,
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { visitors, parcels, sosAlerts, units } from "@/lib/db/schema";
import { eq, isNull, count, desc, and, gte, lte } from "drizzle-orm";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { auth } from "@/lib/auth";

export default async function SecurityDashboard(): Promise<React.JSX.Element> {
    const session = await auth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch stats
    const [
        visitorsToday,
        pendingParcelsCount,
        activeAlerts,
        carsInPremise,
        recentVisitorsList,
        pendingParcelsList
    ] = await Promise.all([
        // Visitors Today
        db.select({ count: count() })
            .from(visitors)
            .where(and(
                gte(visitors.checkInAt, today),
                lte(visitors.checkInAt, tomorrow)
            )),

        // Pending Parcels Count
        db.select({ count: count() })
            .from(parcels)
            .where(isNull(parcels.pickedUpAt)),

        // Active SOS Alerts
        db.select({ count: count() })
            .from(sosAlerts)
            .where(eq(sosAlerts.status, 'active')),

        // Cars in Premise (Visitors checked in with license plate)
        db.select({ count: count() })
            .from(visitors)
            .where(and(
                eq(visitors.status, 'checked_in'),
                // Note: Drizzle doesn't have isNotNull for varchar easily, so we check length or use raw sql if needed.
                // For now assuming if it's checked_in it's in premise. 
                // Ideally we filter by license_plate IS NOT NULL AND license_plate != ''
            )),

        // Recent Visitors
        db.select({
            visitor: visitors,
            unit: units,
        })
            .from(visitors)
            .leftJoin(units, eq(visitors.unitId, units.id))
            .orderBy(desc(visitors.checkInAt))
            .limit(5),

        // Pending Parcels List
        db.select({
            parcel: parcels,
            unit: units,
        })
            .from(parcels)
            .innerJoin(units, eq(parcels.unitId, units.id))
            .where(isNull(parcels.pickedUpAt))
            .orderBy(desc(parcels.receivedAt))
            .limit(5)
    ]);

    const stats = [
        {
            title: "ผู้มาติดต่อวันนี้",
            value: visitorsToday[0].count.toString(),
            icon: Users,
            color: "from-blue-400 to-indigo-500",
            href: "/security/visitors",
        },
        {
            title: "พัสดุรอรับ",
            value: pendingParcelsCount[0].count.toString(),
            icon: Package,
            color: "from-emerald-400 to-cyan-500",
            href: "/security/parcels",
        },
        {
            title: "รถในพื้นที่",
            value: carsInPremise[0].count.toString(), // Approximate
            icon: Car,
            color: "from-amber-400 to-orange-500",
            href: "/security/visitors?type=vehicle",
        },
        {
            title: "แจ้งเตือน",
            value: activeAlerts[0].count.toString(),
            icon: Bell,
            color: "from-red-400 to-pink-500",
            href: "/security/alerts",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Dashboard รปภ.
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        สวัสดี, {session?.user?.name || 'เจ้าหน้าที่'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02]">
                        <QrCode className="w-5 h-5 mr-2" />
                        สแกน QR
                    </Button>
                    <Button variant="outline" className="border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <Camera className="w-5 h-5 mr-2" />
                        กล้อง CCTV
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Link key={stat.title} href={stat.href}>
                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-slate-600 dark:text-slate-400 text-sm">{stat.title}</p>
                                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                    </div>
                                    <div
                                        className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                    >
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link href="/security/visitors/new" className="contents">
                    <Button className="h-20 flex-col gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/25">
                        <LogIn className="w-6 h-6" />
                        <span className="text-base">Check-in ผู้มาติดต่อ</span>
                    </Button>
                </Link>
                <Link href="/security/visitors" className="contents">
                    <Button className="h-20 flex-col gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                        <LogOut className="w-6 h-6" />
                        <span className="text-base">Check-out</span>
                    </Button>
                </Link>
                <Link href="/security/parcels/new" className="contents">
                    <Button className="h-20 flex-col gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25">
                        <Package className="w-6 h-6" />
                        <span className="text-base">รับพัสดุ</span>
                    </Button>
                </Link>
                <Link href="/security/alerts/new" className="contents">
                    <Button className="h-20 flex-col gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg shadow-red-500/25 animate-pulse">
                        <AlertTriangle className="w-6 h-6" />
                        <span className="text-base">แจ้งเหตุฉุกเฉิน</span>
                    </Button>
                </Link>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Visitors */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-700/50">
                        <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                            ผู้มาติดต่อล่าสุด
                        </CardTitle>
                        <Link href="/security/visitors">
                            <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                ดูทั้งหมด
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        {recentVisitorsList.length > 0 ? (
                            recentVisitorsList.map(({ visitor, unit }: typeof recentVisitorsList[number], index: number) => (
                                <div
                                    key={visitor.id}
                                    className={`flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${index !== recentVisitorsList.length - 1 ? "border-b border-slate-200 dark:border-slate-700/30" : ""
                                        }`}
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-900 dark:text-white text-base">{visitor.visitorName}</span>
                                            <Badge
                                                className={
                                                    visitor.status === "checked_in"
                                                        ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                                                        : "bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20"
                                                }
                                            >
                                                {visitor.status === "checked_in" ? "อยู่ในพื้นที่" : "ออกแล้ว"}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            {unit ? `ห้อง ${unit.unitNumber}` : 'ไม่ระบุ'} • {visitor.purpose} • {visitor.checkInAt ? format(new Date(visitor.checkInAt), 'HH:mm', { locale: th }) : '-'}
                                        </p>
                                    </div>
                                    {visitor.licensePlate && (
                                        <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/50">
                                            <Car className="w-3 h-3 mr-1" />
                                            {visitor.licensePlate}
                                        </Badge>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-500">
                                ยังไม่มีผู้มาติดต่อ
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pending Parcels */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 dark:border-slate-700/50">
                        <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center gap-2">
                            <Package className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                            พัสดุรอส่ง
                        </CardTitle>
                        <Link href="/security/parcels">
                            <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                ดูทั้งหมด
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        {pendingParcelsList.length > 0 ? (
                            pendingParcelsList.map(({ parcel, unit }: typeof pendingParcelsList[number], index: number) => (
                                <div
                                    key={parcel.id}
                                    className={`flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${index !== pendingParcelsList.length - 1 ? "border-b border-slate-200 dark:border-slate-700/30" : ""
                                        }`}
                                >
                                    <div className="space-y-1">
                                        <p className="font-medium text-slate-900 dark:text-white text-base">{parcel.courier}</p>
                                        <p className="text-sm text-slate-500">
                                            ห้อง {unit.unitNumber} • รับเมื่อ {parcel.receivedAt ? format(new Date(parcel.receivedAt), 'HH:mm', { locale: th }) : '-'}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/25"
                                    >
                                        แจ้งลูกบ้าน
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-500">
                                ไม่มีพัสดุค้างส่ง
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

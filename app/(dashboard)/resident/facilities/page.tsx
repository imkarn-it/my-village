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
} from "lucide-react";

// Mock data
const facilities = [
    {
        id: 1,
        name: "ฟิตเนส",
        description: "ห้องออกกำลังกายพร้อมอุปกรณ์ครบครัน",
        icon: Dumbbell,
        openTime: "06:00",
        closeTime: "22:00",
        maxCapacity: 20,
        image: null,
        color: "from-orange-400 to-red-500",
        available: true,
    },
    {
        id: 2,
        name: "สระว่ายน้ำ",
        description: "สระว่ายน้ำขนาด 25 เมตร พร้อมสระเด็ก",
        icon: Waves,
        openTime: "06:00",
        closeTime: "20:00",
        maxCapacity: 50,
        image: null,
        color: "from-cyan-400 to-blue-500",
        available: true,
    },
    {
        id: 3,
        name: "ห้องประชุม/จัดเลี้ยง",
        description: "ห้องประชุมพร้อมอุปกรณ์โสตทัศน์",
        icon: PartyPopper,
        openTime: "08:00",
        closeTime: "22:00",
        maxCapacity: 100,
        image: null,
        color: "from-purple-400 to-pink-500",
        available: false,
    },
    {
        id: 4,
        name: "ที่จอดรถ VIP",
        description: "ที่จอดรถสำหรับแขกพิเศษ",
        icon: Car,
        openTime: "00:00",
        closeTime: "23:59",
        maxCapacity: 10,
        image: null,
        color: "from-emerald-400 to-teal-500",
        available: true,
    },
];

const myBookings = [
    {
        id: 1,
        facility: "ฟิตเนส",
        date: "12 ธ.ค. 2567",
        time: "18:00 - 19:00",
        status: "approved",
    },
    {
        id: 2,
        facility: "สระว่ายน้ำ",
        date: "14 ธ.ค. 2567",
        time: "10:00 - 12:00",
        status: "pending",
    },
];

export default function FacilitiesPage(): React.JSX.Element {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                            <CalendarDays className="w-5 h-5 text-white" />
                        </div>
                        จองพื้นที่ส่วนกลาง
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        จองพื้นที่และสิ่งอำนวยความสะดวก
                    </p>
                </div>
            </div>

            {/* My Bookings */}
            {myBookings.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                        การจองของฉัน
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myBookings.map((booking) => (
                            <Card
                                key={booking.id}
                                className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300 group"
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                {booking.facility}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {booking.date} • {booking.time}
                                            </p>
                                        </div>
                                        <Badge
                                            className={
                                                booking.status === "approved"
                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                            }
                                        >
                                            {booking.status === "approved" ? "อนุมัติแล้ว" : "รออนุมัติ"}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                    placeholder="ค้นหาพื้นที่..."
                    className="pl-10 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                />
            </div>

            {/* Facilities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {facilities.map((facility) => (
                    <Card
                        key={facility.id}
                        className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm overflow-hidden group hover:border-slate-300 dark:hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50"
                    >
                        {/* Image/Icon Header */}
                        <div className={`h-32 bg-gradient-to-br ${facility.color} flex items-center justify-center relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
                            <facility.icon className="w-16 h-16 text-white/90 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                            {!facility.available && (
                                <div className="absolute inset-0 bg-slate-100/80 dark:bg-slate-900/80 flex items-center justify-center">
                                    <Badge className="bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30">
                                        ไม่ว่าง
                                    </Badge>
                                </div>
                            )}
                        </div>

                        <CardContent className="p-5 space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {facility.name}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {facility.description}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {facility.openTime} - {facility.closeTime}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {facility.maxCapacity} คน
                                </span>
                            </div>

                            <Button
                                className={`w-full transition-all duration-300 ${facility.available
                                    ? "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02]"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                                    }`}
                                disabled={!facility.available}
                            >
                                {facility.available ? (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        จองเลย
                                    </>
                                ) : (
                                    "ไม่สามารถจองได้"
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

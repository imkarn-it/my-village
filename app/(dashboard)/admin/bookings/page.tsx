"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Search,
    CalendarDays,
    Clock,
    MoreHorizontal,
    Check,
    X,
    MapPin,
    // Users reserved for future use
    Filter,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { api } from "@/lib/api/client";

type Booking = {
    id: string;
    facilityId: string;
    facility: {
        id: string;
        name: string;
        maxCapacity?: number;
    };
    unitId: string;
    unit?: {
        id: string;
        number: string;
    };
    userId: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    bookingDate: string;
    startTime: string;
    endTime: string;
    status: "pending" | "approved" | "rejected" | "cancelled";
    createdAt: string;
    updatedAt: string;
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case "pending":
            return <Badge variant="secondary">รออนุมัติ</Badge>;
        case "approved":
            return <Badge className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20">อนุมัติแล้ว</Badge>;
        case "rejected":
            return <Badge variant="destructive">ถูกปฏิเสธ</Badge>;
        case "cancelled":
            return <Badge variant="outline">ถูกยกเลิก</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
};

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const { data } = await api.bookings.get();
            if (data && Array.isArray(data)) {
                // Sort by date and time
                const sortedBookings = data.sort((a: Booking, b: Booking) => {
                    const dateA = new Date(`${a.bookingDate} ${a.startTime}`);
                    const dateB = new Date(`${b.bookingDate} ${b.startTime}`);
                    return dateB.getTime() - dateA.getTime();
                });
                setBookings(sortedBookings);
            }
        } catch {
            setError("ไม่สามารถโหลดข้อมูลการจองได้");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            // @ts-expect-error - Eden Treaty type inference issue
            const { data } = await api.bookings({ id }).patch({ status: "approved" });
            if (data) {
                await fetchBookings();
            }
        } catch {
            setError("ไม่สามารถอนุมัติการจองได้");
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธการจองนี้?")) return;

        try {
            // @ts-expect-error - Eden Treaty type inference issue
            const { data } = await api.bookings({ id }).patch({ status: "rejected" });
            if (data) {
                await fetchBookings();
            }
        } catch {
            setError("ไม่สามารถปฏิเสธการจองได้");
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        // Search filter
        const matchesSearch =
            booking.facility?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.unit?.number?.toLowerCase().includes(searchQuery.toLowerCase());

        // Status filter
        const matchesFilter =
            filter === "all" ||
            (filter === "pending" && booking.status === "pending") ||
            (filter === "approved" && booking.status === "approved") ||
            (filter === "upcoming" && booking.status === "approved" && new Date(`${booking.bookingDate} ${booking.endTime}`) > new Date()) ||
            (filter === "past" && (new Date(`${booking.bookingDate} ${booking.endTime}`) < new Date() || ["rejected", "cancelled"].includes(booking.status)));

        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">การจองทั้งหมด</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">จัดการการจองสิ่งอำนวยความสะดวก</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
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
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">การจองทั้งหมด</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">จัดการการจองสิ่งอำนวยความสะดวก</p>
                    </div>
                </div>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-800">{error}</p>
                        <Button onClick={fetchBookings} variant="outline" className="mt-2">
                            ลองใหม่
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const pendingCount = bookings.filter(b => b.status === "pending").length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">การจองทั้งหมด</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">จัดการการจองสิ่งอำนวยความสะดวก</p>
                    {pendingCount > 0 && (
                        <p className="text-amber-600 font-medium mt-1">
                            มี {pendingCount} รายการที่รอการอนุมัติ
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin/facilities">
                        <Button variant="outline">
                            <MapPin className="h-4 w-4 mr-2" />
                            จัดการสิ่งอำนวยความสะดวก
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
                    <Input
                        placeholder="ค้นหาสิ่งอำนวยความสะดวก, ผู้จอง, ห้อง..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <div className="flex gap-2">
                        {[
                            { value: "all", label: "ทั้งหมด" },
                            { value: "pending", label: `รออนุมัติ (${pendingCount})` },
                            { value: "approved", label: "อนุมัติแล้ว" },
                            { value: "upcoming", label: "ที่จะถึง" },
                            { value: "past", label: "ที่ผ่านมา" },
                        ].map((item) => (
                            <Button
                                key={item.value}
                                variant={filter === item.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter(item.value)}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="pt-6 text-center">
                        <CalendarDays className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            {searchQuery || filter !== "all" ? "ไม่พบการจองที่ตรงตามเงื่อนไข" : "ยังไม่มีการจอง"}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            {searchQuery || filter !== "all"
                                ? "ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง"
                                : "ยังไม่มีผู้ใช้จองสิ่งอำนวยความสะดวก"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map((booking) => {
                        const bookingDateTime = new Date(`${booking.bookingDate} ${booking.startTime}`);
                        // isPast can be used for visual styling in future
                        const _isPast = new Date() > new Date(`${booking.bookingDate} ${booking.endTime}`);

                        return (
                            <Card key={booking.id} className={booking.status === "pending" ? "border-amber-200" : ""}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <CardTitle className="text-xl">{booking.facility?.name || "สิ่งอำนวยความสะดวก"}</CardTitle>
                                                {getStatusBadge(booking.status)}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <CalendarDays className="h-4 w-4" />
                                                    {format(bookingDateTime, "PPP", { locale: th })}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <Clock className="h-4 w-4" />
                                                    {booking.startTime} - {booking.endTime}
                                                </div>
                                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                                    <span className="font-medium">ห้อง:</span> {booking.unit?.number || "-"}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {booking.status === "pending" && (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => handleApprove(booking.id)}
                                                                className="text-green-600"
                                                            >
                                                                <Check className="h-4 w-4 mr-2" />
                                                                อนุมัติ
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleReject(booking.id)}
                                                                className="text-red-600"
                                                            >
                                                                <X className="h-4 w-4 mr-2" />
                                                                ปฏิเสธ
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                        </>
                                                    )}
                                                    <DropdownMenuItem disabled>
                                                        ดูรายละเอียด (Coming Soon)
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">ผู้จอง:</span>{" "}
                                            {booking.user?.name || "-"}
                                            {booking.user?.email && (
                                                <span className="text-slate-600 dark:text-slate-400 ml-2">({booking.user.email})</span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="font-medium">รหัสการจอง:</span>{" "}
                                            {booking.id.slice(0, 8)}...
                                        </div>
                                        <div>
                                            <span className="font-medium">จองเมื่อ:</span>{" "}
                                            {format(new Date(booking.createdAt), "PPP", { locale: th })}
                                        </div>
                                    </div>
                                    {booking.status === "pending" && (
                                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                                            <p className="text-sm text-amber-800">
                                                การจองนี้รอการอนุมัติจาก admin
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
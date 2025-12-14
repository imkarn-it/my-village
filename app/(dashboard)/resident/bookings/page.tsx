"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    CalendarDays,
    Clock,
    MoreHorizontal,
    X,
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
    userId: string;
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
            return <Badge className="bg-green-100 text-green-800">อนุมัติแล้ว</Badge>;
        case "rejected":
            return <Badge variant="destructive">ถูกปฏิเสธ</Badge>;
        case "cancelled":
            return <Badge variant="outline">ถูกยกเลิก</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
};

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

    const handleCancel = async (id: string) => {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้?")) return;

        try {
            // @ts-ignore - Eden Treaty type inference issue
            const { data } = await api.bookings({ id }).patch({ status: "cancelled" });
            if (data) {
                await fetchBookings();
            }
        } catch {
            setError("ไม่สามารถยกเลิกการจองได้");
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        if (filter === "all") return true;
        if (filter === "upcoming") {
            const bookingDate = new Date(`${booking.bookingDate} ${booking.startTime}`);
            return bookingDate > new Date() && booking.status === "approved";
        }
        if (filter === "pending") return booking.status === "pending";
        if (filter === "past") {
            const bookingDate = new Date(`${booking.bookingDate} ${booking.endTime}`);
            return bookingDate < new Date() || ["rejected", "cancelled"].includes(booking.status);
        }
        return booking.status === filter;
    });

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">การจองของฉัน</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">ดูการจองสิ่งอำนวยความสะดวกของคุณ</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
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
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">การจองของฉัน</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">ดูการจองสิ่งอำนวยความสะดวกของคุณ</p>
                    </div>
                </div>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-red-200 dark:border-red-500/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <p className="text-red-800 dark:text-red-400">{error}</p>
                        <Button onClick={fetchBookings} variant="outline" className="mt-2 border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
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
                    <h1 className="text-3xl font-bold text-gray-900">การจองของฉัน</h1>
                    <p className="text-gray-600 mt-1">ดูการจองสิ่งอำนวยความสะดวกของคุณ</p>
                </div>
                <Link href="/resident/facilities">
                    <Button>
                        <CalendarDays className="h-4 w-4 mr-2" />
                        จองเพิ่ม
                    </Button>
                </Link>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4">
                <Filter className="h-4 w-4 text-slate-500" />
                <div className="flex gap-2">
                    {[
                        { value: "all", label: "ทั้งหมด" },
                        { value: "upcoming", label: "ที่จะถึง" },
                        { value: "pending", label: "รออนุมัติ" },
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

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="pt-6 text-center">
                        <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            {filter === "all" ? "ยังไม่มีการจอง" : `ไม่มีการจอง${filter === "upcoming" ? "ที่จะถึง" : filter === "pending" ? "ที่รออนุมัติ" : "ที่ผ่านมา"}`}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {filter === "all" ? "คุณยังไม่เคยจองสิ่งอำนวยความสะดวก" : `ไม่พบการจองที่ตรงตามเงื่อนไข`}
                        </p>
                        {filter === "all" && (
                            <Link href="/resident/facilities">
                                <Button>จองสิ่งอำนวยความสะดวก</Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map((booking) => {
                        const bookingDateTime = new Date(`${booking.bookingDate} ${booking.startTime}`);
                        const isPast = new Date() > new Date(`${booking.bookingDate} ${booking.endTime}`);
                        const canCancel = !isPast && ["pending", "approved"].includes(booking.status);

                        return (
                            <Card key={booking.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl">{booking.facility?.name || "สิ่งอำนวยความสะดวก"}</CardTitle>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <CalendarDays className="h-4 w-4" />
                                                    {format(bookingDateTime, "PPP", { locale: th })}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Clock className="h-4 w-4" />
                                                    {booking.startTime} - {booking.endTime}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(booking.status)}
                                            {canCancel && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => handleCancel(booking.id)}
                                                            className="text-red-600"
                                                        >
                                                            <X className="h-4 w-4 mr-2" />
                                                            ยกเลิกการจอง
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium">รหัสการจอง:</span> {booking.id.slice(0, 8)}...
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium">จองเมื่อ:</span>{" "}
                                            {format(new Date(booking.createdAt), "PPP", { locale: th })}
                                        </div>
                                    </div>
                                    {booking.status === "rejected" && (
                                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                                            <p className="text-sm text-red-800">
                                                การจองนี้ถูกปฏิเสธ กรุณาติดต่อ admin หากต้องการข้อมูลเพิ่มเติม
                                            </p>
                                        </div>
                                    )}
                                    {booking.status === "cancelled" && (
                                        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                            <p className="text-sm text-gray-800">การจองนี้ถูกยกเลิกแล้ว</p>
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
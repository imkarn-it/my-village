"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Users, ArrowLeft, Save, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { api } from "@/lib/api/client";

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

type BookingData = {
    facilityId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    notes?: string;
};

export default function FacilityBookingPage() {
    const params = useParams();
    const router = useRouter();
    const facilityId = params.id as string;

    const [facility, setFacility] = useState<Facility | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [bookingData, setBookingData] = useState<BookingData>({
        facilityId,
        bookingDate: "",
        startTime: "",
        endTime: "",
        notes: "",
    });

    const fetchFacility = useCallback(async () => {
        try {
            setLoading(true);
            const response = await (api.facilities.get as unknown as (options: { query: { id: string } }) => Promise<{
                data: { success: boolean; data: Facility[] } | null;
            }>)({ query: { id: facilityId } });
            if (response.data?.success && response.data.data.length > 0) {
                setFacility(response.data.data[0]);
            } else {
                setError("ไม่พบสิ่งอำนวยความสะดวก");
            }
        } catch {
            setError("ไม่สามารถโหลดข้อมูลสิ่งอำนวยความสะดวกได้");
        } finally {
            setLoading(false);
        }
    }, [facilityId]);

    const generateTimeSlots = () => {
        if (!facility?.openTime || !facility?.closeTime) return [];

        const slots = [];
        const [openHour, openMinute] = facility.openTime.split(":").map(Number);
        const [closeHour, closeMinute] = facility.closeTime.split(":").map(Number);

        const startMinutes = openHour * 60 + (openMinute || 0);
        const endMinutes = closeHour * 60 + (closeMinute || 0);

        for (let minutes = startMinutes; minutes < endMinutes; minutes += 60) {
            const hour = Math.floor(minutes / 60);
            const minute = minutes % 60;
            const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
            slots.push(timeString);
        }

        return slots;
    };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date) {
            setBookingData(prev => ({
                ...prev,
                bookingDate: format(date, "yyyy-MM-dd"),
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        // Validation
        if (!selectedDate) {
            setError("กรุณาเลือกวันที่");
            setSubmitting(false);
            return;
        }

        if (!bookingData.startTime || !bookingData.endTime) {
            setError("กรุณาเลือกเวลาเริ่มต้นและเวลาสิ้นสุด");
            setSubmitting(false);
            return;
        }

        if (bookingData.startTime >= bookingData.endTime) {
            setError("เวลาสิ้นสุดต้องมาหลังเวลาเริ่มต้น");
            setSubmitting(false);
            return;
        }

        try {
            const payload = {
                facilityId,
                unitId: "default-unit", // TODO: Get from session
                userId: "default-user", // TODO: Get from session
                bookingDate: bookingData.bookingDate,
                startTime: bookingData.startTime,
                endTime: bookingData.endTime,
            };

            const { data } = await api.bookings.post(payload);

            if (data) {
                router.push("/resident/bookings?success=true");
            }
        } catch (err: unknown) {
            const error = err as { status?: number; message?: string };
            if (error.status === 409) {
                setError("ช่วงเวลานี้ถูกจองแล้ว กรุณาเลือกเวลาอื่น");
            } else {
                setError(error.message || "ไม่สามารถจองได้ กรุณาลองใหม่");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const timeSlots = generateTimeSlots();

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/resident/facilities">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            กลับ
                        </Button>
                    </Link>
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <Card className="animate-pulse">
                            <CardHeader className="h-48"></CardHeader>
                        </Card>
                    </div>
                    <Card className="animate-pulse">
                        <CardHeader className="h-96"></CardHeader>
                    </Card>
                </div>
            </div>
        );
    }

    if (error && !facility) {
        return (
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/resident/facilities">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            กลับ
                        </Button>
                    </Link>
                </div>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-800">{error}</p>
                        <Button onClick={() => router.push("/resident/facilities")} variant="outline" className="mt-2">
                            กลับไปหน้ารายการ
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!facility) return null;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/resident/facilities">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        กลับ
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{facility.name}</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">จองใช้สิ่งอำนวยความสะดวก</p>
                </div>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            <p className="text-red-800">{error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Facility Info */}
                <div className="space-y-6">
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>ข้อมูลสิ่งอำนวยความสะดวก</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {facility.image && (
                                <div className="aspect-video rounded-lg overflow-hidden relative">
                                    <Image
                                        src={facility.image}
                                        alt={facility.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            {facility.description && (
                                <div>
                                    <h3 className="font-semibold mb-2">รายละเอียด</h3>
                                    <p className="text-slate-600 dark:text-slate-400">{facility.description}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {facility.openTime && facility.closeTime && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm">
                                            {facility.openTime} - {facility.closeTime}
                                        </span>
                                    </div>
                                )}
                                {facility.maxCapacity && (
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm">ความจุ {facility.maxCapacity} คน</span>
                                    </div>
                                )}
                            </div>
                            {facility.requiresApproval && (
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                    <span className="text-sm text-amber-600">
                                        การจองต้องได้รับการอนุมัติจาก admin
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Booking Form */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>ทำการจอง</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Date Selection */}
                            <div className="space-y-2">
                                <Label>วันที่ต้องการจอง *</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-full justify-start text-left font-normal ${!selectedDate && "text-muted-foreground"
                                                }`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {selectedDate ? (
                                                format(selectedDate, "PPP", { locale: th })
                                            ) : (
                                                <span>เลือกวันที่</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={handleDateSelect}
                                            disabled={(date) => {
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);
                                                return date < today;
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Time Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>เวลาเริ่มต้น *</Label>
                                    <Select
                                        value={bookingData.startTime}
                                        onValueChange={(value) =>
                                            setBookingData(prev => ({ ...prev, startTime: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="เลือกเวลา" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timeSlots.map((time) => (
                                                <SelectItem key={time} value={time}>
                                                    {time}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>เวลาสิ้นสุด *</Label>
                                    <Select
                                        value={bookingData.endTime}
                                        onValueChange={(value) =>
                                            setBookingData(prev => ({ ...prev, endTime: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="เลือกเวลา" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timeSlots.map((time) => (
                                                <SelectItem key={time} value={time}>
                                                    {time}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">หมายเหตุ (ถ้ามี)</Label>
                                <Textarea
                                    id="notes"
                                    value={bookingData.notes}
                                    onChange={(e) =>
                                        setBookingData(prev => ({ ...prev, notes: e.target.value }))
                                    }
                                    placeholder="ระบุรายละเอียดเพิ่มเติม..."
                                    rows={3}
                                />
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={submitting || !selectedDate || !bookingData.startTime || !bookingData.endTime}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {submitting ? "กำลังจอง..." : "จองเลย"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
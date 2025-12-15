"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft,
    Calendar,
    Clock,
    Users,
    MapPin,
    CheckCircle,
    XCircle,
    AlertCircle,
    Download,
    Share,
    Edit,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Booking } from "@/types";

// Extended booking type with joined data for display
type FacilityBooking = Booking & {
    facilityName: string;
    facilityImage?: string;
    facilityLocation: string;
    userName: string;
    userUnit: string;
    participants?: number;
    totalAmount?: number;
    notes?: string;
    qrCode: string;
    updatedAt?: string;
};

// Sample booking data - in real app, fetch from API
const booking: FacilityBooking = {
    id: "1",
    facilityId: "1",
    unitId: "unit-1",
    facilityName: "สระว่ายน้ำ",
    facilityImage: "/facilities/swimming-pool.jpg",
    facilityLocation: "ชั้น G ใกล้สวนสาธารณะ",
    userId: "user1",
    userName: "สมชาย ใจดี",
    userUnit: "A/101",
    bookingDate: "2025-01-15",
    startTime: "08:00:00",
    endTime: "10:00:00",
    status: "approved",
    participants: 2,
    totalAmount: 0,
    createdAt: new Date("2025-01-14T10:00:00Z"),
    notes: "ออกกำลังกายเช้า ต้องการใช้เก้าอี้อาบแดด 2 ตัว",
    qrCode: "BK20250115001",
};

export default function BookingDetailPage() {
    const _params = useParams();
    const router = useRouter();
    // const bookingId = params.id as string;

    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            case "cancelled":
                return "bg-slate-100 dark:bg-slate-800 text-gray-800";
            default:
                return "bg-slate-100 dark:bg-slate-800 text-gray-800";
        }
    };

    const getStatusText = (status: string | null) => {
        switch (status) {
            case "approved":
                return "อนุมัติแล้ว";
            case "pending":
                return "รออนุมัติ";
            case "rejected":
                return "ปฏิเสธ";
            case "cancelled":
                return "ยกเลิก";
            default:
                return status || "ไม่ทราบสถานะ";
        }
    };

    const getStatusIcon = (status: string | null) => {
        switch (status) {
            case "approved":
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case "pending":
                return <AlertCircle className="h-5 w-5 text-yellow-600" />;
            case "rejected":
                return <XCircle className="h-5 w-5 text-red-600" />;
            case "cancelled":
                return <XCircle className="h-5 w-5 text-red-600" />;
            default:
                return null;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (timeString: string) => {
        // Handle time format "HH:mm:ss"
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    };

    const formatDateTime = (dateString: string | Date | null) => {
        if (!dateString) return "-";
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        return date.toLocaleString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleCancelBooking = async () => {
        setCancelling(true);
        try {
            // In real app, call API to cancel booking
            // await api.bookings(bookingId).delete();

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            router.push("/resident/bookings?cancelled=true");
        } catch (error) {
            console.error("Failed to cancel booking:", error);
        } finally {
            setCancelling(false);
            setShowCancelDialog(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `การจอง${booking.facilityName}`,
                text: `จอง ${booking.facilityName} วันที่ ${formatDate(booking.bookingDate)} เวลา ${formatTime(booking.startTime)}-${formatTime(booking.endTime)}`,
                url: window.location.href,
            });
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert("คัดลอกลิงก์แล้ว");
        }
    };

    const handleDownloadQR = () => {
        // In real app, generate and download QR code
        const link = document.createElement('a');
        link.download = `booking-${booking.qrCode}.png`;
        link.href = '/qr-code-placeholder.png';
        link.click();
    };

    const canCancel = booking.status === "approved" || booking.status === "pending";
    const canEdit = booking.status === "approved" || booking.status === "pending";

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/resident/bookings">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            กลับ
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">รายละเอียดการจอง</h1>
                        <p className="text-slate-600 dark:text-slate-400">รหัสการจอง: {booking.qrCode}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleShare}>
                        <Share className="h-4 w-4 mr-2" />
                        แชร์
                    </Button>
                    <Button variant="outline" onClick={handleDownloadQR}>
                        <Download className="h-4 w-4 mr-2" />
                        ดาวน์โหลด QR
                    </Button>
                    {canEdit && (
                        <Button variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            แก้ไข
                        </Button>
                    )}
                    {canCancel && (
                        <Button
                            variant="destructive"
                            onClick={() => setShowCancelDialog(true)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            ยกเลิกการจอง
                        </Button>
                    )}
                </div>
            </div>

            {/* Status Alert */}
            <Alert className={getStatusColor(booking.status)}>
                <div className="flex items-center gap-2">
                    {getStatusIcon(booking.status)}
                    <AlertDescription className="font-medium">
                        สถานะการจอง: {getStatusText(booking.status)}
                    </AlertDescription>
                </div>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Facility Info */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>ข้อมูลสิ่งอำนวยความสะดวก</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-4">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                                    <Image
                                        src={booking.facilityImage || "/placeholder.png"}
                                        alt={booking.facilityName}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold">{booking.facilityName}</h3>
                                    <div className="flex items-center gap-2 mt-1 text-slate-600 dark:text-slate-400">
                                        <MapPin className="h-4 w-4" />
                                        <span className="text-sm">{booking.facilityLocation}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Users className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            จำนวนผู้เข้าใช้: {booking.participants} คน
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Booking Details */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>รายละเอียดการจอง</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">วันที่:</span>
                                <span>{formatDate(booking.bookingDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">เวลา:</span>
                                <span>
                                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">ระยะเวลา:</span>
                                <span>
                                    {Math.round(
                                        (new Date(`2000-01-01T${booking.endTime}`).getTime() -
                                            new Date(`2000-01-01T${booking.startTime}`).getTime()) /
                                        (1000 * 60 * 60)
                                    )} ชั่วโมง
                                </span>
                            </div>
                            {(booking.totalAmount && booking.totalAmount > 0) && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">ค่าบริการ:</span>
                                    <span className="text-lg font-semibold text-green-600">
                                        ฿{booking.totalAmount}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    {booking.notes && (
                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>หมายเหตุ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 dark:text-slate-300">{booking.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* QR Code */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-center">QR Code สำหรับเช็คอิน</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div className="w-48 h-48 bg-slate-100 dark:bg-slate-800 mx-auto rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-32 h-32 bg-slate-200 dark:bg-slate-700 mx-auto mb-2 rounded flex items-center justify-center">
                                        <span className="text-2xl font-bold text-slate-500 dark:text-slate-400">
                                            QR
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{booking.qrCode}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                                แสดง QR Code นี้ต่อเจ้าหน้าที่เพื่อเช็คอิน
                            </p>
                        </CardContent>
                    </Card>

                    {/* Timestamps */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-sm">ข้อมูลเวลา</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <span className="text-slate-600 dark:text-slate-400">สร้างเมื่อ:</span>
                                <p className="font-medium">{formatDateTime(booking.createdAt)}</p>
                            </div>
                            <div>
                                <span className="text-slate-600 dark:text-slate-400">อัปเดตล่าสุด:</span>
                                <p className="font-medium">{formatDateTime(booking.updatedAt || booking.createdAt)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-sm">ติดต่อสอบถาม</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                หากมีข้อสงสัยเกี่ยวกับการจอง
                            </p>
                            <Link href="/resident/support/new">
                                <Button className="w-full" variant="outline" size="sm">
                                    ติดต่อแอดมิน
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Cancel Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>ยืนยันการยกเลิกการจอง</DialogTitle>
                        <DialogDescription>
                            คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจอง {booking.facilityName} ในวันที่ {formatDate(booking.bookingDate)}?
                            <br />
                            การยกเลิกนี้ไม่สามารถกลับมาแก้ไขได้
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelDialog(false)}
                            disabled={cancelling}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancelBooking}
                            disabled={cancelling}
                        >
                            {cancelling ? "กำลังยกเลิก..." : "ยืนยันการยกเลิก"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
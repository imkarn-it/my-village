"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    QrCode,
    Camera,
    CameraOff,
    AlertTriangle,
    CheckCircle,
    Clock,
    MapPin,
    User,
    FileText,
    ArrowLeft,
    RefreshCw,
    Home,
    Wrench,
    Ticket
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

type ScanResult = {
    type: "ticket" | "equipment" | "location" | "resident" | "unknown";
    id: string;
    data: unknown;
    timestamp: Date;
};

type TicketInfo = {
    id: string;
    ticketNumber: string;
    title: string;
    location: string;
    unit: string;
    requester: string;
    priority: "low" | "medium" | "high" | "urgent";
    status: "pending" | "assigned" | "in_progress" | "completed";
    reportedDate: string;
    category: string;
};

const mockTicketInfo: TicketInfo = {
    id: "1",
    ticketNumber: "MT-2025-001",
    title: "ซ่อมแอร์ห้อง A-205",
    location: "อาคาร A ชั้น 2",
    unit: "A-205",
    requester: "สมศักดิ์ ใจดี",
    priority: "medium",
    status: "assigned",
    reportedDate: "2025-12-13T09:00:00Z",
    category: "ระบบไกล์อากาศ"
};

export default function MaintenanceQRScannerPage() {
    const router = useRouter();
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setIsScanning(true);
                setError("");
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบสิทธิ์การใช้งานกล้อง");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsScanning(false);
    };

    const simulateQRScan = () => {
        // Simulate QR code scan for demo purposes
        const mockQRData = {
            type: "ticket" as const,
            id: "MT-2025-001",
            data: mockTicketInfo
        };

        processScanResult(mockQRData);
    };

    const processScanResult = (data: {
        type: "ticket" | "equipment" | "location" | "resident" | "unknown";
        id?: string;
        ticketId?: string;
        unitId?: string;
        data?: TicketInfo;
        [key: string]: unknown;
    }) => {
        setIsLoading(true);
        stopCamera();

        // Process different types of QR codes
        if (data.type === "ticket") {
            // Fetch ticket details
            setTimeout(() => {
                setTicketInfo(data.data || null);
                setScanResult({
                    type: data.type,
                    id: data.id || "",
                    data: data.data || null,
                    timestamp: new Date()
                });
                setIsLoading(false);
            }, 1000);
        } else {
            setScanResult({
                type: data.type || "unknown",
                id: data.id || "",
                data: data,
                timestamp: new Date()
            });
            setIsLoading(false);
        }
    };

    const handleAction = (action: string) => {
        if (!scanResult) return;

        switch (action) {
            case "start-work":
                router.push(`/maintenance/checklist/${scanResult.id}`);
                break;
            case "view-details":
                router.push(`/maintenance/tickets/${scanResult.id}`);
                break;
            case "new-ticket":
                router.push("/maintenance/tickets/new");
                break;
            case "scan-again":
                setScanResult(null);
                setTicketInfo(null);
                setError("");
                break;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent": return "bg-red-100 text-red-800";
            case "high": return "bg-orange-100 text-orange-800";
            case "medium": return "bg-yellow-100 text-yellow-800";
            case "low": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-800";
            case "in_progress": return "bg-blue-100 text-blue-800";
            case "assigned": return "bg-purple-100 text-purple-800";
            case "pending": return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">สแกน QR Code</h1>
                    <p className="text-gray-600">สแกนเพื่อดูข้อมูลงานซ่อม</p>
                </div>
                <Link href="/maintenance/mobile">
                    <Button variant="ghost" size="icon">
                        <Home className="w-5 h-5" />
                    </Button>
                </Link>
            </div>

            {!scanResult ? (
                /* Scanner View */
                <div className="space-y-6">
                    {/* Camera Preview */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                                {isScanning ? (
                                    <>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Scan Overlay */}
                                        <div className="absolute inset-0 pointer-events-none">
                                            <div className="absolute inset-0 bg-black bg-opacity-40">
                                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                    <div className="w-64 h-64 border-4 border-white rounded-lg">
                                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-lg" />
                                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-lg" />
                                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-lg" />
                                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-lg" />
                                                    </div>
                                                    <div className="text-center mt-4">
                                                        <p className="text-white text-sm">จัด QR Code ให้อยู่ในกรอบ</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-white">
                                        <QrCode className="w-24 h-24 mb-4 text-gray-400" />
                                        <p className="text-gray-400 text-center px-4">
                                            {error || "กดเริ่มการสแกนเพื่อใช้งานกล้อง"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Camera Controls */}
                            <div className="flex gap-3 mt-4">
                                {!isScanning ? (
                                    <Button
                                        onClick={startCamera}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Camera className="w-4 h-4 mr-2" />
                                        เริ่มสแกน
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            onClick={stopCamera}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            <CameraOff className="w-4 h-4 mr-2" />
                                            หยุดสแกน
                                        </Button>
                                        <Button
                                            onClick={simulateQRScan}
                                            variant="outline"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                            </div>

                            {error && (
                                <Alert className="mt-4 bg-red-50 border-red-200">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-700">
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">การกระทำด่วน</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/maintenance/tickets/new" className="block">
                                <Button variant="outline" className="w-full justify-start">
                                    <Ticket className="w-4 h-4 mr-2" />
                                    สร้างใบแจ้งซ่อมใหม่
                                </Button>
                            </Link>
                            <Link href="/maintenance/equipment" className="block">
                                <Button variant="outline" className="w-full justify-start">
                                    <Wrench className="w-4 h-4 mr-2" />
                                    ตรวจสอบอุปกรณ์
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                /* Result View */
                <div className="space-y-6">
                    {/* Scan Success */}
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-green-900">สแกนสำเร็จ</h3>
                                    <p className="text-sm text-green-700">
                                        พบข้อมูล: {scanResult.type === "ticket" ? "ใบแจ้งซ่อม" : scanResult.type}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ticket Information */}
                    {ticketInfo && (
                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        ข้อมูลใบแจ้งซ่อม
                                    </span>
                                    <div className="flex gap-2">
                                        <Badge className={getPriorityColor(ticketInfo.priority)}>
                                            {ticketInfo.priority === "urgent" && "ด่วนที่สุด"}
                                            {ticketInfo.priority === "high" && "สูง"}
                                            {ticketInfo.priority === "medium" && "ปานกลาง"}
                                            {ticketInfo.priority === "low" && "ต่ำ"}
                                        </Badge>
                                        <Badge className={getStatusColor(ticketInfo.status)}>
                                            {ticketInfo.status === "assigned" && "มอบหมายแล้ว"}
                                            {ticketInfo.status === "in_progress" && "กำลังดำเนินการ"}
                                            {ticketInfo.status === "completed" && "เสร็จสิ้น"}
                                            {ticketInfo.status === "pending" && "รอดำเนินการ"}
                                        </Badge>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg">{ticketInfo.title}</h3>
                                    <p className="text-gray-600 mt-1">{ticketInfo.ticketNumber}</p>
                                </div>

                                <div className="grid grid-cols-1 gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{ticketInfo.location} - {ticketInfo.unit}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span>ผู้แจ้ง: {ticketInfo.requester}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span>แจ้ง: {format(new Date(ticketInfo.reportedDate), "d MMM yyyy HH:mm", { locale: th })}</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleAction("start-work")}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        disabled={ticketInfo.status === "completed"}
                                    >
                                        <Wrench className="w-4 h-4 mr-2" />
                                        {ticketInfo.status === "completed" ? "เสร็จสิ้นแล้ว" : "เริ่มทำงาน"}
                                    </Button>
                                    <Button
                                        onClick={() => handleAction("view-details")}
                                        variant="outline"
                                    >
                                        ดูรายละเอียด
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="p-4 space-y-3">
                            <Button
                                onClick={() => handleAction("scan-again")}
                                variant="outline"
                                className="w-full"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                สแกน QR Code ใหม่
                            </Button>
                            <Link href="/maintenance/mobile" className="block">
                                <Button variant="ghost" className="w-full">
                                    กลับไปหน้าหลัก
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="p-6 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                            <p>กำลังดึงข้อมูล...</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
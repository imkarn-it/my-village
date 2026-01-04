"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Car,
    Phone,
    Clock,
    History,
    Send,
    AlertCircle,
    Star,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";
import { withFeaturePage } from "@/lib/features";

type TransportRequest = {
    id: string;
    type: "taxi" | "motorcycle" | "private_car";
    status: "pending" | "assigned" | "picked_up" | "completed" | "cancelled";
    passengerName: string;
    passengerPhone: string;
    unitNumber: string;
    pickupLocation: string;
    destination: string;
    pickupTime: string;
    specialRequests?: string;
    driverName?: string;
    driverPhone?: string;
    vehicleDetails?: string;
    estimatedArrival?: string;
    createdAt: string;
    assignedAt?: string;
    pickedUpAt?: string;
    completedAt?: string;
    rating?: number;
    feedback?: string;
    fare?: number;
};

const mockRequests: TransportRequest[] = [
    {
        id: "1",
        type: "taxi",
        status: "completed",
        passengerName: "สมศักดิ์ ใจดี",
        passengerPhone: "081-234-5678",
        unitNumber: "A-101",
        pickupLocation: "Lobby อาคาร A",
        destination: "สนามบินสุวรรณภูมิ",
        pickupTime: "2025-01-13T08:00:00Z",
        specialRequests: "มีกระเป๋าใหญ่ 2 ใบ",
        driverName: "คุณวีระ",
        driverPhone: "082-345-6789",
        vehicleDetails: "Toyota Camry กข-1234",
        createdAt: "2025-01-13T07:45:00Z",
        assignedAt: "2025-01-13T07:50:00Z",
        pickedUpAt: "2025-01-13T08:05:00Z",
        completedAt: "2025-01-13T09:30:00Z",
        rating: 5,
        feedback: "บริการดี พนักงานมาตรงเวลา",
        fare: 650
    },
    {
        id: "2",
        type: "motorcycle",
        status: "assigned",
        passengerName: "วีระ มั่นคง",
        passengerPhone: "082-345-6789",
        unitNumber: "B-205",
        pickupLocation: "หน้าอาคาร B",
        destination: "BTS สถานีอโศก",
        pickupTime: "2025-01-13T18:30:00Z",
        driverName: "คุณสมชาย",
        driverPhone: "083-456-7890",
        vehicleDetails: "Honda Click คง-5678",
        estimatedArrival: "2025-01-13T18:35:00Z",
        createdAt: "2025-01-13T18:20:00Z",
        assignedAt: "2025-01-13T18:22:00Z"
    }
];

const transportProviders = [
    {
        id: "taxi-company-1",
        name: "แท็กซี่มิตรภาพ",
        type: "taxi",
        rating: 4.5,
        phone: "02-123-4567",
        available: true,
        estimatedTime: "5-10 นาที",
        baseFare: 40,
        perKm: 8
    },
    {
        id: "bike-1",
        name: "ไรเดอร์แมน",
        type: "motorcycle",
        rating: 4.7,
        phone: "081-987-6543",
        available: true,
        estimatedTime: "3-5 นาที",
        baseFare: 20,
        perKm: 5
    }
];

function ResidentTransportPage() {
    const [requests, setRequests] = useState<TransportRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewRequestForm, setShowNewRequestForm] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<TransportRequest | null>(null);
    const [providers] = useState(transportProviders);

    // Form state
    const [formData, setFormData] = useState({
        type: "taxi" as "taxi" | "motorcycle" | "private_car",
        passengerName: "",
        passengerPhone: "",
        unitNumber: "",
        pickupLocation: "",
        destination: "",
        pickupTime: "",
        specialRequests: ""
    });

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setRequests(mockRequests);
            setLoading(false);
        }, 1000);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!formData.passengerName || !formData.passengerPhone || !formData.pickupLocation || !formData.destination) {
            toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        try {
            // Create new request
            const newRequest: TransportRequest = {
                id: Date.now().toString(),
                type: formData.type,
                status: "pending",
                passengerName: formData.passengerName,
                passengerPhone: formData.passengerPhone,
                unitNumber: formData.unitNumber,
                pickupLocation: formData.pickupLocation,
                destination: formData.destination,
                pickupTime: formData.pickupTime || new Date().toISOString(),
                specialRequests: formData.specialRequests,
                createdAt: new Date().toISOString()
            };

            // Add to requests list
            setRequests([newRequest, ...requests]);

            // Show success message
            toast.success("ส่งคำขอแท็กซี่/รถจ้างเรียบร้อยแล้ว");

            // Reset form
            setFormData({
                type: "taxi",
                passengerName: "",
                passengerPhone: "",
                unitNumber: "",
                pickupLocation: "",
                destination: "",
                pickupTime: "",
                specialRequests: ""
            });
            setShowNewRequestForm(false);

            // Simulate notification to security
            setTimeout(() => {
                toast.info("รปภ. ได้รับแจ้งเรียบร้อยแล้ว กำลังหาพนักงานให้");
            }, 2000);

        } catch {
            toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
        }
    };

    const handleRate = async (requestId: string, rating: number, feedback: string) => {
        try {
            // Update request with rating
            setRequests(requests.map(req =>
                req.id === requestId
                    ? { ...req, rating, feedback }
                    : req
            ));

            toast.success("ขอบคุณสำหรับการให้คะแนน");
            setSelectedRequest(null);
        } catch {
            toast.error("ไม่สามารถบันทึกคะแนนได้");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return "bg-yellow-100 text-yellow-800";
            case "assigned": return "bg-blue-100 text-blue-800";
            case "picked_up": return "bg-purple-100 text-purple-800";
            case "completed": return "bg-green-100 text-green-800";
            case "cancelled": return "bg-red-100 text-red-800";
            default: return "bg-slate-100 dark:bg-slate-800 text-gray-800";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "pending": return "รอดำเนินการ";
            case "assigned": return "มอบหมายแล้ว";
            case "picked_up": return "รับผู้โดยสารแล้ว";
            case "completed": return "เสร็จสิ้น";
            case "cancelled": return "ยกเลิก";
            default: return status;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "taxi": return <Car className="w-5 h-5" />;
            case "motorcycle": return <Car className="w-5 h-5" />;
            case "private_car": return <Car className="w-5 h-5" />;
            default: return <Car className="w-5 h-5" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "taxi": return "แท็กซี่";
            case "motorcycle": return "มอเตอร์ไซค์";
            case "private_car": return "รถส่วนตัว";
            default: return type;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 mb-2"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-96"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="animate-pulse">
                        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                    <div className="animate-pulse">
                        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                            <Car className="w-5 h-5 text-white" />
                        </div>
                        บริการรถเรียก
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">เรียกแท็กซี่ มอเตอร์ไซค์ หรือรถจ้างส่วนตัว</p>
                </div>
                <Button onClick={() => setShowNewRequestForm(true)} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-[1.02]">
                    <Car className="w-4 h-4 mr-2" />
                    เรียกรถใหม่
                </Button>
            </div>

            {/* Quick Call Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {providers.map((provider) => (
                    <Card key={provider.id} className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm hover:border-orange-500/50 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-orange-500/10 dark:hover:shadow-orange-500/5">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {getTypeIcon(provider.type)}
                                    <div>
                                        <h3 className="font-semibold">{provider.name}</h3>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                            <span className="text-sm">{provider.rating}</span>
                                        </div>
                                    </div>
                                </div>
                                {provider.available ? (
                                    <Badge className="bg-green-100 text-green-800">พร้อมบริการ</Badge>
                                ) : (
                                    <Badge className="bg-red-100 text-red-800">ไม่ว่าง</Badge>
                                )}
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">เบื้องต้น:</span>
                                    <span className="font-medium">฿{provider.baseFare}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">ต่อกิโลเมตร:</span>
                                    <span className="font-medium">฿{provider.perKm}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">เวลามาถึง:</span>
                                    <span className="font-medium">{provider.estimatedTime}</span>
                                </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <Button variant="outline" className="flex-1" asChild>
                                    <a href={`tel:${provider.phone}`}>
                                        <Phone className="w-4 h-4 mr-2" />
                                        {provider.phone}
                                    </a>
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setShowNewRequestForm(true)}
                                >
                                    จองผ่านแอป
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Request History */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        ประวัติการเรียกใช้บริการ ({requests.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {requests.length === 0 ? (
                        <div className="text-center py-12">
                            <Car className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                ยังไม่มีประวัติการเรียกใช้บริการ
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                เริ่มต้นใช้บริการเรียกรถของคุณ
                            </p>
                            <Button onClick={() => setShowNewRequestForm(true)}>
                                <Car className="w-4 h-4 mr-2" />
                                เรียกรถคันแรก
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((request) => (
                                <div key={request.id} className="border rounded-lg p-4 hover:bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                {getTypeIcon(request.type)}
                                                <div>
                                                    <p className="font-medium">{getTypeLabel(request.type)}</p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {format(new Date(request.createdAt), "d MMM yyyy, HH:mm", { locale: th })}
                                                    </p>
                                                </div>
                                                <Badge className={getStatusColor(request.status)}>
                                                    {getStatusLabel(request.status)}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                <div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">ผู้โดยสาร</p>
                                                    <p className="font-medium">{request.passengerName}</p>
                                                    <p className="text-sm">{request.passengerPhone}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">ห้องพัก</p>
                                                    <p className="font-medium">{request.unitNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">จุดรับ</p>
                                                    <p className="font-medium">{request.pickupLocation}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">จุดส่ง</p>
                                                    <p className="font-medium">{request.destination}</p>
                                                </div>
                                            </div>

                                            {request.driverName && (
                                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                                    <p className="text-sm font-medium text-blue-900">ข้อมูลพนักงานขับรถ</p>
                                                    <p className="text-sm text-blue-700">
                                                        คุณ{request.driverName} - {request.driverPhone}
                                                    </p>
                                                    {request.vehicleDetails && (
                                                        <p className="text-sm text-blue-700">{request.vehicleDetails}</p>
                                                    )}
                                                </div>
                                            )}

                                            {request.estimatedArrival && request.status === "assigned" && (
                                                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                                                    <p className="text-sm text-yellow-800">
                                                        <Clock className="w-4 h-4 inline mr-1" />
                                                        คาดว่าจะถึงในอีก {format(new Date(request.estimatedArrival), "HH:mm", { locale: th })}
                                                    </p>
                                                </div>
                                            )}

                                            {request.fare && (
                                                <div className="mt-4 text-right">
                                                    <span className="text-lg font-bold text-slate-900 dark:text-white">฿{request.fare}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            {request.status === "completed" && !request.rating && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedRequest(request)}
                                                >
                                                    <Star className="w-4 h-4 mr-2" />
                                                    ให้คะแนน
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* New Request Modal */}
            {showNewRequestForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold">เรียกใช้บริการรถ</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="type">ประเภทรถ</Label>
                                    <Select value={formData.type} onValueChange={(value: "taxi" | "motorcycle" | "private_car") => setFormData({ ...formData, type: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="taxi">แท็กซี่</SelectItem>
                                            <SelectItem value="motorcycle">มอเตอร์ไซค์</SelectItem>
                                            <SelectItem value="private_car">รถส่วนตัว</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="pickupTime">เวลารับ</Label>
                                    <Input
                                        id="pickupTime"
                                        type="datetime-local"
                                        value={formData.pickupTime}
                                        onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="passengerName">ชื่อผู้โดยสาร</Label>
                                    <Input
                                        id="passengerName"
                                        value={formData.passengerName}
                                        onChange={(e) => setFormData({ ...formData, passengerName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="passengerPhone">เบอร์โทรศัพท์</Label>
                                    <Input
                                        id="passengerPhone"
                                        value={formData.passengerPhone}
                                        onChange={(e) => setFormData({ ...formData, passengerPhone: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="unitNumber">ห้องพัก</Label>
                                <Input
                                    id="unitNumber"
                                    placeholder="เช่น A-101"
                                    value={formData.unitNumber}
                                    onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="pickupLocation">จุดรับ</Label>
                                    <Input
                                        id="pickupLocation"
                                        placeholder="เช่น Lobby อาคาร A"
                                        value={formData.pickupLocation}
                                        onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="destination">จุดหมาย</Label>
                                    <Input
                                        id="destination"
                                        placeholder="เช่น สนามบินสุวรรณภูมิ"
                                        value={formData.destination}
                                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="specialRequests">คำขอพิเศษ (ถ้ามี)</Label>
                                <Textarea
                                    id="specialRequests"
                                    placeholder="เช่น มีกระเป๋าใหญ่ ต้องการรถที่มีที่ว่างพอสำหรับ..."
                                    value={formData.specialRequests}
                                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium mb-1">หมายเหตุ:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>คำขอของคุณจะถูกส่งไปยังรปภ. เพื่อประสานรถให้</li>
                                            <li>รปภ. จะแจ้งกลับเมื่อมีพนักงานรับเหมาะกับคำขอ</li>
                                            <li>คุณจะได้รับข้อมูลพนักงานขับรถทางแอปพลิเคชัน</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowNewRequestForm(false)}
                                >
                                    ยกเลิก
                                </Button>
                                <Button type="submit" className="flex-1">
                                    <Send className="w-4 h-4 mr-2" />
                                    ส่งคำขอ
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold">ให้คะแนนบริการ</h2>
                        </div>

                        <div className="p-6">
                            <div className="text-center mb-4">
                                <p className="text-slate-600 dark:text-slate-400 mb-2">คะแนนความพึงพอใจ</p>
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setSelectedRequest({ ...selectedRequest, rating: star })}
                                            className="p-1"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${star <= (selectedRequest.rating || 0)
                                                    ? "text-yellow-400 fill-current"
                                                    : "text-gray-300"
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="feedback">ความคิดเห็น (ไม่บังคับ)</Label>
                                <Textarea
                                    id="feedback"
                                    placeholder="แสดงความคิดเห็นเกี่ยวกับบริการ..."
                                    value={selectedRequest.feedback || ""}
                                    onChange={(e) => setSelectedRequest({ ...selectedRequest, feedback: e.target.value })}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setSelectedRequest(null)}
                            >
                                ข้าม
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={() => {
                                    if (selectedRequest.rating) {
                                        handleRate(selectedRequest.id, selectedRequest.rating, selectedRequest.feedback || "");
                                    }
                                }}
                                disabled={!selectedRequest.rating}
                            >
                                ส่งคะแนน
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default withFeaturePage('transport')(ResidentTransportPage);
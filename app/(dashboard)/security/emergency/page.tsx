"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    ArrowLeft,
    AlertTriangle,
    Phone,
    MapPin,
    Clock,
    Users,
    Bell,
    Send,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    MessageSquare,
    Navigation,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";
import { api } from "@/lib/api/client";

type EmergencyAlert = {
    id: string;
    type: "medical" | "fire" | "security" | "utility" | "other";
    severity: "low" | "medium" | "high" | "critical";
    title: string;
    description: string;
    location: {
        unitId?: string;
        unitNumber?: string;
        building?: string;
        floor?: string;
        details?: string;
    };
    reportedBy: string;
    contactNumber: string;
    status: "active" | "resolved" | "cancelled";
    createdAt: string;
    resolvedAt?: string;
    assignedTo?: string[];
    notes?: Array<{
        id: string;
        message: string;
        createdBy: string;
        createdAt: string;
    }>;
};

const emergencyTypes = [
    { value: "medical", label: "การแพทย์", icon: "🏥", color: "bg-red-500" },
    { value: "fire", label: "ไฟไหม", icon: "🔥", color: "bg-orange-500" },
    { value: "security", label: "ความปลอดภัย", icon: "🚨", color: "bg-purple-500" },
    { value: "utility", label: "สาธารณูติบำรุง", icon: "⚡", color: "bg-yellow-500" },
    { value: "other", label: "อื่นๆ", icon: "❗", color: "bg-slate-50 dark:bg-slate-800/500" },
];

const severityLevels = [
    { value: "low", label: "เล็กน้อย", color: "bg-green-100 text-green-800" },
    { value: "medium", label: "ปานกลาง", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "สูง", color: "bg-orange-100 text-orange-800" },
    { value: "critical", label: "วิกฤติ", color: "bg-red-100 text-red-800" },
];

export default function SecurityEmergencyPage() {
    const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        type: "",
        severity: "",
        title: "",
        description: "",
        unitId: "",
        locationDetails: "",
        reportedBy: "",
        contactNumber: "",
    });

    useEffect(() => {
        fetchAlerts();
        // Set up location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log("Location obtained:", position.coords);
                },
                (error) => {
                    console.error("Location error:", error);
                }
            );
        }
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            // TODO: Implement actual API call
            // Mock data for now
            const mockAlerts: EmergencyAlert[] = [
                {
                    id: "1",
                    type: "medical",
                    severity: "high",
                    title: "ผู้ป่วยล้มหมดสติ",
                    description: "ผู้สูงอายุประมาณ 75 ปี ล้มหมดสติในห้องน้ำ ต้องการความช่วยเหลือด่วน",
                    location: {
                        unitId: "unit-A-101",
                        unitNumber: "A-101",
                        building: "A",
                        floor: "1",
                        details: "ห้องน้ำในบ้าน",
                    },
                    reportedBy: "สมชาย ใจดี",
                    contactNumber: "081-234-5678",
                    status: "active",
                    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                    assignedTo: ["นายพยาบาล 1", "รปภ. สมชาย"],
                },
                {
                    id: "2",
                    type: "utility",
                    severity: "medium",
                    title: "น้ำรั่วจากท่อแอร์",
                    description: "น้ำรั่วหนักท่อแอร์ห้อง B-205 อาจทำให้พื้นช้ำเสียหาย",
                    location: {
                        unitId: "unit-B-205",
                        unitNumber: "B-205",
                        building: "B",
                        floor: "2",
                        details: "ห้องนอน",
                    },
                    reportedBy: "สมศรี รักเรือน",
                    contactNumber: "082-345-6789",
                    status: "active",
                    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
                },
            ];

            setAlerts(mockAlerts);
        } catch (error) {
            console.error("Failed to fetch alerts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // TODO: Implement actual API call
            const newAlert: EmergencyAlert = {
                id: `alert-${Date.now()}`,
                type: formData.type as EmergencyAlert["type"],
                severity: formData.severity as EmergencyAlert["severity"],
                title: formData.title,
                description: formData.description,
                location: {
                    unitId: formData.unitId,
                    details: formData.locationDetails,
                },
                reportedBy: formData.reportedBy,
                contactNumber: formData.contactNumber,
                status: "active",
                createdAt: new Date().toISOString(),
            };

            setAlerts([newAlert, ...alerts]);
            toast.success("แจ้งเหตุฉุกเฉินสำเร็จ");

            // Reset form
            setFormData({
                type: "",
                severity: "",
                title: "",
                description: "",
                unitId: "",
                locationDetails: "",
                reportedBy: "",
                contactNumber: "",
            });
            setShowForm(false);

            // Send notifications
            if (newAlert.severity === "critical" || newAlert.severity === "high") {
                // Send SMS to security team
                // Send email to management
                toast.info("ได้ส่งแจ้งเตือนให้ทีมความปลอดภัยแล้ว");
            }
        } catch (err: any) {
            toast.error(err.message || "ไม่สามารถแจ้งเหตุฉุกเฉินได้");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResolve = async (alertId: string) => {
        try {
            // TODO: Implement actual API call
            setAlerts(alerts.map(alert =>
                alert.id === alertId
                    ? { ...alert, status: "resolved", resolvedAt: new Date().toISOString() }
                    : alert
            ));
            toast.success("แก้ไขสถานการเรียบร้อยแล้ว");
            setSelectedAlert(null);
        } catch (error) {
            toast.error("ไม่สามารถอัปเดตสถานะได้");
        }
    };

    const handleCallEmergency = (number: string) => {
        window.location.href = `tel:${number}`;
    };

    const getEmergencyIcon = (type: string) => {
        const emergency = emergencyTypes.find(e => e.value === type);
        return emergency?.icon || "❗";
    };

    const getSeverityColor = (severity: string) => {
        const level = severityLevels.find(l => l.value === severity);
        return level?.color || "bg-slate-100 dark:bg-slate-800 text-gray-800";
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">แจัดการเหตุฉุกเฉิน</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">ระบบแจ้งเหตุฉุกเฉินทันที</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="pt-6">
                                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">แจัดการเหตุฉุกเฉิน</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">ระบบแจ้งเหตุฉุกเฉินทันที</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setShowForm(true)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        แจ้งเหตุฉุกเฉิน
                    </Button>
                    <Button
                        onClick={() => handleCallEmergency("1669")}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        <Phone className="w-4 h-4 mr-2" />
                        โทร 1669 (กู้ชีวย)
                    </Button>
                </div>
            </div>

            {/* Emergency Contact Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-red-800">กู้ชีวย 1669</h3>
                                <p className="text-sm text-red-600">ฉุกเฉินทางการแพทย์</p>
                            </div>
                            <Button
                                onClick={() => handleCallEmergency("1669")}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                <Phone className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-orange-800">แจดทั่งอัคคี</h3>
                                <p className="text-sm text-orange-600">ป้องกันไฟไหม</p>
                            </div>
                            <Button
                                onClick={() => handleCallEmergency("199")}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                <Phone className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-blue-800">สายามตำรวจ</h3>
                                <p className="text-sm text-blue-600">แจ้งเหตุอาชญาติ</p>
                            </div>
                            <Button
                                onClick={() => handleCallEmergency("191")}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Phone className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alert Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <CardTitle>แจ้งเหตุฉุกเฉิน</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">ประเภทที่เกิดขึ้น</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกประเภท" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {emergencyTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        <div className="flex items-center gap-2">
                                                            <span>{type.icon}</span>
                                                            {type.label}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="severity">ระดับความรุนแรง</Label>
                                        <Select
                                            value={formData.severity}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
                                            required
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกระดับความ" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {severityLevels.map((level) => (
                                                    <SelectItem key={level.value} value={level.value}>
                                                        <Badge className={level.color}>
                                                            {level.label}
                                                        </Badge>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="title">หัวข้อเหตุการ</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="ระบุหัวข้อเหตุการอย่างชัดเจน"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">รายละเอียด</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="อธิบายรายละเอียดเหตุการที่เกิดขึ้น..."
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reportedBy">ผู้แจ้ง</Label>
                                        <Input
                                            id="reportedBy"
                                            value={formData.reportedBy}
                                            onChange={(e) => setFormData(prev => ({ ...prev, reportedBy: e.target.value }))}
                                            placeholder="ชื่อผู้แจ้ง"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contactNumber">เบอร์โทรศัพท์</Label>
                                        <Input
                                            id="contactNumber"
                                            value={formData.contactNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                                            placeholder="08x-xxx-xxxx"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="locationDetails">สถานที่ (รายละเอียดเพิ่มเติม)</Label>
                                    <Textarea
                                        id="locationDetails"
                                        value={formData.locationDetails}
                                        onChange={(e) => setFormData(prev => ({ ...prev, locationDetails: e.target.value }))}
                                        placeholder="ตัวอย่าง: ห้องน้ำ ห้อง A-101, ล็อบบีสิ้น ตึก A"
                                        rows={2}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        {isSubmitting ? "กำลังแจ้ง..." : "แจ้งเหตุฉุกเฉิน"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1"
                                    >
                                        ยกเลิก
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Active Alerts */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>เหตุฉุกเฉินที่กำลังเกิดขึ้น</span>
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                            {alerts.filter(a => a.status === "active").length} รายการ
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {alerts.length === 0 ? (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                            ไม่มีเหตุฉุกเฉินที่กำลังดำเนินการ
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className="border-l-4 border-red-500 p-4 rounded-lg hover:bg-slate-50 dark:bg-slate-800/50 cursor-pointer"
                                    onClick={() => setSelectedAlert(alert)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-2xl">{getEmergencyIcon(alert.type)}</span>
                                                <h3 className="font-semibold text-lg">{alert.title}</h3>
                                                <Badge className={getSeverityColor(alert.severity)}>
                                                    {severityLevels.find(l => l.value === alert.severity)?.label}
                                                </Badge>
                                            </div>
                                            <p className="text-slate-700 dark:text-slate-300 mb-2">{alert.description}</p>
                                            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                                {alert.location.unitNumber && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {alert.location.unitNumber}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    {alert.reportedBy}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {format(new Date(alert.createdAt), "HH:mm", { locale: th })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {alert.status === "active" && (
                                                <Button
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleResolve(alert.id);
                                                    }}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    แก้ไข
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCallEmergency(alert.contactNumber);
                                                }}
                                            >
                                                <Phone className="w-4 h-4 mr-1" />
                                                โทร
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Alert Detail Modal */}
            {selectedAlert && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <CardTitle>รายละเอียดเหตุฉุกเฉิน</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">ประเภท</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{getEmergencyIcon(selectedAlert.type)}</span>
                                        <p className="font-medium">
                                            {emergencyTypes.find(t => t.value === selectedAlert.type)?.label}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">ระดับความ</span>
                                    <Badge className={getSeverityColor(selectedAlert.severity)}>
                                        {severityLevels.find(l => l.value === selectedAlert.severity)?.label}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">{selectedAlert.title}</h3>
                                <p className="text-slate-700 dark:text-slate-300">{selectedAlert.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">สถานที่</span>
                                    <p className="font-medium">
                                        {selectedAlert.location.unitNumber && `${selectedAlert.location.unitNumber}`}
                                        {selectedAlert.location.details && ` - ${selectedAlert.location.details}`}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">ผู้แจ้ง</span>
                                    <p className="font-medium">
                                        {selectedAlert.reportedBy}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    onClick={() => handleResolve(selectedAlert.id)}
                                    disabled={selectedAlert.status === "resolved"}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    แก้ไขปัญหา
                                </Button>
                                <Button
                                    onClick={() => handleCallEmergency(selectedAlert.contactNumber)}
                                    variant="outline"
                                >
                                    <Phone className="w-4 h-4 mr-2" />
                                    โทรผู้แจ้ง
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedAlert(null)}
                                >
                                    ปิด
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
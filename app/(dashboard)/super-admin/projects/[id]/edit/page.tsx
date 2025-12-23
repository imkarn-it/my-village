"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Building,
    MapPin,
    Users,
    Home,
    Save,
    ArrowLeft,
    Trash2,
    AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api/client";

type Project = {
    id: string;
    name: string;
    code: string;
    type: "condominium" | "apartment" | "housing" | "village" | "office";
    address: string;
    province: string;
    district: string;
    subdistrict: string;
    postalCode: string;
    totalUnits: number;
    floors?: number;
    buildings?: number;
    facilities: string[];
    description: string;
    adminEmail: string;
    adminName: string;
    adminPhone: string;
    status: "active" | "inactive" | "maintenance";
    settings: {
        allowVisitorQR: boolean;
        requireMaintenanceApproval: boolean;
        enableFacilityBooking: boolean;
        enableSOS: boolean;
    };
    createdAt: string;
    updatedAt?: string;
    totalUsers?: number;
    activeUsers?: number;
    totalAnnouncements?: number;
    totalMaintenance?: number;
};

const facilityOptions = [
    { id: "pool", label: "สระว่ายน้ำ", icon: "🏊" },
    { id: "gym", label: "ฟิตเนส", icon: "💪" },
    { id: "garden", label: "สวนสาธารณะ", icon: "🌳" },
    { id: "parking", label: "ที่จอดรถ", icon: "🚗" },
    { id: "security", label: "รักษาความปลอดภัย 24 ชม", icon: "🛡️" },
    { id: "elevator", label: "ลิฟต์", icon: "🛗" },
    { id: "playground", label: "สนามเด็กเล่น", icon: "🎠" },
    { id: "function", label: "ห้องประชุม", icon: "🏛️" },
    { id: "library", label: "ห้องสมุด", icon: "📚" },
    { id: "shop", label: "ร้านค้า", icon: "🏪" }
];

export default function EditProjectPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [project, setProject] = useState<Project | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [formData, setFormData] = useState<Partial<Project>>({
        name: "",
        code: "",
        type: "condominium",
        address: "",
        province: "",
        district: "",
        subdistrict: "",
        postalCode: "",
        totalUnits: 0,
        floors: 1,
        buildings: 1,
        facilities: [],
        description: "",
        adminEmail: "",
        adminName: "",
        adminPhone: "",
        status: "active",
        settings: {
            allowVisitorQR: true,
            requireMaintenanceApproval: false,
            enableFacilityBooking: false,
            enableSOS: false,
        }
    });

    const fetchProject = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await api.projects({ id: projectId }).get();
            if (error) throw error;

            if (!data.success) {
                throw new Error(data.error);
            }

            const projectData = data.data as unknown as Project;

            if (!projectData) {
                throw new Error("Project data not found");
            }

            setProject(projectData);
            setFormData({
                name: projectData.name,
                code: projectData.code || "",
                type: projectData.type,
                address: projectData.address || "",
                province: projectData.province || "",
                district: projectData.district || "",
                subdistrict: projectData.subdistrict || "",
                postalCode: projectData.postalCode || "",
                totalUnits: projectData.totalUnits || 0,
                floors: projectData.floors || 1,
                buildings: projectData.buildings || 1,
                facilities: projectData.facilities || [],
                description: projectData.description || "",
                adminEmail: projectData.adminEmail || "",
                adminName: projectData.adminName || "",
                adminPhone: projectData.adminPhone || "",
                status: projectData.status,
                settings: projectData.settings || {
                    allowVisitorQR: true,
                    requireMaintenanceApproval: false,
                    enableFacilityBooking: false,
                    enableSOS: false,
                },
            });
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถโหลดข้อมูลโครงการได้");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (projectId) {
            fetchProject();
        }
    }, [projectId, fetchProject]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data, error } = await api.projects({ id: projectId }).patch({
                name: formData.name,
                type: formData.type,
                address: formData.address,
                status: formData.status,
                settings: formData.settings,
                totalUnits: formData.totalUnits,
                description: formData.description,
            });
            if (error) throw error;
            if (!data.success) throw new Error(data.error);

            toast.success("บันทึกข้อมูลสำเร็จ");
            router.push("/super-admin/projects");
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถบันทึกข้อมูลได้");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            const { data, error } = await api.projects({ id: projectId }).delete();
            if (error) throw error;
            if (!data.success) throw new Error(data.error);

            toast.success("ลบโครงการสำเร็จ");
            router.push("/super-admin/projects");
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถลบโครงการได้");
        }
    };

    const toggleFacility = (facilityId: string) => {
        setFormData(prev => ({
            ...prev,
            facilities: prev.facilities?.includes(facilityId)
                ? prev.facilities.filter(f => f !== facilityId)
                : [...(prev.facilities || []), facilityId]
        }));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active": return "bg-green-100 text-green-800";
            case "inactive": return "bg-slate-100 dark:bg-slate-800 text-gray-800";
            case "maintenance": return "bg-yellow-100 text-yellow-800";
            default: return "bg-slate-100 dark:bg-slate-800 text-gray-800";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "active": return "ใช้งาน";
            case "inactive": return "ไม่ใช้งาน";
            case "maintenance": return "ปิดปรับปรุง";
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 mb-2"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-96"></div>
                </div>
                <div className="space-y-4">
                    <div className="animate-pulse h-96 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    <div className="animate-pulse h-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="space-y-6">
                <div className="text-center py-12">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">ไม่พบข้อมูลโครงการ</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">โครงการที่คุณค้นหาไม่มีอยู่ในระบบ</p>
                    <Button asChild>
                        <Link href="/super-admin/projects">กลับรายการโครงการ</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" asChild>
                        <Link href="/super-admin/projects">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            ย้อนกลับ
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">แก้ไขข้อมูลโครงการ</h1>
                        <p className="text-slate-600 dark:text-slate-400">ปรับเปลี่ยนข้อมูลโครงการ: {project.name}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowDeleteModal(true)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        ลบโครงการ
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ผู้ใช้ทั้งหมด</p>
                                <p className="text-2xl font-bold">{project.totalUsers || 0}</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ใช้งานอยู่</p>
                                <p className="text-2xl font-bold text-green-600">{project.activeUsers || 0}</p>
                            </div>
                            <Home className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">แจ้งซ่อม</p>
                                <p className="text-2xl font-bold">{project.totalMaintenance || 0}</p>
                            </div>
                            <Building className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">สถานะ</p>
                                <Badge className={getStatusColor(project.status)}>
                                    {getStatusLabel(project.status)}
                                </Badge>
                            </div>
                            <MapPin className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Project Information */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="w-5 h-5" />
                            ข้อมูลโครงการ
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">ชื่อโครงการ *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="code">รหัสโครงการ *</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="type">ประเภทโครงการ</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="condominium">คอนโดมิเนียม</SelectItem>
                                        <SelectItem value="apartment">อพาร์ตเมนต์</SelectItem>
                                        <SelectItem value="housing">หมู่บ้านจัดสรร</SelectItem>
                                        <SelectItem value="village">หมู่บ้าน</SelectItem>
                                        <SelectItem value="office">อาคารสำนักงาน</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="status">สถานะโครงการ</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">ใช้งาน</SelectItem>
                                        <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                                        <SelectItem value="maintenance">ปิดปรับปรุง</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="totalUnits">จำนวนยูนิตทั้งหมด *</Label>
                                <Input
                                    id="totalUnits"
                                    type="number"
                                    value={formData.totalUnits}
                                    onChange={(e) => setFormData({ ...formData, totalUnits: parseInt(e.target.value) || 0 })}
                                    required
                                />
                            </div>
                            {formData.type === "condominium" && (
                                <>
                                    <div>
                                        <Label htmlFor="floors">จำนวนชั้น</Label>
                                        <Input
                                            id="floors"
                                            type="number"
                                            value={formData.floors}
                                            onChange={(e) => setFormData({ ...formData, floors: parseInt(e.target.value) || 1 })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="buildings">จำนวนอาคาร</Label>
                                        <Input
                                            id="buildings"
                                            type="number"
                                            value={formData.buildings}
                                            onChange={(e) => setFormData({ ...formData, buildings: parseInt(e.target.value) || 1 })}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="description">คำอธิบายโครงการ</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label className="mb-2 block">สิ่งอำนวยความสะดวก</Label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {facilityOptions.map((facility) => (
                                    <div
                                        key={facility.id}
                                        className={`
                                            cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all
                                            ${formData.facilities?.includes(facility.id)
                                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                                : "border-slate-200 hover:border-slate-300"
                                            }
                                        `}
                                        onClick={() => toggleFacility(facility.id)}
                                    >
                                        <span className="text-2xl">{facility.icon}</span>
                                        <span className="text-sm font-medium">{facility.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Settings */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="w-5 h-5" />
                            การตั้งค่าโครงการ
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={formData.settings?.allowVisitorQR}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        settings: { ...formData.settings!, allowVisitorQR: e.target.checked }
                                    })}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                />
                                <div>
                                    <p className="font-medium">ใช้งานระบบ QR Code ผู้มาติดต่อ</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">อนุญาตให้ลูกบ้านสร้าง QR Code สำหรับผู้มาเยือน</p>
                                </div>
                            </label>

                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={formData.settings?.requireMaintenanceApproval}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        settings: { ...formData.settings!, requireMaintenanceApproval: e.target.checked }
                                    })}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                />
                                <div>
                                    <p className="font-medium">ต้องการอนุมัติการแจ้งซ่อม</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">คำขอซ่อมต้องได้รับการอนุมัติจากแอดมินก่อนดำเนินการ</p>
                                </div>
                            </label>

                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={formData.settings?.enableFacilityBooking}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        settings: { ...formData.settings!, enableFacilityBooking: e.target.checked }
                                    })}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                />
                                <div>
                                    <p className="font-medium">เปิดใช้งานระบบจองพื้นที่ส่วนกลาง</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">ลูกบ้านสามารถจองใช้สิ่งอำนวยความสะดวกได้</p>
                                </div>
                            </label>

                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={formData.settings?.enableSOS}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        settings: { ...formData.settings!, enableSOS: e.target.checked }
                                    })}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                />
                                <div>
                                    <p className="font-medium">เปิดใช้งานระบบ SOS ฉุกเฉิน</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">ลูกบ้านสามารถกดปุ่มแจ้งเหตุฉุกเฉินได้</p>
                                </div>
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" asChild>
                        <Link href="/super-admin/projects">ยกเลิก</Link>
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? (
                            <>กำลังบันทึก...</>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                บันทึกการเปลี่ยนแปลง
                            </>
                        )}
                    </Button>
                </div>
            </form>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <h3 className="text-lg font-semibold">ยืนยันการลบโครงการ</h3>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                คุณแน่ใจหรือไม่ว่าต้องการลบโครงการ &quot;{project.name}&quot;?
                                การกระทำนี้ไม่สามารถย้อนกลับได้
                            </p>
                        </div>
                        <div className="p-6 border-t flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={handleDelete}
                            >
                                ลบโครงการ
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Building,
    MapPin,
    Users,
    Home,
    Car,
    TreePine,
    Plus,
    Save,
    ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ProjectFormData = {
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
    adminPassword: string;
    adminName: string;
    adminPhone: string;
    settings: {
        allowVisitorQR: boolean;
        requireMaintenanceApproval: boolean;
        enableFacilityBooking: boolean;
        enableSOS: boolean;
    };
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

export default function NewProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<ProjectFormData>({
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
        adminPassword: "",
        adminName: "",
        adminPhone: "",
        settings: {
            allowVisitorQR: true,
            requireMaintenanceApproval: false,
            enableFacilityBooking: true,
            enableSOS: true
        }
    });

    const provinces = [
        "กรุงเทพมหานคร", "สมุทรปราการ", "นนทบุรี", "ปทุมธานี", "พระนครศรีอยุธยา",
        "อ่างทอง", "ลพบุรี", "สิงห์บุรี", "ชลบุรี", "ระยอง",
        "ฉะเชิงเทรา", "จันทบุรี", "ตราด", "ประจวบคีรีขันธ์", "เพชรบุรี",
        "นครศรีธรรม", "ราชบุรี", "กาญจนบุรี", "เพชรบูรณ์", "ลำปาง",
        "ลำพูน", "แพร่", "น่าน", "อุตรดิตถ์", "สุโขทัย",
        "พิษณุโลก", "เชียงราย", "เชียงใหม่", "แม่ฮ่องสอน", "นครสวรรค์",
        "อุดรธานี", "สกลนคร", "หนองคาย", "มุกดาหาร", "ขอนแก่น",
        "กาฬสินธุ์", "มหาสารคาม", "ร้อยเอ็ด", "ยโสธร", "ชัยภูมิ"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate required fields
            if (!formData.name || !formData.code || !formData.address || !formData.totalUnits) {
                toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
                setLoading(false);
                return;
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create project
            const projectData = {
                ...formData,
                id: Date.now().toString(),
                status: "active",
                createdAt: new Date().toISOString(),
                createdBy: "super_admin"
            };

            console.log("Creating project:", projectData);

            // Create admin user
            const adminData = {
                name: formData.adminName,
                email: formData.adminEmail,
                phone: formData.adminPhone,
                password: formData.adminPassword,
                role: "project_admin",
                projectId: projectData.id
            };

            console.log("Creating admin user:", adminData);

            toast.success("สร้างโครงการและผู้ดูแลระบบสำเร็จแล้ว");
            router.push("/super-admin/projects");

        } catch (error) {
            console.error("Error creating project:", error);
            toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
        } finally {
            setLoading(false);
        }
    };

    const handleFacilityToggle = (facilityId: string) => {
        setFormData(prev => ({
            ...prev,
            facilities: prev.facilities.includes(facilityId)
                ? prev.facilities.filter(f => f !== facilityId)
                : [...prev.facilities, facilityId]
        }));
    };

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
                        <h1 className="text-2xl font-bold text-gray-900">สร้างโครงการใหม่</h1>
                        <p className="text-gray-600">เพิ่มโครงการคอนโดหรือหมู่บ้านใหม่ในระบบ</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                                    placeholder="เช่น My Village Condominium"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="code">รหัสโครงการ *</Label>
                                <Input
                                    id="code"
                                    placeholder="เช่น MV001"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="type">ประเภทโครงการ *</Label>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="totalUnits">จำนวนยูนิตทั้งหมด *</Label>
                                <Input
                                    id="totalUnits"
                                    type="number"
                                    placeholder="เช่น 250"
                                    value={formData.totalUnits}
                                    onChange={(e) => setFormData({ ...formData, totalUnits: parseInt(e.target.value) || 0 })}
                                    required
                                />
                            </div>
                            {(formData.type === "condominium" || formData.type === "apartment") && (
                                <>
                                    <div>
                                        <Label htmlFor="floors">จำนวนชั้น</Label>
                                        <Input
                                            id="floors"
                                            type="number"
                                            placeholder="เช่น 25"
                                            value={formData.floors}
                                            onChange={(e) => setFormData({ ...formData, floors: parseInt(e.target.value) || 1 })}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="buildings">จำนวนอาคาร</Label>
                                        <Input
                                            id="buildings"
                                            type="number"
                                            placeholder="เช่น 3"
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
                                placeholder="รายละเอียดเกี่ยวกับโครงการ..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Location */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            ที่อยู่
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="address">ที่อยู่ *</Label>
                            <Input
                                id="address"
                                placeholder="เช่น 999 ถนนสุขุมวิท"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="province">จังหวัด *</Label>
                                <Select
                                    value={formData.province}
                                    onValueChange={(value) => setFormData({ ...formData, province: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกจังหวัด" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {provinces.map(province => (
                                            <SelectItem key={province} value={province}>
                                                {province}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="district">อำเภอ/เขต *</Label>
                                <Input
                                    id="district"
                                    placeholder="เขตวัฒนา"
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="subdistrict">ตำบล/แขวง *</Label>
                                <Input
                                    id="subdistrict"
                                    placeholder="แขวง Khlong Toei"
                                    value={formData.subdistrict}
                                    onChange={(e) => setFormData({ ...formData, subdistrict: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="postalCode">รหัสไปรษณีย์ *</Label>
                                <Input
                                    id="postalCode"
                                    placeholder="10110"
                                    value={formData.postalCode}
                                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Facilities */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TreePine className="w-5 h-5" />
                            สิ่งอำนวยความสะดวก
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {facilityOptions.map(facility => (
                                <div
                                    key={facility.id}
                                    onClick={() => handleFacilityToggle(facility.id)}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${formData.facilities.includes(facility.id)
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                >
                                    <div className="text-center">
                                        <div className="text-2xl mb-1">{facility.icon}</div>
                                        <p className="text-sm font-medium">{facility.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Admin User */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            ผู้ดูแลระบบ (Project Admin)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="adminName">ชื่อผู้ดูแล *</Label>
                                <Input
                                    id="adminName"
                                    placeholder="สมศักดิ์ ใจดี"
                                    value={formData.adminName}
                                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="adminEmail">อีเมล *</Label>
                                <Input
                                    id="adminEmail"
                                    type="email"
                                    placeholder="admin@myvillage.com"
                                    value={formData.adminEmail}
                                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="adminPhone">เบอร์โทรศัพท์ *</Label>
                                <Input
                                    id="adminPhone"
                                    placeholder="081-234-5678"
                                    value={formData.adminPhone}
                                    onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="adminPassword">รหัสผ่านเริ่มต้น *</Label>
                                <Input
                                    id="adminPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.adminPassword}
                                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                                    required
                                />
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
                                    checked={formData.settings.allowVisitorQR}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        settings: { ...formData.settings, allowVisitorQR: e.target.checked }
                                    })}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                />
                                <div>
                                    <p className="font-medium">ใช้งานระบบ QR Code ผู้มาติดต่อ</p>
                                    <p className="text-sm text-gray-500">อนุญาตให้ลูกบ้านสร้าง QR Code สำหรับผู้มาเยือน</p>
                                </div>
                            </label>

                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={formData.settings.requireMaintenanceApproval}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        settings: { ...formData.settings, requireMaintenanceApproval: e.target.checked }
                                    })}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                />
                                <div>
                                    <p className="font-medium">ต้องการอนุมัติการแจ้งซ่อม</p>
                                    <p className="text-sm text-gray-500">คำขอซ่อมต้องได้รับการอนุมัติจากแอดมินก่อนดำเนินการ</p>
                                </div>
                            </label>

                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={formData.settings.enableFacilityBooking}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        settings: { ...formData.settings, enableFacilityBooking: e.target.checked }
                                    })}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                />
                                <div>
                                    <p className="font-medium">เปิดใช้งานระบบจองพื้นที่ส่วนกลาง</p>
                                    <p className="text-sm text-gray-500">ลูกบ้านสามารถจองใช้สิ่งอำนวยความสะดวกได้</p>
                                </div>
                            </label>

                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={formData.settings.enableSOS}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        settings: { ...formData.settings, enableSOS: e.target.checked }
                                    })}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                />
                                <div>
                                    <p className="font-medium">เปิดใช้งานระบบ SOS ฉุกเฉิน</p>
                                    <p className="text-sm text-gray-500">ลูกบ้านสามารถกดปุ่มแจ้งเหตุฉุกเฉินได้</p>
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
                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <>กำลังสร้าง...</>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                สร้างโครงการ
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
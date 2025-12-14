"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
// Select components not used in this page - using custom time inputs
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api/client";

export default function NewFacilityPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: "",
        openTime: "",
        closeTime: "",
        maxCapacity: "",
        requiresApproval: false,
        isActive: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                name: formData.name,
                description: formData.description || undefined,
                image: formData.image || undefined,
                openTime: formData.openTime || undefined,
                closeTime: formData.closeTime || undefined,
                maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : undefined,
                requiresApproval: formData.requiresApproval,
                isActive: formData.isActive,
                projectId: "default-project", // TODO: Get from session
            };

            const { data } = await api.facilities.post(payload);

            if (data) {
                router.push("/admin/facilities");
                router.refresh();
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "ไม่สามารถสร้างสิ่งอำนวยความสะดวกได้";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/facilities">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        กลับ
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">เพิ่มสิ่งอำนวยความสะดวก</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">สร้างสิ่งอำนวยความสะดวกใหม่ในโครงการ</p>
                </div>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-800">{error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Form */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>ข้อมูลสิ่งอำนวยความสะดวก</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">ชื่อสิ่งอำนวยความสะดวก *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    placeholder="เช่น สระว่ายน้ำ ห้องออกกำลังกาย"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxCapacity">ความจุ (คน)</Label>
                                <Input
                                    id="maxCapacity"
                                    type="number"
                                    value={formData.maxCapacity}
                                    onChange={(e) => handleInputChange("maxCapacity", e.target.value)}
                                    placeholder="เช่น 20"
                                    min="1"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">รายละเอียด</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                placeholder="บรรยายรายละเอียดเกี่ยวกับสิ่งอำนวยความสะดวก"
                                rows={3}
                            />
                        </div>

                        {/* Image URL */}
                        <div className="space-y-2">
                            <Label htmlFor="image">รูปภาพ (URL)</Label>
                            <Input
                                id="image"
                                value={formData.image}
                                onChange={(e) => handleInputChange("image", e.target.value)}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        {/* Operating Hours */}
                        <div className="space-y-4">
                            <Label>เวลาทำการ</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="openTime">เวลาเปิด</Label>
                                    <Input
                                        id="openTime"
                                        type="time"
                                        value={formData.openTime}
                                        onChange={(e) => handleInputChange("openTime", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="closeTime">เวลาปิด</Label>
                                    <Input
                                        id="closeTime"
                                        type="time"
                                        value={formData.closeTime}
                                        onChange={(e) => handleInputChange("closeTime", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="space-y-4">
                            <Label>การตั้งค่า</Label>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>ต้องการการอนุมัติ</Label>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">การจองต้องได้รับการอนุมัติจาก admin</p>
                                    </div>
                                    <Switch
                                        checked={formData.requiresApproval}
                                        onCheckedChange={(checked) => handleInputChange("requiresApproval", checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>เปิดใช้งาน</Label>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">สิ่งอำนวยความสะดวกพร้อมให้จอง</p>
                                    </div>
                                    <Switch
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-6">
                            <Button type="submit" disabled={loading}>
                                <Save className="h-4 w-4 mr-2" />
                                {loading ? "กำลังบันทึก..." : "บันทึก"}
                            </Button>
                            <Link href="/admin/facilities">
                                <Button type="button" variant="outline">
                                    ยกเลิก
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
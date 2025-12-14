"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Wrench,
    Search,

    Plus,

    MapPin,
    CheckCircle,
    AlertTriangle,
    Clock,
    History,


    Activity,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,

} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Equipment = {
    id: string;
    name: string;
    type: "tools" | "vehicle" | "safety" | "cleaning" | "other";
    serialNumber?: string;
    status: "available" | "in_use" | "maintenance" | "retired";
    location: string;
    assignedTo?: string;
    lastMaintenance: string;
    nextMaintenance?: string;
    warranty?: {
        provider: string;
        expires: string;
    };
    purchaseDate?: string;
    purchasePrice?: number;
    notes: string;
    image?: string;
};

type MaintenanceRecord = {
    id: string;
    equipmentId: string;
    type: "routine" | "repair" | "replacement";
    description: string;
    cost?: number;
    performedBy: string;
    performedAt: string;
    nextMaintenance?: string;
    parts?: Array<{
        name: string;
        quantity: number;
        cost: number;
    }>;
};

const mockEquipment: Equipment[] = [
    {
        id: "1",
        name: "ชุดเครื่องมือไฟฟ้าแบบครบ",
        type: "tools",
        serialNumber: "ELT-2024-001",
        status: "available",
        location: "ห้องเก็บช่าง A",
        lastMaintenance: "2025-01-10",
        nextMaintenance: "2025-04-10",
        warranty: {
            provider: "บริษัท อุปกรณ์ไฟฟ้า",
            expires: "2027-01-10"
        },
        purchaseDate: "2024-01-10",
        purchasePrice: 45000,
        notes: "ชุดประกอบมิติครบครบ แบบครบ"
    },
    {
        id: "2",
        name: "รถเข็นขนาดใหญ่่",
        type: "vehicle",
        serialNumber: "CT-2023-045",
        status: "in_use",
        location: "อาคาร A ชั้น 2",
        assignedTo: "ช่างสมศักดิ์",
        lastMaintenance: "2025-01-05",
        purchaseDate: "2023-05-15",
        purchasePrice: 250000,
        notes: "รถเข็นรับสินค้า 2 ตัน"
    },
    {
        id: "3",
        name: "เครื่องดูดซึม",
        type: "safety",
        serialNumber: "TH-2024-078",
        status: "maintenance",
        location: "ศูนย์ซ่อม",
        lastMaintenance: "2025-01-12",
        nextMaintenance: "2025-01-20",
        warranty: {
            provider: "SafetyTech Solutions",
            expires: "2026-07-12"
        },
        purchaseDate: "2024-07-12",
        purchasePrice: 150000,
        notes: "เครื่องดูดซึมคลื่นคลื่น 4"
    },
    {
        id: "4",
        name: "เครื่องทำความสะอาน",
        type: "cleaning",
        status: "available",
        location: "ห้องน้ำชั้น 1",
        lastMaintenance: "2025-01-08",
        nextMaintenance: "2025-04-08",
        purchaseDate: "2024-03-20",
        purchasePrice: 35000,
        notes: "เครื่องทำความขนาด 6 ลิตร"
    },
    {
        id: "5",
        name: "ชุดเครื่องมือก่อสร้าง",
        type: "tools",
        serialNumber: "TL-2023-012",
        status: "available",
        location: "ห้องเก็บช่าง B",
        lastMaintenance: "2025-01-15",
        nextMaintenance: "2025-07-15",
        purchaseDate: "2023-06-15",
        purchasePrice: 28000,
        notes: "เครื่องก่อสร้างสำหรับช่างมือ"
    }
];

const mockMaintenanceRecords: MaintenanceRecord[] = [
    {
        id: "1",
        equipmentId: "1",
        type: "routine",
        description: "ตรวจสอบสภาพและทำความทั่วรถ",
        cost: 500,
        performedBy: "ช่างวีระ",
        performedAt: "2025-01-10",
        nextMaintenance: "2025-04-10",
        parts: []
    },
    {
        id: "2",
        equipmentId: "3",
        type: "repair",
        description: "เปลี่ยนแบตเตอร์ต์ชั้นที่ 2",
        cost: 2500,
        performedBy: "ศูนย์ซ่อมกลางกลาง",
        performedAt: "2025-01-12",
        nextMaintenance: "2025-01-20",
        parts: [
            { name: "แบตเตอร์ต์ต์ชั้นที่ 2", quantity: 1, cost: 2000 },
            { name: "ยางแผนน", quantity: 2, cost: 250 }
        ]
    }
];

export default function EquipmentPage() {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

    const [showAddDialog, setShowAddDialog] = useState(false);


    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setEquipment(mockEquipment);
            setMaintenanceRecords(mockMaintenanceRecords);

        }, 1000);
    }, []);

    const filteredEquipment = equipment.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || item.status === statusFilter;
        const matchesType = typeFilter === "all" || item.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    const _handleScheduleMaintenance = async (equipmentId: string) => {
        try {
            const record: MaintenanceRecord = {
                id: Date.now().toString(),
                equipmentId,
                type: "routine",
                description: "ตรวจสอบและบำรุงตามกำหนด",
                performedBy: "ช่างมือปัจจุบัน",
                performedAt: new Date().toISOString(),
                nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
            };

            setMaintenanceRecords([...maintenanceRecords, record]);

            toast.success("กำหนดการบำรุุงสำเร็จแล้ว");
            // setShowMaintenanceDialog(false);
        } catch {
            toast.error("ไม่สามารถกำหนดการบำรุุงได้");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "available": return "bg-green-100 text-green-800";
            case "in_use": return "bg-blue-100 text-blue-800";
            case "maintenance": return "bg-red-100 text-red-800";
            case "retired": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "available": return "พร้อมใช้งาน";
            case "in_use": return "กำลังใช้งาน";
            case "maintenance": return "กำลังซ่อมบำรุง";
            case "retired": return "เลิกใช้งาน";
            default: return status;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "tools": return "เครื่องมือ";
            case "vehicle": return "ยานพาหนะ";
            case "safety": return "อุปกรณ์ความปลอดภัย";
            case "cleaning": return "อุปกรณ์ทำความ";
            case "other": return "อื่นๆ";
            default: return type;
        }
    };

    const getMaintenanceHistory = (equipmentId: string) => {
        return maintenanceRecords
            .filter(record => record.equipmentId === equipmentId)
            .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime());
    };

    const isOverdueForMaintenance = (equipment: Equipment) => {
        if (!equipment.nextMaintenance) return false;
        return new Date() > new Date(equipment.nextMaintenance);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">จัดการอุปกรณ์</h1>
                    <p className="text-gray-600">ติดตามและจัดการอุปกรณ์และเครื่องมือต่างๆ</p>
                </div>
                <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มอุปกรณ์
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ทั้งหมด</p>
                                <p className="text-2xl font-bold text-gray-900">{equipment.length}</p>
                            </div>
                            <Wrench className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">พร้อมใช้งาน</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {equipment.filter(e => e.status === "available").length}
                                </p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">กำลังใช้งาน</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {equipment.filter(e => e.status === "in_use").length}
                                </p>
                            </div>
                            <Activity className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ซ่อมบำรุง</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {equipment.filter(e => e.status === "maintenance").length}
                                </p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="ค้นหาจากชื่อหรือ S/N..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full lg:w-[150px]">
                                <SelectValue placeholder="สถานะ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกสถานะ</SelectItem>
                                <SelectItem value="available">พร้อมใช้งาน</SelectItem>
                                <SelectItem value="in_use">กำลังใช้งาน</SelectItem>
                                <SelectItem value="maintenance">กำลังซ่อมบำรุง</SelectItem>
                                <SelectItem value="retired">เลิกใช้งาน</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full lg:w-[180px]">
                                <SelectValue placeholder="ประเภท" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกประเภท</SelectItem>
                                <SelectItem value="tools">เครื่องมือ</SelectItem>
                                <SelectItem value="vehicle">ยานพาหนะ</SelectItem>
                                <SelectItem value="safety">อุปกรณ์ความปลอดภัย</SelectItem>
                                <SelectItem value="cleaning">อุปกรณ์ทำความ</SelectItem>
                                <SelectItem value="other">อื่นๆ</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Equipment Table */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>รายการอุปกรณ์ ({filteredEquipment.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredEquipment.length === 0 ? (
                        <div className="text-center py-12">
                            <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่พบอุปกรณ์</h3>
                            <p className="text-gray-600">ยังไม่มีอุปกรณ์ที่ตรงตามเงื่อนไข</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ชื่ออุปกรณ์</TableHead>
                                        <TableHead>ประเภท</TableHead>
                                        <TableHead>S/N</TableHead>
                                        <TableHead>สถานะ</TableHead>
                                        <TableHead>ที่ตั้งงาน</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredEquipment.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            className={`hover:bg-gray-50 ${isOverdueForMaintenance(item)
                                                ? "border-l-4 border-l-orange-500"
                                                : ""
                                                }`}
                                        >
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {getTypeLabel(item.type)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {item.serialNumber || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(item.status)}>
                                                    {getStatusLabel(item.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <MapPin className="w-3 h-3 text-gray-400" />
                                                    <span>{item.location}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Equipment Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>เพิ่มอุปกรณ์ใหม่</DialogTitle>
                        <DialogDescription>
                            เพิ่มข้อมูลอุปกรณ์ใหม่ในระบบ
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">ชื่ออุปกรณ์ *</Label>
                                <Input
                                    id="name"
                                    placeholder="เช่น เครื่องมือไฟฟ้าแบบครบ"
                                />
                            </div>
                            <div>
                                <Label htmlFor="serialNumber">หมายเลขที่บี่ *</Label>
                                <Input
                                    id="serialNumber"
                                    placeholder="เช่น ELT-2024-001"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="type">ประเภท *</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกประเภท" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tools">เครื่องมือ</SelectItem>
                                        <SelectItem value="vehicle">ยานพาหนะ</SelectItem>
                                        <SelectItem value="safety">อุปกรณ์ความปลอดภัย</SelectItem>
                                        <SelectItem value="cleaning">อุปกรณ์ทำความ</SelectItem>
                                        <SelectItem value="other">อื่นๆ</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="location">ที่ตั้งงาน *</Label>
                                <Input
                                    id="location"
                                    placeholder="เช่น ห้องเก็บช่าง A"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="notes">บันทึกเพิ่มเติม</Label>
                            <Textarea
                                id="notes"
                                placeholder="รายละเอียดเกี่ยวกับอุปกรณ์..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                            ยกเลิก
                        </Button>
                        <Button onClick={() => setShowAddDialog(false)}>
                            เพิ่มอุปกรณ์
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Maintenance History Dialog */}
            {selectedEquipment && (
                <Dialog open={!!selectedEquipment} onOpenChange={() => setSelectedEquipment(null)}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>ประวัติการบำรุุง</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="mb-4">
                                <h3 className="font-semibold">{selectedEquipment.name}</h3>
                                <p className="text-sm text-gray-600">{selectedEquipment.serialNumber}</p>
                            </div>

                            <div className="space-y-4">
                                {getMaintenanceHistory(selectedEquipment.id).map((record) => (
                                    <div key={record.id} className="border rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-medium">
                                                    {record.type === "routine" ? "บำรุงตามกำหนด" : "ซ่อม"}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {format(new Date(record.performedAt), "d MMMM yyyy, HH:mm", { locale: th })}
                                                </p>
                                            </div>
                                            <Badge
                                                className={
                                                    record.type === "routine"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-orange-100 text-orange-800"
                                                }
                                            >
                                                {record.type === "routine" ? "ประจำเดือน" : "ซ่อม"}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-700">{record.description}</p>
                                        {record.cost && (
                                            <p className="text-sm font-medium text-gray-900 mt-2">
                                                ค่าใช้จ่าย: ฿{record.cost.toLocaleString('th-TH')}
                                            </p>
                                        )}
                                        {record.parts && record.parts.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-sm font-medium text-gray-700 mb-1">อะไหล่ที่ใช้:</p>
                                                <div className="space-y-1">
                                                    {record.parts.map((part, index) => (
                                                        <div key={index} className="text-sm text-gray-600">
                                                            • {part.name} x{part.quantity} (฿{part.cost.toLocaleString('th-TH')})
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                                            <span>ดำเนินการโดย:</span>
                                            <span className="font-medium">{record.performedBy}</span>
                                        </div>
                                    </div>
                                ))}

                                {getMaintenanceHistory(selectedEquipment.id).length === 0 && (
                                    <div className="text-center py-8">
                                        <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600">ยังไม่มีประวัติการบำรุุง</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedEquipment(null)}>
                                ปิด
                            </Button>
                            <Button onClick={() => { }}>
                                <Clock className="w-4 h-4 mr-2" />
                                กำหนดบำรุุง
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,

} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Package,
    Search,
    Plus,
    MoreHorizontal,
    AlertTriangle,
    TrendingDown,
    Edit,
    Trash2,
    Eye,
    Box,
    DollarSign,


} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";
import { api } from "@/lib/api/client";

type Part = {
    id: string;
    name: string;
    category: string;
    sku: string;
    description?: string;
    unit: string;
    currentStock: number;
    minStockLevel: number;
    maxStockLevel?: number;
    unitPrice?: number;
    supplier?: string;
    location?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

type InventoryStats = {
    totalItems: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
    categories: number;
};

const mockParts: Part[] = [
    {
        id: "1",
        name: "หลอด LED 18W",
        category: "หลอดไฟ",
        sku: "LED-001",
        description: "หลอดไฟ LED 18W สีขาว ประหยัดไฟ",
        unit: "หลอด",
        currentStock: 45,
        minStockLevel: 20,
        maxStockLevel: 100,
        unitPrice: 150,
        supplier: "บริษัท ไฟฉาย จำกัด",
        location: "โกดัง A, ชั้น 2",
        isActive: true,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-12-01T00:00:00Z",
    },
    {
        id: "2",
        name: "สวิตช์ 1 วิ 2 ทาง",
        category: "สวิตช์/ปลั๊ก",
        sku: "SWT-002",
        description: "สวิตช์ 1 วิ 2 ทาง สีขาว",
        unit: "ตัว",
        currentStock: 8,
        minStockLevel: 15,
        maxStockLevel: 50,
        unitPrice: 85,
        supplier: "บริษัท สวิตช์ ไทย จำกัด",
        location: "โกดัง B, ชั้น 1",
        isActive: true,
        createdAt: "2025-01-15T00:00:00Z",
        updatedAt: "2025-12-10T00:00:00Z",
    },
    {
        id: "3",
        name: "ท่อ PVC ขนาด 1 นิ้ว",
        category: "ท่อประปา",
        sku: "PVC-003",
        description: "ท่อ PVC ขนาด 1 นิ้ว ความยาว 4 เมตร",
        unit: "เส้น",
        currentStock: 0,
        minStockLevel: 10,
        maxStockLevel: 30,
        unitPrice: 120,
        supplier: "บริษัท ท่อสุขภาพ จำกัด",
        location: "โกดัง C, ชั้น 3",
        isActive: true,
        createdAt: "2025-02-01T00:00:00Z",
        updatedAt: "2025-12-05T00:00:00Z",
    },
    {
        id: "4",
        name: "ปั๊มน้ำ 1/2 HP",
        category: "ปั๊ม/มอเตอร์",
        sku: "PMP-004",
        description: "ปั๊มน้ำอัตโนมัติ ขนาด 1/2 HP",
        unit: "เครื่อง",
        currentStock: 3,
        minStockLevel: 2,
        maxStockLevel: 5,
        unitPrice: 2500,
        supplier: "บริษัท ปั๊มน้ำไทย จำกัด",
        location: "โกดัง A, ชั้น 1",
        isActive: true,
        createdAt: "2025-03-01T00:00:00Z",
        updatedAt: "2025-11-30T00:00:00Z",
    },
];

const mockStats: InventoryStats = {
    totalItems: 127,
    lowStock: 18,
    outOfStock: 7,
    totalValue: 284750,
    categories: 12,
};

const categories = [
    "ทั้งหมด",
    "หลอดไฟ",
    "สวิตช์/ปลั๊ก",
    "ท่อประปา",
    "ปั๊ม/มอเตอร์",
    "เครื่องมือ",
    "สารเคมี",
    "อุปกรณ์ทำความสะอาด",
    "อะไหล่แอร์",
    "อุปกรณ์ความปลอดภัย",
];

export default function PartsPage() {
    const [parts, setParts] = useState<Part[]>([]);
    const [stats] = useState<InventoryStats>(mockStats);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
    const [stockFilter, setStockFilter] = useState("all");
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form state for new part
    const [newPart, setNewPart] = useState({
        name: "",
        category: "หลอดไฟ",
        sku: "",
        description: "",
        unit: "ชิ้น",
        currentStock: 0,
        minStockLevel: 5,
        maxStockLevel: 100,
        unitPrice: 0,
        supplier: "",
        location: "",
    });

    useEffect(() => {
        fetchParts();
    }, []);

    const fetchParts = async () => {
        try {
            setLoading(true);
            // @ts-ignore - API types
            const { data } = await api.parts.get();
            if (data && Array.isArray(data)) {
                setParts(data);
            } else {
                // Fallback to mock data
                setParts(mockParts);
            }
        } catch {
            // Fallback to mock data
            setParts(mockParts);
        } finally {
            setLoading(false);
        }
    };

    const filteredParts = parts.filter((part) => {
        const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            part.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "ทั้งหมด" || part.category === selectedCategory;

        let matchesStock = true;
        if (stockFilter === "low") {
            matchesStock = part.currentStock <= part.minStockLevel;
        } else if (stockFilter === "out") {
            matchesStock = part.currentStock === 0;
        }

        return matchesSearch && matchesCategory && matchesStock;
    });

    const getStockStatus = (part: Part) => {
        if (part.currentStock === 0) {
            return { label: "หมด", color: "bg-red-100 text-red-800" };
        } else if (part.currentStock <= part.minStockLevel) {
            return { label: "ต่ำ", color: "bg-yellow-100 text-yellow-800" };
        } else {
            return { label: "ปกติ", color: "bg-green-100 text-green-800" };
        }
    };

    const handleCreatePart = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPart.name || !newPart.category) {
            toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        setIsCreating(true);

        try {
            // @ts-ignore - API types
            const { error } = await api.parts.post(newPart);

            if (error) {
                throw new Error(String(error.value));
            }

            toast.success("เพิ่มอะไหล่เรียบร้อยแล้ว");
            setShowAddDialog(false);

            // Reset form
            setNewPart({
                name: "",
                category: "หลอดไฟ",
                sku: "",
                description: "",
                unit: "ชิ้น",
                currentStock: 0,
                minStockLevel: 5,
                maxStockLevel: 100,
                unitPrice: 0,
                supplier: "",
                location: "",
            });

            fetchParts();
        } catch (err: unknown) {
            console.error("Error creating part:", err);
            const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเพิ่มอะไหล่";
            toast.error(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    const handleNewPartChange = (field: string, value: string | number) => {
        setNewPart(prev => ({ ...prev, [field]: value }));
    };

    const handleDeletePart = async (id: string) => {
        if (!confirm("คุณต้องการลบอะไหล่นี้ใช่หรือไม่?")) {
            return;
        }

        try {
            // @ts-ignore - API types
            const { error } = await api.parts({ id }).delete();

            if (error) {
                toast.error("ไม่สามารถลบอะไหล่ได้");
            } else {
                toast.success("ลบอะไหล่เรียบร้อยแล้ว");
                fetchParts();
            }
        } catch {
            toast.error("เกิดข้อผิดพลาดในการลบอะไหล่");
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2 mt-2"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card className="animate-pulse">
                    <CardHeader>
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-12 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">คงคลังอะไหล่</h1>
                    <p className="text-gray-600">จัดการอะไหล่และวัสดุสำรองสำหรับงานซ่อมบำรุง</p>
                </div>
                <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มอะไหล่
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">รายการทั้งหมด</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
                            </div>
                            <Package className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">สต็อกต่ำ</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">หมดสต็อก</p>
                                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                            </div>
                            <TrendingDown className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">มูลค่ารวม</p>
                                <p className="text-2xl font-bold text-gray-900">฿{stats.totalValue.toLocaleString('th-TH')}</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">หมวดหมู่</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.categories}</p>
                            </div>
                            <Box className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="ค้นหาชื่ออะไหล่หรือ SKU..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="เลือกหมวดหมู่" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={stockFilter} onValueChange={setStockFilter}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">สต็อกทั้งหมด</SelectItem>
                                <SelectItem value="low">สต็อกต่ำ</SelectItem>
                                <SelectItem value="out">หมดสต็อก</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Parts Table */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        รายการอะไหล่ ({filteredParts.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredParts.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                {searchTerm || selectedCategory !== "ทั้งหมด"
                                    ? "ไม่พบอะไหล่ที่ค้นหา"
                                    : "ยังไม่มีอะไหล่"}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {searchTerm || selectedCategory !== "ทั้งหมด"
                                    ? "ลองปรับเปลี่ยนเงื่อนไขการค้นหา"
                                    : "เริ่มต้นด้วยการเพิ่มอะไหล่ชิ้นแรก"}
                            </p>
                            {(!searchTerm && selectedCategory === "ทั้งหมด") && (
                                <Button onClick={() => setShowAddDialog(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    เพิ่มอะไหล่แรก
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>อะไหล่</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>หมวดหมู่</TableHead>
                                        <TableHead>สต็อก</TableHead>
                                        <TableHead>ราคา/หน่วย</TableHead>
                                        <TableHead>ที่จัดเก็บ</TableHead>
                                        <TableHead>สถานะ</TableHead>
                                        <TableHead>จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredParts.map((part) => {
                                        const stockStatus = getStockStatus(part);
                                        return (
                                            <TableRow key={part.id} className="hover:bg-gray-50">
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{part.name}</div>
                                                        {part.description && (
                                                            <div className="text-sm text-gray-500 line-clamp-1">
                                                                {part.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-sm">{part.sku || "-"}</span>
                                                </TableCell>
                                                <TableCell>{part.category}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{part.currentStock}</span>
                                                        <span className="text-gray-500 text-sm">{part.unit}</span>
                                                        <Badge className={stockStatus.color}>
                                                            {stockStatus.label}
                                                        </Badge>
                                                    </div>
                                                    {part.minStockLevel > 0 && (
                                                        <div className="text-xs text-gray-500">
                                                            ขั้นต่ำ: {part.minStockLevel}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {part.unitPrice ? (
                                                        <span>฿{part.unitPrice.toLocaleString('th-TH')}</span>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </TableCell>
                                                <TableCell>{part.location || "-"}</TableCell>
                                                <TableCell>
                                                    <Badge className={part.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                                        {part.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>จัดการ</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => setSelectedPart(part)}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                ดูรายละเอียด
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                แก้ไข
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeletePart(part.id)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                ลบ
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Part Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            เพิ่มอะไหล่ใหม่
                        </DialogTitle>
                        <DialogDescription>
                            เพิ่มอะไหล่หรือวัสดุสำรองเข้าสู่ระบบคงคลัง
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreatePart}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="name">ชื่ออะไหล่ *</Label>
                                <Input
                                    id="name"
                                    placeholder="เช่น หลอด LED 18W"
                                    value={newPart.name}
                                    onChange={(e) => handleNewPartChange("name", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">หมวดหมู่ *</Label>
                                <Select
                                    value={newPart.category}
                                    onValueChange={(value) => handleNewPartChange("category", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกหมวดหมู่" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.filter(c => c !== "ทั้งหมด").map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    placeholder="รหัสสินค้า"
                                    value={newPart.sku}
                                    onChange={(e) => handleNewPartChange("sku", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description">รายละเอียด</Label>
                                <Input
                                    id="description"
                                    placeholder="รายละเอียดสินค้า"
                                    value={newPart.description}
                                    onChange={(e) => handleNewPartChange("description", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unit">หน่วย *</Label>
                                <Select
                                    value={newPart.unit}
                                    onValueChange={(value) => handleNewPartChange("unit", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ชิ้น">ชิ้น</SelectItem>
                                        <SelectItem value="หลอด">หลอด</SelectItem>
                                        <SelectItem value="ตัว">ตัว</SelectItem>
                                        <SelectItem value="เส้น">เส้น</SelectItem>
                                        <SelectItem value="ม้วน">ม้วน</SelectItem>
                                        <SelectItem value="ขวด">ขวด</SelectItem>
                                        <SelectItem value="ถุง">ถุง</SelectItem>
                                        <SelectItem value="กล่อง">กล่อง</SelectItem>
                                        <SelectItem value="เครื่อง">เครื่อง</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="currentStock">จำนวนคงเหลือ *</Label>
                                <Input
                                    id="currentStock"
                                    type="number"
                                    min="0"
                                    value={newPart.currentStock}
                                    onChange={(e) => handleNewPartChange("currentStock", parseInt(e.target.value) || 0)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="minStockLevel">สต็อกขั้นต่ำ *</Label>
                                <Input
                                    id="minStockLevel"
                                    type="number"
                                    min="0"
                                    value={newPart.minStockLevel}
                                    onChange={(e) => handleNewPartChange("minStockLevel", parseInt(e.target.value) || 0)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="maxStockLevel">สต็อกสูงสุด</Label>
                                <Input
                                    id="maxStockLevel"
                                    type="number"
                                    min="0"
                                    value={newPart.maxStockLevel}
                                    onChange={(e) => handleNewPartChange("maxStockLevel", parseInt(e.target.value) || 0)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="unitPrice">ราคาต่อหน่วย</Label>
                                <Input
                                    id="unitPrice"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={newPart.unitPrice}
                                    onChange={(e) => handleNewPartChange("unitPrice", parseFloat(e.target.value) || 0)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="supplier">ผู้จัดจำหน่าย</Label>
                                <Input
                                    id="supplier"
                                    placeholder="ชื่อผู้จัดจำหน่าย"
                                    value={newPart.supplier}
                                    onChange={(e) => handleNewPartChange("supplier", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="location">ที่จัดเก็บ</Label>
                                <Input
                                    id="location"
                                    placeholder="เช่น โกดัง A, ชั้น 2"
                                    value={newPart.location}
                                    onChange={(e) => handleNewPartChange("location", e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                                ยกเลิก
                            </Button>
                            <Button type="submit" disabled={isCreating}>
                                {isCreating ? (
                                    <>
                                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        เพิ่มอะไหล่
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Part Detail Modal */}
            {selectedPart && (
                <Dialog open={!!selectedPart} onOpenChange={() => setSelectedPart(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>รายละเอียดอะไหล่</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-500">ชื่ออะไหล่</Label>
                                <p className="font-medium">{selectedPart.name}</p>
                                {selectedPart.description && (
                                    <p className="text-sm text-gray-600">{selectedPart.description}</p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">SKU</Label>
                                    <p className="font-mono">{selectedPart.sku || "-"}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">หมวดหมู่</Label>
                                    <p>{selectedPart.category}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">จำนวนคงเหลือ</Label>
                                    <p className="font-medium">
                                        {selectedPart.currentStock} {selectedPart.unit}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">ราคาต่อหน่วย</Label>
                                    <p>
                                        {selectedPart.unitPrice
                                            ? `฿${selectedPart.unitPrice.toLocaleString('th-TH')}`
                                            : "-"}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">สต็อกขั้นต่ำ</Label>
                                    <p>{selectedPart.minStockLevel} {selectedPart.unit}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">ที่จัดเก็บ</Label>
                                    <p>{selectedPart.location || "-"}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">ผู้จัดจำหน่าย</Label>
                                    <p>{selectedPart.supplier || "-"}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">สถานะ</Label>
                                    <Badge className={selectedPart.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                        {selectedPart.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
                                    </Badge>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">สร้างเมื่อ</Label>
                                    <p>{format(new Date(selectedPart.createdAt), "d MMM yyyy", { locale: th })}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">อัพเดตล่าสุด</Label>
                                    <p>{format(new Date(selectedPart.updatedAt), "d MMM yyyy", { locale: th })}</p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedPart(null)}>
                                ปิด
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
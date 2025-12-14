"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    History,
    Search,
    Download,
    Calendar as CalendarIcon,
    TrendingUp,
    PieChart,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

type MaintenanceRecord = {
    id: string;
    ticketId: string;
    title: string;
    category: string;
    priority: "low" | "medium" | "high" | "urgent";
    status: "completed" | "cancelled" | "pending";
    assignedTo?: string;
    unit?: {
        number: string;
        building: string;
    };
    createdAt: string;
    completedAt?: string;
    duration?: number; // in minutes
    cost?: {
        labor: number;
        parts: number;
        total: number;
    };
    issueType: string;
    resolution?: string;
};

type MaintenanceStats = {
    totalRecords: number;
    completedCount: number;
    cancelledCount: number;
    pendingCount: number;
    avgCompletionTime: number;
    totalCost: number;
    mostCommonIssues: Array<{
        issue: string;
        count: number;
        percentage: number;
    }>;
    categoryDistribution: Array<{
        category: string;
        count: number;
        percentage: number;
    }>;
};

const mockRecords: MaintenanceRecord[] = [
    {
        id: "1",
        ticketId: "T001",
        title: "แก้ไขแอร์เครื่องที่ 1",
        category: "แอร์",
        priority: "high",
        status: "completed",
        assignedTo: "ช่างสมศักดิ์",
        unit: { number: "A-101", building: "A" },
        createdAt: "2025-01-10T09:00:00Z",
        completedAt: "2025-01-12T10:30:00Z",
        duration: 120,
        cost: { labor: 300, parts: 1500, total: 1800 },
        issueType: "แอร์ไม่เย็น",
        resolution: "เปลี่ยนคอยล์แอร์และเติมก๊าซ"
    },
    {
        id: "2",
        ticketId: "T002",
        title: "ซ่อมปั๊มน้ำชั้น 2",
        category: "ประปา",
        priority: "medium",
        status: "completed",
        assignedTo: "ช่างวีระ",
        unit: { number: "B-205", building: "B" },
        createdAt: "2025-01-11T08:00:00Z",
        completedAt: "2025-01-12T09:15:00Z",
        duration: 60,
        cost: { labor: 200, parts: 0, total: 200 },
        issueType: "ปั๊มน้ำไม่ทำงาน",
        resolution: "เปลี่ยนตะแกรงกรอง ล้างถังน้ำ"
    },
    {
        id: "3",
        ticketId: "T003",
        title: "ตรวจเช็คระบบไฟฟ้าโซน A",
        category: "ไฟฟ้า",
        priority: "low",
        status: "cancelled",
        assignedTo: "ช่างสมศักดิ์",
        unit: { number: "C-301", building: "C" },
        createdAt: "2025-01-09T10:00:00Z",
        completedAt: "2025-01-11T14:20:00Z",
        issueType: "ไฟกระพริบ",
        resolution: "ผู้อยู่อาศัยยกเลิกการให้บริการ"
    },
    {
        id: "4",
        ticketId: "T004",
        title: "ซ่อมประตูห้องน้ำ",
        category: "ห้องน้ำ",
        priority: "urgent",
        status: "pending",
        assignedTo: "ช่างวีระ",
        unit: { number: "A-203", building: "A" },
        createdAt: "2025-01-13T07:30:00Z",
        issueType: "ประตูไม่ปิด",
        resolution: "รออะไหล่"
    }
];

const mockStats: MaintenanceStats = {
    totalRecords: 245,
    completedCount: 220,
    cancelledCount: 15,
    pendingCount: 10,
    avgCompletionTime: 85,
    totalCost: 28450,
    mostCommonIssues: [
        { issue: "แอร์ไม่เย็น", count: 45, percentage: 18.4 },
        { issue: "น้ำรั่ว", count: 38, percentage: 15.5 },
        { issue: "ปั๊มน้ำไม่ทำงาน", count: 32, percentage: 13.1 },
        { issue: "ไฟดับ/กระพริบ", count: 28, percentage: 11.4 },
        { issue: "ประตู/หน้าต่าง", count: 22, percentage: 9.0 }
    ],
    categoryDistribution: [
        { category: "แอร์", count: 78, percentage: 31.8 },
        { category: "ประปา", count: 62, percentage: 25.3 },
        { category: "ไฟฟ้า", count: 45, percentage: 18.4 },
        { category: "ห้องน้ำ", count: 35, percentage: 14.3 },
        { category: "อื่นๆ", count: 25, percentage: 10.2 }
    ]
};

export default function MaintenanceHistoryPage() {
    const [records, setRecords] = useState<MaintenanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState<{ from?: Date; to?: Date }>({});
    const [stats] = useState<MaintenanceStats>(mockStats);  // setStats reserved for API integration
    const [showCalendar, setShowCalendar] = useState(false);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setRecords(mockRecords);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredRecords = records.filter(record => {
        const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.issueType.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || record.status === statusFilter;
        const matchesCategory = categoryFilter === "all" || record.category === categoryFilter;

        let matchesDate = true;
        if (dateFilter.from && new Date(record.createdAt) < dateFilter.from) {
            matchesDate = false;
        }
        if (dateFilter.to && new Date(record.createdAt) > dateFilter.to) {
            matchesDate = false;
        }

        return matchesSearch && matchesStatus && matchesCategory && matchesDate;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-800";
            case "cancelled": return "bg-red-100 text-red-800";
            case "pending": return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed": return <CheckCircle className="w-4 h-4" />;
            case "cancelled": return <XCircle className="w-4 h-4" />;
            case "pending": return <AlertCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent": return "border-red-500";
            case "high": return "border-orange-500";
            case "medium": return "border-yellow-500";
            case "low": return "border-green-500";
            default: return "border-gray-200";
        }
    };

    const exportHistory = () => {
        // Implement export functionality
        console.log("Exporting maintenance history...");
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }, (_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-20 bg-gray-200 rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card className="animate-pulse">
                    <CardContent className="p-6">
                        <div className="h-96 bg-gray-200 rounded"></div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">รวมทั้งหมด</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
                            </div>
                            <History className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">เสร็จสิ้น</p>
                                <p className="text-2xl font-bold text-green-600">{stats.completedCount}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ยกเลิก</p>
                                <p className="text-2xl font-bold text-red-600">{stats.cancelledCount}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">รอดำเนินการ</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            ปัญหาที่พบบ่อย
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.mostCommonIssues.map((issue, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-medium">{issue.issue}</p>
                                            <p className="text-sm text-gray-600">{issue.count} ครั้ง</p>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${issue.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="ml-3 text-sm text-gray-600 w-12 text-right">
                                        {issue.percentage}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="w-5 h-5" />
                            สัดส่วนตามหมวดหมู่
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.categoryDistribution.map((cat, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-medium">{cat.category}</p>
                                            <p className="text-sm text-gray-600">{cat.count} รายการ</p>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{ width: `${cat.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="ml-3 text-sm text-gray-600 w-12 text-right">
                                        {cat.percentage}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">ประวัติการซ่อมบำรุง</h1>
                    <p className="text-gray-600">บันทึกประวัติการดำเนินงานซ่อมบำรุงทั้งหมด</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportHistory}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="ค้นหาจากชื่องาน, รหัสตั๋ว, หรือประเภทปัญหา..."
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
                                <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                                <SelectItem value="cancelled">ยกเลิก</SelectItem>
                                <SelectItem value="pending">รอดำเนินการ</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full lg:w-[180px]">
                                <SelectValue placeholder="หมวดหมู่" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                                <SelectItem value="แอร์">แอร์</SelectItem>
                                <SelectItem value="ประปา">ประปา</SelectItem>
                                <SelectItem value="ไฟฟ้า">ไฟฟ้า</SelectItem>
                                <SelectItem value="ห้องน้ำ">ห้องน้ำ</SelectItem>
                                <SelectItem value="ประตู/หน้าต่าง">ประตู/หน้าต่าง</SelectItem>
                            </SelectContent>
                        </Select>
                        <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full lg:w-[200px]">
                                    <CalendarIcon className="w-4 h-4 mr-2" />
                                    {dateFilter.from && dateFilter.to
                                        ? `${format(dateFilter.from, "d MMM", { locale: th })} - ${format(dateFilter.to, "d MMM", { locale: th })}`
                                        : "เลือกช่วงวันที่"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    selected={{ from: dateFilter.from, to: dateFilter.to }}
                                    onSelect={(range) => {
                                        setDateFilter({ from: range?.from, to: range?.to });
                                        setShowCalendar(false);
                                    }}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
            </Card>

            {/* Records Table */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        รายการประวัติ ({filteredRecords.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredRecords.length === 0 ? (
                        <div className="text-center py-12">
                            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                                    ? "ไม่พบประวัติที่ตรงตามเงื่อนไข"
                                    : "ยังไม่มีประวัติการซ่อมบำรุง"}
                            </h3>
                            <p className="text-gray-600">
                                {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                                    ? "ลองปรับเปลี่ยนเงื่อนไขการค้นหา"
                                    : "ประวัติการซ่อมบำรุงจะแสดงที่นี่"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>รหัสตั๋ว</TableHead>
                                        <TableHead>ชื่องาน</TableHead>
                                        <TableHead>ประเภทปัญหา</TableHead>
                                        <TableHead>ห้องพัก</TableHead>
                                        <TableHead>วันที่แจ้ง</TableHead>
                                        <TableHead>ผู้รับผิดชอบ</TableHead>
                                        <TableHead>สถานะ</TableHead>
                                        <TableHead>ระยะเวลา</TableHead>
                                        <TableHead>ค่าใช้จ่าย</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRecords.map((record) => (
                                        <TableRow
                                            key={record.id}
                                            className={`hover:bg-gray-50 border-l-4 ${getPriorityColor(record.priority)}`}
                                        >
                                            <TableCell className="font-medium">
                                                {record.ticketId}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{record.title}</p>
                                                    <Badge variant="outline" className="text-xs mt-1">
                                                        {record.category}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm">{record.issueType}</p>
                                            </TableCell>
                                            <TableCell>
                                                {record.unit ? (
                                                    <p className="text-sm">
                                                        {record.unit.building}-{record.unit.number}
                                                    </p>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm">
                                                    {format(new Date(record.createdAt), "d MMM yyyy", { locale: th })}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                {record.assignedTo || (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`flex items-center gap-1 ${getStatusColor(record.status)}`}>
                                                    {getStatusIcon(record.status)}
                                                    {record.status === "completed" && "เสร็จสิ้น"}
                                                    {record.status === "cancelled" && "ยกเลิก"}
                                                    {record.status === "pending" && "รอดำเนินการ"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {record.duration ? (
                                                    <span className="text-sm">{record.duration} นาที</span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {record.cost ? (
                                                    <p className="font-medium">฿{record.cost.total.toLocaleString()}</p>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
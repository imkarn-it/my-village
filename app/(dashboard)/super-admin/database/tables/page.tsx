"use client";

import React, { useState } from "react";
import {
    Database,
    Table as TableIcon,
    Search,
    Eye,
    Download,
    RefreshCw,
    Filter,
    MoreHorizontal,
    Copy,
    FileText,
    Edit,
    Trash2,
    Plus,
    BarChart2,
    Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data
const tables = [
    {
        name: "users",
        displayName: "Users",
        description: "User accounts and authentication",
        records: 25,
        size: "2.4 MB",
        lastModified: "2025-01-15T08:30:00Z",
        hasRelations: true,
        schema: [
            { name: "id", type: "uuid", nullable: false },
            { name: "email", type: "varchar", nullable: false },
            { name: "name", type: "varchar", nullable: false },
            { name: "role", type: "varchar", nullable: false },
            { name: "project_id", type: "uuid", nullable: false },
            { name: "created_at", type: "timestamp", nullable: false },
        ],
    },
    {
        name: "units",
        displayName: "Units",
        description: "Building units and apartments",
        records: 150,
        size: "8.5 MB",
        lastModified: "2025-01-15T07:45:00Z",
        hasRelations: true,
        schema: [
            { name: "id", type: "uuid", nullable: false },
            { name: "unit_number", type: "varchar", nullable: false },
            { name: "building", type: "varchar", nullable: false },
            { name: "floor", type: "integer", nullable: false },
            { name: "project_id", type: "uuid", nullable: false },
            { name: "occupied", type: "boolean", nullable: false },
        ],
    },
    {
        name: "announcements",
        displayName: "Announcements",
        description: "Community announcements and notices",
        records: 45,
        size: "1.2 MB",
        lastModified: "2025-01-14T15:20:00Z",
        hasRelations: true,
        schema: [
            { name: "id", type: "uuid", nullable: false },
            { name: "title", type: "varchar", nullable: false },
            { name: "content", type: "text", nullable: true },
            { name: "is_pinned", type: "boolean", nullable: false },
            { name: "project_id", type: "uuid", nullable: false },
        ],
    },
    {
        name: "visitors",
        displayName: "Visitors",
        description: "Visitor registrations and access logs",
        records: 1250,
        size: "15.3 MB",
        lastModified: "2025-01-15T12:00:00Z",
        hasRelations: true,
        schema: [
            { name: "id", type: "uuid", nullable: false },
            { name: "name", type: "varchar", nullable: false },
            { name: "id_number", type: "varchar", nullable: false },
            { name: "qr_code", type: "varchar", nullable: false },
            { name: "purpose", type: "varchar", nullable: true },
        ],
    },
    {
        name: "maintenance_requests",
        displayName: "Maintenance Requests",
        description: "Maintenance and repair requests",
        records: 89,
        size: "3.7 MB",
        lastModified: "2025-01-15T10:15:00Z",
        hasRelations: true,
        schema: [
            { name: "id", type: "uuid", nullable: false },
            { name: "title", type: "varchar", nullable: false },
            { name: "description", type: "text", nullable: true },
            { name: "status", type: "varchar", nullable: false },
            { name: "priority", type: "varchar", nullable: false },
        ],
    },
    {
        name: "bills",
        displayName: "Bills",
        description: "Utility bills and payment records",
        records: 1250,
        size: "18.9 MB",
        lastModified: "2025-01-15T09:00:00Z",
        hasRelations: true,
        schema: [
            { name: "id", type: "uuid", nullable: false },
            { name: "invoice_number", type: "varchar", nullable: false },
            { name: "amount", type: "decimal", nullable: false },
            { name: "status", type: "varchar", nullable: false },
            { name: "due_date", type: "date", nullable: false },
        ],
    },
    {
        name: "facilities",
        displayName: "Facilities",
        description: "Common facilities and amenities",
        records: 5,
        size: "0.8 MB",
        lastModified: "2025-01-10T14:30:00Z",
        hasRelations: true,
        schema: [
            { name: "id", type: "uuid", nullable: false },
            { name: "name", type: "varchar", nullable: false },
            { name: "type", type: "varchar", nullable: false },
            { name: "capacity", type: "integer", nullable: false },
            { name: "is_active", type: "boolean", nullable: false },
        ],
    },
    {
        name: "bookings",
        displayName: "Bookings",
        description: "Facility bookings and reservations",
        records: 234,
        size: "5.4 MB",
        lastModified: "2025-01-15T11:30:00Z",
        hasRelations: true,
        schema: [
            { name: "id", type: "uuid", nullable: false },
            { name: "facility_id", type: "uuid", nullable: false },
            { name: "unit_id", type: "uuid", nullable: false },
            { name: "start_time", type: "timestamp", nullable: false },
            { name: "end_time", type: "timestamp", nullable: false },
        ],
    },
    {
        name: "support_tickets",
        displayName: "Support Tickets",
        description: "Customer support tickets and issues",
        records: 67,
        size: "2.1 MB",
        lastModified: "2025-01-15T13:45:00Z",
        hasRelations: true,
        schema: [
            { name: "id", type: "uuid", nullable: false },
            { name: "subject", type: "varchar", nullable: false },
            { name: "category", type: "varchar", nullable: false },
            { name: "status", type: "varchar", nullable: false },
            { name: "priority", type: "varchar", nullable: false },
        ],
    },
    {
        name: "sos_alerts",
        displayName: "SOS Alerts",
        description: "Emergency alert notifications",
        records: 3,
        size: "0.3 MB",
        lastModified: "2025-01-12T16:20:00Z",
        hasRelations: true,
        schema: [
            { name: "id", type: "uuid", nullable: false },
            { name: "location_lat", type: "decimal", nullable: true },
            { name: "location_lng", type: "decimal", nullable: true },
            { name: "message", type: "text", nullable: true },
            { name: "status", type: "varchar", nullable: false },
        ],
    },
    {
        name: "audit_logs",
        displayName: "Audit Logs",
        description: "System activity audit trail",
        records: 15420,
        size: "45.2 MB",
        lastModified: "2025-01-15T14:00:00Z",
        hasRelations: false,
        schema: [
            { name: "id", type: "uuid", nullable: false },
            { name: "user_id", type: "uuid", nullable: false },
            { name: "action", type: "varchar", nullable: false },
            { name: "resource", type: "varchar", nullable: false },
            { name: "ip_address", type: "varchar", nullable: true },
        ],
    },
];

export default function DatabaseTablesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [filterBy, setFilterBy] = useState("all");
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [showTruncateDialog, setShowTruncateDialog] = useState(false);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [tableData, setTableData] = useState<{
        columns: { name: string; type: string; nullable: boolean }[];
        rows: any[];
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const filteredTables = tables.filter((table) => {
        const matchesSearch =
            table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            table.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            table.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter =
            filterBy === "all" ||
            (filterBy === "hasRelations" && table.hasRelations) ||
            (filterBy === "noRelations" && !table.hasRelations);
        return matchesSearch && matchesFilter;
    });

    const formatSize = (bytes: string) => {
        return bytes;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleViewTable = async (tableName: string) => {
        setIsLoading(true);
        setSelectedTable(tableName);
        try {
            // In real app, fetch table data from API
            // const response = await fetch(`/api/database/tables/${tableName}`);
            // const data = await response.json();
            // setTableData(data);

            // Mock data
            await new Promise(resolve => setTimeout(resolve, 1000));
            setTableData({
                columns: tables.find(t => t.name === tableName)?.schema || [],
                rows: [], // Mock empty data
            });
        } catch (error) {
            console.error("Failed to fetch table data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportTable = (tableName: string) => {
        // In real app, generate and download CSV/Excel
        const data = {
            table: tableName,
            columns: tables.find(t => t.name === tableName)?.schema || [],
            data: tableData?.rows || [],
            exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${tableName}-export.json`;
        a.click();
    };

    const handleTruncateTable = async (tableName: string) => {
        // In real app, call API to truncate table
        console.log(`Truncating table: ${tableName}`);
    };

    const getSizeInMB = (size: string) => {
        const match = size.match(/(\d+\.?\d*)\s*MB/);
        return match ? parseFloat(match[1]) : 0;
    };

    const totalSize = tables.reduce((sum, table) => sum + getSizeInMB(table.size), 0);
    const totalRecords = tables.reduce((sum, table) => sum + table.records, 0);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Database Tables</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">View and manage all database tables</p>
                </div>
                <Button>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Stats
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">จำนวนตารางงาน</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{tables.length}</p>
                            </div>
                            <Table className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">แถวนข้อมูลทั้งหมด</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalRecords.toLocaleString()}</p>
                            </div>
                            <BarChart2 className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ขนาดข้อมูล</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalSize.toFixed(1)} MB</p>
                            </div>
                            <Database className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ตารางงานที่มี Relations</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {tables.filter(t => t.hasRelations).length}
                                </p>
                            </div>
                            <Key className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="ค้นหาชื่อตารางงาน..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-48">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger>
                                    <SelectValue placeholder="เรียงตาม" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">ชื่อ (A-Z)</SelectItem>
                                    <SelectItem value="records">จำนวนข้อมูล (มาก-น้อย)</SelectItem>
                                    <SelectItem value="size">ขนาด (มาก-น้อย)</SelectItem>
                                    <SelectItem value="modified">แก้ไขล่าสุด</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full md:w-48">
                            <Select value={filterBy} onValueChange={setFilterBy}>
                                <SelectTrigger>
                                    <SelectValue placeholder="กรองแผล" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">ทั้งหมด</SelectItem>
                                    <SelectItem value="hasRelations">มี Relations</SelectItem>
                                    <SelectItem value="noRelations">ไม่มี Relations</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tables List */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>ตารางงานในฐานข้อมูล</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ตารางงาน</TableHead>
                                <TableHead>Records</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Relations</TableHead>
                                <TableHead>แก้ไขล่าสุด</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTables.map((table) => (
                                <TableRow key={table.name}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{table.displayName}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{table.name}</p>
                                            <p className="text-xs text-slate-400 mt-1">{table.description}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{table.records.toLocaleString()}</Badge>
                                    </TableCell>
                                    <TableCell>{formatSize(table.size)}</TableCell>
                                    <TableCell>
                                        {table.hasRelations ? (
                                            <Badge className="bg-green-100 text-green-800">
                                                {tables.filter(t => t.name === table.name && t.schema.some(col => col.name.includes("_id"))).length - 1} Relations
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">No Relations</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm">{formatDate(table.lastModified)}</span>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => handleViewTable(table.name)}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    ดูข้อมูล
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedTable(table.name);
                                                        setShowViewDialog(true);
                                                    }}
                                                >
                                                    <Table className="h-4 w-4 mr-2" />
                                                    ดู Schema
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleExportTable(table.name)}
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Export Data
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Truncate Table
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* View Table Data Dialog */}
            <Dialog open={showViewDialog || !!selectedTable} onOpenChange={(open) => !open && setSelectedTable(null)}>
                <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>ดูข้อมูลตารางงาน: {selectedTable}</DialogTitle>
                        <DialogDescription>
                            {tableData && `แสดง ${tableData.rows.length} แถวนข้อมูล`}
                        </DialogDescription>
                    </DialogHeader>
                    {tableData && (
                        <div className="space-y-4">
                            <div className="max-h-[50vh] overflow-auto border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {tableData.columns.map((col) => (
                                                <TableHead key={col.name}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{col.name}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {col.type}
                                                        </Badge>
                                                        {!col.nullable && (
                                                            <span className="text-red-500 text-xs">*</span>
                                                        )}
                                                    </div>
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tableData.rows.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={tableData.columns.length} className="text-center py-8">
                                                    <p className="text-slate-500 dark:text-slate-400">ไม่มีข้อมูลในตารางงานนี้</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            // Show sample data or actual data
                                            <TableRow>
                                                {tableData.columns.map((col, index) => (
                                                    <TableCell key={col.name}>
                                                        {/* Sample data display */}
                                                        {index === 0 && <span className="text-blue-600">uuid</span>}
                                                        {index === 1 && <span className="text-green-600">example@email.com</span>}
                                                        {index === 2 && <span className="font-medium">John Doe</span>}
                                                        {index === 3 && <Badge>resident</Badge>}
                                                        {index === 4 && <Badge className="bg-blue-100 text-blue-800">uuid</Badge>}
                                                        {index === 5 && <span className="text-slate-500 dark:text-slate-400">2025-01-15</span>}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {isLoading ? "กำลังโหลดข้อมูล..." : `แสดง ${tableData.rows.length} แถวน`}
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-2" />
                                        ดาวนโหลด
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => selectedTable && handleViewTable(selectedTable)}
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        รีเฟรช
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Export Dialog */}
            <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>ส่งออกข้อมูล</DialogTitle>
                        <DialogDescription>
                            เลือกรูปแบบที่จะส่งออกข้อมูลจากตารางงาน {selectedTable}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <p className="font-medium">รูปแบบไฟล์:</p>
                            <div className="mt-2 space-y-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="format"
                                        defaultChecked
                                        className="text-blue-600"
                                    />
                                    <span>JSON (.json)</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="format" className="text-blue-600" />
                                    <span>CSV (.csv)</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="format" className="text-blue-600" />
                                    <span>Excel (.xlsx)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                            ยกเลิก
                        </Button>
                        <Button onClick={() => selectedTable && handleExportTable(selectedTable)}>
                            <Download className="h-4 w-4 mr-2" />
                            ส่งออก
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Truncate Table Dialog */}
            <Dialog open={showTruncateDialog} onOpenChange={setShowTruncateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">ตัดตอนข้อมูลตารางงาน</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        คำเตือน: การลบข้อมูลในตารางงาน "<strong>{selectedTable}</strong>" จะลบข้อมูลทั้งหมดและไม่สามารับกู้คืน
                    </DialogDescription>
                    <div className="mt-4 p-4 bg-red-50 rounded-lg">
                        <p className="font-medium">ยืนยันยืนอีก:</p>
                        <ul className="list-disc list-inside mt-2 text-sm text-slate-700 dark:text-slate-300">
                            <li>สำรอง backup ข้อมูลก่อนลบ</li>
                            <li>ตรวจสอบถานผลกระทบ</li>
                            <li>ให้้หน้าที่จะต้องการลบข้อมูลในอนาคต่อไป</li>
                        </ul>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowTruncateDialog(false)}>
                            ยกเลิก
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => selectedTable && handleTruncateTable(selectedTable)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            ยืนยัน
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
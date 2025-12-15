"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
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
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Database,
    Activity,
    HardDrive,
    Users,
    Building,
    FileText,
    Download,
    Upload,
    RefreshCw,
    Settings,
    AlertTriangle,
    CheckCircle,
    Clock,
    Trash2,
    Eye,
    Copy,
    Terminal,
    Shield,
    Zap,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

type DatabaseStats = {
    totalSize: string;
    usedSpace: number;
    totalSpace: number;
    totalRecords: number;
    totalTables: number;
    lastBackup: string;
    connectionStatus: "connected" | "disconnected" | "maintenance";
    uptime: string;
};

type TableInfo = {
    name: string;
    records: number;
    size: string;
    lastModified: string;
    status: "healthy" | "warning" | "error";
};

type BackupRecord = {
    id: string;
    filename: string;
    size: string;
    createdAt: string;
    status: "completed" | "in_progress" | "failed";
    type: "manual" | "automatic";
    projectId?: string;
};

type QueryHistory = {
    id: string;
    query: string;
    executionTime: number;
    status: "success" | "error";
    executedAt: string;
    executedBy: string;
};

const mockDatabaseStats: DatabaseStats = {
    totalSize: "2.4 GB",
    usedSpace: 2.4,
    totalSpace: 10,
    totalRecords: 156789,
    totalTables: 14,
    lastBackup: "2025-01-13T02:00:00Z",
    connectionStatus: "connected",
    uptime: "45 days 12 hours"
};

const mockTables: TableInfo[] = [
    { name: "users", records: 15420, size: "245 MB", lastModified: "2025-01-13T09:15:00Z", status: "healthy" },
    { name: "units", records: 850, size: "12 MB", lastModified: "2025-01-12T16:30:00Z", status: "healthy" },
    { name: "maintenance_tickets", records: 2456, size: "78 MB", lastModified: "2025-01-13T10:45:00Z", status: "healthy" },
    { name: "visitors", records: 12340, size: "189 MB", lastModified: "2025-01-13T11:20:00Z", status: "warning" },
    { name: "announcements", records: 234, size: "8 MB", lastModified: "2025-01-12T14:10:00Z", status: "healthy" },
    { name: "parcels", records: 5678, size: "95 MB", lastModified: "2025-01-13T08:30:00Z", status: "healthy" },
    { name: "bills", records: 8934, size: "156 MB", lastModified: "2025-01-13T07:45:00Z", status: "healthy" },
    { name: "support_tickets", records: 1234, size: "34 MB", lastModified: "2025-01-13T11:50:00Z", status: "healthy" },
    { name: "facilities_bookings", records: 3456, size: "67 MB", lastModified: "2025-01-13T10:20:00Z", status: "healthy" },
    { name: "emergency_alerts", records: 234, size: "12 MB", lastModified: "2025-01-13T09:30:00Z", status: "healthy" },
    { name: "activities", records: 98765, size: "1.2 GB", lastModified: "2025-01-13T11:55:00Z", status: "healthy" },
    { name: "files", records: 3456, size: "567 MB", lastModified: "2025-01-13T11:00:00Z", status: "healthy" },
    { name: "notifications", records: 23456, size: "234 MB", lastModified: "2025-01-13T11:40:00Z", status: "healthy" },
    { name: "audit_logs", records: 45678, size: "456 MB", lastModified: "2025-01-13T11:58:00Z", status: "error" }
];

const mockBackups: BackupRecord[] = [
    {
        id: "1",
        filename: "myvillage_backup_2025_01_13_020000.sql",
        size: "1.2 GB",
        createdAt: "2025-01-13T02:00:00Z",
        status: "completed",
        type: "automatic"
    },
    {
        id: "2",
        filename: "myvillage_backup_manual_2025_01_12_150000.sql",
        size: "1.1 GB",
        createdAt: "2025-01-12T15:00:00Z",
        status: "completed",
        type: "manual"
    },
    {
        id: "3",
        filename: "myvillage_backup_2025_01_12_020000.sql",
        size: "1.1 GB",
        createdAt: "2025-01-12T02:00:00Z",
        status: "completed",
        type: "automatic"
    }
];

const mockQueryHistory: QueryHistory[] = [
    {
        id: "1",
        query: "SELECT * FROM maintenance_tickets WHERE status = 'completed'",
        executionTime: 45,
        status: "success",
        executedAt: "2025-01-13T11:30:00Z",
        executedBy: "admin@myvillage.com"
    },
    {
        id: "2",
        query: "UPDATE users SET last_login = NOW() WHERE id = 'user_123'",
        executionTime: 12,
        status: "success",
        executedAt: "2025-01-13T11:25:00Z",
        executedBy: "system"
    },
    {
        id: "3",
        query: "DELETE FROM activities WHERE created_at < '2024-01-01'",
        executionTime: 2300,
        status: "success",
        executedAt: "2025-01-13T11:20:00Z",
        executedBy: "admin@myvillage.com"
    }
];

export default function SuperAdminDatabasePage() {
    const [stats, setStats] = useState<DatabaseStats>(mockDatabaseStats);
    const [tables, setTables] = useState<TableInfo[]>(mockTables);
    const [backups, setBackups] = useState<BackupRecord[]>(mockBackups);
    const [queryHistory, setQueryHistory] = useState<QueryHistory[]>(mockQueryHistory);
    const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [showQueryDialog, setShowQueryDialog] = useState(false);
    const [customQuery, setCustomQuery] = useState("");
    const [activeTab, setActiveTab] = useState("overview");

    const getStatusColor = (status: string) => {
        switch (status) {
            case "healthy":
            case "connected":
            case "completed":
            case "success":
                return "bg-green-100 text-green-800";
            case "warning":
            case "in_progress":
                return "bg-yellow-100 text-yellow-800";
            case "error":
            case "failed":
            case "disconnected":
                return "bg-red-100 text-red-800";
            case "maintenance":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-slate-100 dark:bg-slate-800 text-gray-800";
        }
    };

    const handleBackup = async (type: "manual" | "automatic" = "manual") => {
        setIsBackingUp(true);
        // Simulate backup process
        setTimeout(() => {
            const newBackup: BackupRecord = {
                id: Date.now().toString(),
                filename: `myvillage_backup_manual_${format(new Date(), "yyyy_MM_dd_HHmmss")}.sql`,
                size: "1.2 GB",
                createdAt: new Date().toISOString(),
                status: "completed",
                type
            };
            setBackups([newBackup, ...backups]);
            setIsBackingUp(false);
        }, 3000);
    };

    const handleExecuteQuery = async () => {
        if (!customQuery.trim()) return;

        // Simulate query execution
        const newQuery: QueryHistory = {
            id: Date.now().toString(),
            query: customQuery,
            executionTime: Math.floor(Math.random() * 1000),
            status: Math.random() > 0.1 ? "success" : "error",
            executedAt: new Date().toISOString(),
            executedBy: "superadmin@myvillage.com"
        };

        setQueryHistory([newQuery, ...queryHistory]);
        setCustomQuery("");
        setShowQueryDialog(false);
    };

    const downloadBackup = (backupId: string) => {
        console.log("Downloading backup:", backupId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ฐานข้อมูล</h1>
                <p className="text-slate-600 dark:text-slate-400">จัดการและตรวจสอบสถานะฐานข้อมูลระบบ</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
                    <TabsTrigger value="tables">ตารางข้อมูล</TabsTrigger>
                    <TabsTrigger value="backups">การสำรองข้อมูล</TabsTrigger>
                    <TabsTrigger value="queries">ประวัติคำสั่ง</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ขนาดฐานข้อมูล</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalSize}</p>
                                    </div>
                                    <HardDrive className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="mt-2">
                                    <Progress value={(stats.usedSpace / stats.totalSpace) * 100} className="h-2" />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        {stats.usedSpace} GB / {stats.totalSpace} GB
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">จำนวนระเบียน</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalRecords.toLocaleString()}</p>
                                    </div>
                                    <FileText className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">จำนวนตาราง</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalTables}</p>
                                    </div>
                                    <Database className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">สถานะเชื่อมต่อ</p>
                                        <Badge className={getStatusColor(stats.connectionStatus)}>
                                            {stats.connectionStatus === "connected" && "เชื่อมต่อแล้ว"}
                                            {stats.connectionStatus === "disconnected" && "ไม่ได้เชื่อมต่อ"}
                                            {stats.connectionStatus === "maintenance" && "กำลังปรับปรุง"}
                                        </Badge>
                                    </div>
                                    <Activity className="h-8 w-8 text-indigo-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* System Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="w-5 h-5" />
                                    ข้อมูลระบบ
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">เวลาทำงานติดต่อกัน</span>
                                    <span className="font-medium">{stats.uptime}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">การสำรองข้อมูลล่าสุด</span>
                                    <span className="font-medium">
                                        {format(new Date(stats.lastBackup), "d MMM yyyy, HH:mm", { locale: th })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">เวอร์ชั่นฐานข้อมูล</span>
                                    <span className="font-medium">PostgreSQL 15.4</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">ตำแหน่งที่จัดเก็บ</span>
                                    <span className="font-medium">Supabase (AWS)</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    การรักษาความปลอดภัย
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">การเข้ารหัส</span>
                                    <Badge className="bg-green-100 text-green-800">เปิดใช้งาน</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">SSL Certificate</span>
                                    <Badge className="bg-green-100 text-green-800">ถูกต้อง</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">การควบคุมการเข้าถึง</span>
                                    <Badge className="bg-green-100 text-green-800">เปิดใช้งาน</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">การตรวจสอบสิทธิ์ 2 ชั้น</span>
                                    <Badge className="bg-green-100 text-green-800">บังคับใช้</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tables Tab */}
                <TabsContent value="tables" className="space-y-6">
                    <div className="flex justify-between">
                        <h3 className="text-lg font-semibold">จัดการตารางข้อมูล</h3>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                รีเฟรช
                            </Button>
                        </div>
                    </div>

                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ชื่อตาราง</TableHead>
                                            <TableHead>จำนวนระเบียน</TableHead>
                                            <TableHead>ขนาด</TableHead>
                                            <TableHead>แก้ไขล่าสุด</TableHead>
                                            <TableHead>สถานะ</TableHead>
                                            <TableHead>จัดการ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tables.map((table) => (
                                            <TableRow key={table.name} className="hover:bg-slate-50 dark:bg-slate-800/50">
                                                <TableCell className="font-medium">{table.name}</TableCell>
                                                <TableCell>{table.records.toLocaleString()}</TableCell>
                                                <TableCell>{table.size}</TableCell>
                                                <TableCell>
                                                    {format(new Date(table.lastModified), "d MMM yyyy, HH:mm", { locale: th })}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(table.status)}>
                                                        {table.status === "healthy" && "ปกติ"}
                                                        {table.status === "warning" && "คำเตือน"}
                                                        {table.status === "error" && "ผิดพลาด"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setSelectedTable(table)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm">
                                                            <Settings className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Backups Tab */}
                <TabsContent value="backups" className="space-y-6">
                    <div className="flex justify-between">
                        <h3 className="text-lg font-semibold">การสำรองข้อมูล</h3>
                        <Button onClick={() => handleBackup("manual")} disabled={isBackingUp}>
                            {isBackingUp ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    กำลังสำรองข้อมูล...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    สำรองข้อมูลตอนนี้
                                </>
                            )}
                        </Button>
                    </div>

                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ชื่อไฟล์</TableHead>
                                            <TableHead>ขนาด</TableHead>
                                            <TableHead>วันที่สร้าง</TableHead>
                                            <TableHead>ประเภท</TableHead>
                                            <TableHead>สถานะ</TableHead>
                                            <TableHead>จัดการ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {backups.map((backup) => (
                                            <TableRow key={backup.id} className="hover:bg-slate-50 dark:bg-slate-800/50">
                                                <TableCell className="font-medium">{backup.filename}</TableCell>
                                                <TableCell>{backup.size}</TableCell>
                                                <TableCell>
                                                    {format(new Date(backup.createdAt), "d MMM yyyy, HH:mm", { locale: th })}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={backup.type === "automatic" ? "default" : "secondary"}>
                                                        {backup.type === "automatic" ? "อัตโนมัติ" : "กำหนดเอง"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(backup.status)}>
                                                        {backup.status === "completed" && "สำเร็จ"}
                                                        {backup.status === "in_progress" && "กำลังดำเนินการ"}
                                                        {backup.status === "failed" && "ล้มเหลว"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => downloadBackup(backup.id)}
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm">
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Queries Tab */}
                <TabsContent value="queries" className="space-y-6">
                    <div className="flex justify-between">
                        <h3 className="text-lg font-semibold">ประวัติคำสั่ง SQL</h3>
                        <Button onClick={() => setShowQueryDialog(true)}>
                            <Terminal className="w-4 h-4 mr-2" />
                            รันคำสั่งใหม่
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="p-6">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>คำสั่ง</TableHead>
                                            <TableHead>เวลาทำงาน</TableHead>
                                            <TableHead>สถานะ</TableHead>
                                            <TableHead>ผู้ดำเนินการ</TableHead>
                                            <TableHead>วันที่</TableHead>
                                            <TableHead>จัดการ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {queryHistory.map((query) => (
                                            <TableRow key={query.id} className="hover:bg-slate-50 dark:bg-slate-800/50">
                                                <TableCell className="max-w-md truncate font-mono text-sm">
                                                    {query.query}
                                                </TableCell>
                                                <TableCell>{query.executionTime} ms</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(query.status)}>
                                                        {query.status === "success" && "สำเร็จ"}
                                                        {query.status === "error" && "ผิดพลาด"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{query.executedBy}</TableCell>
                                                <TableCell>
                                                    {format(new Date(query.executedAt), "d MMM yyyy, HH:mm", { locale: th })}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="sm">
                                                            <Copy className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Query Dialog */}
            <Dialog open={showQueryDialog} onOpenChange={setShowQueryDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>รันคำสั่ง SQL</DialogTitle>
                        <DialogDescription>
                            กรอกคำสั่ง SQL เพื่อดำเนินการกับฐานข้อมูล
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium">คำสั่ง SQL</label>
                            <textarea
                                className="w-full mt-2 p-3 border rounded-lg font-mono text-sm"
                                rows={6}
                                placeholder="SELECT * FROM table_name WHERE condition;"
                                value={customQuery}
                                onChange={(e) => setCustomQuery(e.target.value)}
                            />
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm text-yellow-800">
                                ⚠️ คำเตือน: การรันคำสั่ง SQL โดยตรงอาจส่งผลกระทบต่อข้อมูลในระบบ
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowQueryDialog(false)}>
                            ยกเลิก
                        </Button>
                        <Button onClick={handleExecuteQuery} disabled={!customQuery.trim()}>
                            รันคำสั่ง
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
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
    Activity,
    Search,
    Filter,
    Calendar,
    User,
    Shield,
    Database,
    Settings,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    Eye,
    Download,
    RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

type ActivityLog = {
    id: string;
    type: "user" | "system" | "security" | "database" | "maintenance" | "admin";
    action: string;
    details: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    projectId?: string;
    projectName?: string;
    ipAddress?: string;
    userAgent?: string;
    status: "success" | "warning" | "error" | "info";
    timestamp: string;
    metadata?: Record<string, any>;
};

type ActivityStats = {
    totalLogs: number;
    todayLogs: number;
    errorCount: number;
    warningCount: number;
    successCount: number;
    topUsers: Array<{
        name: string;
        email: string;
        count: number;
    }>;
    topActions: Array<{
        action: string;
        count: number;
        percentage: number;
    }>;
    hourlyActivity: Array<{
        hour: number;
        count: number;
    }>;
};

const mockLogs: ActivityLog[] = [
    {
        id: "1",
        type: "user",
        action: "login",
        details: "ผู้ใช้เข้าสู่ระบบสำเร็จ",
        userId: "user_1",
        userName: "สมศักดิ์ ใจดี",
        userEmail: "somsak@example.com",
        projectId: "proj_1",
        projectName: "My Village 1",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0...",
        status: "success",
        timestamp: "2025-01-13T11:30:00Z"
    },
    {
        id: "2",
        type: "admin",
        action: "user_created",
        details: "สร้างผู้ใช้ใหม่: admin.new@myvillage.com",
        userId: "admin_1",
        userName: "Admin User",
        userEmail: "admin@myvillage.com",
        projectId: "proj_2",
        projectName: "My Condo",
        status: "success",
        timestamp: "2025-01-13T11:25:00Z",
        metadata: {
            newUserId: "user_456",
            newUserName: "New User",
            role: "admin"
        }
    },
    {
        id: "3",
        type: "security",
        action: "failed_login",
        details: "พยายามเข้าสู่ระบบล้มเหลว 3 ครั้ง",
        userEmail: "unknown@hack.com",
        ipAddress: "192.168.1.200",
        userAgent: "curl/7.68.0",
        status: "error",
        timestamp: "2025-01-13T11:20:00Z",
        metadata: {
            attemptCount: 3,
            lastAttempt: "2025-01-13T11:20:00Z"
        }
    },
    {
        id: "4",
        type: "database",
        action: "backup_completed",
        details: "การสำรองข้อมูลอัตโนมัติสำเร็จ",
        userId: "system",
        userName: "System",
        status: "success",
        timestamp: "2025-01-13T02:00:00Z",
        metadata: {
            backupSize: "1.2 GB",
            filename: "myvillage_backup_2025_01_13_020000.sql"
        }
    },
    {
        id: "5",
        type: "maintenance",
        action: "task_completed",
        details: "แก้ไขแอร์เครื่องที่ 1 เสร็จสิ้น",
        userId: "tech_1",
        userName: "ช่างสมศักดิ์",
        userEmail: "tech@myvillage.com",
        projectId: "proj_1",
        projectName: "My Village 1",
        status: "success",
        timestamp: "2025-01-13T10:30:00Z",
        metadata: {
            taskId: "task_123",
            ticketId: "T001",
            duration: 120
        }
    },
    {
        id: "6",
        type: "system",
        action: "high_memory_usage",
        details: "การใช้งานหน่วยความจำสูง (85%)",
        status: "warning",
        timestamp: "2025-01-13T10:15:00Z",
        metadata: {
            memoryUsage: 85,
            threshold: 80,
            server: "web-server-01"
        }
    },
    {
        id: "7",
        type: "admin",
        action: "permission_changed",
        details: "แก้ไขสิทธิ์ผู้ใช้: user.admin@myvillage.com",
        userId: "admin_1",
        userName: "Admin User",
        userEmail: "admin@myvillage.com",
        status: "success",
        timestamp: "2025-01-13T09:45:00Z",
        metadata: {
            targetUserId: "user_789",
            oldPermissions: ["read"],
            newPermissions: ["read", "write"]
        }
    },
    {
        id: "8",
        type: "user",
        action: "password_reset",
        details: "รีเซ็ตรหัสผ่านสำเร็จ",
        userId: "user_2",
        userName: "วีระ มั่นคง",
        userEmail: "veera@example.com",
        status: "success",
        timestamp: "2025-01-13T09:30:00Z"
    }
];

const mockStats: ActivityStats = {
    totalLogs: 45678,
    todayLogs: 1234,
    errorCount: 45,
    warningCount: 89,
    successCount: 987,
    topUsers: [
        { name: "Admin User", email: "admin@myvillage.com", count: 234 },
        { name: "สมศักดิ์ ใจดี", email: "somsak@example.com", count: 156 },
        { name: "วีระ มั่นคง", email: "veera@example.com", count: 123 },
        { name: "ช่างสมศักดิ์", email: "tech@myvillage.com", count: 98 },
        { name: "สมชาย รักงาน", email: "somchai@example.com", count: 76 }
    ],
    topActions: [
        { action: "login", count: 3456, percentage: 28.4 },
        { action: "logout", count: 2345, percentage: 19.3 },
        { action: "user_created", count: 1234, percentage: 10.1 },
        { action: "permission_changed", count: 876, percentage: 7.2 },
        { action: "backup_completed", count: 654, percentage: 5.4 }
    ],
    hourlyActivity: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: Math.floor(Math.random() * 100) + 20
    }))
};

export default function SuperAdminActivityPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("today");
    const [stats, setStats] = useState<ActivityStats>(mockStats);
    const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setLogs(mockLogs);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "all" || log.type === typeFilter;
        const matchesStatus = statusFilter === "all" || log.status === statusFilter;

        // Simple date filter for demo
        const matchesDate = dateFilter === "all" ||
            (dateFilter === "today" && new Date(log.timestamp).toDateString() === new Date().toDateString());

        return matchesSearch && matchesType && matchesStatus && matchesDate;
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "user": return <User className="w-4 h-4" />;
            case "admin": return <Shield className="w-4 h-4" />;
            case "security": return <Shield className="w-4 h-4" />;
            case "database": return <Database className="w-4 h-4" />;
            case "maintenance": return <Settings className="w-4 h-4" />;
            case "system": return <Activity className="w-4 h-4" />;
            default: return <Activity className="w-4 h-4" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "user": return "ผู้ใช้";
            case "admin": return "ผู้ดูแล";
            case "security": return "ความปลอดภัย";
            case "database": return "ฐานข้อมูล";
            case "maintenance": return "ซ่อมบำรุง";
            case "system": return "ระบบ";
            default: return type;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "success": return "bg-green-100 text-green-800";
            case "warning": return "bg-yellow-100 text-yellow-800";
            case "error": return "bg-red-100 text-red-800";
            case "info": return "bg-blue-100 text-blue-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "success": return <CheckCircle className="w-4 h-4" />;
            case "warning": return <AlertTriangle className="w-4 h-4" />;
            case "error": return <XCircle className="w-4 h-4" />;
            case "info": return <Clock className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const exportLogs = () => {
        // Implement export functionality
        console.log("Exporting activity logs...");
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
                                <p className="text-sm font-medium text-gray-600">บันทึกทั้งหมด</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalLogs.toLocaleString()}</p>
                            </div>
                            <Activity className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">วันนี้</p>
                                <p className="text-2xl font-bold text-green-600">{stats.todayLogs}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">คำเตือน</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.warningCount}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ข้อผิดพลาด</p>
                                <p className="text-2xl font-bold text-red-600">{stats.errorCount}</p>
                            </div>
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">ประวัติกิจกรรม</h1>
                    <p className="text-gray-600">ติดตามและตรวจสอบกิจกรรมทั้งหมดในระบบ</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportLogs}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Logs
                    </Button>
                    <Button variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        รีเฟรช
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
                                    placeholder="ค้นหาจากชื่อผู้ใช้, อีเมล, หรือรายละเอียด..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full lg:w-[150px]">
                                <SelectValue placeholder="ประเภท" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกประเภท</SelectItem>
                                <SelectItem value="user">ผู้ใช้</SelectItem>
                                <SelectItem value="admin">ผู้ดูแล</SelectItem>
                                <SelectItem value="security">ความปลอดภัย</SelectItem>
                                <SelectItem value="database">ฐานข้อมูล</SelectItem>
                                <SelectItem value="maintenance">ซ่อมบำรุง</SelectItem>
                                <SelectItem value="system">ระบบ</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full lg:w-[150px]">
                                <SelectValue placeholder="สถานะ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกสถานะ</SelectItem>
                                <SelectItem value="success">สำเร็จ</SelectItem>
                                <SelectItem value="warning">คำเตือน</SelectItem>
                                <SelectItem value="error">ข้อผิดพลาด</SelectItem>
                                <SelectItem value="info">ข้อมูล</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="w-full lg:w-[150px]">
                                <SelectValue placeholder="วันที่" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกวัน</SelectItem>
                                <SelectItem value="today">วันนี้</SelectItem>
                                <SelectItem value="yesterday">เมื่อวาน</SelectItem>
                                <SelectItem value="week">7 วันล่าสุด</SelectItem>
                                <SelectItem value="month">30 วันล่าสุด</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Activity Logs Table */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        บันทึกกิจกรรม ({filteredLogs.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredLogs.length === 0 ? (
                        <div className="text-center py-12">
                            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                                    ? "ไม่พบบันทึกที่ตรงตามเงื่อนไข"
                                    : "ยังไม่มีบันทึกกิจกรรม"}
                            </h3>
                            <p className="text-gray-600">
                                {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                                    ? "ลองปรับเปลี่ยนเงื่อนไขการค้นหา"
                                    : "กิจกรรมในระบบจะแสดงที่นี่"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ประเภท</TableHead>
                                        <TableHead>การกระทำ</TableHead>
                                        <TableHead>รายละเอียด</TableHead>
                                        <TableHead>ผู้ใช้</TableHead>
                                        <TableHead>โครงการ</TableHead>
                                        <TableHead>สถานะ</TableHead>
                                        <TableHead>วันที่</TableHead>
                                        <TableHead>จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-gray-50">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getTypeIcon(log.type)}
                                                    <span className="text-sm">{getTypeLabel(log.type)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {log.action}
                                            </TableCell>
                                            <TableCell className="max-w-md truncate">
                                                {log.details}
                                            </TableCell>
                                            <TableCell>
                                                {log.userName ? (
                                                    <div>
                                                        <p className="font-medium text-sm">{log.userName}</p>
                                                        {log.userEmail && (
                                                            <p className="text-xs text-gray-500">{log.userEmail}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {log.projectName ? (
                                                    <span className="text-sm">{log.projectName}</span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`flex items-center gap-1 ${getStatusColor(log.status)}`}>
                                                    {getStatusIcon(log.status)}
                                                    {log.status === "success" && "สำเร็จ"}
                                                    {log.status === "warning" && "คำเตือน"}
                                                    {log.status === "error" && "ข้อผิดพลาด"}
                                                    {log.status === "info" && "ข้อมูล"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm">
                                                    {format(new Date(log.timestamp), "d MMM yyyy, HH:mm", { locale: th })}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedLog(log)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Log Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">รายละเอียดกิจกรรม</h3>
                                    <p className="text-gray-600">ID: {selectedLog.id}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedLog(null)}
                                >
                                    ×
                                </Button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">ประเภท</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        {getTypeIcon(selectedLog.type)}
                                        <span>{getTypeLabel(selectedLog.type)}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">การกระทำ</label>
                                    <p className="font-medium">{selectedLog.action}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">ผู้ใช้</label>
                                    <p>{selectedLog.userName || selectedLog.userEmail || "-"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">โครงการ</label>
                                    <p>{selectedLog.projectName || "-"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">IP Address</label>
                                    <p className="font-mono text-sm">{selectedLog.ipAddress || "-"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">สถานะ</label>
                                    <Badge className={getStatusColor(selectedLog.status)}>
                                        {selectedLog.status}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">รายละเอียด</label>
                                <p className="mt-1 text-gray-700">{selectedLog.details}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-500">วันที่และเวลา</label>
                                <p className="mt-1">
                                    {format(new Date(selectedLog.timestamp), "d MMMM yyyy, HH:mm:ss", { locale: th })}
                                </p>
                            </div>

                            {selectedLog.metadata && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">ข้อมูลเพิ่มเติม</label>
                                    <div className="mt-1 bg-gray-50 rounded-lg p-3">
                                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                                            {JSON.stringify(selectedLog.metadata, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {selectedLog.userAgent && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">User Agent</label>
                                    <p className="mt-1 text-sm text-gray-700 break-all">{selectedLog.userAgent}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t flex justify-end">
                            <Button onClick={() => setSelectedLog(null)}>
                                ปิด
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
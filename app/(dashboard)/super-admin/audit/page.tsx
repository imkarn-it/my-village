"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
    Shield,
    Search,
    Filter,
    Download,
    Eye,
    User,
    Settings,
    Activity,
    AlertTriangle,
    Users,
    FileText,
    Database,
    Building,
    Trash2,
    Mail,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

type AuditLog = {
    id: string;
    timestamp: string;
    userId: string;
    userName?: string;
    userEmail?: string;
    userRole: string;
    action: string;
    resource: string;
    resourceId?: string;
    resourceName?: string;
    details: {
        ip?: string;
        userAgent?: string;
        oldValue?: any;
        newValue?: any;
        changes?: string[];
        reason?: string;
    };
    severity: "low" | "medium" | "high" | "critical";
    category: "auth" | "user_management" | "data" | "security" | "system" | "api" | "file";
    status: "success" | "failed" | "warning";
    sessionId?: string;
};

type AuditStats = {
    totalLogs: number;
    todayLogs: number;
    criticalLogs: number;
    failedLogins: number;
    activeUsers: number;
    uniqueIPs: number;
    topActions: { action: string; count: number }[];
    resourceUsage: { resource: string; count: number }[];
};

const mockLogs: AuditLog[] = [
    {
        id: "1",
        timestamp: "2025-01-13T14:30:00Z",
        userId: "user-1",
        userName: "สมชาย ใจดี",
        userEmail: "somchai@example.com",
        userRole: "resident",
        action: "login",
        resource: "auth",
        details: {
            ip: "192.168.1.100",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        severity: "low",
        category: "auth",
        status: "success",
        sessionId: "sess-123",
    },
    {
        id: "2",
        timestamp: "2025-01-13T14:25:00Z",
        userId: "admin-1",
        userName: "ผู้ดูแลระบบ สุริกา",
        userEmail: "admin@myvillage.com",
        userRole: "super_admin",
        action: "delete_user",
        resource: "user",
        resourceId: "user-2",
        resourceName: "สมศรี มั่งคั่ง",
        details: {
            oldValue: {
                name: "สมศรี มั่งคั่ง",
                email: "somsri@example.com",
                role: "resident",
            },
            reason: "ย้ายออกจากการละเมิด",
        },
        severity: "high",
        category: "user_management",
        status: "success",
    },
    {
        id: "3",
        timestamp: "2025-01-13T14:20:00Z",
        userId: "admin-1",
        userName: "ผู้ดูแลระบบ สุริกา",
        userEmail: "admin@myvillage.com",
        userRole: "super_admin",
        action: "system_backup",
        resource: "system",
        details: {
            changes: ["Created backup", "Location: Cloud Storage", "Size: 245.6MB"],
        },
        severity: "medium",
        category: "system",
        status: "success",
    },
    {
        id: "4",
        timestamp: "2025-01-13T14:15:00Z",
        userId: "unknown",
        userRole: "unknown",
        action: "login_failed",
        resource: "auth",
        details: {
            ip: "203.123.45.67",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            reason: "Invalid password",
        },
        severity: "medium",
        category: "security",
        status: "failed",
    },
    {
        id: "5",
        timestamp: "2025-01-13T14:10:00Z",
        userId: "user-3",
        userName: "วิชัย รุ่งเรือง",
        userEmail: "wichai@example.com",
        userRole: "security",
        action: "approve_visitor",
        resource: "visitor",
        resourceId: "visitor-1",
        resourceName: "สมศรี สมใจ",
        details: {
            newValue: {
                name: "สมศรี สมใจ",
                purpose: "เยี่ยม",
                status: "approved",
            },
        },
        severity: "low",
        category: "data",
        status: "success",
    },
    {
        id: "6",
        timestamp: "2025-01-13T14:05:00Z",
        userId: "user-4",
        userName: "ช่าง สมชาย",
        userEmail: "mechanic@example.com",
        userRole: "maintenance",
        action: "update_maintenance_request",
        resource: "maintenance_request",
        resourceId: "mr-1",
        resourceName: "ซ่อมแอร์แอร์ห้อง A-101",
        details: {
            oldValue: {
                status: "pending",
                priority: "medium",
            },
            newValue: {
                status: "in_progress",
                priority: "high",
            },
            changes: ["Status changed from pending to in_progress", "Priority changed from medium to high"],
        },
        severity: "low",
        category: "data",
        status: "success",
    },
    {
        id: "7",
        timestamp: "2025-01-13T14:00:00Z",
        userId: "admin-2",
        userName: "ผู้จัดการนิติบุคคล",
        userEmail: "manager@example.com",
        userRole: "admin",
        action: "send_announcement",
        resource: "announcement",
        resourceId: "ann-1",
        resourceName: "ประกาศปิดระบบ",
        details: {
            newValue: {
                title: "ปิดปรับปรับระบบชั่วคราว",
                message: "ระบบจะปิดปรับปรับในเวลา 22:00-23:00",
                type: "maintenance",
            },
        },
        severity: "medium",
        category: "system",
        status: "success",
    },
];

const mockStats: AuditStats = {
    totalLogs: 1234,
    todayLogs: 87,
    criticalLogs: 3,
    failedLogins: 12,
    activeUsers: 156,
    uniqueIPs: 45,
    topActions: [
        { action: "login", count: 234 },
        { action: "login_failed", count: 67 },
        { action: "create", count: 45 },
        { action: "update", count: 38 },
        { action: "delete", count: 23 },
    ],
    resourceUsage: [
        { resource: "user", count: 156 },
        { resource: "auth", count: 134 },
        { resource: "announcement", count: 45 },
        { resource: "maintenance_request", count: 38 },
        { resource: "visitor", count: 28 },
    ],
};

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [stats, setStats] = useState<AuditStats>(mockStats);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedSeverity, setSelectedSeverity] = useState("all");
    const [selectedDateRange, setSelectedDateRange] = useState("today");
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            // TODO: Implement audit API when available
            // For now, use mock data
            await new Promise(resolve => setTimeout(resolve, 300));
            setLogs(mockLogs);
        } catch (error) {
            // Fallback to mock data
            setLogs(mockLogs);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter((log) => {
        const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.resource?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.resourceName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === "all" || log.category === selectedCategory;
        const matchesSeverity = selectedSeverity === "all" || log.severity === selectedSeverity;

        let matchesDate = true;
        const now = new Date();
        const logDate = new Date(log.timestamp);

        if (selectedDateRange === "today") {
            matchesDate = logDate.toDateString() === now.toDateString();
        } else if (selectedDateRange === "week") {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = logDate >= weekAgo;
        } else if (selectedDateRange === "month") {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = logDate >= monthAgo;
        }

        return matchesSearch && matchesCategory && matchesSeverity && matchesDate;
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "critical": return "bg-red-100 text-red-800";
            case "high": return "bg-orange-100 text-orange-800";
            case "medium": return "bg-yellow-100 text-yellow-800";
            case "low": return "bg-green-100 text-green-800";
            default: return "bg-slate-100 dark:bg-slate-800 text-gray-800";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "success": return <CheckCircle className="w-4 h-4 text-green-600" />;
            case "failed": return <AlertCircle className="w-4 h-4 text-red-600" />;
            case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
            default: return null;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "auth": return <User className="w-4 h-4" />;
            case "user_management": return <Users className="w-4 h-4" />;
            case "data": return <Database className="w-4 h-4" />;
            case "security": return <Shield className="w-4 h-4" />;
            case "system": return <Settings className="w-4 h-4" />;
            case "api": return <Activity className="w-4 h-4" />;
            case "file": return <FileText className="w-4 h-4" />;
            default: return <Activity className="w-4 h-4" />;
        }
    };

    const exportToPDF = () => {
        const pdf = new jsPDF();
        pdf.setFont("helvetica");

        // Title
        pdf.setFontSize(20);
        pdf.text("Audit Logs Report", 20, 20);

        // Date range
        pdf.setFontSize(12);
        pdf.text(`Generated: ${format(new Date(), "PPP", { locale: th })}`, 20, 35);
        pdf.text(`Period: ${selectedDateRange === "today" ? "วันนี้" : selectedDateRange === "week" ? "7 วัน" : "30 วัน"}`, 20, 45);

        // Stats
        pdf.setFontSize(16);
        pdf.text("Statistics", 20, 60);
        pdf.setFontSize(11);

        let yPosition = 70;
        const statItems = [
            [`Total Logs: ${stats.totalLogs}`],
            [`Today: ${stats.todayLogs}`],
            [`Critical: ${stats.criticalLogs}`],
            [`Failed Logins: ${stats.failedLogins}`],
        ];

        statItems.forEach((item) => {
            pdf.text(item[0], 30, yPosition);
            yPosition += 10;
        });

        // Logs table
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.text("Audit Logs", 20, 20);

        const tableData = filteredLogs.map(log => [
            format(new Date(log.timestamp), "dd/MM/yyyy HH:mm", { locale: th }),
            log.userName || "Unknown",
            log.action,
            log.resource,
            log.severity,
            log.status,
        ]);

        (pdf as any).autoTable({
            head: [["Timestamp", "User", "Action", "Resource", "Severity", "Status"]],
            body: tableData,
            startY: 30,
            theme: "grid",
            styles: { font: "helvetica", fontSize: 10 },
            headStyles: { fillColor: [59, 130, 246] }
        });

        // Save the PDF
        pdf.save(`audit-logs-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    };

    const handleClearLogs = async () => {
        if (!confirm("คุณต้องการลบ logs ทั้งหมดใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้")) {
            return;
        }

        try {
            // TODO: Implement audit clear API when available
            // Mock implementation
            console.log("Clearing audit logs");
            await new Promise(resolve => setTimeout(resolve, 500));
            toast.success("ลบ logs สำเร็จแล้ว");
            fetchLogs();
        } catch (err) {
            toast.error("เกิดข้อผิดพลาดในการลบ logs");
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card className="animate-pulse">
                    <CardHeader>
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
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
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">บันทึกกิจกรรมระบบ</h1>
                    <p className="text-slate-600 dark:text-slate-400">ติดตามการกระทำทั้งหมดในระบบ</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportToPDF}>
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                    </Button>
                    <Button variant="outline" onClick={handleClearLogs}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        ลบ Logs
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Logs ทั้งหมด</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalLogs.toLocaleString('th-TH')}</p>
                            </div>
                            <Activity className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">วันนี้</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.todayLogs}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">วิกฉุนร้ายแรง</p>
                                <p className="text-2xl font-bold text-red-600">{stats.criticalLogs}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ล็อกอินผิด</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.failedLogins}</p>
                            </div>
                            <Shield className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ผู้ใช้ที่ใช้งาน</p>
                                <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                            </div>
                            <Users className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">IP ที่ไม่ซ้ำกัน</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.uniqueIPs}</p>
                            </div>
                            <Database className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="ค้นหา User, Action, Resource..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="หมวดหมู่" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                <SelectItem value="auth">การยืนยันตัว</SelectItem>
                                <SelectItem value="user_management">จัดการผู้ใช้</SelectItem>
                                <SelectItem value="data">ข้อมูล</SelectItem>
                                <SelectItem value="security">ความปลอดภัย</SelectItem>
                                <SelectItem value="system">ระบบ</SelectItem>
                                <SelectItem value="api">API</SelectItem>
                                <SelectItem value="file">ไฟล์</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ระดับความรุนแรงทั้งหมด</SelectItem>
                                <SelectItem value="critical">วิกฉุนร้ายแรง</SelectItem>
                                <SelectItem value="high">สูง</SelectItem>
                                <SelectItem value="medium">ปานกลาง</SelectItem>
                                <SelectItem value="low">ต่ำ</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">วันนี้</SelectItem>
                                <SelectItem value="week">7 วัน</SelectItem>
                                <SelectItem value="month">30 วัน</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            บันทึกกิจกรรม ({filteredLogs.length})
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredLogs.length === 0 ? (
                        <div className="text-center py-12">
                            <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">ไม่มีบันทึกกิจกรรม</h3>
                            <p className="text-slate-600 dark:text-slate-400">
                                {searchTerm || selectedCategory !== "all" || selectedSeverity !== "all"
                                    ? "ไม่พบบันทึกที่ตรงตามเงื่อนไข"
                                    : "ยังไม่มีกิจกรรมที่บันทึกไว้"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>วันที่/เวลา</TableHead>
                                        <TableHead>ผู้ใช้</TableHead>
                                        <TableHead>การกระทำ</TableHead>
                                        <TableHead>ทรัพยากร</TableHead>
                                        <TableHead>ระดับ</TableHead>
                                        <TableHead>สถานะ</TableHead>
                                        <TableHead>ดู</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.map((log) => (
                                        <TableRow key={log.id} className="hover:bg-slate-50 dark:bg-slate-800/50">
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm", { locale: th })}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {log.details.ip && `IP: ${log.details.ip}`}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm font-medium">{log.userName || "Unknown"}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{log.userRole}</p>
                                                    {log.userEmail && (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{log.userEmail}</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getCategoryIcon(log.category)}
                                                    <span className="text-sm">{log.action}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm font-medium">{log.resource}</p>
                                                    {log.resourceName && (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                                                            {log.resourceName}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getSeverityColor(log.severity)}>
                                                    {log.severity === "critical" ? "วิกฉุนร้ายแรง" :
                                                        log.severity === "high" ? "สูง" :
                                                            log.severity === "medium" ? "ปานกลาง" :
                                                                log.severity === "low" ? "ต่ำ" : log.severity}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(log.status)}
                                                    <span className={
                                                        log.status === "success" ? "text-green-600" :
                                                            log.status === "failed" ? "text-red-600" :
                                                                log.status === "warning" ? "text-yellow-600" : "text-slate-600 dark:text-slate-400"
                                                    }>
                                                        {log.status === "success" ? "สำเร็จ" :
                                                            log.status === "failed" ? "ล้มเหลว" :
                                                                log.status === "warning" ? "คำเตือน" : log.status}
                                                    </span>
                                                </div>
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

            {/* Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>การกระทำยอดนิยม</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.topActions.slice(0, 5).map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm">{item.action}</span>
                                    <Badge variant="outline">{item.count}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Resource Usage */}
                <Card>
                    <CardHeader>
                        <CardTitle>การใช้งานทรัพยากร</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {stats.resourceUsage.slice(0, 5).map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm">{item.resource}</span>
                                    <Badge variant="outline">{item.count}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Log Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">รายละเอียดบันทึก</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedLog(null)}
                                >
                                    ✕
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">วันที่/เวลา</p>
                                        <p className="text-sm">
                                            {format(new Date(selectedLog.timestamp), "PPP pp", { locale: th })}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">ผู้ใช้</p>
                                        <p className="text-sm">
                                            {selectedLog.userName} ({selectedLog.userRole})
                                        </p>
                                        {selectedLog.userEmail && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{selectedLog.userEmail}</p>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">การกระทำ</p>
                                        <p className="text-sm">{selectedLog.action}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">ทรัพยากร</p>
                                        <p className="text-sm">{selectedLog.resource}</p>
                                        {selectedLog.resourceName && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{selectedLog.resourceName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">ระดับความรุนแรง</p>
                                        <Badge className={getSeverityColor(selectedLog.severity)}>
                                            {selectedLog.severity === "critical" ? "วิกฉุนร้ายแรง" :
                                                selectedLog.severity === "high" ? "สูง" :
                                                    selectedLog.severity === "medium" ? "ปานกลาง" :
                                                        selectedLog.severity === "low" ? "ต่ำ" : selectedLog.severity}
                                        </Badge>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">สถานะ</p>
                                        <Badge variant="outline">
                                            {selectedLog.status === "success" ? "สำเร็จ" :
                                                selectedLog.status === "failed" ? "ล้มเหลว" :
                                                    selectedLog.status === "warning" ? "คำเตือน" : selectedLog.status}
                                        </Badge>
                                    </div>
                                </div>

                                {selectedLog.details.ip && (
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">ข้อมูลเพิ่มเติม</p>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-sm space-y-1">
                                            {selectedLog.details.ip && (
                                                <p><span className="font-medium">IP Address:</span> {selectedLog.details.ip}</p>
                                            )}
                                            {selectedLog.details.userAgent && (
                                                <p><span className="font-medium">User Agent:</span> {selectedLog.details.userAgent}</p>
                                            )}
                                            {selectedLog.details.reason && (
                                                <p><span className="font-medium">เหตุผล:</span> {selectedLog.details.reason}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedLog.details.changes && (
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">การเปลี่ยนแปลง</p>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                                            {selectedLog.details.changes.map((change, index) => (
                                                <p key={index} className="text-sm">• {change}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {(selectedLog.details.oldValue || selectedLog.details.newValue) && (
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">การเปลี่ยนแปลง</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedLog.details.oldValue && (
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">ค่าเก่า:</p>
                                                    <pre className="bg-slate-50 dark:bg-slate-800/50 rounded p-2 text-xs overflow-x-auto">
                                                        {JSON.stringify(selectedLog.details.oldValue, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                            {selectedLog.details.newValue && (
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">ค่าใหม่:</p>
                                                    <pre className="bg-slate-50 dark:bg-slate-800/50 rounded p-2 text-xs overflow-x-auto">
                                                        {JSON.stringify(selectedLog.details.newValue, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Edit,
    Trash2,
    Users,
    Building2,
    MapPin,
    Calendar,
    TrendingUp,
    Activity,
    Database,
    Settings,
    MoreHorizontal,
    BarChart3,
    PieChart,
    Download,
    Shield,
    AlertTriangle,
    CheckCircle,
    Clock,
    RefreshCw,
    Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { Project, User } from "@/types";

// Extended Project type for UI purposes
type ExtendedProject = Project & {
    status: string;
    description: string;
    totalUnits: number;
    occupiedUnits: number;
    adminEmail: string;
    adminPhone: string;
    subscriptionStatus: string;
    subscriptionExpiry: string;
    storageUsed: number;
    storageLimit: number;
    monthlyCost: number;
    setupComplete: boolean;
    domain?: string;
};

// Sample data
const project: ExtendedProject = {
    id: "1",
    name: "My Village Phase 1",
    type: "village",
    address: "123 ถนนสุขุมานี แขวงคลองเต็น เขตคลองเต็น กรุงเทพมหานคร",
    domain: "village1.myvillage.app",
    logo: null,
    settings: null,
    createdAt: new Date("2024-01-15T00:00:00Z"),
    updatedAt: new Date("2025-01-15T00:00:00Z"),
    status: "active",
    description: "หมู่บ้านจัดสรร ระดับพรีเมียม บนทำเลใจทองกลางกรุงเทพมหานคร",
    totalUnits: 150,
    occupiedUnits: 125,
    adminEmail: "admin@village1.com",
    adminPhone: "02-123-4567",
    subscriptionStatus: "active",
    subscriptionExpiry: "2025-12-31T00:00:00Z",
    storageUsed: 8.5,
    storageLimit: 20,
    monthlyCost: 15000,
    setupComplete: true,
};

const projectStats = {
    totalUsers: 280,
    activeUsers: 265,
    totalAnnouncements: 45,
    totalParcels: 234,
    totalVisitors: 1250,
    totalMaintenanceRequests: 89,
    totalBills: 1250,
    totalBillsPaid: 1100,
    totalBillsPending: 120,
    totalBillsOverdue: 30,
    monthlyRevenue: 2500000,
    monthlyGrowth: 5.2,
    userGrowth: 3.8,
};

const recentActivities = [
    {
        id: "1",
        type: "user_registered",
        description: "ผู้ใช้ใหม่ลงทะเบียน: สมชาย ใจดี (A/101)",
        timestamp: "2025-01-15T10:30:00Z",
        icon: Users,
    },
    {
        id: "2",
        type: "announcement_created",
        description: "ประกาศใหม่: ปิดปรับปรุงระบบน้ำ วันที่ 20 มกราคม",
        timestamp: "2025-01-15T09:15:00Z",
        icon: AlertTriangle,
    },
    {
        id: "3",
        type: "maintenance_completed",
        description: "แจ้งซ่อมเสร็จสิ้น: แอร์ห้องนอน D/205",
        timestamp: "2025-01-14T16:45:00Z",
        icon: CheckCircle,
    },
    {
        id: "4",
        type: "payment_received",
        description: "รับชำระเงิน: บิลน้ำประจำเดือนมกราคม - คุณสมศรี",
        timestamp: "2025-01-14T14:20:00Z",
        icon: TrendingUp,
    },
];

const topUsers: (User & { unitNumber: string; lastActive: string; lastLogin?: string })[] = [
    {
        id: "1",
        email: "john@village1.com",
        password: null,
        name: "จอห์น สมิธ",
        role: "admin",
        unitNumber: "A/101",
        lastActive: "2 นาทีที่แล้ว",
        isActive: true,
        lastLogin: "2025-01-15T08:30:00Z",
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-15T08:30:00Z"),
        projectId: "1",
        phone: null,
        avatar: null,
        unitId: null,
    },
    {
        id: "2",
        email: "jane@village1.com",
        password: null,
        name: "เจน ดอว์",
        role: "resident",
        unitNumber: "B/205",
        lastActive: "10 นาทีที่แล้ว",
        isActive: true,
        lastLogin: "2025-01-14T19:20:00Z",
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-14T19:20:00Z"),
        projectId: "1",
        phone: null,
        avatar: null,
        unitId: "1",
    },
];

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showArchiveDialog, setShowArchiveDialog] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800";
            case "inactive":
                return "bg-gray-100 text-gray-800";
            case "maintenance":
                return "bg-yellow-100 text-yellow-800";
            case "archived":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "active":
                return "ใช้งานอยู่";
            case "inactive":
                return "ไม่ใช้งาน";
            case "maintenance":
                return "กำลังปรับปรุง";
            case "archived":
                return "ถูกเก็บไว้";
            default:
                return status;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleDeleteProject = () => {
        // In real app, call API to delete project
        console.log("Deleting project:", projectId);
        setShowDeleteDialog(false);
        router.push("/super-admin/projects");
    };

    const handleArchiveProject = () => {
        // In real app, call API to archive project
        console.log("Archiving project:", projectId);
        setShowArchiveDialog(false);
    };

    const handleRefreshStats = async () => {
        setIsRefreshing(true);
        try {
            // In real app, call API to refresh stats
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error("Failed to refresh stats:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const exportData = () => {
        // In real app, generate and download export
        const data = {
            project: project.name,
            stats: projectStats,
            exportDate: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `project-${projectId}-export.json`;
        a.click();
    };

    const occupancyRate = (project.occupiedUnits / project.totalUnits) * 100;
    const storagePercentage = ((project.storageUsed || 0) / (project.storageLimit || 1)) * 100;
    const billPaymentRate = (projectStats.totalBillsPaid / projectStats.totalBills) * 100;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/super-admin/projects">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            กลับ
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(project.status)}>
                                {getStatusText(project.status)}
                            </Badge>
                            <span className="text-sm text-gray-500">ID: {projectId}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleRefreshStats} disabled={isRefreshing}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                        รีเฟรช
                    </Button>
                    <Button variant="outline" onClick={exportData}>
                        <Download className="h-4 w-4 mr-2" />
                        ส่งออกข้อมูล
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/super-admin/projects/${projectId}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    แก้ไขโครงการ
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/super-admin/settings?project=${projectId}`}>
                                    <Settings className="h-4 w-4 mr-2" />
                                    ตั้งค่าโครงการ
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setShowArchiveDialog(true)}
                                disabled={project.status === "archived"}
                            >
                                <Archive className="h-4 w-4 mr-2" />
                                เก็บโครงการ
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setShowDeleteDialog(true)}
                                className="text-red-600"
                                disabled={project.status === "archived"}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                ลบโครงการ
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Main Info */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        ข้อมูลทั่วไป
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <p className="text-sm text-gray-600">ประเภท</p>
                            <p className="font-medium capitalize">{project.type}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">โดเมน</p>
                            <p className="font-medium">{project.domain}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">สร้างเมื่อ</p>
                            <p className="font-medium">{formatDate(project.createdAt?.toISOString() || "")}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">สถานะการตั้งค่า</p>
                            <div className="flex items-center gap-2">
                                {project.setupComplete ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-sm font-medium text-green-600">เสร็จสมบูรณ์</span>
                                    </>
                                ) : (
                                    <>
                                        <Clock className="h-4 w-4 text-yellow-500" />
                                        <span className="text-sm font-medium text-yellow-600">กำลังดำเนินการ</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm text-gray-600">ที่อยู่</p>
                        <p className="font-medium">{project.address}</p>
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">คำอธิบาย</p>
                        <p className="mt-1">{project.description}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
                    <TabsTrigger value="users">ผู้ใช้</TabsTrigger>
                    <TabsTrigger value="statistics">สถิติ</TabsTrigger>
                    <TabsTrigger value="activity">กิจกรรม</TabsTrigger>
                    <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">ยูนิตทั้งหมด</p>
                                        <p className="text-2xl font-bold">{project.totalUnits}</p>
                                        <p className="text-xs text-gray-500">
                                            {project.occupiedUnits} ยูนิตใช้งาน ({occupancyRate.toFixed(1)}%)
                                        </p>
                                    </div>
                                    <Building2 className="h-8 w-8 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">ผู้ใช้ทั้งหมด</p>
                                        <p className="text-2xl font-bold">{projectStats.totalUsers}</p>
                                        <p className="text-xs text-gray-500">
                                            {projectStats.activeUsers} ใช้งานอยู่
                                        </p>
                                    </div>
                                    <Users className="h-8 w-8 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">พื้นที่จัดเก็บ</p>
                                        <p className="text-2xl font-bold">
                                            {project.storageUsed}/{project.storageLimit} GB
                                        </p>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{ width: `${storagePercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                    <Database className="h-8 w-8 text-orange-500" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">ค่าใช้จ่าย/เดือน</p>
                                        <p className="text-2xl font-bold">฿{project.monthlyCost?.toLocaleString()}</p>
                                        <p className="text-xs text-green-600">
                                            รายได้ ฿{projectStats.monthlyRevenue.toLocaleString()}
                                        </p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-purple-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Progress Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">อัตราการเข้าพัก</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm">ยูนิตที่เข้าพัก</span>
                                        <span className="text-sm font-medium">{occupancyRate.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-blue-500 h-3 rounded-full"
                                            style={{ width: `${occupancyRate}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>{project.occupiedUnits} ยูนิต</span>
                                        <span>{project.totalUnits - project.occupiedUnits} ยูนิตว่าง</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">สถานะการชำระเงินบิล</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm">บิลที่ชำระแล้ว</span>
                                        <span className="text-sm font-medium">{billPaymentRate.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-green-500 h-3 rounded-full"
                                            style={{ width: `${billPaymentRate}%` }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="text-center">
                                            <p className="text-green-600 font-medium">{projectStats.totalBillsPaid}</p>
                                            <p className="text-gray-500">ชำระแล้ว</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-yellow-600 font-medium">{projectStats.totalBillsPending}</p>
                                            <p className="text-gray-500">รอชำระ</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-red-600 font-medium">{projectStats.totalBillsOverdue}</p>
                                            <p className="text-gray-500">ค้างชำระ</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Subscription Info */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                ข้อมูลการสมัครใช้งาน
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">สถานะการสมัคร</p>
                                    <Badge className={project.subscriptionStatus === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                        {project.subscriptionStatus === "active" ? "ใช้งานอยู่" : "หมดอายุ"}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">หมดอายุวันที่</p>
                                    <p className="font-medium">{formatDate(project.subscriptionExpiry || "")}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">ผู้ดูแลโครงการ</p>
                                    <p className="font-medium">{project.adminEmail}</p>
                                    <p className="text-sm text-gray-500">{project.adminPhone}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="users" className="space-y-6">
                    {/* Users Summary */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>ผู้ใช้ล่าสุด</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ชื่อผู้ใช้</TableHead>
                                        <TableHead>อีเมล</TableHead>
                                        <TableHead>บทบาท</TableHead>
                                        <TableHead>หน่วยที่พัก</TableHead>
                                        <TableHead>ใช้งานล่าสุด</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge className={user.role === "admin" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{user.unitNumber}</TableCell>
                                            <TableCell>{user.lastActive}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="mt-4 text-center">
                                <Button variant="outline" asChild>
                                    <Link href={`/super-admin/users?project=${projectId}`}>
                                        ดูผู้ใช้ทั้งหมด
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="statistics" className="space-y-6">
                    {/* Charts and detailed statistics */}
                    <Alert>
                        <BarChart3 className="h-4 w-4" />
                        <AlertDescription>
                            รายงานและกราฟระบบสถิติจะพร้อมใช้งานในเร็ว ๆ นี้
                        </AlertDescription>
                    </Alert>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                    {/* Recent Activities */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                กิจกรรมล่าสุด
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <activity.icon className="h-4 w-4 text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm">{activity.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatDateTime(activity.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    {/* Project Settings */}
                    <Alert>
                        <Settings className="h-4 w-4" />
                        <AlertDescription>
                            สามารถตั้งค่ารายละเอียดของโครงการได้ในหน้าตั้งค่าระบบ
                        </AlertDescription>
                    </Alert>
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>ลบโครงการ</DialogTitle>
                        <DialogDescription>
                            คุณแน่ใจหรือไม่ว่าต้องการลบโครงการ "{project.name}"?
                            <br />
                            <strong>คำเตือน:</strong> การลบโครงการจะลบข้อมูลทั้งหมดและไม่สามารถกู้คืนได้
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            ยกเลิก
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteProject}>
                            ลบโครงการ
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Archive Confirmation Dialog */}
            <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>เก็บโครงการไว้</DialogTitle>
                        <DialogDescription>
                            คุณแน่ใจหรือไม่ว่าต้องการเก็บโครงการ "{project.name}" ไว้?
                            <br />
                            โครงการจะถูกระงับการใช้งานชั่วคราว แต่ข้อมูลจะยังคงอยู่
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
                            ยกเลิก
                        </Button>
                        <Button onClick={handleArchiveProject}>
                            เก็บโครงการ
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
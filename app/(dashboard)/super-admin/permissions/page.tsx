"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Shield,
    Users,
    Key,
    Eye,
    Edit,
    Trash2,
    Plus,
    Lock,
    Unlock,
    UserCheck,
    AlertTriangle,
    CheckCircle,
    Clock,
    MoreHorizontal,
    RefreshCw,
    XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { User } from "@/types";

// Sample data
const users: (User & { projectName: string; lastActive: string; lastLogin?: string; permissions?: string[] })[] = [
    {
        id: "1",
        email: "john.smith@village1.com",
        password: null,
        name: "จอห์น สมิธ",
        role: "admin",
        projectName: "My Village 1",
        isActive: true,
        lastLogin: "2025-01-15T08:30:00Z",
        lastActive: "2 นาทีที่แล้ว",
        permissions: ["read", "write", "delete"],
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-15T08:30:00Z"),
        projectId: "1",
        phone: null,
        avatar: null,
        unitId: null,
        deletedAt: null,
        deletedBy: null,
    },
    {
        id: "2",
        email: "jane.doe@village1.com",
        password: null,
        name: "เจน ดอว์",
        role: "resident",
        projectName: "My Village 1",
        isActive: true,
        lastLogin: "2025-01-14T19:20:00Z",
        lastActive: "1 ชั่วโมงที่แล้ว",
        permissions: ["read"],
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-14T19:20:00Z"),
        projectId: "1",
        phone: null,
        avatar: null,
        unitId: "1",
        deletedAt: null,
        deletedBy: null,
    },
    {
        id: "3",
        email: "mike.wilson@village2.com",
        password: null,
        name: "ไมค์ วิลสัน",
        role: "admin",
        projectName: "Hillside Condo",
        isActive: false,
        lastLogin: "2025-01-10T14:15:00Z",
        lastActive: "5 วันที่แล้ว",
        permissions: ["read", "write"],
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-10T14:15:00Z"),
        projectId: "2",
        phone: null,
        avatar: null,
        unitId: null,
        deletedAt: null,
        deletedBy: null,
    },
    {
        id: "4",
        email: "sarah.johnson@village2.com",
        password: null,
        name: "ซาราห์ จอห์นสัน",
        role: "security",
        projectName: "Hillside Condo",
        isActive: true,
        lastLogin: "2025-01-15T07:00:00Z",
        lastActive: "ตอนนี้",
        permissions: ["read", "write"],
        createdAt: new Date("2025-01-01T00:00:00Z"),
        updatedAt: new Date("2025-01-15T07:00:00Z"),
        projectId: "2",
        phone: null,
        avatar: null,
        unitId: null,
        deletedAt: null,
        deletedBy: null,
    },
];

const roles = [
    {
        name: "super_admin",
        label: "Super Admin",
        description: "สิทธิ์การเข้าถึงระดับสูงสุด - จัดการระบบทั้งหมด",
        permissions: ["read", "write", "delete", "manage_users", "manage_projects", "system_settings"],
        color: "bg-purple-100 text-purple-800",
    },
    {
        name: "admin",
        label: "Admin",
        description: "ผู้จัดการโครงการ - จัดการลูกบ้านและการดำเนินงานทั้งหมด",
        permissions: ["read", "write", "delete", "manage_residents", "manage_facilities"],
        color: "bg-blue-100 text-blue-800",
    },
    {
        name: "maintenance",
        label: "Maintenance",
        description: "ช่างซ่อมบำรุง - จัดการและแก้ไขปัญหาการใช้งาน",
        permissions: ["read", "write", "manage_maintenance"],
        color: "bg-orange-100 text-orange-800",
    },
    {
        name: "security",
        label: "Security",
        description: "รักษาความปลอดภัย - จัดการผู้มาติดต่อและความปลอดภัย",
        permissions: ["read", "write", "manage_visitors", "manage_sos"],
        color: "bg-green-100 text-green-800",
    },
    {
        name: "resident",
        label: "Resident",
        description: "ลูกบ้าน - ใช้งานระบบสำหรับลูกบ้าน",
        permissions: ["read"],
        color: "bg-slate-100 dark:bg-slate-800 text-gray-800",
    },
];

export default function SuperAdminPermissionsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);
    const [activeTab, setActiveTab] = useState("users");

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.projectName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesStatus = statusFilter === "all" ||
            (statusFilter === "active" && user.isActive) ||
            (statusFilter === "inactive" && !user.isActive);
        return matchesSearch && matchesRole && matchesStatus;
    });

    const getRoleColor = (role: string) => {
        const roleConfig = roles.find(r => r.name === role);
        return roleConfig?.color || "bg-slate-100 dark:bg-slate-800 text-gray-800";
    };

    const getRoleLabel = (role: string) => {
        const roleConfig = roles.find(r => r.name === role);
        return roleConfig?.label || role;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleResetPassword = (user: typeof users[0]) => {
        setSelectedUser(user);
        setShowResetDialog(true);
    };

    const confirmResetPassword = async () => {
        if (!selectedUser) return;

        try {
            // In real app, call API to reset password
            console.log(`Resetting password for user: ${selectedUser.id}`);
            setShowResetDialog(false);
            setSelectedUser(null);
        } catch (error) {
            console.error("Failed to reset password:", error);
        }
    };

    const handleToggleStatus = async (user: typeof users[0]) => {
        try {
            // In real app, call API to toggle user status
            console.log(`Toggling status for user: ${user.id}, active: ${!user.isActive}`);
        } catch (error) {
            console.error("Failed to toggle user status:", error);
        }
    };

    const calculatePermissionStats = () => {
        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.isActive).length;
        const superAdmins = users.filter(u => u.role === "super_admin").length;
        const admins = users.filter(u => u.role === "admin").length;

        return {
            totalUsers,
            activeUsers,
            inactiveUsers: totalUsers - activeUsers,
            superAdmins,
            admins,
            others: totalUsers - superAdmins - admins,
        };
    };

    const stats = calculatePermissionStats();

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">การจัดการสิทธิ์การเข้าถึง</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">จัดการผู้ใช้และสิทธิ์การเข้าถึงระบบ</p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มผู้ใช้
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ผู้ใช้ทั้งหมด</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ใช้งานอยู่</p>
                                <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                            </div>
                            <UserCheck className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Super Admin</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.superAdmins}</p>
                            </div>
                            <Shield className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Admin</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.admins}</p>
                            </div>
                            <Key className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ระงับอยู่</p>
                                <p className="text-2xl font-bold text-red-600">{stats.inactiveUsers}</p>
                            </div>
                            <Lock className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="users">ผู้ใช้และสิทธิ์</TabsTrigger>
                    <TabsTrigger value="roles">บทบาทและสิทธิ์</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    {/* Filters */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="ค้นหาชื่อ อีเมล หรือโครงการ..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="w-full md:w-40">
                                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="บทบาท" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">ทุกบทบาท</SelectItem>
                                            <SelectItem value="super_admin">Super Admin</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="security">Security</SelectItem>
                                            <SelectItem value="resident">Resident</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-full md:w-40">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="สถานะ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">ทุกสถานะ</SelectItem>
                                            <SelectItem value="active">ใช้งานอยู่</SelectItem>
                                            <SelectItem value="inactive">ระงับอยู่</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Users Table */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>รายการผู้ใช้</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ผู้ใช้</TableHead>
                                        <TableHead>บทบาท</TableHead>
                                        <TableHead>โครงการ</TableHead>
                                        <TableHead>สถานะ</TableHead>
                                        <TableHead>ใช้งานล่าสุด</TableHead>
                                        <TableHead>กิจกรรมล่าสุด</TableHead>
                                        <TableHead className="w-[100px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{user.name || "-"}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getRoleColor(user.role)}>
                                                    {getRoleLabel(user.role)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{user.projectName}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {user.isActive ? (
                                                        <>
                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                            <span className="text-sm">ใช้งานอยู่</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-4 w-4 text-red-500" />
                                                            <span className="text-sm">ระงับอยู่</span>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {user.lastLogin ? formatDate(user.lastLogin) : "-"}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                                                    <Clock className="h-3 w-3" />
                                                    {user.lastActive}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            ดูรายละเอียด
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            แก้ไขข้อมูล
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleResetPassword(user)}
                                                        >
                                                            <Key className="h-4 w-4 mr-2" />
                                                            รีเซ็ตรหัสผ่าน
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleToggleStatus(user)}
                                                            className={user.isActive ? "text-red-600" : "text-green-600"}
                                                        >
                                                            {user.isActive ? (
                                                                <>
                                                                    <Lock className="h-4 w-4 mr-2" />
                                                                    ระงับผู้ใช้
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Unlock className="h-4 w-4 mr-2" />
                                                                    เปิดใช้งาน
                                                                </>
                                                            )}
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
                </TabsContent>

                <TabsContent value="roles" className="space-y-4">
                    {/* Roles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {roles.map((role) => (
                            <Card key={role.name} className="relative overflow-hidden">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{role.label}</CardTitle>
                                        <Badge className={role.color}>{role.name}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{role.description}</p>

                                    <div>
                                        <p className="text-sm font-medium mb-2">สิทธิ์การเข้าถึง:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {role.permissions.map((perm) => (
                                                <Badge key={perm} variant="outline" className="text-xs">
                                                    {perm}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            {users.filter(u => u.role === role.name).length} ผู้ใช้
                                        </span>
                                        <Button variant="outline" size="sm">
                                            <Edit className="h-3 w-3 mr-1" />
                                            แก้ไข
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Permission Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                การตั้งค่าสิทธิ์ทั่วไป
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    การเปลี่ยนแปลงสิทธิ์การเข้าถึงอาจส่งผลกระทบต่อผู้ใช้ทั้งระบบ
                                    กรุณาตรวจสอบให้แน่ใจก่อนทำการเปลี่ยนแปลง
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">การลงทะเบียนผู้ใช้ใหม่</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            อนุญาตให้สร้างผู้ใช้ใหม่โดยไม่ต้องอนุมัติ
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        แก้ไข
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">การรีเซ็ตรหัสผ่านด้วยตนเอง</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            อนุญาตให้ผู้ใช้รีเซ็ตรหัสผ่านได้ด้วยตนเอง
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        แก้ไข
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">ระยะเวลาเซสชัน</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            อัตโนมัติออกจากระบบหลังไม่มีการใช้งาน 30 วัน
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        แก้ไข
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">การเข้าถึง API</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            จำกัดการเรียกใช้ API 1000 ครั้งต่อชั่วโมงต่อผู้ใช้
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        แก้ไข
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Reset Password Dialog */}
            <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>รีเซ็ตรหัสผ่าน</DialogTitle>
                        <DialogDescription>
                            คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตรหัสผ่านสำหรับ {selectedUser?.name}?
                            <br />
                            ระบบจะสร้างรหัสผ่านชั่วคราวและส่งไปยังอีเมลของผู้ใช้
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                            ยกเลิก
                        </Button>
                        <Button onClick={confirmResetPassword}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            รีเซ็ตรหัสผ่าน
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
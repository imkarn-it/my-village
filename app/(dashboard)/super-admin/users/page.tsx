"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Users,
    Search,
    Filter,
    Plus,
    MoreHorizontal,
    User,
    Shield,
    Building,
    Mail,
    Phone,
    Calendar,
    Activity,
    Ban,
    Lock,
    Unlock,
    Edit,
    Key,
    UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { Label } from "@/components/ui/label";
import { Trash2, FileText, Eye } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

type AdminUser = {
    id: string;
    email: string;
    name: string;
    role: "super_admin" | "project_admin" | "admin" | "staff";
    status: "active" | "inactive" | "suspended";
    projectId?: string;
    projectName?: string;
    permissions: string[];
    lastLogin?: string;
    createdAt: string;
    phone?: string;
    avatar?: string;
};

type UserStats = {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    suspendedUsers: number;
    newUsersThisMonth: number;
    projectDistribution: Array<{
        projectName: string;
        count: number;
        percentage: number;
    }>;
    roleDistribution: Array<{
        role: string;
        count: number;
        percentage: number;
    }>;
};

const mockUsers: AdminUser[] = [
    {
        id: "1",
        email: "superadmin@myvillage.com",
        name: "สมศักดิ์ ใจดี",
        role: "super_admin",
        status: "active",
        permissions: ["all"],
        lastLogin: "2025-01-13T09:30:00Z",
        createdAt: "2025-01-01T00:00:00Z",
        phone: "081-234-5678"
    },
    {
        id: "2",
        email: "admin.village@myvillage.com",
        name: "วีระ มั่นคง",
        role: "project_admin",
        status: "active",
        projectId: "proj_1",
        projectName: "My Village 1",
        permissions: ["user_management", "reports", "settings"],
        lastLogin: "2025-01-13T08:45:00Z",
        createdAt: "2025-01-05T00:00:00Z",
        phone: "082-345-6789"
    },
    {
        id: "3",
        email: "admin.condo@myvillage.com",
        name: "สมชาย รักงาน",
        role: "project_admin",
        status: "active",
        projectId: "proj_2",
        projectName: "My Condo",
        permissions: ["user_management", "reports"],
        lastLogin: "2025-01-12T16:20:00Z",
        createdAt: "2025-01-08T00:00:00Z",
        phone: "083-456-7890"
    },
    {
        id: "4",
        email: "staff.john@myvillage.com",
        name: "John Doe",
        role: "staff",
        status: "active",
        projectId: "proj_1",
        projectName: "My Village 1",
        permissions: ["maintenance", "security"],
        lastLogin: "2025-01-13T07:00:00Z",
        createdAt: "2025-01-10T00:00:00Z"
    },
    {
        id: "5",
        email: "suspended.user@myvillage.com",
        name: "ผู้ใช้ที่ถูกระงับ",
        role: "admin",
        status: "suspended",
        projectId: "proj_1",
        projectName: "My Village 1",
        permissions: [],
        lastLogin: "2025-01-10T14:30:00Z",
        createdAt: "2025-01-03T00:00:00Z"
    }
];

const mockStats: UserStats = {
    totalUsers: 156,
    activeUsers: 142,
    inactiveUsers: 8,
    suspendedUsers: 6,
    newUsersThisMonth: 23,
    projectDistribution: [
        { projectName: "My Village 1", count: 68, percentage: 43.6 },
        { projectName: "My Condo", count: 45, percentage: 28.8 },
        { projectName: "City Tower", count: 32, percentage: 20.5 },
        { projectName: "Green Park", count: 11, percentage: 7.1 }
    ],
    roleDistribution: [
        { role: "project_admin", count: 24, percentage: 15.4 },
        { role: "admin", count: 48, percentage: 30.8 },
        { role: "staff", count: 78, percentage: 50.0 },
        { role: "super_admin", count: 6, percentage: 3.8 }
    ]
};

export default function SuperAdminUsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [projectFilter, setProjectFilter] = useState("all");
    const [stats, setStats] = useState<UserStats>(mockStats);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [showAddUserDialog, setShowAddUserDialog] = useState(false);
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        phone: "",
        role: "admin" as "resident" | "admin" | "security" | "maintenance" | "super_admin",
        projectId: "",
    });

    // Form state for creating new user
    const [newUser, setNewUser] = useState({
        email: "",
        name: "",
        phone: "",
        role: "admin" as "resident" | "admin" | "security" | "maintenance" | "super_admin",
        projectId: "",
        unitId: "",
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setUsers(mockUsers);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesStatus = statusFilter === "all" || user.status === statusFilter;
        const matchesProject = projectFilter === "all" || user.projectId === projectFilter;

        return matchesSearch && matchesRole && matchesStatus && matchesProject;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active": return "bg-green-100 text-green-800";
            case "inactive": return "bg-gray-100 text-gray-800";
            case "suspended": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case "super_admin": return "bg-purple-100 text-purple-800";
            case "project_admin": return "bg-blue-100 text-blue-800";
            case "admin": return "bg-green-100 text-green-800";
            case "staff": return "bg-orange-100 text-orange-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case "super_admin": return "Super Admin";
            case "project_admin": return "Project Admin";
            case "admin": return "Admin";
            case "staff": return "Staff";
            default: return role;
        }
    };

    const handleSuspendUser = async (userId: string) => {
        // Implement suspend user logic
        console.log("Suspending user:", userId);
    };

    const handleActivateUser = async (userId: string) => {
        // Implement activate user logic
        console.log("Activating user:", userId);
    };

    const handleResetPassword = async (userId: string, userEmail: string) => {
        try {
            // @ts-ignore - API types
            const { data, error } = await api.users({ id: userId }).post({
                action: "reset_password",
                email: userEmail,
            });

            if (error) {
                toast.error("ไม่สามารถรีเซ็ตรหัสผ่านได้");
            } else {
                toast.success("ส่งลิงก์รีเซ็ตรหัสผ่านให้ผู้ใช้เรียบร้อยแล้ว");
            }
        } catch (err) {
            toast.error("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        // @ts-ignore - API types
        const { data, error } = await api.users({ id: userId }).delete();

        if (error) {
            toast.error("ไม่สามารถลบผู้ใช้ได้");
        } else {
            toast.success("ลบผู้ใช้เรียบร้อยแล้ว");
            // fetchUsers(); // Mock data - no refresh needed
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!newUser.email || !newUser.name || !newUser.password) {
            toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        if (newUser.password !== newUser.confirmPassword) {
            toast.error("รหัสผ่านไม่ตรงกัน");
            return;
        }

        if (newUser.password.length < 8) {
            toast.error("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
            return;
        }

        setIsCreatingUser(true);

        try {
            // @ts-ignore - API types
            const { data, error } = await api.users.post({
                email: newUser.email,
                name: newUser.name,
                phone: newUser.phone,
                role: newUser.role,
                projectId: newUser.projectId || null,
                unitId: newUser.unitId || null,
                password: newUser.password,
            });

            if (error) {
                throw new Error(String(error.value));
            }

            toast.success("สร้างผู้ใช้ใหม่เรียบร้อยแล้ว");
            setShowAddUserDialog(false);

            // Reset form
            setNewUser({
                email: "",
                name: "",
                phone: "",
                role: "admin",
                projectId: "",
                unitId: "",
                password: "",
                confirmPassword: "",
            });

            // Refresh users list
            // fetchUsers(); // Mock data - no refresh needed
        } catch (err: any) {
            console.error("Error creating user:", err);
            toast.error(err.message || "เกิดข้อผิดพลาดในการสร้างผู้ใช้");
        } finally {
            setIsCreatingUser(false);
        }
    };

    const handleNewUserChange = (field: string, value: string) => {
        setNewUser(prev => ({ ...prev, [field]: value }));
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;

        try {
            // @ts-ignore - API types and role property
            const { data, error } = await api.users({ id: selectedUser.id }).patch({
                name: editForm.name,
                phone: editForm.phone,
                // @ts-ignore - role property not in API type
                role: editForm.role,
                projectId: editForm.projectId || null,
            });

            if (error) {
                throw new Error(String(error.value));
            }

            toast.success("แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว");
            setIsEditingUser(false);
            setSelectedUser(null);
            // fetchUsers(); // Mock data - no refresh needed
        } catch (err: any) {
            console.error("Error updating user:", err);
            toast.error(err.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
        }
    };

    const handleEditFormChange = (field: string, value: string) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 5 }, (_, i) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ผู้ใช้ทั้งหมด</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ใช้งานอยู่</p>
                                <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                            </div>
                            <Activity className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ไม่ใช้งาน</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.inactiveUsers}</p>
                            </div>
                            <Lock className="h-8 w-8 text-gray-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ถูกระงับ</p>
                                <p className="text-2xl font-bold text-red-600">{stats.suspendedUsers}</p>
                            </div>
                            <Ban className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">สมัครใหม่</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.newUsersThisMonth}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้</h1>
                    <p className="text-gray-600">จัดการผู้ดูแลระบบและพนักงานทั้งหมด</p>
                </div>
                <Button onClick={() => setShowAddUserDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    เพิ่มผู้ใช้ใหม่
                </Button>
            </div>

            {/* Filters */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="ค้นหาจากชื่อหรืออีเมล..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-full lg:w-[180px]">
                                <SelectValue placeholder="ตำแหน่ง" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกตำแหน่ง</SelectItem>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                <SelectItem value="project_admin">Project Admin</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full lg:w-[150px]">
                                <SelectValue placeholder="สถานะ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกสถานะ</SelectItem>
                                <SelectItem value="active">ใช้งานอยู่</SelectItem>
                                <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                                <SelectItem value="suspended">ถูกระงับ</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={projectFilter} onValueChange={setProjectFilter}>
                            <SelectTrigger className="w-full lg:w-[200px]">
                                <SelectValue placeholder="โครงการ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกโครงการ</SelectItem>
                                <SelectItem value="proj_1">My Village 1</SelectItem>
                                <SelectItem value="proj_2">My Condo</SelectItem>
                                <SelectItem value="proj_3">City Tower</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        รายชื่อผู้ใช้ ({filteredUsers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                                    ? "ไม่พบผู้ใช้ที่ตรงตามเงื่อนไข"
                                    : "ยังไม่มีผู้ใช้"}
                            </h3>
                            <p className="text-gray-600">
                                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                                    ? "ลองปรับเปลี่ยนเงื่อนไขการค้นหา"
                                    : "เริ่มต้นด้วยการเพิ่มผู้ใช้คนแรก"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ผู้ใช้</TableHead>
                                        <TableHead>ตำแหน่ง</TableHead>
                                        <TableHead>โครงการ</TableHead>
                                        <TableHead>สถานะ</TableHead>
                                        <TableHead>ใช้งานล่าสุด</TableHead>
                                        <TableHead>สร้างเมื่อ</TableHead>
                                        <TableHead>จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-gray-50">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        <p className="text-sm text-gray-600">{user.email}</p>
                                                        {user.phone && (
                                                            <p className="text-xs text-gray-500">{user.phone}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getRoleColor(user.role)}>
                                                    {getRoleLabel(user.role)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.projectName ? (
                                                    <div className="flex items-center gap-2">
                                                        <Building className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm">{user.projectName}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">ทุกโครงการ</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(user.status)}>
                                                    {user.status === "active" && "ใช้งานอยู่"}
                                                    {user.status === "inactive" && "ไม่ใช้งาน"}
                                                    {user.status === "suspended" && "ถูกระงับ"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {user.lastLogin ? (
                                                    <p className="text-sm">
                                                        {format(new Date(user.lastLogin), "d MMM yyyy, HH:mm", { locale: th })}
                                                    </p>
                                                ) : (
                                                    <span className="text-gray-400">ไม่เคยเข้าสู่ระบบ</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm">
                                                    {format(new Date(user.createdAt), "d MMM yyyy", { locale: th })}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => setSelectedUser(user)}
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            ดูข้อมูล
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            แก้ไข
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleResetPassword(user.id, user.email)}
                                                        >
                                                            <Key className="w-4 h-4 mr-2" />
                                                            รีเซ็ตรหัสผ่าน
                                                        </DropdownMenuItem>
                                                        {user.status === "active" ? (
                                                            <DropdownMenuItem
                                                                onClick={() => handleSuspendUser(user.id)}
                                                                className="text-red-600"
                                                            >
                                                                <Ban className="w-4 h-4 mr-2" />
                                                                ระงับผู้ใช้
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem
                                                                onClick={() => handleActivateUser(user.id)}
                                                                className="text-green-600"
                                                            >
                                                                <Unlock className="w-4 h-4 mr-2" />
                                                                เปิดใช้งาน
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            ลบผู้ใช้
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add User Dialog */}
            <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5" />
                            เพิ่มผู้ใช้ใหม่
                        </DialogTitle>
                        <DialogDescription>
                            เพิ่มผู้ดูแลระบบหรือพนักงานใหม่ให้กับระบบ
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">อีเมล *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="user@example.com"
                                    value={newUser.email}
                                    onChange={(e) => handleNewUserChange("email", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
                                <Input
                                    id="name"
                                    placeholder="สมชาย ใจดี"
                                    value={newUser.name}
                                    onChange={(e) => handleNewUserChange("name", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                                <Input
                                    id="phone"
                                    placeholder="08x-xxx-xxxx"
                                    value={newUser.phone}
                                    onChange={(e) => handleNewUserChange("phone", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">ตำแหน่ง *</Label>
                                <Select value={newUser.role} onValueChange={(value) => handleNewUserChange("role", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกตำแหน่ง" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">แอดมิน (ผู้จัดการนิติบุคคล)</SelectItem>
                                        <SelectItem value="security">รักษาความปลอดภัย</SelectItem>
                                        <SelectItem value="maintenance">ช่างซ่อมบำรุง</SelectItem>
                                        <SelectItem value="super_admin">ผู้ดูแลระบบสูงสุด</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">รหัสผ่าน *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="อย่างน้อย 8 ตัวอักษร"
                                    value={newUser.password}
                                    onChange={(e) => handleNewUserChange("password", e.target.value)}
                                    required
                                    minLength={8}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน *</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="ใส่รหัสผ่านอีกครั้ง"
                                    value={newUser.confirmPassword}
                                    onChange={(e) => handleNewUserChange("confirmPassword", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                    <strong>หมายเหตุ:</strong> ผู้ใช้จะได้รับอีเมลแจ้งการสร้างบัญชีและสามารถตั้งรหัสผ่านใหม่ได้
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowAddUserDialog(false)}>
                                ยกเลิก
                            </Button>
                            <Button type="submit" disabled={isCreatingUser}>
                                {isCreatingUser ? (
                                    <>
                                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        กำลังสร้าง...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        เพิ่มผู้ใช้
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* User Detail Modal */}
            {selectedUser && (
                <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>ข้อมูลผู้ใช้</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User className="w-10 h-10 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                    {!isEditingUser ? (
                                        <>
                                            <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                                            <p className="text-gray-600">{selectedUser.email}</p>
                                            {selectedUser.phone && (
                                                <p className="text-sm text-gray-500">{selectedUser.phone}</p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="space-y-2">
                                            <Input
                                                placeholder="ชื่อ-นามสกุล"
                                                value={editForm.name}
                                                onChange={(e) => handleEditFormChange("name", e.target.value)}
                                            />
                                            <Input
                                                value={selectedUser.email}
                                                disabled
                                                className="text-gray-500"
                                            />
                                            <Input
                                                placeholder="เบอร์โทรศัพท์"
                                                value={editForm.phone}
                                                onChange={(e) => handleEditFormChange("phone", e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">ตำแหน่ง</label>
                                    {!isEditingUser ? (
                                        <p>
                                            <Badge className={getRoleColor(selectedUser.role)}>
                                                {getRoleLabel(selectedUser.role)}
                                            </Badge>
                                        </p>
                                    ) : (
                                        <Select value={editForm.role} onValueChange={(value) => handleEditFormChange("role", value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">แอดมิน</SelectItem>
                                                <SelectItem value="security">รักษาความปลอดภัย</SelectItem>
                                                <SelectItem value="maintenance">ช่างซ่อมบำรุง</SelectItem>
                                                <SelectItem value="super_admin">ผู้ดูแลระบบสูงสุด</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">สถานะ</label>
                                    <p>
                                        <Badge className={getStatusColor(selectedUser.status)}>
                                            {selectedUser.status === "active" && "ใช้งานอยู่"}
                                            {selectedUser.status === "inactive" && "ไม่ใช้งาน"}
                                            {selectedUser.status === "suspended" && "ถูกระงับ"}
                                        </Badge>
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">โครงการ</label>
                                    <p>{selectedUser.projectName || "ทุกโครงการ"}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">สร้างเมื่อ</label>
                                    <p>{format(new Date(selectedUser.createdAt), "d MMM yyyy", { locale: th })}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">เข้าสู่ระบบล่าสุด</label>
                                    <p>
                                        {selectedUser.lastLogin
                                            ? format(new Date(selectedUser.lastLogin), "d MMM yyyy, HH:mm", { locale: th })
                                            : "ไม่เคยเข้าสู่ระบบ"}
                                    </p>
                                </div>
                            </div>

                            {selectedUser.permissions.length > 0 && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">สิทธิ์การใช้งาน</label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedUser.permissions.map((permission, index) => (
                                            <Badge key={index} variant="outline">
                                                {permission}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => {
                                setSelectedUser(null);
                                setIsEditingUser(false);
                            }}>
                                ปิด
                            </Button>
                            {!isEditingUser ? (
                                <Button onClick={() => {
                                    setIsEditingUser(true);
                                    setEditForm({
                                        name: selectedUser.name,
                                        phone: selectedUser.phone || "",
                                        role: selectedUser.role as any,
                                        projectId: selectedUser.projectId || "",
                                    });
                                }}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    แก้ไขข้อมูล
                                </Button>
                            ) : (
                                <Button onClick={handleUpdateUser} disabled={isEditingUser}>
                                    <Lock className="w-4 h-4 mr-2" />
                                    บันทึกการแก้ไข
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
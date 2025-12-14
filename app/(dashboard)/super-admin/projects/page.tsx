"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Building2,
    Plus,
    Search,
    MoreHorizontal,
    Users,
    Database,
    Activity,
    Settings,
    Shield,
    Power,
    PowerOff,
    Edit,
    Trash2,
    Copy,
    ExternalLink,
    Globe,
    MapPin,
    Calendar,
    Server,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

type Project = {
    id: string;
    name: string;
    domain: string;
    location: string;
    status: "active" | "inactive" | "maintenance" | "suspended";
    admin: {
        id: string;
        name: string;
        email: string;
    };
    stats: {
        users: number;
        units: number;
        facilities: number;
        monthlyVisitors: number;
        storage: string;
    };
    lastBackup: string;
    createdAt: string;
    updatedAt: string;
    settings: {
        enableMaintenance: boolean;
        enableSOS: boolean;
        enablePayments: boolean;
        autoBackup: boolean;
    };
};

export default function SuperAdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);

            // TODO: Implement actual API call
            // Mock data for now
            const mockProjects: Project[] = [
                {
                    id: "1",
                    name: "My Village",
                    domain: "myvillage.app",
                    location: "กรุงเทพมหานคร",
                    status: "active",
                    admin: {
                        id: "admin-1",
                        name: "สมชาย ผู้จัดการ",
                        email: "admin@myvillage.com",
                    },
                    stats: {
                        users: 1250,
                        units: 450,
                        facilities: 12,
                        monthlyVisitors: 3200,
                        storage: "45.2 GB",
                    },
                    lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    createdAt: "2024-01-15T00:00:00Z",
                    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                    settings: {
                        enableMaintenance: true,
                        enableSOS: true,
                        enablePayments: true,
                        autoBackup: true,
                    },
                },
                {
                    id: "2",
                    name: "Green Valley Condo",
                    domain: "greenvalley.app",
                    location: "เชียงใหม่",
                    status: "active",
                    admin: {
                        id: "admin-2",
                        name: "วิไล รักษา",
                        email: "admin@greenvalley.com",
                    },
                    stats: {
                        users: 890,
                        units: 320,
                        facilities: 8,
                        monthlyVisitors: 2100,
                        storage: "32.8 GB",
                    },
                    lastBackup: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                    createdAt: "2024-03-20T00:00:00Z",
                    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
                    settings: {
                        enableMaintenance: true,
                        enableSOS: true,
                        enablePayments: false,
                        autoBackup: true,
                    },
                },
                {
                    id: "3",
                    name: "Seri Residence",
                    domain: "seri.residence",
                    location: "ภูเก็ต",
                    status: "maintenance",
                    admin: {
                        id: "admin-3",
                        name: "ประสิทธิ์ ดีแก่",
                        email: "admin@seri.com",
                    },
                    stats: {
                        users: 670,
                        units: 240,
                        facilities: 6,
                        monthlyVisitors: 1500,
                        storage: "28.1 GB",
                    },
                    lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    createdAt: "2024-06-10T00:00:00Z",
                    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                    settings: {
                        enableMaintenance: true,
                        enableSOS: false,
                        enablePayments: true,
                        autoBackup: false,
                    },
                },
                {
                    id: "4",
                    name: "Blue Sky Tower",
                    domain: "blueskytower.app",
                    location: "พัทยา",
                    status: "inactive",
                    admin: {
                        id: "admin-4",
                        name: "มานี รักบ้าน",
                        email: "admin@bluesky.com",
                    },
                    stats: {
                        users: 0,
                        units: 180,
                        facilities: 5,
                        monthlyVisitors: 0,
                        storage: "12.5 GB",
                    },
                    lastBackup: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    createdAt: "2024-08-15T00:00:00Z",
                    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    settings: {
                        enableMaintenance: false,
                        enableSOS: false,
                        enablePayments: false,
                        autoBackup: false,
                    },
                },
            ];

            setProjects(mockProjects);
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (projectId: string, currentStatus: string) => {
        try {
            // TODO: Implement API call to toggle project status
            const newStatus = currentStatus === "active" ? "inactive" : "active";
            setProjects(projects.map(project =>
                project.id === projectId ? { ...project, status: newStatus as any } : project
            ));
        } catch (error) {
            console.error("Failed to toggle project status:", error);
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบโครงการนี้? การกระทำนี้ไม่สามารถยกเลิกได้")) return;

        try {
            // TODO: Implement API call to delete project
            setProjects(projects.filter(project => project.id !== projectId));
        } catch (error) {
            console.error("Failed to delete project:", error);
        }
    };

    const filteredProjects = projects.filter(project => {
        // Status filter
        if (statusFilter !== "all" && project.status !== statusFilter) return false;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                project.name.toLowerCase().includes(query) ||
                project.domain.toLowerCase().includes(query) ||
                project.location.toLowerCase().includes(query) ||
                project.admin.name.toLowerCase().includes(query) ||
                project.admin.email.toLowerCase().includes(query)
            );
        }

        return true;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge className="bg-green-500 text-white">Active</Badge>;
            case "inactive":
                return <Badge variant="outline">Inactive</Badge>;
            case "maintenance":
                return <Badge className="bg-yellow-500 text-white">Maintenance</Badge>;
            case "suspended":
                return <Badge className="bg-red-500 text-white">Suspended</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">โครงการทั้งหมด</h1>
                        <p className="text-gray-600 mt-1">จัดการโครงการทั้งหมดในระบบ</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">โครงการทั้งหมด</h1>
                    <p className="text-gray-600 mt-1">จัดการโครงการทั้งหมดในระบบ</p>
                </div>
                <Link href="/super-admin/projects/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        เพิ่มโครงการใหม่
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">โครงการทั้งหมด</p>
                                <p className="text-2xl font-bold">{projects.length}</p>
                            </div>
                            <Building2 className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {projects.filter(p => p.status === "active").length}
                                </p>
                            </div>
                            <Activity className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ผู้ใช้ทั้งหมด</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {projects.reduce((acc, p) => acc + p.stats.users, 0).toLocaleString()}
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">พื้นที่จัดเก็บ</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {projects.reduce((acc, p) => {
                                        const size = parseFloat(p.stats.storage);
                                        return acc + size;
                                    }, 0).toFixed(1)} GB
                                </p>
                            </div>
                            <Database className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="ค้นหาโครงการ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                >
                    <option value="all">ทุกสถานะ</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="suspended">Suspended</option>
                </select>
            </div>

            {/* Projects List */}
            {filteredProjects.length === 0 ? (
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="pt-6 text-center">
                        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">ไม่พบโครงการ</h3>
                        <p className="text-gray-600 mb-4">
                            {searchQuery || statusFilter !== "all"
                                ? "ไม่พบโครงการที่ตรงตามเงื่อนไข"
                                : "ยังไม่มีโครงการในระบบ"}
                        </p>
                        {statusFilter === "all" && !searchQuery && (
                            <Link href="/super-admin/projects/new">
                                <Button>สร้างโครงการแรก</Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredProjects.map((project) => (
                        <Card key={project.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold">{project.name}</h3>
                                            {getStatusBadge(project.status)}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4" />
                                                <span>{project.domain}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                <span>{project.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>จัดการโครงการ</DropdownMenuLabel>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/super-admin/projects/${project.id}`}>
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    เข้าถึงโครงการ
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/super-admin/projects/${project.id}/edit`}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    แก้ไขข้อมูล
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/super-admin/projects/${project.id}/settings`}>
                                                    <Settings className="h-4 w-4 mr-2" />
                                                    ตั้งค่า
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleToggleStatus(project.id, project.status)}
                                            >
                                                {project.status === "active" ? (
                                                    <>
                                                        <PowerOff className="h-4 w-4 mr-2" />
                                                        ปิดใช้งาน
                                                    </>
                                                ) : (
                                                    <>
                                                        <Power className="h-4 w-4 mr-2" />
                                                        เปิดใช้งาน
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleDeleteProject(project.id)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                ลบโครงการ
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Admin Info */}
                                    <div>
                                        <h4 className="font-medium mb-3 text-sm text-gray-700">ผู้ดูแล</h4>
                                        <div className="space-y-1">
                                            <p className="text-sm">{project.admin.name}</p>
                                            <p className="text-sm text-gray-600">{project.admin.email}</p>
                                        </div>
                                    </div>

                                    {/* Statistics */}
                                    <div>
                                        <h4 className="font-medium mb-3 text-sm text-gray-700">สถิติ</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-500">ผู้ใช้:</span>
                                                <span className="ml-1 font-medium">{project.stats.users}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">ห้อง:</span>
                                                <span className="ml-1 font-medium">{project.stats.units}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">สิ่งอำนวยความสะดวก:</span>
                                                <span className="ml-1 font-medium">{project.stats.facilities}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">พื้นที่:</span>
                                                <span className="ml-1 font-medium">{project.stats.storage}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Settings & Info */}
                                    <div>
                                        <h4 className="font-medium mb-3 text-sm text-gray-700">การตั้งค่า</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {project.settings.enableMaintenance && (
                                                <Badge variant="outline" className="text-xs">แจ้งซ่อม</Badge>
                                            )}
                                            {project.settings.enableSOS && (
                                                <Badge variant="outline" className="text-xs">SOS</Badge>
                                            )}
                                            {project.settings.enablePayments && (
                                                <Badge variant="outline" className="text-xs">ชำระเงิน</Badge>
                                            )}
                                            {project.settings.autoBackup && (
                                                <Badge variant="outline" className="text-xs">สำรองอัตโนมัติ</Badge>
                                            )}
                                        </div>
                                        <div className="mt-3 text-xs text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Server className="w-3 h-3" />
                                                <span>สำรองข้อมูลล่าสุด: </span>
                                                <span>{format(new Date(project.lastBackup), "d MMM HH:mm", { locale: th })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
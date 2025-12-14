"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Building2,
    Users,
    Database,
    Activity,
    TrendingUp,
    Server,
    Globe,
    Shield,
    AlertTriangle,
    CheckCircle,
    Clock,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Settings,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

type SystemStats = {
    totalProjects: number;
    activeProjects: number;
    totalUsers: number;
    onlineUsers: number;
    totalDataSize: string;
    systemLoad: number;
    uptime: string;
    errorRate: number;
    apiCalls: number;
    storageUsed: number;
    storageTotal: number;
};

type Project = {
    id: string;
    name: string;
    location: string;
    status: "active" | "inactive" | "maintenance";
    users: number;
    lastBackup: string;
    createdAt: string;
    admin: {
        name: string;
        email: string;
    };
};

type RecentActivity = {
    id: string;
    type: "user" | "project" | "system" | "backup" | "error";
    title: string;
    description: string;
    timestamp: string;
    severity: "low" | "medium" | "high" | "critical";
};

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState<SystemStats>({
        totalProjects: 0,
        activeProjects: 0,
        totalUsers: 0,
        onlineUsers: 0,
        totalDataSize: "0 GB",
        systemLoad: 0,
        uptime: "0%",
        errorRate: 0,
        apiCalls: 0,
        storageUsed: 0,
        storageTotal: 0,
    });
    const [projects, setProjects] = useState<Project[]>([]);
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // TODO: Implement actual API calls
            // Mock data for now
            const mockStats: SystemStats = {
                totalProjects: 12,
                activeProjects: 11,
                totalUsers: 5420,
                onlineUsers: 892,
                totalDataSize: "245.7 GB",
                systemLoad: 45,
                uptime: "99.9%",
                errorRate: 0.2,
                apiCalls: 2847291,
                storageUsed: 187.3,
                storageTotal: 500,
            };

            const mockProjects: Project[] = [
                {
                    id: "1",
                    name: "My Village",
                    location: "กรุงเทพมหานคร",
                    status: "active",
                    users: 1250,
                    lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    createdAt: "2024-01-15T00:00:00Z",
                    admin: {
                        name: "สมชาย ผู้จัดการ",
                        email: "admin@myvillage.com",
                    },
                },
                {
                    id: "2",
                    name: "Green Valley Condo",
                    location: "เชียงใหม่",
                    status: "active",
                    users: 890,
                    lastBackup: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                    createdAt: "2024-03-20T00:00:00Z",
                    admin: {
                        name: "วิไล รักษา",
                        email: "admin@greenvalley.com",
                    },
                },
                {
                    id: "3",
                    name: "Seri Residence",
                    location: "ภูเก็ต",
                    status: "maintenance",
                    users: 670,
                    lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    createdAt: "2024-06-10T00:00:00Z",
                    admin: {
                        name: "ประสิทธิ์ ดีแก่",
                        email: "admin@seri.com",
                    },
                },
            ];

            const mockActivities: RecentActivity[] = [
                {
                    id: "1",
                    type: "system",
                    title: "System Update Completed",
                    description: "System updated to version v2.1.0 successfully",
                    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                    severity: "low",
                },
                {
                    id: "2",
                    type: "backup",
                    title: "Daily Backup Completed",
                    description: "All projects backed up successfully",
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    severity: "low",
                },
                {
                    id: "3",
                    type: "user",
                    title: "New Admin Registration",
                    description: "New admin registered for Green Valley Condo",
                    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                    severity: "medium",
                },
                {
                    id: "4",
                    type: "error",
                    title: "High Memory Usage Alert",
                    description: "Database server memory usage at 85%",
                    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                    severity: "high",
                },
            ];

            setStats(mockStats);
            setProjects(mockProjects);
            setActivities(mockActivities);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "system":
                return <Settings className="w-4 h-4" />;
            case "backup":
                return <Database className="w-4 h-4" />;
            case "user":
                return <Users className="w-4 h-4" />;
            case "project":
                return <Building2 className="w-4 h-4" />;
            case "error":
                return <AlertTriangle className="w-4 h-4" />;
            default:
                return <Activity className="w-4 h-4" />;
        }
    };

    const getActivityColor = (type: string, severity: string) => {
        if (type === "error") {
            switch (severity) {
                case "critical": return "text-red-500 bg-red-50";
                case "high": return "text-orange-500 bg-orange-50";
                case "medium": return "text-yellow-500 bg-yellow-50";
                default: return "text-gray-500 bg-gray-50";
            }
        }
        return "text-blue-500 bg-blue-50";
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge className="bg-green-500 text-white">Active</Badge>;
            case "inactive":
                return <Badge variant="outline">Inactive</Badge>;
            case "maintenance":
                return <Badge className="bg-yellow-500 text-white">Maintenance</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
                        <p className="text-gray-600 mt-1">จัดการระบบทั้งหมด</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="pt-6">
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
                    <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">จัดการระบบทั้งหมด</p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge className="bg-green-500 text-white">
                        System Healthy
                    </Badge>
                    <div className="text-sm text-gray-500">
                        {format(new Date(), "PPP HH:mm", { locale: th })}
                    </div>
                </div>
            </div>

            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">โครงการทั้งหมด</p>
                                <p className="text-2xl font-bold text-blue-700">{stats.totalProjects}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                    <span className="text-xs text-green-600">{stats.activeProjects} Active</span>
                                </div>
                            </div>
                            <Building2 className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600">ผู้ใช้ทั้งหมด</p>
                                <p className="text-2xl font-bold text-purple-700">{stats.totalUsers.toLocaleString()}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-green-600">{stats.onlineUsers} Online</span>
                                </div>
                            </div>
                            <Users className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">System Load</p>
                                <p className="text-2xl font-bold text-green-700">{stats.systemLoad}%</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <ArrowDownRight className="w-3 h-3 text-green-500" />
                                    <span className="text-xs text-green-600">Normal</span>
                                </div>
                            </div>
                            <Server className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-600">Storage</p>
                                <p className="text-2xl font-bold text-orange-700">{stats.storageUsed} GB</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs text-orange-600">of {stats.storageTotal} GB</span>
                                </div>
                            </div>
                            <Database className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Storage Progress Bar */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Storage Usage
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Used: {stats.storageUsed} GB</span>
                            <span>Total: {stats.storageTotal} GB</span>
                        </div>
                        <Progress value={(stats.storageUsed / stats.storageTotal) * 100} className="h-3" />
                        <p className="text-xs text-gray-500">
                            {((stats.storageTotal - stats.storageUsed) / stats.storageTotal * 100).toFixed(1)}% available
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Projects */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            โครงการล่าสุด
                        </CardTitle>
                        <Link href="/super-admin/projects">
                            <Button variant="outline" size="sm">
                                ดูทั้งหมด
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {projects.map((project) => (
                                <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold">{project.name}</h3>
                                            {getStatusBadge(project.status)}
                                        </div>
                                        <p className="text-sm text-gray-600">{project.location}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                            <span>Users: {project.users}</span>
                                            <span>Admin: {project.admin.name}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Last backup</p>
                                        <p className="text-sm font-medium">
                                            {format(new Date(project.lastBackup), "MMM d, HH:mm", { locale: th })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* System Activity */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            กิจกรรมระบบล่าสุด
                        </CardTitle>
                        <Link href="/super-admin/activity">
                            <Button variant="outline" size="sm">
                                ดูทั้งหมด
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {activities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className={`p-2 rounded-full ${getActivityColor(activity.type, activity.severity)}`}>
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold">{activity.title}</h4>
                                        <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                            {format(new Date(activity.timestamp), "PPP HH:mm", { locale: th })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link href="/super-admin/projects/new">
                            <Button variant="outline" className="w-full justify-start">
                                <Building2 className="w-4 h-4 mr-2" />
                                เพิ่มโครงการใหม่
                            </Button>
                        </Link>
                        <Link href="/super-admin/database/backup">
                            <Button variant="outline" className="w-full justify-start">
                                <Database className="w-4 h-4 mr-2" />
                                สำรองข้อมูลทันที
                            </Button>
                        </Link>
                        <Link href="/super-admin/system-settings">
                            <Button variant="outline" className="w-full justify-start">
                                <Settings className="w-4 h-4 mr-2" />
                                ตั้งค่าระบบ
                            </Button>
                        </Link>
                        <Link href="/super-admin/reports">
                            <Button variant="outline" className="w-full justify-start">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                ดูรายงาน
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
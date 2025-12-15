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
import { api } from "@/lib/api/client";

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

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState<SystemStats>({
        totalProjects: 0,
        activeProjects: 0,
        totalUsers: 0,
        onlineUsers: 0,
        totalDataSize: "0 GB",
        systemLoad: 45, // Mock
        uptime: "99.9%",
        errorRate: 0.2, // Mock
        apiCalls: 12543, // Mock
        storageUsed: 0,
        storageTotal: 500,
    });
    const [projects, setProjects] = useState<Project[]>([]);
    const [activities, setActivities] = useState<RecentActivity[]>(mockActivities);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch projects
            const { data: projectsData } = await api.projects.get({ query: { limit: '100' } });

            if (projectsData && Array.isArray(projectsData)) {
                // Map projects
                const mappedProjects: Project[] = projectsData.map((p: any) => {
                    const admin = p.users.find((u: any) => u.role === 'admin');
                    return {
                        id: p.id,
                        name: p.name,
                        location: p.address || 'ไม่ระบุ',
                        status: 'active', // Default to active as we don't have status in DB yet
                        users: p.users.length,
                        lastBackup: new Date().toISOString(), // Mock
                        createdAt: p.createdAt,
                        admin: {
                            name: admin?.name || 'ไม่ระบุ',
                            email: admin?.email || '-',
                        }
                    };
                });

                setProjects(mappedProjects);

                // Calculate stats
                const totalUsers = projectsData.reduce((acc: number, p: any) => acc + p.users.length, 0);

                setStats(prev => ({
                    ...prev,
                    totalProjects: projectsData.length,
                    activeProjects: projectsData.length, // Assuming all active for now
                    totalUsers: totalUsers,
                    onlineUsers: Math.floor(totalUsers * 0.1), // Mock online users (10%)
                    storageUsed: Math.round(totalUsers * 0.05 * 10) / 10, // Mock storage based on users
                }));

                // Generate activities from real data
                const generatedActivities: RecentActivity[] = [];

                // Add recent projects
                projectsData.forEach((p: any) => {
                    if (new Date(p.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) {
                        generatedActivities.push({
                            id: `proj-${p.id}`,
                            type: "project",
                            title: "New Project Created",
                            description: `${p.name} was created`,
                            timestamp: p.createdAt,
                            severity: "low"
                        });
                    }

                    // Add recent users
                    p.users.forEach((u: any) => {
                        if (new Date(u.createdAt).getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000) {
                            generatedActivities.push({
                                id: `user-${u.id}`,
                                type: "user",
                                title: "New User Registration",
                                description: `${u.name || u.email} joined ${p.name}`,
                                timestamp: u.createdAt,
                                severity: "low"
                            });
                        }
                    });
                });

                // Sort by timestamp desc and take top 5
                generatedActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                if (generatedActivities.length > 0) {
                    setActivities(generatedActivities.slice(0, 5));
                }
            }
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
                default: return "text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50";
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
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Super Admin Dashboard</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">จัดการระบบทั้งหมด</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="pt-6">
                                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
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
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Super Admin Dashboard</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">จัดการระบบทั้งหมด</p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge className="bg-green-500 text-white">
                        System Healthy
                    </Badge>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        {format(new Date(), "PPP HH:mm", { locale: th })}
                    </div>
                </div>
            </div>

            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">โครงการทั้งหมด</p>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.totalProjects}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <CheckCircle className="w-3 h-3 text-green-500 dark:text-green-400" />
                                    <span className="text-xs text-green-600 dark:text-green-400">{stats.activeProjects} Active</span>
                                </div>
                            </div>
                            <Building2 className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-purple-50/80 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">ผู้ใช้ทั้งหมด</p>
                                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.totalUsers.toLocaleString()}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-green-600 dark:text-green-400">{stats.onlineUsers} Online</span>
                                </div>
                            </div>
                            <Users className="h-8 w-8 text-purple-500 dark:text-purple-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-green-50/80 dark:bg-green-900/20 border-green-200 dark:border-green-800/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">System Load</p>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.systemLoad}%</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <ArrowDownRight className="w-3 h-3 text-green-500 dark:text-green-400" />
                                    <span className="text-xs text-green-600 dark:text-green-400">Normal</span>
                                </div>
                            </div>
                            <Server className="h-8 w-8 text-green-500 dark:text-green-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-orange-50/80 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Storage</p>
                                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.storageUsed} GB</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs text-orange-600 dark:text-orange-400">of {stats.storageTotal} GB</span>
                                </div>
                            </div>
                            <Database className="h-8 w-8 text-orange-500 dark:text-orange-400" />
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
                        <p className="text-xs text-slate-500 dark:text-slate-400">
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
                                <div key={project.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold">{project.name}</h3>
                                            {getStatusBadge(project.status)}
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{project.location}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                            <span>Users: {project.users}</span>
                                            <span>Admin: {project.admin.name}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Last backup</p>
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
                                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 dark:bg-slate-800/50 rounded-lg transition-colors">
                                    <div className={`p-2 rounded-full ${getActivityColor(activity.type, activity.severity)}`}>
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold">{activity.title}</h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{activity.description}</p>
                                        <p className="text-xs text-slate-400 mt-2">
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
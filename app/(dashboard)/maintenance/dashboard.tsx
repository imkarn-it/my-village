"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Wrench,
    Clock,
    CheckCircle,
    AlertTriangle,
    Calendar,
    MapPin,
    Users,
    Activity,
    BarChart3,
    Phone,
    MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { api } from "@/lib/api/client";

type TaskSummary = {
    total: number;
    pending: number;
    assigned: number;
    inProgress: number;
    completed: number;
    overdue: number;
};

type TodaySchedule = {
    id: string;
    time: string;
    title: string;
    location: string;
    priority: "low" | "medium" | "high" | "urgent";
    status: "pending" | "assigned" | "in_progress" | "completed";
    unit: string;
    requester: string;
};

type Equipment = {
    id: string;
    name: string;
    status: "available" | "in_use" | "maintenance";
    location: string;
    lastMaintenance: string;
    nextMaintenance?: string;
};

const mockEquipment: Equipment[] = [
    {
        id: "1",
        name: "ชุดเครื่องมือไฟฟ้า",
        status: "available",
        location: "ห้องเก็บช่าง A",
        lastMaintenance: "2025-01-10",
        nextMaintenance: "2025-04-10"
    },
    {
        id: "2",
        name: "รถเข็นขนาดใหญ่",
        status: "in_use",
        location: "อาคาร A ชั้น 2",
        lastMaintenance: "2025-01-05"
    },
    {
        id: "3",
        name: "เครื่องดูดซึม",
        status: "maintenance",
        location: "ศูนย์ซ่อม",
        lastMaintenance: "2025-01-12",
        nextMaintenance: "2025-01-20"
    }
];

export default function MaintenanceDashboard() {
    const [tasks, setTasks] = useState<TaskSummary>({
        total: 0,
        pending: 0,
        assigned: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0
    });
    const [schedule, setSchedule] = useState<TodaySchedule[]>([]);
    const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        fetchDashboardData();
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data } = await api.maintenance.get({ query: { limit: '100' } });

            if (data && Array.isArray(data)) {
                // Calculate stats
                const stats = {
                    total: data.length,
                    pending: data.filter((t: any) => t.status === 'pending').length,
                    assigned: data.filter((t: any) => t.status === 'assigned').length,
                    inProgress: data.filter((t: any) => t.status === 'in_progress').length,
                    completed: data.filter((t: any) => t.status === 'completed').length,
                    overdue: 0
                };

                // Calculate overdue (older than 3 days and not completed)
                const threeDaysAgo = new Date();
                threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                stats.overdue = data.filter((t: any) => t.status !== 'completed' && new Date(t.createdAt).getTime() < threeDaysAgo.getTime()).length;

                setTasks(stats);

                // Map to schedule
                const today = new Date().toDateString();
                const todaysTasks = data.filter((t: any) =>
                    new Date(t.createdAt).toDateString() === today ||
                    t.status === 'in_progress' ||
                    t.status === 'assigned'
                );

                const mappedSchedule = todaysTasks.map((t: any) => ({
                    id: t.id,
                    time: format(new Date(t.createdAt), "HH:mm"),
                    title: t.title,
                    location: t.unit ? `อาคาร ${t.unit.building} ห้อง ${t.unit.unitNumber}` : 'ไม่ระบุ',
                    priority: t.priority as any,
                    status: t.status as any,
                    unit: t.unit ? t.unit.unitNumber : '-',
                    requester: t.createdBy?.name || 'ไม่ระบุ'
                }));

                setSchedule(mappedSchedule);
            }

            // Fetch equipment
            const { data: equipmentData } = await api.equipment.get({ query: { limit: '5' } });
            if (equipmentData && Array.isArray(equipmentData)) {
                const mappedEquipment: Equipment[] = (equipmentData as any[]).map((item) => ({
                    id: item.id,
                    name: item.name,
                    status: item.status as "available" | "in_use" | "maintenance",
                    location: item.location || 'ไม่ระบุ',
                    lastMaintenance: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
                    nextMaintenance: undefined
                }));
                setEquipment(mappedEquipment);
            }
        } catch (error) {
            console.error("Failed to fetch maintenance data:", error);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent": return "bg-red-100 text-red-800";
            case "high": return "bg-orange-100 text-orange-800";
            case "medium": return "bg-yellow-100 text-yellow-800";
            case "low": return "bg-green-100 text-green-800";
            default: return "bg-slate-100 dark:bg-slate-800 text-gray-800";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-800";
            case "in_progress": return "bg-blue-100 text-blue-800";
            case "assigned": return "bg-purple-100 text-purple-800";
            case "pending": return "bg-yellow-100 text-yellow-800";
            default: return "bg-slate-100 dark:bg-slate-800 text-gray-800";
        }
    };

    const getEquipmentStatusColor = (status: string) => {
        switch (status) {
            case "available": return "bg-green-100 text-green-800";
            case "in_use": return "bg-blue-100 text-blue-800";
            case "maintenance": return "bg-red-100 text-red-800";
            default: return "bg-slate-100 dark:bg-slate-800 text-gray-800";
        }
    };

    const getEquipmentStatusLabel = (status: string) => {
        switch (status) {
            case "available": return "พร้อมใช้งาน";
            case "in_use": return "กำลังใช้งาน";
            case "maintenance": return "ซ่อมบำรุง";
            default: return status;
        }
    };

    const isTaskOverdue = (time: string, status: string) => {
        if (status === "completed") return false;
        // Simple check: if task is from previous days and not completed
        // Since we don't have exact due time in API yet, we'll assume tasks older than today are overdue if not done
        // Or we can use the time string if it's today
        return false; // Simplified for now as logic changed
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">แดชบอร์ดช่างซ่อม</h1>
                <p className="text-slate-600 dark:text-slate-400">จัดการงานซ่อมบำรุงและติดตามกำหนดการ</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ทั้งหมด</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{tasks.total}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">รอดำเนินการ</p>
                            <p className="text-2xl font-bold text-yellow-600">{tasks.pending}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">มอบหมายแล้ว</p>
                            <p className="text-2xl font-bold text-purple-600">{tasks.assigned}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">กำลังดำเนินการ</p>
                            <p className="text-2xl font-bold text-blue-600">{tasks.inProgress}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">เสร็จสิ้นวันนี้</p>
                            <p className="text-2xl font-bold text-green-600">{tasks.completed}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">เกินกำหนด</p>
                            <p className="text-2xl font-bold text-red-600">{tasks.overdue}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Today's Schedule */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            กำหนดการวันนี้ ({format(currentTime, "d MMMM yyyy", { locale: th })})
                        </span>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/maintenance/schedule">
                                <Calendar className="w-4 h-4 mr-2" />
                                ดูทั้งหมด
                            </Link>
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {schedule.map((task) => {
                            // const isOverdue = isTaskOverdue(task.time, task.status);
                            const isOverdue = false; // Simplified
                            return (
                                <div
                                    key={task.id}
                                    className={`flex items-center justify-between p-4 border rounded-lg ${isOverdue ? "border-red-200 bg-red-50" : "border-gray-200"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <p className="text-lg font-bold">{task.time}</p>
                                            {isOverdue && (
                                                <p className="text-xs text-red-600 font-medium">เกินกำหนด</p>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{task.title}</p>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                <MapPin className="w-3 h-3" />
                                                {task.location}
                                                <span>•</span>
                                                <Users className="w-3 h-3" />
                                                {task.unit}
                                                <span>•</span>
                                                {task.requester}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={getPriorityColor(task.priority)}>
                                            {task.priority === "urgent" && "ด่วนที่สุด"}
                                            {task.priority === "high" && "สูง"}
                                            {task.priority === "medium" && "ปานกลาง"}
                                            {task.priority === "low" && "ต่ำ"}
                                        </Badge>
                                        <Badge className={getStatusColor(task.status)}>
                                            {task.status === "pending" && "รอดำเนินการ"}
                                            {task.status === "in_progress" && "กำลังดำเนินการ"}
                                            {task.status === "completed" && "เสร็จสิ้น"}
                                            {task.status === "assigned" && "มอบหมายแล้ว"}
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}

                        {schedule.length === 0 && (
                            <div className="text-center py-8">
                                <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-600 dark:text-slate-400">ไม่มีกำหนดการในวันนี้</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wrench className="w-5 h-5" />
                            งานที่รอดำเนินการ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Button className="w-full justify-start" variant="outline" asChild>
                                <Link href="/maintenance/pending">
                                    <Clock className="w-4 h-4 mr-2" />
                                    ดูงานที่รอดำเนินการ ({tasks.pending})
                                </Link>
                            </Button>
                            <Button className="w-full justify-start" variant="outline" asChild>
                                <Link href="/maintenance/in-progress">
                                    <Activity className="w-4 h-4 mr-2" />
                                    งานที่กำลังทำ ({tasks.inProgress})
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            งานที่เสร็จวันนี้
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-4">
                            <p className="text-3xl font-bold text-green-600">{tasks.completed}</p>
                            <p className="text-slate-600 dark:text-slate-400">งานที่เสร็จสิ้นแล้ว</p>
                        </div>
                        <Button className="w-full mt-4" variant="outline" asChild>
                            <Link href="/maintenance/completed">
                                ดูรายละเอียด
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            งานเกินกำหนด
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-4">
                            <p className="text-3xl font-bold text-red-600">{tasks.overdue}</p>
                            <p className="text-slate-600 dark:text-slate-400">งานที่ต้องดำเนินการด่วน</p>
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            แจ้งผู้จัดการ
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Equipment Status */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            สถานะอุปกรณ์
                        </span>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/maintenance/equipment">
                                ดูทั้งหมด
                            </Link>
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {equipment.map((item) => (
                            <div key={item.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-medium">{item.name}</h3>
                                    <Badge className={getEquipmentStatusColor(item.status)}>
                                        {getEquipmentStatusLabel(item.status)}
                                    </Badge>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-slate-400" />
                                        {item.location}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        ซ่อมครั้ง: {format(new Date(item.lastMaintenance), "d MMM yyyy", { locale: th })}
                                    </div>
                                    {item.nextMaintenance && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3 text-slate-400" />
                                            ซ่อมครั้งถัดไป: {format(new Date(item.nextMaintenance), "d MMM yyyy", { locale: th })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5" />
                        ติดต่อฉุกเฉิน
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button className="justify-start" variant="outline">
                            <Phone className="w-4 h-4 mr-2" />
                            แจ้งปัญหาฉุกเฉิน - 1669
                        </Button>
                        <Button className="justify-start" variant="outline">
                            <Phone className="w-4 h-4 mr-2" />
                            ตำรวจอัคพพะ - 199
                        </Button>
                        <Button className="justify-start" variant="outline">
                            <Phone className="w-4 h-4 mr-2" />
                            ตำรวจดับเพลิง - 191
                        </Button>
                        <Button className="justify-start" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            แจ้งแอดมิน
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
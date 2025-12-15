"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Wrench,
    Clock,
    CheckCircle,
    AlertTriangle,

    MapPin,
    Phone,
    Camera,

    Users,
    Activity,
    QrCode,
    Home,
    List,
    Settings,
    Bell,
    Search,
    Plus
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

type QuickTask = {
    id: string;
    title: string;
    location: string;
    priority: "low" | "medium" | "high" | "urgent";
    status: "pending" | "in_progress" | "completed";
    time: string;
    unit: string;
};

type TodayStats = {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
};

export default function MaintenanceMobilePage() {
    const [currentTime, setCurrentTime] = useState(new Date());

    const [searchQuery, setSearchQuery] = useState("");

    const stats: TodayStats = {
        total: 12,
        completed: 5,
        inProgress: 3,
        pending: 4
    };

    const todayTasks: QuickTask[] = [
        {
            id: "1",
            title: "ซ่อมแอร์ห้อง A-205",
            location: "อาคาร A ชั้น 2",
            priority: "medium",
            status: "in_progress",
            time: "09:00",
            unit: "A-205"
        },
        {
            id: "2",
            title: "ตรวจเช็คระบบไฟโซน B",
            location: "อาคาร B",
            priority: "high",
            status: "pending",
            time: "10:30",
            unit: "ตรวจระบบ"
        },
        {
            id: "3",
            title: "ซ่อมปั๊มน้ำชั้น 1",
            location: "อาคาร A ชั้น 1",
            priority: "urgent",
            status: "pending",
            time: "14:00",
            unit: "พื้นที่ส่วนกลาง"
        },
        {
            id: "4",
            title: "บำรุงลิฟต์อาคาร A",
            location: "อาคาร A",
            priority: "low",
            status: "completed",
            time: "16:00",
            unit: "อาคาร A"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent": return "bg-red-100 text-red-800 border-red-200";
            case "high": return "bg-orange-100 text-orange-800 border-orange-200";
            case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "low": return "bg-green-100 text-green-800 border-green-200";
            default: return "bg-slate-100 dark:bg-slate-800 text-gray-800 border-gray-200";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-500";
            case "in_progress": return "bg-blue-500";
            case "pending": return "bg-gray-400";
            default: return "bg-gray-400";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "completed": return "เสร็จแล้ว";
            case "in_progress": return "กำลังทำ";
            case "pending": return "รอดำเนินการ";
            default: return status;
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case "urgent": return "ด่วนที่สุด";
            case "high": return "สูง";
            case "medium": return "ปานกลาง";
            case "low": return "ต่ำ";
            default: return priority;
        }
    };

    const completionPercentage = Math.round((stats.completed / stats.total) * 100);

    const filteredTasks = todayTasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-800/50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h1 className="text-xl font-bold">Maintenance Hub</h1>
                        <p className="text-sm text-blue-100">{format(currentTime, "d MMMM yyyy", { locale: th })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost" className="text-white">
                            <Bell className="w-5 h-5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-white">
                            <Settings className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="ค้นหางาน..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg text-slate-900 dark:text-white placeholder-gray-500"
                    />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="p-4">
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <Card className="bg-white border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">วันนี้</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                                </div>
                                <Activity className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-0 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">เสร็จแล้ว</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress Overview */}
                <Card className="bg-white border-0 shadow-sm mb-4">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">ความคืบหน้าวันนี้</span>
                            <span className="text-sm font-bold text-blue-600">{completionPercentage}%</span>
                        </div>
                        <Progress value={completionPercentage} className="h-2" />
                        <div className="flex justify-between mt-2 text-xs text-slate-600 dark:text-slate-400">
                            <span>เสร็จ {stats.completed}/{stats.total} งาน</span>
                            <span>เหลือ {stats.total - stats.completed} งาน</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="px-4 mb-4">
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/maintenance/checklist/new">
                        <Button className="w-full h-16 bg-green-600 hover:bg-green-700">
                            <div className="flex flex-col items-center gap-1">
                                <Plus className="w-6 h-6" />
                                <span className="text-sm">เริ่มงานใหม่</span>
                            </div>
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        className="w-full h-16"
                        onClick={() => window.open("/maintenance/qr-scanner")}
                    >
                        <div className="flex flex-col items-center gap-1">
                            <QrCode className="w-6 h-6" />
                            <span className="text-sm">สแกน QR</span>
                        </div>
                    </Button>
                </div>
            </div>

            {/* Today's Tasks */}
            <div className="px-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">งานวันนี้</h2>
                    <Link href="/maintenance/schedule">
                        <Button variant="ghost" size="sm">
                            ดูทั้งหมด
                        </Button>
                    </Link>
                </div>

                <div className="space-y-3">
                    {filteredTasks.map((task) => (
                        <Card key={task.id} className="bg-white border-0 shadow-sm overflow-hidden">
                            <CardContent className="p-0">
                                {/* Status Bar */}
                                <div className={`h-1 ${getStatusColor(task.status)}`} />

                                <div className="p-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-slate-900 dark:text-white">{task.title}</h3>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                <MapPin className="w-3 h-3" />
                                                {task.location}
                                                <span>•</span>
                                                <Clock className="w-3 h-3" />
                                                {task.time}
                                            </div>
                                        </div>
                                        <Badge className={getPriorityColor(task.priority)}>
                                            {getPriorityLabel(task.priority)}
                                        </Badge>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-2 mt-3">
                                        {task.status === "pending" && (
                                            <Link href={`/maintenance/checklist/${task.id}`} className="flex-1">
                                                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                                                    <Wrench className="w-3 h-3 mr-1" />
                                                    เริ่มทำ
                                                </Button>
                                            </Link>
                                        )}
                                        {task.status === "in_progress" && (
                                            <>
                                                <Link href={`/maintenance/checklist/${task.id}`} className="flex-1">
                                                    <Button size="sm" variant="outline" className="flex-1">
                                                        <List className="w-3 h-3 mr-1" />
                                                        Checklist
                                                    </Button>
                                                </Link>
                                                <Button size="sm" variant="outline">
                                                    <Camera className="w-3 h-3" />
                                                </Button>
                                            </>
                                        )}
                                        {task.status === "completed" && (
                                            <Button size="sm" variant="outline" disabled className="flex-1">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                {getStatusLabel(task.status)}
                                            </Button>
                                        )}
                                        <Button size="sm" variant="outline">
                                            <Phone className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredTasks.length === 0 && (
                    <Card className="bg-white border-0 shadow-sm">
                        <CardContent className="p-8 text-center">
                            <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400">ไม่พบงานที่ค้นหา</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Emergency Contact */}
            <div className="p-4 mt-4">
                <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-red-900">แจ้งเหตุฉุกเฉิน</h3>
                                <p className="text-sm text-red-700">ติดต่อผู้จัดการหรือแจ้งเหตุด่วน</p>
                            </div>
                            <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                <Phone className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
                <div className="grid grid-cols-4 gap-1">
                    <Link href="/maintenance/mobile">
                        <Button variant="ghost" className="w-full h-16 flex flex-col gap-1 rounded-none">
                            <Home className="w-5 h-5" />
                            <span className="text-xs">หน้าแรก</span>
                        </Button>
                    </Link>
                    <Link href="/maintenance/mobile/tasks">
                        <Button variant="ghost" className="w-full h-16 flex flex-col gap-1 rounded-none">
                            <List className="w-5 h-5" />
                            <span className="text-xs">งานทั้งหมด</span>
                        </Button>
                    </Link>
                    <Link href="/maintenance/mobile/equipment">
                        <Button variant="ghost" className="w-full h-16 flex flex-col gap-1 rounded-none">
                            <Wrench className="w-5 h-5" />
                            <span className="text-xs">อุปกรณ์</span>
                        </Button>
                    </Link>
                    <Link href="/maintenance/mobile/profile">
                        <Button variant="ghost" className="w-full h-16 flex flex-col gap-1 rounded-none">
                            <Users className="w-5 h-5" />
                            <span className="text-xs">โปรไฟล์</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
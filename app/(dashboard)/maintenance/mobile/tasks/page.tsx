"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {

    Search,

    Clock,
    CheckCircle,
    AlertTriangle,
    MapPin,
    User,
    Wrench,
    Plus,
    ArrowLeft,
    Home
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

type Task = {
    id: string;
    ticketNumber: string;
    title: string;
    location: string;
    unit: string;
    requester: string;
    priority: "low" | "medium" | "high" | "urgent";
    status: "pending" | "assigned" | "in_progress" | "completed";
    category: string;
    reportedDate: string;
    dueDate?: string;
    estimatedDuration?: number;
    assignedTo?: string;
};

const mockTasks: Task[] = [
    {
        id: "1",
        ticketNumber: "MT-2025-001",
        title: "ซ่อมแอร์ห้อง A-205",
        location: "อาคาร A ชั้น 2",
        unit: "A-205",
        requester: "สมศักดิ์ ใจดี",
        priority: "medium",
        status: "in_progress",
        category: "ระบบไกล์อากาศ",
        reportedDate: "2025-12-13T09:00:00Z",
        dueDate: "2025-12-13T17:00:00Z",
        estimatedDuration: 120,
        assignedTo: "ช่างไกล์อากาศ"
    },
    {
        id: "2",
        ticketNumber: "MT-2025-002",
        title: "ตรวจเช็คระบบไฟฟ้าโซน B",
        location: "อาคาร B",
        unit: "ตรวจระบบ",
        requester: "รปภ.",
        priority: "high",
        status: "pending",
        category: "ระบบไฟฟ้า",
        reportedDate: "2025-12-13T08:30:00Z",
        dueDate: "2025-12-13T12:00:00Z",
        estimatedDuration: 90
    },
    {
        id: "3",
        ticketNumber: "MT-2025-003",
        title: "ซ่อมปั๊มน้ำชั้น 1",
        location: "อาคาร A ชั้น 1",
        unit: "พื้นที่ส่วนกลาง",
        requester: "แอดมิน",
        priority: "urgent",
        status: "pending",
        category: "ระบบประปา",
        reportedDate: "2025-12-13T07:00:00Z",
        dueDate: "2025-12-13T10:00:00Z",
        estimatedDuration: 60
    },
    {
        id: "4",
        ticketNumber: "MT-2025-004",
        title: "บำรุงลิฟต์อาคาร A",
        location: "อาคาร A",
        unit: "อาคาร A",
        requester: "บริษัท บริการลิฟต์",
        priority: "low",
        status: "completed",
        category: "ลิฟต์และบันไดเลื่อน",
        reportedDate: "2025-12-12T14:00:00Z",
        dueDate: "2025-12-13T14:00:00Z",
        estimatedDuration: 180,
        assignedTo: "ช่างลิฟต์"
    },
    {
        id: "5",
        ticketNumber: "MT-2025-005",
        title: "ซ่อมประตูรั้วหน้า",
        location: "ประตูทางเข้า",
        unit: "ประตูหลัก",
        requester: "รปภ.",
        priority: "medium",
        status: "pending",
        category: "ประตูและรั้ว",
        reportedDate: "2025-12-13T10:00:00Z",
        estimatedDuration: 45
    },
    {
        id: "6",
        ticketNumber: "MT-2025-006",
        title: "เปลี่ยนหลอดไฟทางเดิน",
        location: "ทางเดินรอบสระว่ายน้ำ",
        unit: "ส่วนกลาง",
        requester: "ผู้อยู่อาศัย",
        priority: "low",
        status: "assigned",
        category: "ระบบไฟฟ้า",
        reportedDate: "2025-12-13T11:00:00Z",
        estimatedDuration: 30
    }
];

export default function MaintenanceMobileTasksPage() {
    const [tasks] = useState<Task[]>(mockTasks);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPriority, setSelectedPriority] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent": return "bg-red-100 text-red-800 border-red-200";
            case "high": return "bg-orange-100 text-orange-800 border-orange-200";
            case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "low": return "bg-green-100 text-green-800 border-green-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-500";
            case "in_progress": return "bg-blue-500";
            case "assigned": return "bg-purple-500";
            case "pending": return "bg-gray-400";
            default: return "bg-gray-400";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "completed": return "เสร็จแล้ว";
            case "in_progress": return "กำลังทำ";
            case "assigned": return "มอบหมายแล้ว";
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

    const isTaskOverdue = (task: Task) => {
        if (task.status === "completed" || !task.dueDate) return false;
        return new Date() > new Date(task.dueDate);
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority;
        const matchesStatus = selectedStatus === "all" || task.status === selectedStatus;

        return matchesSearch && matchesPriority && matchesStatus;
    });

    const pendingTasks = filteredTasks.filter(task => task.status === "pending" || task.status === "assigned");
    const inProgressTasks = filteredTasks.filter(task => task.status === "in_progress");
    const completedTasks = filteredTasks.filter(task => task.status === "completed");

    const TaskCard = ({ task }: { task: Task }) => {
        const overdue = isTaskOverdue(task);

        return (
            <Card className="bg-white border-0 shadow-sm overflow-hidden mb-3">
                <CardContent className="p-0">
                    {/* Status Bar */}
                    <div className={`h-1 ${getStatusColor(task.status)} ${overdue ? 'bg-red-500' : ''}`} />

                    <div className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-sm">{task.title}</h3>
                                <p className="text-xs text-gray-500 mt-1">{task.ticketNumber}</p>
                            </div>
                            <Badge className={getPriorityColor(task.priority)} variant="outline">
                                {getPriorityLabel(task.priority)}
                            </Badge>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3" />
                                <span>{task.location} - {task.unit}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-3 h-3" />
                                <span>{task.requester}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                <span>
                                    {format(new Date(task.reportedDate), "d MMM HH:mm", { locale: th })}
                                    {task.dueDate && ` - ${format(new Date(task.dueDate), "HH:mm")}`}
                                </span>
                                {task.estimatedDuration && (
                                    <span className="text-gray-400">({task.estimatedDuration} นาที)</span>
                                )}
                            </div>
                        </div>

                        {/* Overdue Warning */}
                        {overdue && (
                            <div className="flex items-center gap-2 mt-2 text-red-600 text-xs">
                                <AlertTriangle className="w-3 h-3" />
                                <span>เกินกำหนดการ</span>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                            {task.status === "pending" && (
                                <Link href={`/maintenance/checklist/${task.id}`} className="flex-1">
                                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-xs">
                                        <Wrench className="w-3 h-3 mr-1" />
                                        เริ่มทำ
                                    </Button>
                                </Link>
                            )}
                            {task.status === "assigned" && (
                                <Link href={`/maintenance/checklist/${task.id}`} className="flex-1">
                                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-xs">
                                        <Wrench className="w-3 h-3 mr-1" />
                                        ทำงาน
                                    </Button>
                                </Link>
                            )}
                            {task.status === "in_progress" && (
                                <Link href={`/maintenance/checklist/${task.id}`} className="flex-1">
                                    <Button size="sm" variant="outline" className="flex-1 text-xs">
                                        <Clock className="w-3 h-3 mr-1" />
                                        ดำเนินการ
                                    </Button>
                                </Link>
                            )}
                            {task.status === "completed" && (
                                <Button size="sm" variant="outline" disabled className="flex-1 text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    {getStatusLabel(task.status)}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sticky top-0 z-10">
                <div className="flex items-center gap-4 mb-3">
                    <Link href="/maintenance/mobile">
                        <Button size="icon" variant="ghost" className="text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold">งานทั้งหมด</h1>
                        <p className="text-sm text-blue-100">{filteredTasks.length} รายการ</p>
                    </div>
                    <Link href="/maintenance/mobile">
                        <Button size="icon" variant="ghost" className="text-white">
                            <Home className="w-5 h-5" />
                        </Button>
                    </Link>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="ค้นหางาน..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white text-gray-900 placeholder-gray-500"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="px-3 py-1 rounded-lg bg-white text-gray-900 text-sm border-0"
                    >
                        <option value="all">ทุกความสำคัญ</option>
                        <option value="urgent">ด่วนที่สุด</option>
                        <option value="high">สูง</option>
                        <option value="medium">ปานกลาง</option>
                        <option value="low">ต่ำ</option>
                    </select>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-1 rounded-lg bg-white text-gray-900 text-sm border-0"
                    >
                        <option value="all">ทุกสถานะ</option>
                        <option value="pending">รอดำเนินการ</option>
                        <option value="assigned">มอบหมายแล้ว</option>
                        <option value="in_progress">กำลังทำ</option>
                        <option value="completed">เสร็จแล้ว</option>
                    </select>
                </div>
            </div>

            {/* Tasks List */}
            <div className="p-4">
                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="pending" className="text-sm">
                            รอดำเนินการ ({pendingTasks.length})
                        </TabsTrigger>
                        <TabsTrigger value="in-progress" className="text-sm">
                            กำลังทำ ({inProgressTasks.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="text-sm">
                            เสร็จแล้ว ({completedTasks.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="space-y-0">
                        {pendingTasks.length > 0 ? (
                            pendingTasks.map(task => <TaskCard key={task.id} task={task} />)
                        ) : (
                            <Card className="bg-white border-0 shadow-sm">
                                <CardContent className="p-8 text-center">
                                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">ไม่มีงานที่รอดำเนินการ</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="in-progress" className="space-y-0">
                        {inProgressTasks.length > 0 ? (
                            inProgressTasks.map(task => <TaskCard key={task.id} task={task} />)
                        ) : (
                            <Card className="bg-white border-0 shadow-sm">
                                <CardContent className="p-8 text-center">
                                    <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">ไม่มีงานที่กำลังดำเนินการ</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="completed" className="space-y-0">
                        {completedTasks.length > 0 ? (
                            completedTasks.map(task => <TaskCard key={task.id} task={task} />)
                        ) : (
                            <Card className="bg-white border-0 shadow-sm">
                                <CardContent className="p-8 text-center">
                                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">ไม่มีงานที่เสร็จสิ้น</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Floating Action Button */}
            <Link href="/maintenance/tickets/new">
                <Button
                    className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg"
                    size="icon"
                >
                    <Plus className="w-6 h-6" />
                </Button>
            </Link>
        </div>
    );
}
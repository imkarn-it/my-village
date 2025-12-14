"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
    CheckCircle,
    Calendar,
    User,
    Search,
    Download,
    Eye,
    Timer,
    AlertCircle,
    TrendingUp,
    Star,
    FileText,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

type MaintenanceTask = {
    id: string;
    ticketId: string;
    title: string;
    category: string;
    priority: "low" | "medium" | "high" | "urgent";
    assignedTo: string;
    completedAt: string;
    duration: number; // in minutes
    partsUsed: Array<{
        name: string;
        quantity: number;
        totalCost: number;
    }>;
    rating?: number; // 1-5 stars
    feedback?: string;
    photos?: string[];
    notes: string;
    cost: {
        labor: number;
        parts: number;
        total: number;
    };
};

type TaskStats = {
    totalCompleted: number;
    avgCompletionTime: number;
    avgRating: number;
    totalCost: number;
    completionRate: number;
};

const mockTasks: MaintenanceTask[] = [
    {
        id: "1",
        ticketId: "T001",
        title: "แก้ไขแอร์เครื่องที่ 1",
        category: "แอร์",
        priority: "high",
        assignedTo: "ช่างสมศักดิ์",
        completedAt: "2025-01-12T10:30:00Z",
        duration: 120,
        partsUsed: [
            { name: "คอยล์แอร์", quantity: 1, totalCost: 1200 },
            { name: "ก๊าซเครื่องทำความเย็น", quantity: 1, totalCost: 300 }
        ],
        rating: 5,
        feedback: "บริการดีมาก ช่างมีประสิทธิภาพ",
        photos: ["/api/placeholder/400/300"],
        notes: "ทำความสะอาดเครื่อง และเติมก๊าซเรียบร้อย",
        cost: {
            labor: 300,
            parts: 1500,
            total: 1800
        }
    },
    {
        id: "2",
        ticketId: "T002",
        title: "ซ่อมปั๊มน้ำชั้น 2",
        category: "ประปา",
        priority: "medium",
        assignedTo: "ช่างวีระ",
        completedAt: "2025-01-12T09:15:00Z",
        duration: 60,
        partsUsed: [],
        rating: 4,
        feedback: "ซ่อมเร็วดี",
        notes: "เปลี่ยนตะแกรงกรอง ล้างถังน้ำ",
        cost: {
            labor: 200,
            parts: 0,
            total: 200
        }
    },
    {
        id: "3",
        ticketId: "T003",
        title: "ตรวจเช็คระบบไฟฟ้าโซน A",
        category: "ไฟฟ้า",
        priority: "low",
        assignedTo: "ช่างสมศักดิ์",
        completedAt: "2025-01-11T14:20:00Z",
        duration: 90,
        partsUsed: [
            { name: "หลอดLED", quantity: 5, totalCost: 250 }
        ],
        rating: 5,
        notes: "ตรวจเช็คระบบทั่วห้อง ไม่พบปัญหา",
        cost: {
            labor: 250,
            parts: 250,
            total: 500
        }
    }
];

const mockStats: TaskStats = {
    totalCompleted: 127,
    avgCompletionTime: 75,
    avgRating: 4.6,
    totalCost: 15420,
    completionRate: 98.5
};

export default function MaintenanceCompletedPage() {
    const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [stats] = useState<TaskStats>(mockStats);  // setStats reserved for API integration
    const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setTasks(mockTasks);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.ticketId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || task.category === categoryFilter;
        const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

        return matchesSearch && matchesCategory && matchesPriority;
    });

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent": return "bg-red-100 text-red-800";
            case "high": return "bg-orange-100 text-orange-800";
            case "medium": return "bg-yellow-100 text-yellow-800";
            case "low": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
            />
        ));
    };

    const exportReport = () => {
        // Implement export functionality
        console.log("Exporting completed tasks report...");
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
                                <p className="text-sm font-medium text-gray-600">เสร็จสิ้นทั้งหมด</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalCompleted}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">เวลาเฉลี่ย</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.avgCompletionTime} นาที</p>
                            </div>
                            <Timer className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">คะแนนเฉลี่ย</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.avgRating}/5</p>
                            </div>
                            <Star className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ยอดรวมค่าใช้จ่าย</p>
                                <p className="text-2xl font-bold text-gray-900">฿{stats.totalCost.toLocaleString()}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">อัตราเสร็จงาน</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-indigo-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">งานที่เสร็จสิ้นแล้ว</h1>
                    <p className="text-gray-600">รายการงานซ่อมบำรุงที่ดำเนินการเสร็จสิ้นแล้ว</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportReport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="ค้นหาจากชื่องานหรือรหัสตั๋ว..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full lg:w-[180px]">
                                <SelectValue placeholder="หมวดหมู่" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                                <SelectItem value="แอร์">แอร์</SelectItem>
                                <SelectItem value="ประปา">ประปา</SelectItem>
                                <SelectItem value="ไฟฟ้า">ไฟฟ้า</SelectItem>
                                <SelectItem value="ห้องน้ำ">ห้องน้ำ</SelectItem>
                                <SelectItem value="ประตู/หน้าต่าง">ประตู/หน้าต่าง</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-full lg:w-[180px]">
                                <SelectValue placeholder="ความสำคัญ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกระดับ</SelectItem>
                                <SelectItem value="urgent">ด่วนที่สุด</SelectItem>
                                <SelectItem value="high">สูง</SelectItem>
                                <SelectItem value="medium">ปานกลาง</SelectItem>
                                <SelectItem value="low">ต่ำ</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Tasks Table */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        รายการงานที่เสร็จสิ้น ({filteredTasks.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {searchTerm || categoryFilter !== "all" || priorityFilter !== "all"
                                    ? "ไม่พบงานที่ตรงตามเงื่อนไข"
                                    : "ยังไม่มีงานที่เสร็จสิ้น"}
                            </h3>
                            <p className="text-gray-600">
                                {searchTerm || categoryFilter !== "all" || priorityFilter !== "all"
                                    ? "ลองปรับเปลี่ยนเงื่อนไขการค้นหา"
                                    : "งานที่เสร็จสิ้นจะแสดงที่นี่"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>รหัสตั๋ว</TableHead>
                                        <TableHead>ชื่องาน</TableHead>
                                        <TableHead>หมวดหมู่</TableHead>
                                        <TableHead>ผู้รับผิดชอบ</TableHead>
                                        <TableHead>วันที่เสร็จ</TableHead>
                                        <TableHead>ระยะเวลา</TableHead>
                                        <TableHead>ค่าใช้จ่าย</TableHead>
                                        <TableHead>คะแนน</TableHead>
                                        <TableHead>จัดการ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTasks.map((task) => (
                                        <TableRow key={task.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">
                                                {task.ticketId}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{task.title}</p>
                                                    <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                                                        {task.priority}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>{task.category}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    {task.assignedTo}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    {format(new Date(task.completedAt), "d MMM yyyy", { locale: th })}
                                                </div>
                                            </TableCell>
                                            <TableCell>{task.duration} นาที</TableCell>
                                            <TableCell>฿{task.cost.total.toLocaleString()}</TableCell>
                                            <TableCell>
                                                {task.rating ? (
                                                    <div className="flex items-center gap-1">
                                                        {renderStars(task.rating)}
                                                        <span className="text-sm text-gray-600 ml-1">({task.rating})</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedTask(task)}
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

            {/* Task Detail Modal */}
            {selectedTask && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">รายละเอียดการซ่อม</h3>
                                    <p className="text-gray-600">ตั๋ว: {selectedTask.ticketId}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedTask(null)}
                                >
                                    ×
                                </Button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">ชื่องาน</label>
                                    <p className="font-medium">{selectedTask.title}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">หมวดหมู่</label>
                                    <p>{selectedTask.category}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">ผู้รับผิดชอบ</label>
                                    <p>{selectedTask.assignedTo}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">ระยะเวลา</label>
                                    <p>{selectedTask.duration} นาที</p>
                                </div>
                            </div>

                            {/* Cost Breakdown */}
                            <div>
                                <h4 className="font-medium mb-2">สรุปค่าใช้จ่าย</h4>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span>ค่าแรง</span>
                                        <span>฿{selectedTask.cost.labor}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>ค่าอะไหล่</span>
                                        <span>฿{selectedTask.cost.parts}</span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between font-semibold">
                                        <span>รวม</span>
                                        <span>฿{selectedTask.cost.total}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Parts Used */}
                            {selectedTask.partsUsed.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">อะไหล่ที่ใช้</h4>
                                    <div className="space-y-2">
                                        {selectedTask.partsUsed.map((part, index) => (
                                            <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                                                <div>
                                                    <p className="font-medium">{part.name}</p>
                                                    <p className="text-sm text-gray-600">จำนวน: {part.quantity}</p>
                                                </div>
                                                <p className="font-medium">฿{part.totalCost}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Rating and Feedback */}
                            {selectedTask.rating && (
                                <div>
                                    <h4 className="font-medium mb-2">คะแนนและความคิดเห็น</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            {renderStars(selectedTask.rating)}
                                            <span className="font-medium">({selectedTask.rating}/5)</span>
                                        </div>
                                        {selectedTask.feedback && (
                                            <p className="text-gray-700">&quot;{selectedTask.feedback}&quot;</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <h4 className="font-medium mb-2">บันทึกการดำเนินการ</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedTask.notes}</p>
                                </div>
                            </div>

                            {/* Photos */}
                            {selectedTask.photos && selectedTask.photos.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">รูปภาพหลังซ่อม</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedTask.photos.map((photo, index) => (
                                            <Image
                                                key={index}
                                                src={photo}
                                                alt={`Photo ${index + 1}`}
                                                width={400}
                                                height={128}
                                                className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80"
                                                onClick={() => window.open(photo, '_blank')}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t flex justify-end gap-2">
                            <Button variant="outline" onClick={() => window.print()}>
                                <FileText className="w-4 h-4 mr-2" />
                                พิมพ์
                            </Button>
                            <Button onClick={() => setSelectedTask(null)}>
                                ปิด
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
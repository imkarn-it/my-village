"use client";

import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Wrench,
    Home,


    User,
    Clock,
    Calendar,
    CheckCircle,
    AlertTriangle,

    Search,

    BarChart3,
    Play,

    Eye,
    MoreHorizontal,
    Users,

} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

import { Progress } from "@/components/ui/progress";
import { useFileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,

    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MaintenanceTask = {
    id: string;
    ticketId: string;
    title: string;
    description: string;
    category: string;
    priority: "low" | "medium" | "high" | "urgent";
    unitId: string;
    unit?: {
        id: string;
        number: string;
        building: string;
        floor: number;
    };
    user?: {
        id: string;
        name: string;
        phone?: string;
    };
    assignedTo: string;
    estimatedCompletion?: string;
    actualCompletion?: string;
    progress: number; // 0-100
    status: "assigned" | "in_progress" | "waiting_parts" | "completed";
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    notes?: Array<{
        id: string;
        message: string;
        createdBy: string;
        createdAt: string;
        attachments?: string[];
    }>;
    parts?: Array<{
        id: string;
        name: string;
        quantity: number;
        unitPrice: number;
        status: "ordered" | "received" | "used";
    }>;
};

type Technician = {
    id: string;
    name: string;
    email: string;
    phone: string;
    skills: string[];
    activeTasks: number;
    completedTasks: number;
};

export default function MaintenanceInProgressPage() {
    const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    const { uploadFile } = useFileUpload();

    useEffect(() => {
        fetchTasks();
        fetchTechnicians();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);

            // TODO: Implement actual API call
            // Mock data for now
            const mockTasks: MaintenanceTask[] = [
                {
                    id: "task-1",
                    ticketId: "1",
                    title: "ซ่อมแอร์ห้อง A-101",
                    description: "แอร์ในห้องนอนเครื่องปกติดูให้ไม่เย็น ต้องการเติมก๊าซและตรวจสอบระบบวย",
                    category: "แอร์",
                    priority: "high",
                    unitId: "unit-1",
                    unit: {
                        id: "unit-1",
                        number: "A-101",
                        building: "A",
                        floor: 1,
                    },
                    user: {
                        id: "user-1",
                        name: "สมชาย ใจดี",
                        phone: "081-234-5678",
                    },
                    assignedTo: "tech-1",
                    estimatedCompletion: "2025-01-13T17:00:00Z",
                    actualCompletion: "2025-01-13T16:30:00Z",
                    progress: 75,
                    status: "in_progress",
                    createdAt: "2025-01-12T09:00:00Z",
                    startedAt: "2025-01-13T14:00:00Z",
                    notes: [
                        {
                            id: "note-1",
                            message: "เรับงาน 14:00 น. ตรวจสอบแล้วพบว่าคอมเพรสเซอร์ทำงานปกติดูปกติ",
                            createdBy: "ช่างสมศรี",
                            createdAt: "2025-01-13T14:00:00Z",
                        },
                        {
                            id: "note-2",
                            message: "เรองก๊าซ R-22 และเติม ตามจำนวน",
                            createdBy: "ช่างสมศรี",
                            createdAt: "2025-01-13T14:30:00Z",
                        },
                    ],
                    parts: [
                        {
                            id: "part-1",
                            name: "ก๊าซแอร์ R-22",
                            quantity: 2,
                            unitPrice: 1200,
                            status: "received",
                        },
                    ],
                },
                {
                    id: "task-2",
                    ticketId: "2",
                    title: "ซ่อมท่อรั่วห้องน้ำ B-205",
                    description: "น้ำรั่วจากท่อใต้อ่างล้างห้องน้ำ ต้องการเปลี่ยนท่อใหม่",
                    category: "ประปา",
                    priority: "medium",
                    unitId: "unit-2",
                    unit: {
                        id: "unit-2",
                        number: "B-205",
                        building: "B",
                        floor: 2,
                    },
                    user: {
                        id: "user-2",
                        name: "สมศรี รักเรือน",
                        phone: "082-345-6789",
                    },
                    assignedTo: "tech-2",
                    estimatedCompletion: "2025-01-13T15:00:00Z",
                    progress: 30,
                    status: "waiting_parts",
                    createdAt: "2025-01-12T11:30:00Z",
                    startedAt: "2025-01-13T09:00:00Z",
                    notes: [
                        {
                            id: "note-3",
                            message: "สั่งซื้ออะไหคุณปลี้นท่อขนาดใหม่ 1 น้วย",
                            createdBy: "ช่างวิไล",
                            createdAt: "2025-01-13T09:30:00Z",
                        },
                    ],
                    parts: [
                        {
                            id: "part-2",
                            name: "ท่อ PVC ขนาด 1 นิ้ว",
                            quantity: 2,
                            unitPrice: 150,
                            status: "ordered",
                        },
                    ],
                },
                {
                    id: "task-3",
                    ticketId: "3",
                    title: "ปรับแก้ LED หลอดในพื้นที่จอดรถ",
                    description: "แจ้งว่า LED ในพื้นที่จอดรถสว่างไม่เท่ากัน",
                    category: "ไฟฟ้า",
                    priority: "low",
                    unitId: "common-area",
                    unit: undefined,
                    user: {
                        id: "admin-1",
                        name: "แอดมิน",
                        phone: "081-987-6543",
                    },
                    assignedTo: "tech-1",
                    estimatedCompletion: "2025-01-14T12:00:00",
                    progress: 50,
                    status: "in_progress",
                    createdAt: "2025-01-13T08:00:00Z",
                    startedAt: "2025-01-13T10:00:00Z",
                    notes: [],
                },
            ];

            setTasks(mockTasks);
        } catch {
            console.error("Failed to fetch tasks");
        } finally {
            setLoading(false);
        }
    };

    const fetchTechnicians = async () => {
        try {
            // TODO: Implement actual API call
            const mockTechnicians: Technician[] = [
                {
                    id: "tech-1",
                    name: "สมศรี ใจดี",
                    email: "somsri@example.com",
                    phone: "082-345-6789",
                    skills: ["แอร์", "ไฟฟ้า"],
                    activeTasks: 2,
                    completedTasks: 8,
                },
                {
                    id: "tech-2",
                    name: "วิไล ดีแก่",
                    email: "wilai@example.com",
                    phone: "083-456-7890",
                    skills: ["ประปา", "ของใช้ในห้อง"],
                    activeTasks: 1,
                    completedTasks: 5,
                },
            ];

            setTechnicians(mockTechnicians);
        } catch {
            console.error("Failed to fetch technicians");
        }
    };

    const _handleAddNote = async (taskId: string, message: string, attachments?: File[]) => {
        try {
            // TODO: Implement actual API call
            let attachmentUrls: string[] = [];

            if (attachments && attachments.length > 0) {
                for (const file of attachments) {
                    // Upload file and get URL
                    const url = await uploadFile(file, "/api/maintenance/upload");
                    attachmentUrls.push(url);
                }
            }

            const newNote = {
                id: `note-${Date.now()}`,
                message,
                createdBy: "ช่างปัจจุบัน",
                createdAt: new Date().toISOString(),
                attachments: attachmentUrls,
            };

            setTasks(prev => prev.map(task =>
                task.id === taskId
                    ? { ...task, notes: [...(task.notes || []), newNote], progress: Math.min(task.progress + 10, 100) }
                    : task
            ));

            toast.success("เพิ่มบันทึกเรียบร้อยแล้ว");
        } catch {
            toast.error("ไม่สามารถเพิ่มบันทึกได้");
        }
    };

    const _handleUpdateProgress = async (taskId: string, progress: number) => {
        try {
            // TODO: Implement actual API call
            setTasks(prev => prev.map(task =>
                task.id === taskId
                    ? {
                        ...task,
                        progress,
                        status: progress >= 100 ? "completed" : "in_progress",
                        completedAt: progress >= 100 ? new Date().toISOString() : task.completedAt,
                    }
                    : task
            ));

            toast.success("อัปเดตความความสำเร็จ");
        } catch {
            toast.error("ไม่สามารถอัปเดตความความได้");
        }
    };

    const handleCompleteTask = async (taskId: string) => {
        try {
            // TODO: Implement actual API call
            setTasks(prev => prev.map(task =>
                task.id === taskId
                    ? { ...task, status: "completed", progress: 100, completedAt: new Date().toISOString() }
                    : task
            ));

            toast.success("ทำงานเสร็จสมบูรณแล้ว");
        } catch {
            toast.error("ไม่สามารถทำเครื่องงานได้");
        }
    };

    const filteredTasks = tasks.filter(task => {
        // Category filter
        if (categoryFilter !== "all" && task.category !== categoryFilter) return false;

        // Priority filter
        if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                task.title.toLowerCase().includes(query) ||
                task.description.toLowerCase().includes(query) ||
                task.unit?.number?.toLowerCase().includes(query) ||
                task.user?.name?.toLowerCase().includes(query)
            );
        }

        return true;
    });

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "urgent":
                return <Badge className="bg-red-500 text-white">ด่วนที่สุด</Badge>;
            case "high":
                return <Badge className="bg-orange-500 text-white">ด่วน</Badge>;
            case "medium":
                return <Badge className="bg-yellow-500 text-white">ปานกลาง</Badge>;
            case "low":
                return <Badge variant="outline">ต่ำ</Badge>;
            default:
                return <Badge variant="secondary">{priority}</Badge>;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "assigned":
                return "text-blue-600 bg-blue-50";
            case "in_progress":
                return "text-orange-600 bg-orange-50";
            case "waiting_parts":
                return "text-yellow-600 bg-yellow-50";
            case "completed":
                return "text-green-600 bg-green-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "assigned":
                return "รับมอบหมาย";
            case "in_progress":
                return "กำลังดำเนินการ";
            case "waiting_parts":
                return "รออะไหล่";
            case "completed":
                return "เสร็จแล้ว";
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">งานที่กำลังดำเนินการ</h1>
                        <p className="text-gray-600 mt-1">ติดตามความคือหนาของงานที่ได้รับมอบหมาย</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
                    <h1 className="text-3xl font-bold text-gray-900">งานที่กำลังดำเนินการ</h1>
                    <p className="text-gray-600 mt-1">ติดตามความคือหนาของงานที่ได้รับมอบหมาย</p>
                </div>
                <div className="text-sm text-gray-500">
                    ทั้งหมด {filteredTasks.length} งาน
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">กำลังดำเนินการ</p>
                                <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
                            </div>
                            <Wrench className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">รองอะไหคุณ</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {tasks.filter(t => t.status === "waiting_parts").length}
                                </p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ความคือหนาเฉลี่ย</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {Math.round(tasks.reduce((acc, task) => acc + task.progress, 0) / tasks.length)}%
                                </p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ช่างที่ปฏิบาทหนาย</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {technicians.length}
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="ค้นหางาน..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm"
                    >
                        <option value="all">ทุกประเภท</option>
                        <option value="ไฟฟ้า">ไฟฟ้า</option>
                        <option value="ประปา">ประปา</option>
                        <option value="แอร์">แอร์</option>
                        <option value="ของใช้ในห้อง">ของใช้ในห้อง</option>
                        <option value="ส่วนกลาง">ส่วนกลาง</option>
                    </select>
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm"
                    >
                        <option value="all">ทุกระดับความ</option>
                        <option value="urgent">ด่วนที่สุด</option>
                        <option value="high">ด่วน</option>
                        <option value="medium">ปานกลาง</option>
                        <option value="low">ต่ำ</option>
                    </select>
                </div>
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">ไม่มีงานที่กำลังดำเนินการ</h3>
                        <p className="text-gray-600">
                            {searchQuery || categoryFilter !== "all" || priorityFilter !== "all"
                                ? "ไม่พบงานที่ตรงตามเงื่อนไข"
                                : "ไม่มีงานที่กำลังดำเนินการในขณะนี้"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredTasks.map((task) => (
                        <Card key={task.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold">{task.title}</h3>
                                            {getPriorityBadge(task.priority)}
                                            <Badge className={getStatusColor(task.status)}>
                                                {getStatusLabel(task.status)}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-600 line-clamp-2">{task.description}</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => { }}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                ดูรายละเอียด
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleCompleteTask(task.id)}
                                                disabled={task.status === "completed"}
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                ทำเครื่องเสร็จ
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Progress Bar */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">ความคือหนา</span>
                                            <span className="text-sm font-medium">{task.progress}%</span>
                                        </div>
                                        <Progress value={task.progress} className="h-2" />
                                    </div>

                                    {/* Task Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Home className="h-4 w-4 text-gray-400" />
                                            <span>ห้อง: {task.unit?.number || "ส่วนกลาง"}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <span>ผู้แจ้ง: {task.user?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span>กำหนด: {technicians.find(t => t.id === task.assignedTo)?.name || "ไม่ระบุ"}</span>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="border-t pt-4">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span>แจ้งซ่อม: {format(new Date(task.createdAt), "PPP HH:mm", { locale: th })}</span>
                                            </div>
                                            {task.startedAt && (
                                                <div className="flex items-center gap-2">
                                                    <Play className="h-4 w-4 text-green-500" />
                                                    <span>เริ่มทำ: {format(new Date(task.startedAt), "PPP HH:mm", { locale: th })}</span>
                                                </div>
                                            )}
                                            {task.estimatedCompletion && (
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-blue-500" />
                                                    <span>กำหนดเสร็จ: {format(new Date(task.estimatedCompletion), "PPP HH:mm", { locale: th })}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Parts Status */}
                                        {task.parts && task.parts.length > 0 && (
                                            <div className="mt-3">
                                                <h4 className="text-sm font-medium mb-2">อะไหคุณ</h4>
                                                <div className="space-y-1">
                                                    {task.parts.map((part) => (
                                                        <div key={part.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                                                            <div>
                                                                <span className="font-medium">{part.name}</span>
                                                                <span className="text-gray-500 ml-2">
                                                                    x{part.quantity}
                                                                </span>
                                                            </div>
                                                            <Badge
                                                                variant={part.status === "received" ? "default" : "outline"}
                                                            >
                                                                {part.status === "ordered" ? "สั่งซื้อ" : "ได้รับแล้ว"}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Notes */}
                                        {task.notes && task.notes.length > 0 && (
                                            <div className="mt-3">
                                                <h4 className="text-sm font-medium mb-2">บันทึกล่าสุด</h4>
                                                <div className="space-y-2">
                                                    {task.notes.slice(-2).map((note) => (
                                                        <div key={note.id} className="p-2 bg-blue-50 rounded text-sm">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span className="font-medium">{note.createdBy}</span>
                                                                <span className="text-xs text-gray-500">
                                                                    {format(new Date(note.createdAt), "HH:mm", { locale: th })}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-700">{note.message}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-2 pt-4 border-t">
                                        <Button
                                            size="sm"
                                            onClick={() => { }}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            ดูรายละเอียด
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleCompleteTask(task.id)}
                                            disabled={task.status === "completed"}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            ทำเสร็จ
                                        </Button>
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
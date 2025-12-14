"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    Clock,
    Home,
    Phone,

    CheckCircle,

    MoreHorizontal,
    Search,

    User,
    Wrench,
    MessageCircle,

} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";


type MaintenanceTicket = {
    id: string;
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
        email?: string;
    };
    category: string;
    title: string;
    description: string;
    status: "pending" | "in_progress" | "completed" | "cancelled";
    priority: "low" | "medium" | "high" | "urgent";
    createdAt: string;
    updatedAt: string;
    assignedTo?: string;
    estimatedCompletion?: string;
    images?: string[];
};

const categories = [
    "ทั้งหมด",
    "ไฟฟ้า",
    "ประปา",
    "แอร์",
    "ของใช้ในห้อง",
    "ส่วนกลาง",
    "อื่นๆ",
];

const priorities = [
    { value: "all", label: "ทั้งหมด" },
    { value: "urgent", label: "ด่วนที่สุด" },
    { value: "high", label: "ด่วน" },
    { value: "medium", label: "ปานกลาง" },
    { value: "low", label: "ต่ำ" },
];

export default function MaintenancePendingPage() {
    const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ทั้งหมด");
    const [priorityFilter, setPriorityFilter] = useState("all");

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);

            // TODO: Implement actual API call
            // Mock data for now
            const mockTickets: MaintenanceTicket[] = [
                {
                    id: "1",
                    unitId: "unit-1",
                    unit: { id: "unit-1", number: "A-101", building: "A", floor: 1 },
                    user: { id: "user-1", name: "สมชาย ใจดี", phone: "081-234-5678", email: "somchai@example.com" },
                    category: "ไฟฟ้า",
                    title: "ไฟกระพริบในห้องนอน",
                    description: "ไฟในห้องนอนกระพริบมา 2 วันแล้ว ต้องการให้ช่างมาตรวจสอบว่าเป็นที่หลอดไฟหรือวงจร",
                    status: "pending",
                    priority: "medium",
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                },
                {
                    id: "2",
                    unitId: "unit-2",
                    unit: { id: "unit-2", number: "B-205", building: "B", floor: 2 },
                    user: { id: "user-2", name: "สมศรี รักเรือน", phone: "082-345-6789", email: "somsri@example.com" },
                    category: "ประปา",
                    title: "น้ำรั่วจากท่อในห้องน้ำ",
                    description: "น้ำรั่วจากท่อต่อใต้อ่างล้างหน้า ต้องการแก้ไขด่วนเพราะน้ำอาจทำให้พื้นเสียหาย",
                    status: "pending",
                    priority: "urgent",
                    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                },
                {
                    id: "3",
                    unitId: "unit-3",
                    unit: { id: "unit-3", number: "C-302", building: "C", floor: 3 },
                    user: { id: "user-3", name: "วิไล รักสงบ", phone: "083-456-7890", email: "wilai@example.com" },
                    category: "แอร์",
                    title: "แอร์ไม่เย็น",
                    description: "แอร์ในห้องนั่งเล่นไม่เย็น คอมเพรสเซอร์ทำงานปกติแต่ลมไม่เย็น อาจจะต้องเติมก๊าซ",
                    status: "pending",
                    priority: "high",
                    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                },
                {
                    id: "4",
                    unitId: "unit-4",
                    unit: { id: "unit-4", number: "D-401", building: "D", floor: 4 },
                    user: { id: "user-4", name: "ประสิทธิ์ มีกำลัง", phone: "084-567-8901", email: "prasit@example.com" },
                    category: "ของใช้ในห้อง",
                    title: "ประตู้ห้องน้ำมีปัญหา",
                    description: "ประตู้ห้องน้ำปิด-เปิดยาก มีเสียงดัง ต้องการปรับแก้",
                    status: "pending",
                    priority: "low",
                    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
                },
                {
                    id: "5",
                    unitId: "unit-5",
                    unit: { id: "unit-5", number: "E-102", building: "E", floor: 1 },
                    user: { id: "user-5", name: "มานี รักษาบ้าน", phone: "085-678-9012", email: "manee@example.com" },
                    category: "ไฟฟ้า",
                    title: "เต้าเสียบไม่ทำงาน",
                    description: "เต้าเสียบไฟในห้องครัวไม่มีไฟเข้า ลองปลั๊กอุปกรณ์อื่นแล้วก็ไม่ทำงาน",
                    status: "pending",
                    priority: "medium",
                    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
                    updatedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
                },
            ];

            setTickets(mockTickets);
        } catch {
            setError("ไม่สามารถโหลดข้อมูลการแจ้งซ่อมได้");
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptTicket = async (ticketId: string) => {
        try {
            // TODO: Implement API call to accept ticket
            const updatedTickets = tickets.map(ticket =>
                ticket.id === ticketId
                    ? { ...ticket, status: "in_progress" as const, assignedTo: "current-user" }
                    : ticket
            );
            setTickets(updatedTickets.filter(t => t.status === "pending"));
        } catch (err) {
            console.error("Failed to accept ticket:", err);
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        // Status filter - only show pending tickets
        if (ticket.status !== "pending") return false;

        // Category filter
        if (categoryFilter !== "ทั้งหมด" && ticket.category !== categoryFilter) return false;

        // Priority filter
        if (priorityFilter !== "all" && ticket.priority !== priorityFilter) return false;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                ticket.title.toLowerCase().includes(query) ||
                ticket.description.toLowerCase().includes(query) ||
                ticket.unit?.number.toLowerCase().includes(query) ||
                ticket.user?.name.toLowerCase().includes(query) ||
                ticket.user?.phone?.includes(query)
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

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">งานที่รอดำเนินการ</h1>
                        <p className="text-gray-600 mt-1">รายการแจ้งซ่อมที่ยังไม่ได้รับมอบหมาย</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
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

    if (error) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">งานที่รอดำเนินการ</h1>
                        <p className="text-gray-600 mt-1">รายการแจ้งซ่อมที่ยังไม่ได้รับมอบหมาย</p>
                    </div>
                </div>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-800">{error}</p>
                        <Button onClick={fetchTickets} variant="outline" className="mt-2">
                            ลองใหม่
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">งานที่รอดำเนินการ</h1>
                    <p className="text-gray-600 mt-1">รายการแจ้งซ่อมที่ยังไม่ได้รับมอบหมาย</p>
                </div>
                <div className="text-sm text-gray-500">
                    ทั้งหมด {filteredTickets.length} รายการ
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="ค้นหาตามชื่อ, ห้อง, หรือรายละเอียด..."
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
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm"
                    >
                        {priorities.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tickets List */}
            {filteredTickets.length === 0 ? (
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="pt-6 text-center">
                        <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">ไม่มีงานที่รอดำเนินการ</h3>
                        <p className="text-gray-600">
                            {searchQuery || categoryFilter !== "ทั้งหมด" || priorityFilter !== "all"
                                ? "ไม่พบรายการที่ตรงตามเงื่อนไข"
                                : "ไม่มีงานที่รอการดำเนินการในขณะนี้"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredTickets.map((ticket) => (
                        <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold text-gray-900">{ticket.title}</h3>
                                            {getPriorityBadge(ticket.priority)}
                                            <Badge variant="outline">{ticket.category}</Badge>
                                        </div>
                                        <p className="text-gray-600 line-clamp-2">{ticket.description}</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>จัดการงาน</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleAcceptTicket(ticket.id)}>
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                รับงานนี้
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link href={`/maintenance/tickets/${ticket.id}`}>
                                                    <Wrench className="h-4 w-4 mr-2" />
                                                    ดูรายละเอียด
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`tel:${ticket.user?.phone}`}>
                                                    <Phone className="h-4 w-4 mr-2" />
                                                    โทรติดต่อ
                                                </Link>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Home className="h-4 w-4 text-gray-400" />
                                        <span>ห้อง: {ticket.unit?.number || "ไม่ระบุ"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span>ผู้แจ้ง: {ticket.user?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span>
                                            {format(new Date(ticket.createdAt), "PPP HH:mm", { locale: th })}
                                        </span>
                                    </div>
                                </div>
                                {ticket.user?.phone && (
                                    <div className="flex items-center gap-2 mt-3 text-sm">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <span className="font-mono">{ticket.user.phone}</span>
                                        <Button size="sm" variant="outline" className="ml-auto">
                                            <MessageCircle className="w-4 h-4 mr-1" />
                                            รับงาน
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
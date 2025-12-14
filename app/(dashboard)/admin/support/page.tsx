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
    Plus,
    MessageSquare,
    Clock,
    CheckCircle,
    AlertCircle,
    MoreHorizontal,
    Eye,
    Reply,
    Search,
    Filter,
    Home,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { api } from "@/lib/api/client";

type SupportTicket = {
    id: string;
    unitId: string;
    unit?: {
        id: string;
        number: string;
    };
    user?: {
        id: string;
        name: string;
        email: string;
    };
    subject: string;
    message?: string;
    status: "open" | "in_progress" | "resolved" | "closed";
    createdAt: string;
    updatedAt: string;
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case "open":
            return <Badge variant="default">เปิดใหม่</Badge>;
        case "in_progress":
            return <Badge className="bg-blue-100 text-blue-800">กำลังดำเนินการ</Badge>;
        case "resolved":
            return <Badge className="bg-green-100 text-green-800">แก้ไขแล้ว</Badge>;
        case "closed":
            return <Badge variant="outline">ปิดแล้ว</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "open":
            return "bg-red-50 border-red-200";
        case "in_progress":
            return "bg-blue-50 border-blue-200";
        case "resolved":
            return "bg-green-50 border-green-200";
        case "closed":
            return "bg-gray-50 border-gray-200";
        default:
            return "bg-white border-gray-200";
    }
};

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const { data } = await api.support.get();
            if (data && Array.isArray(data)) {
                // Sort by date and status priority
                const sortedTickets = data.sort((a: SupportTicket, b: SupportTicket) => {
                    // Priority: open > in_progress > resolved > closed
                    const statusPriority = { open: 0, in_progress: 1, resolved: 2, closed: 3 };
                    const aPriority = statusPriority[a.status] || 999;
                    const bPriority = statusPriority[b.status] || 999;

                    if (aPriority !== bPriority) {
                        return aPriority - bPriority;
                    }

                    // Then by date (newest first)
                    const dateA = new Date(a.createdAt);
                    const dateB = new Date(b.createdAt);
                    return dateB.getTime() - dateA.getTime();
                });
                setTickets(sortedTickets);
            }
        } catch (err) {
            setError("ไม่สามารถโหลดข้อมูลตั๋วงความได้");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            // @ts-ignore - Eden Treaty type inference issue
            const { data, error } = await api.support({ id }).patch({
                status: newStatus
            });

            if (error) {
                throw new Error(String(error.value));
            }

            if (data && data.success) {
                await fetchTickets();
            }
        } catch (err: any) {
            console.error("Failed to update ticket:", err);
            setError(err.message || "ไม่สามารถอัปเดตสถานะได้");
        }
    };

    const filteredTickets = tickets.filter((ticket) => {
        // Status filter
        if (filter !== "all" && ticket.status !== filter) return false;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                ticket.subject.toLowerCase().includes(query) ||
                ticket.message?.toLowerCase().includes(query) ||
                ticket.unit?.number.toLowerCase().includes(query) ||
                ticket.user?.name.toLowerCase().includes(query) ||
                ticket.user?.email.toLowerCase().includes(query)
            );
        }

        return true;
    });

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">จัดการตั๋วงความ</h1>
                        <p className="text-gray-600 mt-1">ตรวจสอบและดำเนินการคำร้องจากลูกบ้าน</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="pb-3">
                                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
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
                        <h1 className="text-3xl font-bold text-gray-900">จัดการตั๋วงความ</h1>
                        <p className="text-gray-600 mt-1">ตรวจสอบและดำเนินการคำร้องจากลูกบ้าน</p>
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

    // Get counts for each status
    const statusCounts = tickets.reduce((acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">จัดการตั๋วงความ</h1>
                    <p className="text-gray-600 mt-1">ตรวจสอบและดำเนินการคำร้องจากลูกบ้าน</p>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white border-red-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-600">เปิดใหม่</p>
                                <p className="text-2xl font-bold text-red-700">{statusCounts.open || 0}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">กำลังดำเนินการ</p>
                                <p className="text-2xl font-bold text-blue-700">{statusCounts.in_progress || 0}</p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-green-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">แก้ไขแล้ว</p>
                                <p className="text-2xl font-bold text-green-700">{statusCounts.resolved || 0}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-gray-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ทั้งหมด</p>
                                <p className="text-2xl font-bold text-gray-700">{tickets.length}</p>
                            </div>
                            <MessageSquare className="h-8 w-8 text-gray-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2">
                    {[
                        { value: "all", label: "ทั้งหมด" },
                        { value: "open", label: "เปิดใหม่" },
                        { value: "in_progress", label: "กำลังดำเนินการ" },
                        { value: "resolved", label: "แก้ไขแล้ว" },
                    ].map((item) => (
                        <Button
                            key={item.value}
                            variant={filter === item.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter(item.value)}
                        >
                            {item.label}
                        </Button>
                    ))}
                </div>
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="ค้นหาตั๋วงความ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Tickets List */}
            {filteredTickets.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            {filter === "all" ? "ยังไม่มีตั๋วงความ" : `ไม่มีตั๋วงความที่${filter === "open" ? "เปิดใหม่" : filter === "in_progress" ? "กำลังดำเนินการ" : "แก้ไขแล้ว"}`}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {searchQuery ? "ไม่พบตั๋วงความที่ตรงตามเงื่อนไขการค้นหา" : "ไม่พบตั๋วงความที่ตรงตามเงื่อนไข"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredTickets.map((ticket) => (
                        <Card key={ticket.id} className={`hover:shadow-md transition-shadow ${getStatusColor(ticket.status)}`}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <CardTitle className="text-xl">{ticket.subject}</CardTitle>
                                            {getStatusBadge(ticket.status)}
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                            {ticket.unit && (
                                                <div className="flex items-center gap-2">
                                                    <Home className="h-4 w-4" />
                                                    {ticket.unit.number}
                                                </div>
                                            )}
                                            {ticket.user && (
                                                <div className="flex items-center gap-2">
                                                    <MessageSquare className="h-4 w-4" />
                                                    {ticket.user.name}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                {format(new Date(ticket.createdAt), "PPP HH:mm", { locale: th })}
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
                                            <DropdownMenuLabel>จัดการตั๋วงความ</DropdownMenuLabel>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/support/${ticket.id}`}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    ดูรายละเอียด
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {ticket.status === "open" && (
                                                <DropdownMenuItem
                                                    onClick={() => handleStatusUpdate(ticket.id, "in_progress")}
                                                >
                                                    <Clock className="h-4 w-4 mr-2" />
                                                    รับเรื่อง
                                                </DropdownMenuItem>
                                            )}
                                            {(ticket.status === "open" || ticket.status === "in_progress") && (
                                                <DropdownMenuItem
                                                    onClick={() => handleStatusUpdate(ticket.id, "resolved")}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    แก้ไขแล้ว
                                                </DropdownMenuItem>
                                            )}
                                            {(ticket.status === "resolved") && (
                                                <DropdownMenuItem
                                                    onClick={() => handleStatusUpdate(ticket.id, "closed")}
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    ปิดเรื่อง
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            {ticket.message && (
                                <CardContent className="pt-0">
                                    <div className="text-gray-700 text-sm line-clamp-3">
                                        {ticket.message}
                                    </div>
                                </CardContent>
                            )}
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                                    <div>
                                        <span className="font-medium">รหัสตั๋วง:</span> #{ticket.id.slice(0, 8)}...
                                    </div>
                                    <div>
                                        <span className="font-medium">อัพเดตล่าสุด:</span>{" "}
                                        {format(new Date(ticket.updatedAt), "PPP HH:mm", { locale: th })}
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
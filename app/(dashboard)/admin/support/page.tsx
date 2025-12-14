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
    MessageSquare,
    Clock,
    CheckCircle,
    AlertCircle,
    MoreHorizontal,
    Eye,
    Search,
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
        unitNumber?: string;
        number?: string;
    };
    user?: {
        id: string;
        name: string;
        email: string;
    };
    subject: string;
    message?: string | null;
    status: "open" | "in_progress" | "resolved" | "closed";
    createdAt: string;
    updatedAt?: string;
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case "open":
            return <Badge variant="default">เปิดใหม่</Badge>;
        case "in_progress":
            return <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">กำลังดำเนินการ</Badge>;
        case "resolved":
            return <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">แก้ไขแล้ว</Badge>;
        case "closed":
            return <Badge variant="outline">ปิดแล้ว</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "open":
            return "bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800/50";
        case "in_progress":
            return "bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50";
        case "resolved":
            return "bg-green-50/80 dark:bg-green-900/20 border-green-200 dark:border-green-800/50";
        case "closed":
            return "bg-slate-50/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700";
        default:
            return "bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50";
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
                const sortedTickets = data.sort((a: SupportTicket, b: SupportTicket) => {
                    const statusPriority = { open: 0, in_progress: 1, resolved: 2, closed: 3 };
                    const aPriority = statusPriority[a.status] || 999;
                    const bPriority = statusPriority[b.status] || 999;

                    if (aPriority !== bPriority) {
                        return aPriority - bPriority;
                    }

                    const dateA = new Date(a.createdAt);
                    const dateB = new Date(b.createdAt);
                    return dateB.getTime() - dateA.getTime();
                });
                setTickets(sortedTickets);
            }
        } catch {
            setError("ไม่สามารถโหลดข้อมูลแจ้งปัญหาได้");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const response = await api.support({ id }).patch({ status: newStatus }) as {
                data: { success: boolean } | null;
                error: { value: unknown } | null;
            };

            if (response.error) {
                throw new Error(String(response.error.value));
            }

            if (response.data?.success) {
                await fetchTickets();
            }
        } catch (err: unknown) {
            console.error("Failed to update ticket:", err);
            const message = err instanceof Error ? err.message : "ไม่สามารถอัปเดตสถานะได้";
            setError(message);
        }
    };

    const filteredTickets = tickets.filter((ticket) => {
        if (filter !== "all" && ticket.status !== filter) return false;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const unitNumber = ticket.unit?.unitNumber || ticket.unit?.number || "";
            return (
                ticket.subject.toLowerCase().includes(query) ||
                ticket.message?.toLowerCase().includes(query) ||
                unitNumber.toLowerCase().includes(query) ||
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
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">จัดการแจ้งปัญหา</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">ตรวจสอบและดำเนินการคำร้องจากลูกบ้าน</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i} className="animate-pulse bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardHeader className="pb-3">
                                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mt-2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
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
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">จัดการแจ้งปัญหา</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">ตรวจสอบและดำเนินการคำร้องจากลูกบ้าน</p>
                    </div>
                </div>
                <Card className="border-red-200 dark:border-red-800/50 bg-red-50/80 dark:bg-red-900/20 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <p className="text-red-800 dark:text-red-300">{error}</p>
                        <Button onClick={fetchTickets} variant="outline" className="mt-2">
                            ลองใหม่
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const statusCounts = tickets.reduce((acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">จัดการแจ้งปัญหา</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">ตรวจสอบและดำเนินการคำร้องจากลูกบ้าน</p>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white/80 dark:bg-slate-900/50 border-red-200 dark:border-red-800/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">เปิดใหม่</p>
                                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{statusCounts.open || 0}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-blue-200 dark:border-blue-800/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">กำลังดำเนินการ</p>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{statusCounts.in_progress || 0}</p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-green-200 dark:border-green-800/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">แก้ไขแล้ว</p>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{statusCounts.resolved || 0}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ทั้งหมด</p>
                                <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{tickets.length}</p>
                            </div>
                            <MessageSquare className="h-8 w-8 text-slate-500 dark:text-slate-400" />
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
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
                    <Input
                        placeholder="ค้นหาแจ้งปัญหา..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Tickets List */}
            {filteredTickets.length === 0 ? (
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="pt-6 text-center">
                        <MessageSquare className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                            {filter === "all" ? "ยังไม่มีแจ้งปัญหา" : `ไม่มีแจ้งปัญหาที่${filter === "open" ? "เปิดใหม่" : filter === "in_progress" ? "กำลังดำเนินการ" : "แก้ไขแล้ว"}`}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            {searchQuery ? "ไม่พบแจ้งปัญหาที่ตรงตามเงื่อนไขการค้นหา" : "ไม่พบแจ้งปัญหาที่ตรงตามเงื่อนไข"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredTickets.map((ticket) => (
                        <Card key={ticket.id} className={`hover:shadow-md transition-shadow backdrop-blur-sm ${getStatusColor(ticket.status)}`}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <CardTitle className="text-xl text-slate-900 dark:text-white">{ticket.subject}</CardTitle>
                                            {getStatusBadge(ticket.status)}
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                                            {ticket.unit && (
                                                <div className="flex items-center gap-2">
                                                    <Home className="h-4 w-4" />
                                                    {ticket.unit.unitNumber || ticket.unit.number}
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
                                            <DropdownMenuLabel>จัดการแจ้งปัญหา</DropdownMenuLabel>
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
                                    <div className="text-slate-700 dark:text-slate-300 text-sm line-clamp-3">
                                        {ticket.message}
                                    </div>
                                </CardContent>
                            )}
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-500 dark:text-slate-400">
                                    <div>
                                        <span className="font-medium">รหัสเรื่อง:</span> #{ticket.id.slice(0, 8)}...
                                    </div>
                                    {ticket.updatedAt && (
                                        <div>
                                            <span className="font-medium">อัพเดตล่าสุด:</span>{" "}
                                            {format(new Date(ticket.updatedAt), "PPP HH:mm", { locale: th })}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
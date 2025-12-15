"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Plus,
    MessageSquare,
    Clock,
    MoreHorizontal,
    Eye,
    Reply,
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

export default function SupportPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const { data } = await api.support.get();
            if (data && Array.isArray(data)) {
                // Sort by date
                const sortedTickets = data.sort((a: SupportTicket, b: SupportTicket) => {
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

    const filteredTickets = tickets.filter((ticket) => {
        if (filter === "all") return true;
        if (filter === "open") return ticket.status === "open";
        if (filter === "in_progress") return ticket.status === "in_progress";
        if (filter === "resolved") return ticket.status === "resolved" || ticket.status === "closed";
        return ticket.status === filter;
    });

    const handleViewTicket = (id: string) => {
        router.push(`/resident/support/${id}`);
    };

    const handleReply = (id: string) => {
        router.push(`/resident/support/${id}`);
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ตั๋วงความ</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">ติดต่อนิติบุคคลเพื่อขอความช่วยเหลือ</p>
                    </div>
                    <Link href="/resident/support/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            สร้างตั๋วงความ
                        </Button>
                    </Link>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
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
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ตั๋วงความ</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">ติดต่อนิติบุคคลเพื่อขอความช่วยเหลือ</p>
                    </div>
                    <Link href="/resident/support/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            สร้างตั๋วงความ
                        </Button>
                    </Link>
                </div>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-red-200 dark:border-red-500/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <p className="text-red-800 dark:text-red-400">{error}</p>
                        <Button onClick={fetchTickets} variant="outline" className="mt-2 border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        ตั๋วงความ
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">ติดต่อนิติบุคคลเพื่อขอความช่วยเหลือ</p>
                </div>
                <Link href="/resident/support/new">
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02]">
                        <Plus className="h-4 w-4 mr-2" />
                        สร้างตั๋วงความ
                    </Button>
                </Link>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-4">
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
            </div>

            {/* Tickets List */}
            {filteredTickets.length === 0 ? (
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="pt-6 text-center">
                        <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            {filter === "all" ? "ยังไม่มีตั๋วงความ" : `ไม่มีตั๋วงความ${filter === "open" ? "ที่เปิดใหม่" : filter === "in_progress" ? "ที่กำลังดำเนินการ" : "ที่แก้ไขแล้ว"}`}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            {filter === "all" ? "สร้างตั๋วงความแรกเพื่อติดต่อนิติบุคคล" : `ไม่พบตั๋วงความที่ตรงตามเงื่อนไข`}
                        </p>
                        {filter === "all" && (
                            <Link href="/resident/support/new">
                                <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02]">สร้างตั๋วงความแรก</Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredTickets.map((ticket) => (
                        <Card
                            key={ticket.id}
                            className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5"
                            onClick={() => handleViewTicket(ticket.id)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <CardTitle className="text-xl text-slate-900 dark:text-white">{ticket.subject}</CardTitle>
                                            {getStatusBadge(ticket.status)}
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4" />
                                                {ticket.unit?.number || "ไม่ระบุห้อง"}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                {format(new Date(ticket.createdAt), "PPP", { locale: th })}
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
                                            <DropdownMenuItem
                                                onClick={() => handleViewTicket(ticket.id)}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                ดูรายละเอียด
                                            </DropdownMenuItem>
                                            {ticket.status !== "closed" && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleReply(ticket.id)}
                                                    >
                                                        <Reply className="h-4 w-4 mr-2" />
                                                        ตอบกลับ
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            {ticket.message && (
                                <CardContent className="pt-0">
                                    <div className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                                        {ticket.message}
                                    </div>
                                </CardContent>
                            )}
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-500 dark:text-slate-400">
                                    <div>
                                        <span className="font-medium">รหัสตั๋วง:</span> #{ticket.id.slice(0, 8)}...
                                    </div>
                                    <div>
                                        <span className="font-medium">อัพเดตล่าสุดท้าย:</span>{" "}
                                        {format(new Date(ticket.updatedAt), "PPP", { locale: th })}
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
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    MessageSquare,
    Paperclip,
    Send,
    User,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    Calendar,
    MapPin,
    Phone,
    Mail,
    Download,
    Reply,
    MoreHorizontal,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDateTime } from "@/lib/utils/format";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import type { SupportTicket as DBSupportTicket } from "@/types";

// Extended support ticket type with UI properties
type SupportTicket = DBSupportTicket & {
    userName?: string;
    userUnit?: string;
    userEmail?: string;
    userPhone?: string;
    category?: string;
    description?: string;
    priority?: string;
    assignedTo?: string;
    assignedToId?: string;
    attachments?: Array<{
        id: string;
        name: string;
        url: string;
        type: string;
        size: number;
    }>;
    responses?: Array<{
        id: string;
        userId: string;
        userName: string;
        userRole?: string;
        message: string;
        createdAt: string;
        isAdmin: boolean;
        attachments?: Array<{
            id: string;
            name: string;
            url: string;
            type: string;
            size: number;
        }>;
    }>;
    updatedAt?: Date;
};

export default function SupportTicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const ticketId = params.id as string;

    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showCloseDialog, setShowCloseDialog] = useState(false);

    const fetchTicket = useCallback(async () => {
        try {
            setLoading(true);
            // Correct API call
            const { data, error } = await api.support({ id: ticketId }).get();

            if (error) {
                toast.error("ไม่สามารถโหลดข้อมูลตั๋วงความได้");
                return;
            }

            if (data && data.success) {
                setTicket(data.data as unknown as SupportTicket);
            }
        } catch (err) {
            console.error("Failed to fetch ticket:", err);
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
            setLoading(false);
        }
    }, [ticketId]);

    useEffect(() => {
        fetchTicket();
    }, [fetchTicket]);

    const getStatusColor = (status: string | null | undefined) => {
        switch (status) {
            case "open":
                return "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20";
            case "in_progress":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20";
            case "resolved":
                return "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20";
            case "closed":
                return "bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20";
            default:
                return "bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20";
        }
    };

    const getStatusText = (status: string | null | undefined) => {
        switch (status) {
            case "open":
                return "เปิดแล้ว";
            case "in_progress":
                return "กำลังดำเนินการ";
            case "resolved":
                return "แก้ไขแล้ว";
            case "closed":
                return "ปิดแล้ว";
            default:
                return status || "-";
        }
    };

    const getPriorityColor = (priority: string | undefined) => {
        switch (priority) {
            case "urgent":
                return "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20";
            case "high":
                return "bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-500/20";
            case "medium":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20";
            case "low":
                return "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20";
            default:
                return "bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20";
        }
    };

    const getPriorityText = (priority: string | undefined) => {
        switch (priority) {
            case "urgent":
                return "เร่งด่วน";
            case "high":
                return "สูง";
            case "medium":
                return "ปานกลาง";
            case "low":
                return "ต่ำ";
            default:
                return priority || "-";
        }
    };

    const getCategoryText = (category: string | undefined) => {
        switch (category) {
            case "maintenance":
                return "แจ้งซ่อมบำรุง";
            case "account":
                return "ปัญหาบัญชี";
            case "payment":
                return "การชำระเงิน";
            case "facility":
                return "สิ่งอำนวยความสะดวก";
            case "parking":
                return "ที่จอดรถ";
            case "security":
                return "ความปลอดภัย";
            case "noise":
                return "เรื่องรบกวน";
            case "suggestion":
                return "ข้อเสนอแนะ";
            case "complaint":
                return "ร้องเรียน";
            default:
                return "อื่นๆ";
        }
    };

    const getRoleColor = (role: string | undefined) => {
        switch (role) {
            case "admin":
                return "bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20";
            case "maintenance":
                return "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20";
            case "resident":
                return "bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20";
            default:
                return "bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20";
        }
    };

    const getRoleText = (role: string | undefined) => {
        switch (role) {
            case "admin":
                return "แอดมิน";
            case "maintenance":
                return "ช่าง";
            case "resident":
                return "ลูกบ้าน";
            default:
                return role || "-";
        }
    };


    const handleReply = async () => {
        if (!replyText.trim()) return;

        setSubmitting(true);
        try {
            // Correct API call
            const { data, error } = await api.support({ id: ticketId }).responses.post({
                message: replyText
            });

            if (error) {
                toast.error("ไม่สามารถส่งความคิดเห็นได้");
                return;
            }

            if (data && data.success) {
                toast.success("ส่งความคิดเห็นเรียบร้อยแล้ว");
                setReplyText("");
                fetchTicket(); // Refresh data
            }
        } catch (error) {
            console.error("Failed to send reply:", error);
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseTicket = async () => {
        setSubmitting(true);
        try {
            // Correct API call
            const { data, error } = await api.support({ id: ticketId }).patch({
                status: "closed"
            });

            if (error) {
                toast.error("ไม่สามารถปิดตั๋วงความได้");
                return;
            }

            if (data && data.success) {
                toast.success("ปิดตั๋วงความเรียบร้อยแล้ว");
                router.push("/resident/support");
            }
        } catch (error) {
            console.error("Failed to close ticket:", error);
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
            setSubmitting(false);
            setShowCloseDialog(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <AlertCircle className="w-12 h-12 text-slate-300" />
                <p className="text-slate-500">ไม่พบข้อมูลตั๋วงความ</p>
                <Link href="/resident/support">
                    <Button variant="outline">กลับหน้ารายการ</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/resident/support">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            กลับ
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ตั๋วงความ #{ticketId.substring(0, 8)}</h1>
                        <p className="text-slate-600 dark:text-slate-400">รายละเอียดและประวัติการตอบกลับ</p>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            ดาวน์โหลด PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            ส่งต่อผู้ดูแลอื่น
                        </DropdownMenuItem>
                        {ticket.status !== "closed" && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => setShowCloseDialog(true)}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    ปิดตั๋วงความ
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Status and Priority Badges */}
            <div className="flex items-center gap-3">
                <Badge className={getStatusColor(ticket.status)}>
                    {getStatusText(ticket.status)}
                </Badge>
                <Badge className={getPriorityColor(ticket.priority)}>
                    {getPriorityText(ticket.priority)}
                </Badge>
                <Badge variant="outline">
                    {getCategoryText(ticket.category)}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Initial Ticket */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDateTime(ticket.createdAt)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {ticket.userUnit || "-"}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={`/avatars/${ticket.userId}.jpg`} />
                                    <AvatarFallback>{ticket.userName?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-slate-900 dark:text-white">{ticket.userName}</span>
                                        <Badge variant="outline" className={getRoleColor("resident")}>
                                            ลูกบ้าน
                                        </Badge>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{ticket.description}</p>
                                </div>
                            </div>

                            {ticket.attachments && ticket.attachments.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">ไฟล์แนบ:</p>
                                    {ticket.attachments.map((file) => (
                                        <div key={file.id} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-200 dark:border-slate-700">
                                            <Paperclip className="h-4 w-4 text-slate-400" />
                                            <span className="text-sm flex-1 text-slate-700 dark:text-slate-300">{file.name}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {formatFileSize(file.size)}
                                            </span>
                                            <Button variant="ghost" size="sm">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Replies */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">การตอบกลับ ({ticket.responses?.length || 0})</h3>
                        {ticket.responses?.map((reply) => (
                            <Card key={reply.id} className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                                <CardContent className="pt-4">
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={`/avatars/${reply.userId}.jpg`} />
                                            <AvatarFallback>{reply.userName?.charAt(0) || "U"}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-slate-900 dark:text-white">{reply.userName}</span>
                                                <Badge variant="outline" className={getRoleColor(reply.userRole)}>
                                                    {getRoleText(reply.userRole)}
                                                </Badge>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {formatDateTime(reply.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{reply.message}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {ticket.assignedTo && (
                            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <AlertDescription className="text-blue-800 dark:text-blue-300">
                                    ตั๋วงความนี้ได้รับมอบหมายให้ {ticket.assignedTo}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Reply Form */}
                    {ticket.status !== "closed" && (
                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">ตอบกลับ</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    placeholder="พิมพ์ข้อความตอบกลับ..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    rows={4}
                                />
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm">
                                        <Paperclip className="h-4 w-4 mr-2" />
                                        แนบไฟล์
                                    </Button>
                                    <Button
                                        onClick={handleReply}
                                        disabled={!replyText.trim() || submitting}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                กำลังส่ง...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                ส่งข้อความ
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">ข้อมูลผู้แจ้ง</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                                    <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">ชื่อ-นามสกุล</p>
                                    <p className="font-medium">{ticket.userName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                                    <MapPin className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">บ้านเลขที่</p>
                                    <p className="font-medium">{ticket.userUnit || "-"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                                    <Phone className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">เบอร์โทรศัพท์</p>
                                    <p className="font-medium">{ticket.userPhone || "-"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                                    <Mail className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">อีเมล</p>
                                    <p className="font-medium">{ticket.userEmail || "-"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">ไทม์ไลน์</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="mt-1">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">เปิดตั๋วงความ</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {formatDateTime(ticket.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                {ticket.updatedAt && ticket.createdAt && ticket.updatedAt > ticket.createdAt && (
                                    <div className="flex gap-3">
                                        <div className="mt-1">
                                            <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">อัปเดตล่าสุด</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {formatDateTime(ticket.updatedAt)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {ticket.status === "closed" && (
                                    <div className="flex gap-3">
                                        <div className="mt-1">
                                            <div className="h-2 w-2 rounded-full bg-green-500 ring-4 ring-green-100 dark:ring-green-900" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">ปิดงานแล้ว</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {formatDateTime(ticket.updatedAt || new Date())}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
"use client";

import React, { useState } from "react";
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
    replies?: Array<{
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

// Sample data
const ticket: SupportTicket = {
    id: "TK001",
    unitId: "unit-1",
    userId: "user1",
    subject: "แจ้งซ่อมแอร์ห้องนอนให้ความเย็นน้อยลง",
    message: "แอร์ห้องนอนทำงานปกติ แต่ความเย็นน้อยลงมาก ต้องตั้งอุณหภูมิต่ำสุดถึงจะรู้สึกเย็นได้ น่าจะเป็นเรื่องก๊าซรั่วหรือฟิลเตอร์สกปริก",
    status: "in_progress",
    createdAt: new Date("2025-01-15T09:00:00Z"),
    repliedAt: new Date("2025-01-15T10:15:00Z"),
    repliedBy: "admin1",
    userName: "สมชาย ใจดี",
    userUnit: "A/101",
    userEmail: "somchai@email.com",
    userPhone: "0812345678",
    category: "maintenance",
    description: "แอร์ห้องนอนทำงานปกติ แต่ความเย็นน้อยลงมาก ต้องตั้งอุณหภูมิต่ำสุดถึงจะรู้สึกเย็นได้ น่าจะเป็นเรื่องก๊าซรั่วหรือฟิลเตอร์สกปริก",
    priority: "medium",
    assignedTo: "ช่างสมศักดิ์",
    assignedToId: "tech1",
    updatedAt: new Date("2025-01-15T14:30:00Z"),
    attachments: [
        {
            id: "att1",
            name: "แอร์ห้องนอน.jpg",
            url: "/attachments/aircon.jpg",
            type: "image/jpeg",
            size: 2048576,
        },
    ],
    replies: [
        {
            id: "reply1",
            userId: "admin1",
            userName: "แอดมินจอห์น",
            userRole: "admin",
            isAdmin: true,
            message: "ได้รับเรื่องแล้วครับ จะส่งช่างไปตรวจสอบในวันนี้ ช่างจะโทรนัดหมายก่อนไปครับ",
            createdAt: "2025-01-15T10:15:00Z",
            attachments: [],
        },
        {
            id: "reply2",
            userId: "tech1",
            userName: "ช่างสมศักดิ์",
            userRole: "maintenance",
            isAdmin: false,
            message: "สวัสดีครับ ช่างสมศักดิ์ครับ ผมสามารถไปตรวจสอบได้ในช่วงบ่ายวันนี้ (ประมาณ 14:00 น.) ได้ไหมครับ",
            createdAt: "2025-01-15T13:45:00Z",
            attachments: [],
        },
        {
            id: "reply3",
            userId: "user1",
            userName: "สมชาย ใจดี",
            userRole: "resident",
            isAdmin: false,
            message: "ได้ครับ 14:00 น. ผมอยู่บ้านครับ",
            createdAt: "2025-01-15T13:50:00Z",
            attachments: [],
        },
    ],
};

export default function SupportTicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const ticketId = params.id as string;

    const [replyText, setReplyText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showCloseDialog, setShowCloseDialog] = useState(false);

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case "open":
                return "bg-blue-100 text-blue-800";
            case "in_progress":
                return "bg-yellow-100 text-yellow-800";
            case "resolved":
                return "bg-green-100 text-green-800";
            case "closed":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusText = (status: string | null) => {
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
                return status;
        }
    };

    const getPriorityColor = (priority: string | undefined) => {
        switch (priority) {
            case "urgent":
                return "bg-red-100 text-red-800";
            case "high":
                return "bg-orange-100 text-orange-800";
            case "medium":
                return "bg-yellow-100 text-yellow-800";
            case "low":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
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
                return priority;
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
                return "bg-purple-100 text-purple-800";
            case "maintenance":
                return "bg-blue-100 text-blue-800";
            case "resident":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
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
                return role;
        }
    };


    const handleReply = async () => {
        if (!replyText.trim()) return;

        setSubmitting(true);
        try {
            // In real app, call API to add reply
            // await api.support.tickets(ticketId).replies.post({ message: replyText });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Reload the page or update state
            window.location.reload();
        } catch (error) {
            console.error("Failed to send reply:", error);
        } finally {
            setSubmitting(false);
            setReplyText("");
        }
    };

    const handleCloseTicket = async () => {
        setSubmitting(true);
        try {
            // In real app, call API to close ticket
            // await api.support.tickets(ticketId).patch({ status: "closed" });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            router.push("/resident/support");
        } catch (error) {
            console.error("Failed to close ticket:", error);
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
                        <h1 className="text-2xl font-bold text-gray-900">ตั๋วงความ #{ticketId}</h1>
                        <p className="text-gray-600">รายละเอียดและประวัติการตอบกลับ</p>
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
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDateTime(ticket.createdAt)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {ticket.userUnit}
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
                                        <span className="font-medium">{ticket.userName}</span>
                                        <Badge variant="outline" className={getRoleColor("resident")}>
                                            ลูกบ้าน
                                        </Badge>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                                </div>
                            </div>

                            {ticket.attachments && ticket.attachments.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">ไฟล์แนบ:</p>
                                    {ticket.attachments.map((file) => (
                                        <div key={file.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                                            <Paperclip className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm flex-1">{file.name}</span>
                                            <span className="text-xs text-gray-500">
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
                        <h3 className="text-lg font-semibold">การตอบกลับ ({ticket.replies?.length || 0})</h3>
                        {ticket.replies?.map((reply) => (
                            <Card key={reply.id}>
                                <CardContent className="pt-4">
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={`/avatars/${reply.userId}.jpg`} />
                                            <AvatarFallback>{reply.userName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium">{reply.userName}</span>
                                                <Badge variant="outline" className={getRoleColor(reply.userRole)}>
                                                    {getRoleText(reply.userRole)}
                                                </Badge>
                                                <span className="text-xs text-gray-500">
                                                    {formatDateTime(reply.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 whitespace-pre-wrap">{reply.message}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {ticket.assignedTo && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    ตั๋วงความนี้ได้รับมอบหมายให้ {ticket.assignedTo}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Reply Form */}
                    {ticket.status !== "closed" && (
                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Reply className="h-5 w-5" />
                                    เพิ่มความเห็น
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="พิมพ์ความเห็นหรือข้อมูลเพิ่มเติม..."
                                    rows={4}
                                />
                                <div className="flex justify-end">
                                    <Button onClick={handleReply} disabled={!replyText.trim() || submitting}>
                                        <Send className="h-4 w-4 mr-2" />
                                        {submitting ? "กำลังส่ง..." : "ส่งความเห็น"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-sm">ข้อมูลผู้แจ้ง</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">ชื่อ</p>
                                <p className="font-medium">{ticket.userName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">หน่วยที่พัก</p>
                                <p className="font-medium">{ticket.userUnit}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">อีเมล</p>
                                <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3 text-gray-400" />
                                    <a href={`mailto:${ticket.userEmail}`} className="text-blue-600 hover:underline">
                                        {ticket.userEmail}
                                    </a>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">โทรศัพท์</p>
                                <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 text-gray-400" />
                                    <a href={`tel:${ticket.userPhone}`} className="text-blue-600 hover:underline">
                                        {ticket.userPhone}
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ticket Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">รายละเอียดตั๋วงความ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">รหัสตั๋ว</p>
                                <p className="font-medium">{ticketId}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">สถานะ</p>
                                <Badge className={getStatusColor(ticket.status)}>
                                    {getStatusText(ticket.status)}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">ความสำคัญ</p>
                                <Badge className={getPriorityColor(ticket.priority)}>
                                    {getPriorityText(ticket.priority)}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">ประเภท</p>
                                <p className="font-medium">{getCategoryText(ticket.category)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">สร้างเมื่อ</p>
                                <p className="font-medium">{formatDateTime(ticket.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">อัปเดตล่าสุด</p>
                                <p className="font-medium">{formatDateTime(ticket.updatedAt || ticket.createdAt)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    {ticket.status !== "closed" && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">การดำเนินการ</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowCloseDialog(true)}
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    ปิดตั๋วงความ
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Close Confirmation Dialog */}
            <Card className="hidden">
                <CardContent className="p-0">
                    <div className="p-4 space-y-4">
                        <h3 className="font-semibold">ยืนยันการปิดตั๋วงความ</h3>
                        <p className="text-sm text-gray-600">
                            คุณแน่ใจหรือไม่ว่าต้องการปิดตั๋วงความนี้?
                            หากปิดแล้วจะไม่สามารถแก้ไขได้
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setShowCloseDialog(false)}>
                                ยกเลิก
                            </Button>
                            <Button variant="destructive" onClick={handleCloseTicket}>
                                ปิดตั๋วงความ
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
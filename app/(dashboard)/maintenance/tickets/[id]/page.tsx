"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Separator } from "@/components/ui/separator";
import { FileViewer, ImageGallery } from "@/components/ui/file-viewer";
import {
    ArrowLeft,
    Home,
    User,
    Phone,
    Mail,
    Calendar,
    Wrench,
    MessageCircle,
    Camera,
    FileText,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";

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
        email: string;
        phone?: string;
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
    documents?: Array<{
        id: string;
        name: string;
        url: string;
        type: string;
        size: number;
    }>;
    notes?: Array<{
        id: string;
        message: string;
        createdBy: string;
        createdAt: string;
    }>;
};

export default function MaintenanceTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [ticket, setTicket] = useState<MaintenanceTicket | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newNote, setNewNote] = useState("");
    const [newStatus, setNewStatus] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTicketDetails = useCallback(async () => {
        try {
            setLoading(true);

            // TODO: Implement actual API call
            // Mock data for now
            const mockTicket: MaintenanceTicket = {
                id: id,
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
                    email: "somchai@example.com",
                    phone: "081-234-5678",
                },
                category: "ไฟฟ้า",
                title: "ไฟกระพริบในห้องนอน",
                description: "ไฟในห้องนอนกระพริบมา 2 วันแล้ว ต้องการให้ช่างมาตรวจสอบว่าเป็นที่หลอดไฟหรือวงจร กระพริบอย่างต่อเนื่องทำให้ไม่สามารถนอนหลับได้",
                status: "pending",
                priority: "medium",
                createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                images: [
                    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1604082267651-e3b4d14c4c87?w=800&h=600&fit=crop",
                ],
                documents: [
                    {
                        id: "doc-1",
                        name: "ใบแจ้งหนี้ค่าไฟ.pdf",
                        url: "/documents/invoice.pdf",
                        type: "application/pdf",
                        size: 245760,
                    },
                ],
                notes: [
                    {
                        id: "note-1",
                        message: "ลูกบ้านโทรมาแจ้งปัญหาอีกครั้ง เรื่องไฟกระพริบรบกวนการนอน",
                        createdBy: "ผู้แจ้ง",
                        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                    },
                ],
            };

            setTicket(mockTicket);
            setNewStatus(mockTicket.status);
        } catch (err: unknown) {
            console.error("Failed to fetch ticket details:", err);
            const errorMessage = err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลได้";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchTicketDetails();
        }
    }, [id, fetchTicketDetails]);

    const handleStatusUpdate = async () => {
        if (!ticket || newStatus === ticket.status) return;

        setIsSubmitting(true);
        try {
            // TODO: Implement API call
            setTicket(prev => prev ? { ...prev, status: newStatus as MaintenanceTicket["status"] } : null);
            toast.success("อัปเดตสถานะเรียบร้อยแล้ว");
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "ไม่สามารถอัปเดตสถานะได้";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        setIsSubmitting(true);
        try {
            // TODO: Implement API call
            const newNoteObj = {
                id: `note-${Date.now()}`,
                message: newNote,
                createdBy: "ช่างซ่อมบำรุง",
                createdAt: new Date().toISOString(),
            };

            setTicket(prev => prev ? {
                ...prev,
                notes: [...(prev.notes || []), newNoteObj],
                status: prev.status === "pending" ? "in_progress" : prev.status,
            } : null);

            setNewNote("");
            toast.success("เพิ่มบันทึกเรียบร้อยแล้ว");

            // Update status if it was pending
            if (ticket?.status === "pending") {
                setNewStatus("in_progress");
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "ไม่สามารถเพิ่มบันทึกได้";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <Badge variant="outline">รอดำเนินการ</Badge>;
            case "in_progress":
                return <Badge className="bg-blue-500 text-white">กำลังดำเนินการ</Badge>;
            case "completed":
                return <Badge className="bg-green-500 text-white">เสร็จแล้ว</Badge>;
            case "cancelled":
                return <Badge variant="destructive">ยกเลิก</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/maintenance/pending">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
                <Card className="animate-pulse">
                    <CardHeader>
                        <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/maintenance/pending">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">ข้อผิดพลาด</h1>
                </div>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-800">{error || "ไม่พบข้อมูล"}</p>
                        <Link href="/maintenance/pending">
                            <Button variant="outline" className="mt-2">
                                กลับไปหน้ารายการ
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/maintenance/pending">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold">แจ้งซ่อม #{ticket.id.slice(0, 8)}...</h1>
                        <div className="flex items-center gap-2">
                            {getPriorityBadge(ticket.priority)}
                            {getStatusBadge(ticket.status)}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="space-y-1">
                        <Label htmlFor="status" className="text-sm">เปลี่ยนสถานะ</Label>
                        <div className="flex gap-2">
                            <select
                                id="status"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="px-3 py-1 border rounded-md text-sm"
                                disabled={isSubmitting}
                            >
                                <option value="pending">รอดำเนินการ</option>
                                <option value="in_progress">กำลังดำเนินการ</option>
                                <option value="completed">เสร็จแล้ว</option>
                                <option value="cancelled">ยกเลิก</option>
                            </select>
                            {newStatus !== ticket.status && (
                                <Button size="sm" onClick={handleStatusUpdate} disabled={isSubmitting}>
                                    บันทึก
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Ticket Details */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wrench className="w-5 h-5" />
                                รายละเอียดการแจ้งซ่อม
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{ticket.title}</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                            </div>

                            {/* Images */}
                            {ticket.images && ticket.images.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <Camera className="w-4 h-4" />
                                        รูปภาพประกอบ
                                    </h4>
                                    <ImageGallery
                                        images={ticket.images.map(url => ({ url, alt: ticket.title }))}
                                    />
                                </div>
                            )}

                            {/* Documents */}
                            {ticket.documents && ticket.documents.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        เอกสารแนบ
                                    </h4>
                                    <div className="space-y-2">
                                        {ticket.documents.map((doc) => (
                                            <FileViewer key={doc.id} file={doc} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>บันทึกการดำเนินการ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 mb-6">
                                {ticket.notes && ticket.notes.length > 0 ? (
                                    ticket.notes.map((note) => (
                                        <div key={note.id} className="border-l-4 border-blue-200 pl-4 py-2">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium">{note.createdBy}</span>
                                                <span className="text-xs text-gray-500">
                                                    {format(new Date(note.createdAt), "PPP HH:mm", { locale: th })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700">{note.message}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">ยังไม่มีบันทึก</p>
                                )}
                            </div>

                            <Separator />

                            <form onSubmit={handleAddNote} className="pt-4">
                                <div>
                                    <Label htmlFor="note">เพิ่มบันทึก</Label>
                                    <Textarea
                                        id="note"
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        placeholder="บันทึกการดำเนินการหรือข้อมูลเพิ่มเติม..."
                                        rows={3}
                                        className="mt-1"
                                    />
                                </div>
                                <Button type="submit" disabled={isSubmitting || !newNote.trim()} className="mt-3">
                                    {isSubmitting ? "กำลังบันทึก..." : "เพิ่มบันทึก"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* User Info */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">ข้อมูลผู้แจ้ง</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {ticket.user && (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{ticket.user.name}</p>
                                            <p className="text-sm text-gray-500">ลูกบ้าน</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span>{ticket.user.email}</span>
                                        </div>
                                        {ticket.user.phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span>{ticket.user.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Unit Info */}
                    {ticket.unit && (
                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">ข้อมูลห้องพัก</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        <Home className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{ticket.unit.number}</p>
                                        <p className="text-sm text-gray-500">
                                            ตึก {ticket.unit.building} ชั้น {ticket.unit.floor}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Timeline */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">เส้นเวลา</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="text-sm font-medium">แจ้งซ่อม</p>
                                    <p className="text-xs text-gray-500">
                                        {format(new Date(ticket.createdAt), "PPP HH:mm", { locale: th })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                                <div>
                                    <p className="text-sm font-medium">อัปเดตล่าสุด</p>
                                    <p className="text-xs text-gray-500">
                                        {format(new Date(ticket.updatedAt), "PPP HH:mm", { locale: th })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">ดำเนินการด่วน</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                <Phone className="w-4 h-4 mr-2" />
                                โทรติดต่อผู้แจ้ง
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <Calendar className="w-4 h-4 mr-2" />
                                นัดหมายวันเวลา
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                ส่งข้อความแจ้ง
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
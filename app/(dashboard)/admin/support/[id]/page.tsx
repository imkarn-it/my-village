"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    MessageSquare,
    Home,
    User,
    Mail,
    Phone,
    Send,
    Save,
    FileText,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import type { ApiResponse, SupportTicketWithRelations } from "@/lib/api/types";

type TicketResponse = {
    id: string;
    ticketId: string;
    message: string;
    isFromAdmin: boolean;
    createdBy: string;
    createdAt: string;
};

const getStatusBadge = (status: string | null) => {
    switch (status) {
        case "open":
            return <Badge variant="default">เปิดใหม่</Badge>;
        case "in_progress":
            return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">กำลังดำเนินการ</Badge>;
        case "resolved":
            return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">แก้ไขแล้ว</Badge>;
        case "closed":
            return <Badge variant="outline">ปิดแล้ว</Badge>;
        default:
            return <Badge variant="secondary">{status || "ไม่ทราบ"}</Badge>;
    }
};

export default function SupportTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [ticket, setTicket] = useState<SupportTicketWithRelations | null>(null);
    const [responses, setResponses] = useState<TicketResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newResponse, setNewResponse] = useState("");
    const [newStatus, setNewStatus] = useState<string>("");

    useEffect(() => {
        if (id) {
            fetchTicketDetails();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchTicketDetails = async () => {
        try {
            setLoading(true);

            // Fetch ticket details using /support/:id endpoint
            const response = await api.support({ id }).get() as {
                data: ApiResponse<SupportTicketWithRelations> | null;
                error: { value: unknown } | null;
            };

            if (response.error) {
                throw new Error(String(response.error.value));
            }

            if (response.data?.success && response.data.data) {
                setTicket(response.data.data);
                setNewStatus(response.data.data.status || "open");

                // Fetch responses
                await fetchResponses();
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "ไม่สามารถโหลดข้อมูลตั๋วงความได้";
            console.error("Failed to fetch ticket details:", err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchResponses = async () => {
        try {
            const responsesResponse = await (api.support({ id }) as unknown as {
                responses: { get: () => Promise<{ data: { success: boolean; data: TicketResponse[] } | null }> }
            }).responses.get();

            if (responsesResponse.data?.success && responsesResponse.data.data) {
                setResponses(responsesResponse.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch responses:", err);
            // Not critical - ticket still works without responses
        }
    };

    const handleStatusUpdate = async () => {
        if (!ticket || newStatus === ticket.status) return;

        try {
            const response = await api.support({ id }).patch({ status: newStatus }) as {
                data: ApiResponse<SupportTicketWithRelations> | null;
                error: { value: unknown } | null;
            };

            if (response.error) {
                throw new Error(String(response.error.value));
            }

            if (response.data?.success) {
                setTicket(prev => prev ? { ...prev, status: newStatus } : null);
                toast.success("อัปเดตสถานะเรียบร้อยแล้ว");
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "ไม่สามารถอัปเดตสถานะได้";
            console.error("Failed to update status:", err);
            toast.error(errorMessage);
        }
    };

    const handleResponseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newResponse.trim()) return;

        setIsSubmitting(true);
        try {
            // Call API to add response
            const response = await (api.support({ id }) as unknown as {
                responses: {
                    post: (body: { message: string }) => Promise<{
                        data: { success: boolean; data: TicketResponse } | null;
                        error: { value: unknown } | null;
                    }>
                }
            }).responses.post({ message: newResponse.trim() });

            if (response.error) {
                throw new Error(String(response.error.value));
            }

            if (response.data?.success) {
                toast.success("ส่งข้อความตอบกลับเรียบร้อยแล้ว");
                setNewResponse("");

                // Refresh responses
                await fetchResponses();

                // Update ticket status if needed
                if (ticket && ticket.status === "open") {
                    setNewStatus("in_progress");
                    setTicket(prev => prev ? { ...prev, status: "in_progress" } : null);
                }
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "ไม่สามารถส่งข้อความได้";
            console.error("Failed to send response:", err);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/support">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse"></div>
                </div>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3 animate-pulse"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
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
                    <Link href="/admin/support">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ข้อผิดพลาด</h1>
                </div>
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/50">
                    <CardContent className="pt-6">
                        <p className="text-red-800 dark:text-red-300">{error || "ไม่พบข้อมูลตั๋วงความ"}</p>
                        <Link href="/admin/support">
                            <Button variant="outline" className="mt-2">
                                กลับไปหน้ารายการ
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const displayDate = (date: Date | string | null | undefined) => {
        if (!date) return "-";
        try {
            return format(new Date(date), "PPP HH:mm", { locale: th });
        } catch {
            return "-";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/support">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            ตั๋วงความ #{ticket.id.slice(0, 8)}...
                        </h1>
                        <div className="flex items-center gap-2">
                            {getStatusBadge(ticket.status)}
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                                สร้างเมื่อ {displayDate(ticket.createdAt)}
                            </span>
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
                                className="px-3 py-1 border rounded-md text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                            >
                                <option value="open">เปิดใหม่</option>
                                <option value="in_progress">กำลังดำเนินการ</option>
                                <option value="resolved">แก้ไขแล้ว</option>
                                <option value="closed">ปิดแล้ว</option>
                            </select>
                            {newStatus !== ticket.status && (
                                <Button size="sm" onClick={handleStatusUpdate}>
                                    <Save className="w-4 h-4 mr-1" />
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
                                <FileText className="w-5 h-5" />
                                รายละเอียดตั๋วงความ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">
                                    {ticket.subject}
                                </h3>
                                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                    {ticket.message || "-"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Responses/Conversation */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                บทสนทนา
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {responses.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    ยังไม่มีการตอบกลับ
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {responses.map((response) => (
                                        <div
                                            key={response.id}
                                            className={`p-4 rounded-lg ${response.isFromAdmin
                                                ? "bg-blue-50 dark:bg-blue-900/20 ml-8"
                                                : "bg-slate-50 dark:bg-slate-800/50 mr-8"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-sm text-slate-900 dark:text-white">
                                                    {response.isFromAdmin ? "นิติบุคคล" : ticket.user?.name || "ลูกบ้าน"}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {format(new Date(response.createdAt), "PPP HH:mm", { locale: th })}
                                                </span>
                                            </div>
                                            <p className="text-slate-700 dark:text-slate-300">{response.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Separator className="my-6" />

                            {/* Response Form */}
                            <form onSubmit={handleResponseSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="response">ตอบกลับ</Label>
                                    <Textarea
                                        id="response"
                                        value={newResponse}
                                        onChange={(e) => setNewResponse(e.target.value)}
                                        placeholder="พิมพ์ข้อความตอบกลับ..."
                                        rows={4}
                                        className="mt-1"
                                    />
                                </div>
                                <Button type="submit" disabled={isSubmitting || !newResponse.trim()}>
                                    {isSubmitting ? (
                                        <>กำลังส่ง...</>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            ส่งข้อความ
                                        </>
                                    )}
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
                            {ticket.user ? (
                                <>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{ticket.user.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">ลูกบ้าน</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            <span className="text-slate-600 dark:text-slate-300">{ticket.user.email}</span>
                                        </div>
                                        {ticket.user.phone && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="w-4 h-4 text-slate-400" />
                                                <span className="text-slate-600 dark:text-slate-300">{ticket.user.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="text-slate-500 dark:text-slate-400">ไม่มีข้อมูลผู้แจ้ง</p>
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
                                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                        <Home className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{ticket.unit.unitNumber}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            ตึก {ticket.unit.building || "-"} ชั้น {ticket.unit.floor || "-"}
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
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">สร้างตั๋วงความ</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {displayDate(ticket.createdAt)}
                                    </p>
                                </div>
                            </div>
                            {ticket.repliedAt && (
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">ตอบกลับ</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {displayDate(ticket.repliedAt)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
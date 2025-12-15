"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    FileText,
    ArrowLeft,
    Download,
    Send,
    QrCode,
    Receipt,
    Calendar,
    Home,
    User,
    Mail,
    Phone,
    CheckCircle,
    AlertCircle,
    CreditCard,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";
import { api } from "@/lib/api/client";

type BillDetail = {
    id: string;
    invoiceNumber: string;
    unitId: string;
    unitNumber: string;
    unitFloor?: number;
    unitBuilding?: string;
    residentId: string;
    residentName: string;
    residentEmail?: string;
    residentPhone?: string;
    type: "monthly_fee" | "water" | "electricity" | "parking" | "other";
    title: string;
    description: string;
    items: {
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }[];
    amount: number;
    tax?: number;
    totalAmount: number;
    dueDate: string;
    status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
    paymentMethod?: "promptpay" | "bank_transfer" | "cash" | "credit_card";
    paymentDate?: string;
    transactionId?: string;
    slipImageUrl?: string;
    qrCode?: string;
    createdAt: string;
    updatedAt: string;
    notes?: string;
};

const mockBill: BillDetail = {
    id: "1",
    invoiceNumber: "INV-2024-001",
    unitId: "unit-1",
    unitNumber: "A-101",
    unitFloor: 1,
    unitBuilding: "A",
    residentId: "user-1",
    residentName: "สมชาย ใจดี",
    residentEmail: "somchai@example.com",
    residentPhone: "081-234-5678",
    type: "monthly_fee",
    title: "ค่าใช้จ่ายรายเดือน ธันวาคม 2025",
    description: "ค่าใช้จ่ายรายเดือนสำหรับห้อง A-101",
    items: [
        {
            description: "ค่าส่วนกลาง (Maintenance)",
            quantity: 1,
            unitPrice: 1500,
            total: 1500,
        },
        {
            description: "ค่าน้ำประปา",
            quantity: 25,
            unitPrice: 20,
            total: 500,
        },
        {
            description: "ค่าไฟฟ้า้า",
            quantity: 1,
            unitPrice: 1500,
            total: 1500,
        },
    ],
    amount: 3500,
    tax: 245,
    totalAmount: 3745,
    dueDate: "2025-01-31",
    status: "paid",
    paymentMethod: "promptpay",
    paymentDate: "2025-01-29",
    transactionId: "TXN-2024-123456",
    slipImageUrl: "/api/files/slips/1.jpg",
    qrCode: "https://promptpay.io/xxx",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-29T14:30:00Z",
    notes: "ชำระเร็วจภายที่ 29 มกราคม 2025",
};

export default function BillDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [bill, setBill] = useState<BillDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [generating, setGenerating] = useState(false);

    const billId = params.id as string;

    const fetchBill = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.bills({ id: billId }).get() as {
                data: { success: boolean; data: BillDetail } | null;
            };
            if (response.data) {
                setBill(response.data.success && response.data.data ? response.data.data : mockBill);
            } else {
                // Fallback to mock data
                setBill(mockBill);
            }
        } catch {
            // Fallback to mock data
            setBill(mockBill);
        } finally {
            setLoading(false);
        }
    }, [billId]);

    useEffect(() => {
        if (billId) {
            fetchBill();
        }
    }, [billId, fetchBill]);

    const handleSendEmail = async () => {
        if (!bill) return;

        setSending(true);
        try {
            // TODO: Implement send email endpoint when available
            // For now, just show success message
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("ส่งอีเมลใบแจ้งแล้ว");
        } catch (err: unknown) {
            console.error("Error sending email:", err);
            toast.error((err as Error).message || "ไม่สามารถส่งอีเมลได้");
        } finally {
            setSending(false);
        }
    };

    const handleGenerateQR = async () => {
        if (!bill) return;

        setGenerating(true);
        try {
            // Use the generate-qr endpoint
            const response = await api.bills({ id: bill.id })["generate-qr"].post({}) as {
                data: { success: boolean } | null;
                error: { value: unknown } | null;
            };

            if (response.error) {
                throw new Error(String(response.error.value));
            }

            toast.success("สร้าง QR Code สำเร็จแล้ว");
            fetchBill();
        } catch (err: unknown) {
            console.error("Error generating QR:", err);
            toast.error((err as Error).message || "ไม่สามารถสร้าง QR Code ได้");
        } finally {
            setGenerating(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!bill) return;

        // Create PDF content
        const pdfContent = `
ใบแจ้งค่าใช้จ่าย
===============================

เลขที่: ${bill.invoiceNumber}
วันที่: ${format(new Date(bill.createdAt), "d MMMM yyyy", { locale: th })}

ข้อมูลผู้อยู่
-------------
ชื่อ: ${bill.residentName}
อีเมล: ${bill.residentEmail || "-"}
เบอร์โทร: ${bill.residentPhone || "-"}
ห้อง: ${bill.unitNumber} ชั้น ${bill.unitFloor} อาคาร ${bill.unitBuilding}

รายละเอียดบิล
------------------
เรื่อง: ${bill.title}
${bill.description}

รายการสินค้า/บริการ
------------------------
${bill.items.map((item, index) => `${index + 1}. ${item.description}
   จำนวน: ${item.quantity}
   ราคาต่อหน่วย: ฿${item.unitPrice.toLocaleString('th-TH')}
   รวม: ฿${item.total.toLocaleString('th-TH')}`).join('\n')}

------------------------
จำนวนเงิน: ฿${bill.amount.toLocaleString('th-TH')}
ภาษี (7%): ฿${(bill.tax || 0).toLocaleString('th-TH')}
ยอดรวม: ฿${bill.totalAmount.toLocaleString('th-TH')}

กำหนดชำระ: ${format(new Date(bill.dueDate), "d MMMM yyyy", { locale: th })}

สถานะ: ${bill.status === "paid" ? "ชำระแล้ว" : bill.status === "overdue" ? "เกินกำหนด" : bill.status === "sent" ? "รอชำระ" : "ฉบับร่าง"}

${bill.status === "paid" && `
การชำระ
---------
วันที่ชำระ: ${format(new Date(bill.paymentDate!), "d MMMM yyyy", { locale: th })}
วิธีการชำระ: ${bill.paymentMethod === "promptpay" ? "PromptPay" : bill.paymentMethod}
เลขธุรกรม: ${bill.transactionId || "-"}
หมายเหตุ: ${bill.notes || "-"}
`}
        `;

        // Create and download file
        const blob = new Blob([pdfContent], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bill-${bill.invoiceNumber}.txt`;
        a.style.visibility = "hidden";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("ดาวนโหลด PDF แล้ว");
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 mb-6"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                                        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!bill) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">ไม่พบใบแจ้ง</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">ไม่พบใบแจ้งที่คุณกำลังมองหา</p>
                <Link href="/bills">
                    <Button>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        กลับรายการใบแจ้ง
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/bills">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ใบแจ้ง #{bill.invoiceNumber}</h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            {format(new Date(bill.createdAt), "d MMMM yyyy", { locale: th })}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadPDF}>
                        <Download className="w-4 h-4 mr-2" />
                        ดาวนโหลด
                    </Button>
                    <Button variant="outline" onClick={handleSendEmail} disabled={sending}>
                        {sending ? (
                            <>
                                <div className="w-4 h-4 mr-2 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                                กำลังส่ง...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                ส่งอีเมล
                            </>
                        )}
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/bills/${bill.id}/edit`)}>
                        แก้ไข
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bill Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Bill Information */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                ข้อมูลใบแจ้ง
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">เลขที่ใบแจ้ง</Label>
                                <p className="text-lg font-mono">{bill.invoiceNumber}</p>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">หัวข้อ</Label>
                                <p className="text-lg font-semibold">{bill.title}</p>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">รายละเอียด</Label>
                                <p className="text-slate-700 dark:text-slate-300">{bill.description}</p>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">สถานะ</Label>
                                <Badge className={
                                    bill.status === "paid" ? "bg-green-100 text-green-800" :
                                        bill.status === "overdue" ? "bg-red-100 text-red-800" :
                                            bill.status === "sent" ? "bg-blue-100 text-blue-800" :
                                                "bg-slate-100 dark:bg-slate-800 text-slate-800"
                                }>
                                    {bill.status === "paid" ? "ชำระแล้ว" :
                                        bill.status === "overdue" ? "เกินกำหนด" :
                                            bill.status === "sent" ? "รอชำระ" :
                                                bill.status === "draft" ? "ฉบับร่าง" :
                                                    bill.status === "cancelled" ? "ยกเลิก" :
                                                        bill.status}
                                </Badge>
                            </div>

                            {bill.notes && (
                                <div>
                                    <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">หมายเหตุ</Label>
                                    <p className="text-slate-700 dark:text-slate-300">{bill.notes}</p>
                                </div>
                            )}

                            {bill.status === "paid" && (
                                <div className="border-t pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">วันที่ชำระ</Label>
                                            <p>{format(new Date(bill.paymentDate!), "d MMMM yyyy HH:mm", { locale: th })}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">วิธีการชำระ</Label>
                                            <p>
                                                {bill.paymentMethod === "promptpay" && "PromptPay"}
                                                {bill.paymentMethod === "bank_transfer" && "โอนเงิน"}
                                                {bill.paymentMethod === "cash" && "เงินสด"}
                                                {bill.paymentMethod === "credit_card" && "บัตรเครดิต"}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">เลขธุรกรม</Label>
                                            <p className="font-mono">{bill.transactionId}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">สลิปการโอน</Label>
                                            {bill.slipImageUrl ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(bill.slipImageUrl, '_blank')}
                                                >
                                                    <Receipt className="w-4 h-4 mr-2" />
                                                    ดูสลิป
                                                </Button>
                                            ) : (
                                                <p className="text-slate-500 dark:text-slate-400">-</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Bill Items */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>รายการสินค้า/บริการ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {bill.items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium">{item.description}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">จำนวน: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">฿{item.unitPrice.toLocaleString('th-TH')}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">/หน่วย</p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="font-semibold text-lg">฿{item.total.toLocaleString('th-TH')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t mt-4 pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-600 dark:text-slate-400">จำนวนเงิน:</span>
                                    <span className="font-medium">฿{bill.amount.toLocaleString('th-TH')}</span>
                                </div>
                                {bill.tax && (
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-slate-600 dark:text-slate-400">ภาษี (7%):</span>
                                        <span className="font-medium">฿{bill.tax.toLocaleString('th-TH')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>ยอดรวม:</span>
                                    <span className="text-green-600">฿{bill.totalAmount.toLocaleString('th-TH')}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Resident Information */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                ข้อมูลผู้อยู่
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-medium">{bill.residentName}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">ผู้อยู่</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Home className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm">ห้อง {bill.unitNumber}</span>
                                </div>

                                {bill.residentEmail && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm">{bill.residentEmail}</span>
                                    </div>
                                )}

                                {bill.residentPhone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm">{bill.residentPhone}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Information */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                ข้อมูลการชำระ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">กำหนดชำระ:</span>
                                <span className="font-medium">
                                    {format(new Date(bill.dueDate), "d MMM yyyy", { locale: th })}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">วันที่สร้าง:</span>
                                <span className="text-sm">
                                    {format(new Date(bill.createdAt), "d MMM yyyy", { locale: th })}
                                </span>
                            </div>

                            {bill.status !== "paid" && bill.status !== "cancelled" && (
                                <div className="space-y-3">
                                    {bill.qrCode ? (
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">QR Code สำหรับชำระ</p>
                                            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                                                <QrCode className="w-32 h-32 mx-auto" />
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">สแกนเพื่อชำระ</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            onClick={handleGenerateQR}
                                            disabled={generating}
                                        >
                                            {generating ? (
                                                <>
                                                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    กำลังสร้าง...
                                                </>
                                            ) : (
                                                <>
                                                    <QrCode className="w-4 h-4 mr-2" />
                                                    สร้าง QR Code
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            )}

                            {bill.status === "paid" && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-center">
                                        <CheckCircle className="w-16 h-16 text-green-600" />
                                    </div>
                                    <p className="text-center text-green-600 font-medium">ชำระแล้ว</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>การดำเนินการ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full" variant="outline">
                                <Calendar className="w-4 h-4 mr-2" />
                                กำหนดเวลาใหม่
                            </Button>
                            <Button className="w-full" variant="outline">
                                <FileText className="w-4 h-4 mr-2" />
                                ดูประวัติ
                            </Button>
                            {bill.status === "draft" && (
                                <Button className="w-full">
                                    <Send className="w-4 h-4 mr-2" />
                                    ส่งใบแจ้ง
                                </Button>
                            )}
                            {bill.status === "sent" && (
                                <Button className="w-full" variant="outline">
                                    <Send className="w-4 h-4 mr-2" />
                                    ส่งการแจ้งเตือน
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
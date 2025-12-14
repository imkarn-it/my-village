"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    FileText,
    Search,
    Plus,
    Download,
    Eye,
    Send,
    Receipt,
    AlertCircle,
    CheckCircle,
    Clock,
    MoreHorizontal,
    QrCode,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "sonner";
import { api } from "@/lib/api/client";

type Bill = {
    id: string;
    invoiceNumber: string;
    unitId: string;
    unitNumber?: string;
    residentId: string;
    residentName?: string;
    type: "monthly_fee" | "water" | "electricity" | "parking" | "other";
    title: string;
    description?: string;
    amount: number;
    dueDate: string;
    status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
    paymentMethod?: "promptpay" | "bank_transfer" | "cash" | "credit_card";
    paymentDate?: string;
    createdAt: string;
    updatedAt: string;
    qrCode?: string;
    slipImageUrl?: string;
};

type PaymentStats = {
    totalBills: number;
    totalAmount: number;
    paidAmount: number;
    unpaidAmount: number;
    overdueAmount: number;
    paidCount: number;
    unpaidCount: number;
    overdueCount: number;
};

const mockBills: Bill[] = [
    {
        id: "1",
        invoiceNumber: "INV-2024-001",
        unitId: "unit-1",
        unitNumber: "A-101",
        residentId: "user-1",
        residentName: "สมชาย ใจดี",
        type: "monthly_fee",
        title: "ค่าใช้จ่ายรายเดือน ธันวาคม 2025",
        description: "ค่าส่วนกลาง ค่าน้ำ ค่าไฟ",
        amount: 3500,
        dueDate: "2025-01-31",
        status: "paid",
        paymentMethod: "promptpay",
        paymentDate: "2025-01-29",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-29T14:30:00Z",
        qrCode: "https://promptpay.io/xxx",
        slipImageUrl: "/api/files/slips/1.jpg",
    },
    {
        id: "2",
        invoiceNumber: "INV-2024-002",
        unitId: "unit-2",
        unitNumber: "A-102",
        residentId: "user-2",
        residentName: "สมศรี มั่งคั่ง",
        type: "monthly_fee",
        title: "ค่าใช้จ่ายรายเดือน ธันวาคม 2025",
        description: "ค่าส่วนกลาง ค่าน้ำ ค่าไฟ",
        amount: 3500,
        dueDate: "2025-01-31",
        status: "overdue",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
    },
    {
        id: "3",
        invoiceNumber: "INV-2024-003",
        unitId: "unit-3",
        unitNumber: "B-201",
        residentId: "user-3",
        residentName: "วิชัย รุ่งเรือง",
        type: "water",
        title: "ค่าน้ำประปา ธันวาคม 2025",
        description: "จำนวน 25 หน่วย",
        amount: 450,
        dueDate: "2025-02-15",
        status: "sent",
        createdAt: "2025-02-01T00:00:00Z",
        updatedAt: "2025-02-01T00:00:00Z",
        qrCode: "https://promptpay.io/xxx",
    },
];

const mockStats: PaymentStats = {
    totalBills: 145,
    totalAmount: 1250000,
    paidAmount: 980000,
    unpaidAmount: 270000,
    overdueAmount: 85000,
    paidCount: 98,
    unpaidCount: 32,
    overdueCount: 15,
};

export default function BillsPage() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [stats] = useState<PaymentStats>(mockStats);  // setStats reserved for API integration
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("2024-12");
    const [selectedUnit, setSelectedUnit] = useState("all");

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            setLoading(true);
            // @ts-ignore - API types
            const { data } = await api.bills.get();
            if (data && Array.isArray(data)) {
                setBills(data);
            } else {
                // Fallback to mock data
                setBills(mockBills);
            }
        } catch {
            // Fallback to mock data
            setBills(mockBills);
        } finally {
            setLoading(false);
        }
    };

    const filteredBills = bills.filter((bill) => {
        const matchesSearch = bill.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.residentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTab = activeTab === "all" ||
            (activeTab === "paid" && bill.status === "paid") ||
            (activeTab === "unpaid" && (bill.status === "sent" || bill.status === "draft")) ||
            (activeTab === "overdue" && bill.status === "overdue");

        const matchesUnit = selectedUnit === "all" || bill.unitId === selectedUnit;

        return matchesSearch && matchesTab && matchesUnit;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid": return "bg-green-100 text-green-800";
            case "sent": return "bg-blue-100 text-blue-800";
            case "overdue": return "bg-red-100 text-red-800";
            case "draft": return "bg-gray-100 text-gray-800";
            case "cancelled": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "paid": return "ชำระแล้ว";
            case "sent": return "รอชำระ";
            case "overdue": return "เกินกำหนด";
            case "draft": return "ฉบับร่าง";
            case "cancelled": return "ยกเลิก";
            default: return status;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "monthly_fee": return "ค่ารายเดือน";
            case "water": return "ค่าน้ำ";
            case "electricity": return "ค่าไฟ";
            case "parking": return "ค่าจอดรถ";
            case "other": return "อื่นๆ";
            default: return type;
        }
    };

    const handleSendReminder = async (id: string) => {
        try {
            // @ts-ignore - API types
            const { error } = await api.bills({ id }).post({ action: "send_reminder" });

            if (error) {
                toast.error("ไม่สามารถส่งการแจ้งเตือนได้");
            } else {
                toast.success("ส่งการแจ้งเตือนแล้ว");
            }
        } catch {
            toast.error("เกิดข้อผิดพลาดในการส่งการแจ้งเตือน");
        }
    };

    const handleGenerateQR = async (id: string) => {
        try {
            // @ts-ignore - API types
            const { error } = await api.bills({ id }).post({ action: "generate_qr" });

            if (error) {
                toast.error("ไม่สามารถสร้าง QR Code ได้");
            } else {
                toast.success("สร้าง QR Code สำเร็จแล้ว");
                fetchBills();
            }
        } catch {
            toast.error("เกิดข้อผิดพลาดในการสร้าง QR Code");
        }
    };

    const handleExport = (type: "all" | "paid" | "unpaid" | "overdue") => {
        // Filter bills based on type
        let dataToExport = bills;
        if (type === "paid") {
            dataToExport = bills.filter(b => b.status === "paid");
        } else if (type === "unpaid") {
            dataToExport = bills.filter(b => b.status === "sent" || b.status === "draft");
        } else if (type === "overdue") {
            dataToExport = bills.filter(b => b.status === "overdue");
        }

        // Create CSV content
        const headers = ["เลขที่ใบแจ้ง", "ห้อง", "ผู้อยู่", "ประเภท", "จำนวนเงิน", "วันครบกำหนด", "สถานะ"];
        const rows = dataToExport.map(bill => [
            bill.invoiceNumber,
            bill.unitNumber || "",
            bill.residentName || "",
            getTypeLabel(bill.type),
            bill.amount.toString(),
            bill.dueDate,
            getStatusLabel(bill.status)
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        // Create and download CSV file
        const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `bills-${type}-${format(new Date(), "yyyy-MM-dd")}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("ส่งออกรายงานแล้ว");
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card className="animate-pulse">
                    <CardHeader>
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-12 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">ระบบบิลและใบแจ้ง</h1>
                    <p className="text-gray-600">จัดการใบแจ้งค่าใช้จ่ายและการชำระเงิน</p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    สร้างใบแจ้งใหม่
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ใบแจ้งทั้งหมด</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalBills}</p>
                                <p className="text-sm text-gray-600">฿{stats.totalAmount.toLocaleString('th-TH')}</p>
                            </div>
                            <Receipt className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ชำระแล้ว</p>
                                <p className="text-2xl font-bold text-green-600">{stats.paidCount}</p>
                                <p className="text-sm text-green-600">฿{stats.paidAmount.toLocaleString('th-TH')}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">รอชำระ</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.unpaidCount}</p>
                                <p className="text-sm text-yellow-600">฿{stats.unpaidAmount.toLocaleString('th-TH')}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">เกินกำหนด</p>
                                <p className="text-2xl font-bold text-red-600">{stats.overdueCount}</p>
                                <p className="text-sm text-red-600">฿{stats.overdueAmount.toLocaleString('th-TH')}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="ค้นหาเลขที่ใบแจ้ง, ชื่อผู้อยู่, ห้อง..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2024-12">ธันวาคม 2024</SelectItem>
                                <SelectItem value="2025-01">มกราคม 2025</SelectItem>
                                <SelectItem value="2025-02">กุมภาพันธ์ 2025</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ห้องทั้งหมด</SelectItem>
                                <SelectItem value="unit-1">A-101</SelectItem>
                                <SelectItem value="unit-2">A-102</SelectItem>
                                <SelectItem value="unit-3">B-201</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Bills Table */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            ใบแจ้ง ({filteredBills.length})
                        </span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <Download className="w-4 h-4 mr-2" />
                                    ส่งออกรายงาน
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleExport("all")}>
                                    ส่งออกทั้งหมด
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport("paid")}>
                                    ส่งออกที่ชำระแล้ว
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport("unpaid")}>
                                    ส่งออกที่รอชำระ
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport("overdue")}>
                                    ส่งออกที่เกินกำหนด
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="all">ทั้งหมด</TabsTrigger>
                            <TabsTrigger value="paid">ชำระแล้ว</TabsTrigger>
                            <TabsTrigger value="unpaid">รอชำระ</TabsTrigger>
                            <TabsTrigger value="overdue">เกินกำหนด</TabsTrigger>
                        </TabsList>

                        {filteredBills.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    {activeTab !== "all"
                                        ? `ไม่มีใบแจ้ง${activeTab === "paid" ? "ที่ชำระแล้ว" : activeTab === "unpaid" ? "ที่รอชำระ" : "ที่เกินกำหนด"}`
                                        : "ยังไม่มีใบแจ้ง"}
                                </h3>
                                <p className="text-gray-600">
                                    {activeTab === "all"
                                        ? "สร้างใบแจ้งแรกเพื่อเริ่มต้น"
                                        : "ไม่พบใบแจ้งที่ตรงตามเงื่อนไข"}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>เลขที่</TableHead>
                                            <TableHead>ห้อง</TableHead>
                                            <TableHead>ผู้อยู่</TableHead>
                                            <TableHead>ประเภท</TableHead>
                                            <TableHead>จำนวนเงิน</TableHead>
                                            <TableHead>วันครบกำหนด</TableHead>
                                            <TableHead>สถานะ</TableHead>
                                            <TableHead>การชำระ</TableHead>
                                            <TableHead>จัดการ</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredBills.map((bill) => (
                                            <TableRow key={bill.id} className="hover:bg-gray-50">
                                                <TableCell className="font-mono text-sm">{bill.invoiceNumber}</TableCell>
                                                <TableCell>{bill.unitNumber || "-"}</TableCell>
                                                <TableCell>{bill.residentName || "-"}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {getTypeLabel(bill.type)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    ฿{bill.amount.toLocaleString('th-TH')}
                                                </TableCell>
                                                <TableCell>{format(new Date(bill.dueDate), "d MMM yyyy", { locale: th })}</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(bill.status)}>
                                                        {getStatusLabel(bill.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {bill.status === "paid" ? (
                                                        <div className="space-y-1">
                                                            <p className="text-sm text-green-600">
                                                                {format(new Date(bill.paymentDate!), "d MMM yyyy", { locale: th })}
                                                            </p>
                                                            {bill.paymentMethod && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {bill.paymentMethod === "promptpay" && "PromptPay"}
                                                                    {bill.paymentMethod === "bank_transfer" && "โอนเงิน"}
                                                                    {bill.paymentMethod === "cash" && "เงินสด"}
                                                                    {bill.paymentMethod === "credit_card" && "บัตรเครดิต"}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            {bill.qrCode ? (
                                                                <QrCode className="w-4 h-4 text-blue-600" />
                                                            ) : (
                                                                <span className="text-sm text-gray-500">-</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>จัดการ</DropdownMenuLabel>
                                                            <DropdownMenuItem>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                ดูรายละเอียด
                                                            </DropdownMenuItem>
                                                            {bill.status === "paid" && bill.slipImageUrl && (
                                                                <DropdownMenuItem>
                                                                    <Receipt className="h-4 w-4 mr-2" />
                                                                    ดูสลิปการโอน
                                                                </DropdownMenuItem>
                                                            )}
                                                            {bill.status !== "paid" && bill.status !== "cancelled" && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => handleGenerateQR(bill.id)}>
                                                                        <QrCode className="h-4 w-4 mr-2" />
                                                                        สร้าง QR Code
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleSendReminder(bill.id)}>
                                                                        <Send className="h-4 w-4 mr-2" />
                                                                        ส่งการแจ้งเตือน
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
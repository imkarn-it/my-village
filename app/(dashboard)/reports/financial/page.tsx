"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    FinancialAnalytics,
} from "@/components/reports/analytics-charts";
import {
    FinancialReportGenerator,
    PDFReportGenerator
} from "@/lib/reports/pdf-export";
import {
    DollarSign,
    Download,
    TrendingUp,
    Filter,
    BarChart3,
    Activity,
    FileText,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

type FinancialData = {
    period: string;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    revenueGrowth: number;
    transactionCount: number;
    collectionRate: number;
};

type Transaction = {
    id: string;
    date: string;
    unitNumber: string;
    residentName: string;
    type: string;
    amount: number;
    status: "paid" | "pending" | "overdue";
    dueDate: string;
    paidDate?: string;
};

const mockFinancialData: FinancialData = {
    period: "มกราคม 2025",
    totalRevenue: 4850000,
    totalExpenses: 1230000,
    netProfit: 3620000,
    profitMargin: 74.6,
    revenueGrowth: 15.3,
    transactionCount: 420,
    collectionRate: 94.5
};

const mockTransactions: Transaction[] = [
    {
        id: "1",
        date: "2025-01-01",
        unitNumber: "A-101",
        residentName: "สมศักดิ์ ใจดี",
        type: "ค่าส่วนกลาง",
        amount: 3500,
        status: "paid",
        dueDate: "2025-01-05",
        paidDate: "2025-01-02"
    },
    {
        id: "2",
        date: "2025-01-05",
        unitNumber: "B-205",
        residentName: "วีระ มั่นคง",
        type: "ค่าน้ำ",
        amount: 250,
        status: "pending",
        dueDate: "2025-01-15"
    },
    {
        id: "3",
        date: "2025-01-10",
        unitNumber: "C-301",
        residentName: "สมชาย รักงาน",
        type: "ค่าไฟ",
        amount: 1800,
        status: "overdue",
        dueDate: "2025-01-08"
    }
];

const chartData = [
    { name: "ม.ค.", value: 4850000, value2: 1230000 },
    { name: "ก.พ.", value: 5200000, value2: 1300000 },
    { name: "มี.ค.", value: 4900000, value2: 1250000 },
    { name: "เม.ย.", value: 5100000, value2: 1200000 },
    { name: "พ.ค.", value: 5300000, value2: 1350000 },
    { name: "มิ.ย.", value: 5500000, value2: 1400000 }
];

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const pieData = [
    { name: "ค่าส่วนกลาง", value: 2450000, percentage: 50.5 },
    { name: "ค่าน้ำ", value: 780000, percentage: 16.1 },
    { name: "ค่าไฟ", value: 620000, percentage: 12.8 },
    { name: "ค่าที่จอดรถ", value: 560000, percentage: 11.5 },
    { name: "อื่นๆ", value: 440000, percentage: 9.1 }
];

export default function FinancialReportsPage() {
    const [data, _setData] = useState<FinancialData>(mockFinancialData);
    const [transactions, _setTransactions] = useState<Transaction[]>(mockTransactions);
    const [selectedPeriod, setSelectedPeriod] = useState("month");
    // const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"overview" | "transactions" | "analytics">("overview");

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.residentName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
        const matchesType = typeFilter === "all" || transaction.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    const exportPDF = () => {
        const generator = new FinancialReportGenerator();

        const reportData = {
            month: "มกราคม",
            year: 2025,
            revenue: data.totalRevenue,
            expenses: data.totalExpenses,
            profit: data.netProfit,
            transactionCount: data.transactionCount,
            unitRevenue: [
                { unitNumber: "A-101", revenue: 3500 },
                { unitNumber: "B-205", revenue: 250 },
                { unitNumber: "C-301", revenue: 1800 }
            ]
        };

        generator.generateMonthlyRevenueReport(reportData);
        generator.save("รายงานรายได้_มกราคม_2025");
    };

    const exportDetailedReport = () => {
        const reportData = {
            title: "รายงานการเงินรายละเอียด",
            subtitle: data.period,
            headers: ["วันที่", "ห้องพัก", "ผู้อยู่อาศัย", "ประเภท", "จำนวน", "สถานะ", "วันครบกำหนด", "วันชำระ"],
            rows: transactions.map(t => [
                format(new Date(t.date), "d MMM yyyy", { locale: th }),
                t.unitNumber,
                t.residentName,
                t.type,
                `฿${t.amount.toLocaleString('th-TH')}`,
                t.status === "paid" ? "ชำระแล้ว" : t.status === "pending" ? "รอชำระ" : "ค้างชำระ",
                format(new Date(t.dueDate), "d MMM yyyy", { locale: th }),
                t.paidDate ? format(new Date(t.paidDate), "d MMM yyyy", { locale: th }) : "-"
            ]),
            summary: {
                totalRevenue: `฿${data.totalRevenue.toLocaleString('th-TH')}`,
                totalExpenses: `฿${data.totalExpenses.toLocaleString('th-TH')}`,
                netProfit: `฿${data.netProfit.toLocaleString('th-TH')}`,
                profitMargin: `${data.profitMargin.toFixed(1)}%`,
                collectionRate: `${data.collectionRate.toFixed(1)}%`,
                totalTransactions: data.transactionCount
            }
        };

        PDFReportGenerator.generateAndSave(reportData, "รายงานการเงินรายละเอียด");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">รายงานการเงิน</h1>
                    <p className="text-slate-600 dark:text-slate-400">ข้อมูลรายได้ ค่าใช้จ่าย และธุรกรรมการเงิน</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportDetailedReport}>
                        <FileText className="w-4 h-4 mr-2" />
                        Export รายละเอียด
                    </Button>
                    <Button onClick={exportPDF}>
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* View Mode Selector */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
                <Button
                    variant={viewMode === "overview" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("overview")}
                    className="flex items-center gap-2"
                >
                    <BarChart3 className="w-4 h-4" />
                    ภาพรวม
                </Button>
                <Button
                    variant={viewMode === "transactions" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("transactions")}
                    className="flex items-center gap-2"
                >
                    <FileText className="w-4 h-4" />
                    ธุรกรรม
                </Button>
                <Button
                    variant={viewMode === "analytics" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("analytics")}
                    className="flex items-center gap-2"
                >
                    <Activity className="w-4 h-4" />
                    วิเคราะห์
                </Button>
            </div>

            {/* Filters */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <Input
                                    placeholder="ค้นหาจากห้องพักหรือชื่อผู้อยู่อาศัย..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full lg:w-[150px]">
                                <SelectValue placeholder="สถานะ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกสถานะ</SelectItem>
                                <SelectItem value="paid">ชำระแล้ว</SelectItem>
                                <SelectItem value="pending">รอชำระ</SelectItem>
                                <SelectItem value="overdue">ค้างชำระ</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full lg:w-[180px]">
                                <SelectValue placeholder="ประเภท" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทุกประเภท</SelectItem>
                                <SelectItem value="ค่าส่วนกลาง">ค่าส่วนกลาง</SelectItem>
                                <SelectItem value="ค่าน้ำ">ค่าน้ำ</SelectItem>
                                <SelectItem value="ค่าไฟ">ค่าไฟ</SelectItem>
                                <SelectItem value="ค่าที่จอดรถ">ค่าที่จอดรถ</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                            <SelectTrigger className="w-full lg:w-[180px]">
                                <SelectValue placeholder="ช่วงเวลา" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">วันนี้</SelectItem>
                                <SelectItem value="week">สัปดาห์นี้</SelectItem>
                                <SelectItem value="month">เดือนนี้</SelectItem>
                                <SelectItem value="quarter">ไตรมาสนี้</SelectItem>
                                <SelectItem value="year">ปีนี้</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Content based on view mode */}
            {viewMode === "overview" && (
                <FinancialAnalytics
                    data={{
                        revenueData: chartData,
                        pieData,
                        trends: chartData
                    }}
                    period={selectedPeriod}
                    onPeriodChange={setSelectedPeriod}
                />
            )}

            {viewMode === "transactions" && (
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            รายการธุรกรรม ({filteredTransactions.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>วันที่</TableHead>
                                        <TableHead>ห้องพัก</TableHead>
                                        <TableHead>ผู้อยู่อาศัย</TableHead>
                                        <TableHead>ประเภท</TableHead>
                                        <TableHead className="text-right">จำนวน</TableHead>
                                        <TableHead>สถานะ</TableHead>
                                        <TableHead>วันครบกำหนด</TableHead>
                                        <TableHead>วันชำระ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredTransactions.map((transaction) => (
                                        <TableRow key={transaction.id} className="hover:bg-slate-50 dark:bg-slate-800/50">
                                            <TableCell>
                                                {format(new Date(transaction.date), "d MMM yyyy", { locale: th })}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {transaction.unitNumber}
                                            </TableCell>
                                            <TableCell>{transaction.residentName}</TableCell>
                                            <TableCell>{transaction.type}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                ฿{transaction.amount.toLocaleString('th-TH')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        transaction.status === "paid"
                                                            ? "bg-green-100 text-green-800"
                                                            : transaction.status === "pending"
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-red-100 text-red-800"
                                                    }
                                                >
                                                    {transaction.status === "paid" && "ชำระแล้ว"}
                                                    {transaction.status === "pending" && "รอชำระ"}
                                                    {transaction.status === "overdue" && "ค้างชำระ"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(transaction.dueDate), "d MMM yyyy", { locale: th })}
                                            </TableCell>
                                            <TableCell>
                                                {transaction.paidDate
                                                    ? format(new Date(transaction.paidDate), "d MMM yyyy", { locale: th })
                                                    : "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {viewMode === "analytics" && (
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">อัตรากำไรขั้นต้น</p>
                                        <p className="text-2xl font-bold text-green-600">{data.profitMargin.toFixed(1)}%</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Profit Margin</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">อัตราการเก็บเกี่ยว</p>
                                        <p className="text-2xl font-bold text-blue-600">{data.collectionRate.toFixed(1)}%</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Collection Rate</p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">การเติบโตต่อเดือน</p>
                                        <p className="text-2xl font-bold text-purple-600">+{data.revenueGrowth}%</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Month-over-Month</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ธุรกรรมทั้งหมด</p>
                                        <p className="text-2xl font-bold text-orange-600">{data.transactionCount}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Transactions</p>
                                    </div>
                                    <Activity className="h-8 w-8 text-orange-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Comparison Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>การเปรียบเทียบรายได้</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {pieData.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-4 h-4 rounded"
                                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                />
                                                <span className="text-sm">{item.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">฿{item.value.toLocaleString('th-TH')}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{item.percentage}%</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>ประสิทธิภาพการเก็บเกี่ยว</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">ชำระแล้ว</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: "94.5%" }} />
                                            </div>
                                            <span className="text-sm font-medium">94.5%</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">รอชำระ</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "3.5%" }} />
                                            </div>
                                            <span className="text-sm font-medium">3.5%</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">ค้างชำระ</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                <div className="bg-red-500 h-2 rounded-full" style={{ width: "2.0%" }} />
                                            </div>
                                            <span className="text-sm font-medium">2.0%</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
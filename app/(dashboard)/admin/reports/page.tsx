"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    BarChart3,
    TrendingUp,
    Users,
    DollarSign,
    Wrench,
    FileText,
    Download,
    Calendar,
    Eye,
    FileSpreadsheet,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { exportToExcel, exportToPdf } from "@/lib/utils/export";
import { toast } from "sonner";

type ReportData = {
    financial?: {
        totalRevenue: number;
        totalExpenses: number;
        netIncome: number;
        paidBills: number;
        unpaidBills: number;
        monthlyData: Array<{
            month: string;
            revenue: number;
            expenses: number;
        }>;
    };
    visitors?: {
        totalVisitors: number;
        activeVisitors: number;
        checkedOutVisitors: number;
        dailyData: Array<{
            date: string;
            count: number;
        }>;
        topVisitors: Array<{
            unitNumber: string;
            count: number;
        }>;
    };
    maintenance?: {
        totalTickets: number;
        openTickets: number;
        resolvedTickets: number;
        averageResolutionTime: number;
        ticketsByCategory: Array<{
            category: string;
            count: number;
        }>;
        monthlyData: Array<{
            month: string;
            count: number;
        }>;
    };
};

const reportTypes = [
    {
        id: "financial",
        name: "รายงานการเงิน",
        description: "รายได้ ค่าใช้จ่าย และบิลค่าบริการ",
        icon: DollarSign,
        color: "from-green-400 to-emerald-500",
    },
    {
        id: "visitor",
        name: "รายงานผู้มาติดต่อ",
        description: "สถิติผู้เยี่ยมชมและ QR Code",
        icon: Users,
        color: "from-blue-400 to-cyan-500",
    },
    {
        id: "maintenance",
        name: "รายงานการแจ้งซ่อม",
        description: "แจ้งซ่อม ระยะเวลา และสถิติ",
        icon: Wrench,
        color: "from-orange-400 to-red-500",
    },
];

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState<string>("financial");
    const [dateRange, setDateRange] = useState<string>("30");
    const [reportData, setReportData] = useState<ReportData>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReportData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch data based on selected report type
            switch (selectedReport) {
                case "financial":
                    await fetchFinancialReport();
                    break;
                case "visitor":
                    await fetchVisitorReport();
                    break;
                case "maintenance":
                    await fetchMaintenanceReport();
                    break;
            }
        } catch {
            setError("ไม่สามารถโหลดข้อมูลรายงานได้");
        } finally {
            setLoading(false);
        }
    }, [selectedReport]);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData, dateRange]);

    // Export handlers
    function handleExportFinancial(format: 'excel' | 'pdf') {
        if (!reportData.financial) return;
        const exportData = reportData.financial.monthlyData.map(m => ({
            month: m.month, revenue: m.revenue, expenses: m.expenses,
            profit: m.revenue - m.expenses,
            profitMargin: `${((m.revenue - m.expenses) / m.revenue * 100).toFixed(1)}%`
        }));
        if (format === 'excel') {
            exportToExcel(exportData, {
                filename: `financial-report-${new Date().toISOString().split('T')[0]}`,
                sheetName: 'รายงานการเงิน',
                columns: [{ key: 'month', header: 'เดือน' }, { key: 'revenue', header: 'รายได้' }, { key: 'expenses', header: 'ค่าใช้จ่าย' }, { key: 'profit', header: 'กำไร' }]
            });
        } else {
            exportToPdf(exportData, {
                filename: `financial-report-${new Date().toISOString().split('T')[0]}`,
                title: 'รายงานการเงิน',
                subtitle: `รายได้รวม: ฿${reportData.financial.totalRevenue.toLocaleString()}`,
                columns: [{ key: 'month', header: 'เดือน' }, { key: 'revenue', header: 'รายได้' }, { key: 'expenses', header: 'ค่าใช้จ่าย' }, { key: 'profit', header: 'กำไร' }]
            });
        }
        toast.success(`ส่งออกรายงานเป็น ${format.toUpperCase()} เรียบร้อย`);
    }

    function handleExportVisitor(format: 'excel' | 'pdf') {
        if (!reportData.visitors) return;
        const exportData = reportData.visitors.dailyData.map(d => ({ date: d.date, count: d.count }));
        if (format === 'excel') {
            exportToExcel(exportData, {
                filename: `visitor-report-${new Date().toISOString().split('T')[0]}`,
                sheetName: 'รายงานผู้มาติดต่อ',
                columns: [{ key: 'date', header: 'วันที่' }, { key: 'count', header: 'จำนวน' }]
            });
        } else {
            exportToPdf(exportData, {
                filename: `visitor-report-${new Date().toISOString().split('T')[0]}`,
                title: 'รายงานผู้มาติดต่อ',
                subtitle: `ผู้มาติดต่อทั้งหมด: ${reportData.visitors.totalVisitors} คน`,
                columns: [{ key: 'date', header: 'วันที่' }, { key: 'count', header: 'จำนวน' }]
            });
        }
        toast.success(`ส่งออกรายงานเป็น ${format.toUpperCase()} เรียบร้อย`);
    }

    function handleExportMaintenance(format: 'excel' | 'pdf') {
        if (!reportData.maintenance) return;
        const exportData = reportData.maintenance.ticketsByCategory.map(c => ({
            category: c.category, count: c.count,
            percentage: `${(c.count / reportData.maintenance!.totalTickets * 100).toFixed(1)}%`
        }));
        if (format === 'excel') {
            exportToExcel(exportData, {
                filename: `maintenance-report-${new Date().toISOString().split('T')[0]}`,
                sheetName: 'รายงานการแจ้งซ่อม',
                columns: [{ key: 'category', header: 'ประเภท' }, { key: 'count', header: 'จำนวน' }]
            });
        } else {
            exportToPdf(exportData, {
                filename: `maintenance-report-${new Date().toISOString().split('T')[0]}`,
                title: 'รายงานการแจ้งซ่อม',
                subtitle: `แจ้งซ่อมทั้งหมด: ${reportData.maintenance.totalTickets} รายการ`,
                columns: [{ key: 'category', header: 'ประเภท' }, { key: 'count', header: 'จำนวน' }]
            });
        }
        toast.success(`ส่งออกรายงานเป็น ${format.toUpperCase()} เรียบร้อย`);
    }

    const fetchFinancialReport = async () => {
        try {
            // TODO: Implement actual API call for financial report
            // Mock data for now
            const mockData = {
                totalRevenue: 1500000,
                totalExpenses: 800000,
                netIncome: 700000,
                paidBills: 145,
                unpaidBills: 23,
                monthlyData: [
                    { month: "ม.ค.", revenue: 250000, expenses: 120000 },
                    { month: "ก.พ.", revenue: 280000, expenses: 135000 },
                    { month: "มี.ค.", revenue: 320000, expenses: 150000 },
                    { month: "เม.ย.", revenue: 300000, expenses: 140000 },
                    { month: "พ.ค.", revenue: 350000, expenses: 160000 },
                    { month: "มิ.ย.", revenue: 380000, expenses: 170000 },
                ],
            };
            setReportData({ financial: mockData });
        } catch {
            throw new Error("ไม่สามารถโหลดข้อมูลรายงานการเงินได้");
        }
    };

    const fetchVisitorReport = async () => {
        try {
            // TODO: Implement actual API call for visitor report
            // Mock data for now
            const mockData = {
                totalVisitors: 1247,
                activeVisitors: 89,
                checkedOutVisitors: 1158,
                dailyData: [
                    { date: "2025-01-08", count: 45 },
                    { date: "2025-01-09", count: 52 },
                    { date: "2025-01-10", count: 38 },
                    { date: "2025-01-11", count: 61 },
                    { date: "2025-01-12", count: 47 },
                ],
                topVisitors: [
                    { unitNumber: "A-101", count: 23 },
                    { unitNumber: "B-205", count: 19 },
                    { unitNumber: "C-302", count: 17 },
                    { unitNumber: "A-403", count: 15 },
                    { unitNumber: "D-201", count: 14 },
                ],
            };
            setReportData({ visitors: mockData });
        } catch {
            throw new Error("ไม่สามารถโหลดข้อมูลรายงานผู้มาติดต่อได้");
        }
    };

    const fetchMaintenanceReport = async () => {
        try {
            // TODO: Implement actual API call for maintenance report
            // Mock data for now
            const mockData = {
                totalTickets: 89,
                openTickets: 12,
                resolvedTickets: 77,
                averageResolutionTime: 2.5,
                ticketsByCategory: [
                    { category: "ไฟฟ้า", count: 23 },
                    { category: "ประปา", count: 18 },
                    { category: "แอร์", count: 15 },
                    { category: "ของใช้ในห้อง", count: 12 },
                    { category: "ส่วนกลาง", count: 21 },
                ],
                monthlyData: [
                    { month: "ม.ค.", count: 12 },
                    { month: "ก.พ.", count: 15 },
                    { month: "มี.ค.", count: 18 },
                    { month: "เม.ย.", count: 14 },
                    { month: "พ.ค.", count: 16 },
                    { month: "มิ.ย.", count: 14 },
                ],
            };
            setReportData({ maintenance: mockData });
        } catch {
            throw new Error("ไม่สามารถโหลดข้อมูลรายงานการแจ้งซ่อมได้");
        }
    };

    const renderFinancialReport = () => {
        const data = reportData.financial;
        if (!data) return null;

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">รายได้รวม</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        ฿{data.totalRevenue.toLocaleString()}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ค่าใช้จ่าย</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        ฿{data.totalExpenses.toLocaleString()}
                                    </p>
                                </div>
                                <FileText className="h-8 w-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">กำไรสุทธิ</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        ฿{data.netIncome.toLocaleString()}
                                    </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">อัตราชำระ</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {((data.paidBills / (data.paidBills + data.unpaidBills)) * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <BarChart3 className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            รายงานรายเดือน
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Download className="w-4 h-4 mr-2" />
                                        ส่งออก
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleExportFinancial('excel')}>
                                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                                        Excel (.xlsx)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleExportFinancial('pdf')}>
                                        <FileText className="w-4 h-4 mr-2" />
                                        PDF
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.monthlyData.map((month, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-slate-100/50 dark:bg-white/5 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium">{month.month}</p>
                                        <div className="flex gap-4 mt-1">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">รายได้: ฿{month.revenue.toLocaleString()}</span>
                                            <span className="text-sm text-slate-600 dark:text-slate-400">ค่าใช้จ่าย: ฿{month.expenses.toLocaleString()}</span>
                                            <span className="text-sm font-medium text-green-600">
                                                กำไร: ฿{(month.revenue - month.expenses).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">กำไรขั้นต่ำ</p>
                                        <p className="text-lg font-bold text-green-600">
                                            {((month.revenue - month.expenses) / month.revenue * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderVisitorReport = () => {
        const data = reportData.visitors;
        if (!data) return null;

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ผู้มาติดต่อทั้งหมด</p>
                                    <p className="text-2xl font-bold text-blue-600">{data.totalVisitors.toLocaleString()}</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">กำลังอยู่ในพื้นที่</p>
                                    <p className="text-2xl font-bold text-green-600">{data.activeVisitors}</p>
                                </div>
                                <Eye className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">เช็คเอาท์แล้ว</p>
                                    <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">{data.checkedOutVisitors}</p>
                                </div>
                                <FileText className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">อัตราเฉลี่ย/วัน</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {Math.round(data.totalVisitors / 30)}
                                    </p>
                                </div>
                                <BarChart3 className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>ผู้มาติดต่อรายวัน (5 วันล่าสุด)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data.dailyData.map((day, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm">
                                            {format(new Date(day.date), "d MMMM yyyy", { locale: th })}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-slate-200/50 dark:bg-white/10 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full"
                                                    style={{
                                                        width: `${(day.count / Math.max(...data.dailyData.map(d => d.count))) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium w-12 text-right">{day.count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>ห้องที่มีผู้มาติดต่อมากที่สุด</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data.topVisitors.map((unit, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center text-xs">
                                                {index + 1}
                                            </Badge>
                                            <span className="text-sm font-medium">{unit.unitNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-slate-200/50 dark:bg-white/10 rounded-full h-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full"
                                                    style={{
                                                        width: `${(unit.count / Math.max(...data.topVisitors.map(u => u.count))) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium w-12 text-right">{unit.count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    const renderMaintenanceReport = () => {
        const data = reportData.maintenance;
        if (!data) return null;

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">แจ้งซ่อมทั้งหมด</p>
                                    <p className="text-2xl font-bold text-blue-600">{data.totalTickets}</p>
                                </div>
                                <Wrench className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">รอดำเนินการ</p>
                                    <p className="text-2xl font-bold text-orange-600">{data.openTickets}</p>
                                </div>
                                <FileText className="h-8 w-8 text-orange-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">ดำเนินการแล้ว</p>
                                    <p className="text-2xl font-bold text-green-600">{data.resolvedTickets}</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">เวลาเฉลี่ย</p>
                                    <p className="text-2xl font-bold text-purple-600">{data.averageResolutionTime} วัน</p>
                                </div>
                                <Calendar className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>แจ้งซ่อมตามประเภท</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data.ticketsByCategory.map((category, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${index === 0 ? "bg-blue-500" :
                                                index === 1 ? "bg-red-500" :
                                                    index === 2 ? "bg-green-500" :
                                                        index === 3 ? "bg-yellow-500" :
                                                            "bg-purple-500"
                                                }`}></div>
                                            <span className="text-sm font-medium">{category.category}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-slate-200/50 dark:bg-white/10 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${index === 0 ? "bg-blue-500" :
                                                        index === 1 ? "bg-red-500" :
                                                            index === 2 ? "bg-green-500" :
                                                                index === 3 ? "bg-yellow-500" :
                                                                    "bg-purple-500"
                                                        }`}
                                                    style={{
                                                        width: `${(category.count / Math.max(...data.ticketsByCategory.map(c => c.count))) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium w-8 text-right">{category.count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>แจ้งซ่อมรายเดือน</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data.monthlyData.map((month, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{month.month}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-slate-200/50 dark:bg-white/10 rounded-full h-2">
                                                <div
                                                    className="bg-orange-500 h-2 rounded-full"
                                                    style={{
                                                        width: `${(month.count / Math.max(...data.monthlyData.map(m => m.count))) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium w-8 text-right">{month.count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">รายงาน</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">ดูข้อมูลสถิติและรายงานต่างๆ ของโครงการ</p>
                </div>
                <div className="flex items-center gap-4">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="เลือกช่วงเวลา" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">7 วันล่าสุด</SelectItem>
                            <SelectItem value="30">30 วันล่าสุด</SelectItem>
                            <SelectItem value="90">3 เดือนล่าสุด</SelectItem>
                            <SelectItem value="365">1 ปีล่าสุด</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Report Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                        <Card
                            key={type.id}
                            className={`bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm cursor-pointer transition-all hover:shadow-lg ${selectedReport === type.id
                                ? "ring-2 ring-purple-500 shadow-lg shadow-purple-500/10"
                                : "hover:shadow-md hover:border-purple-500/50"
                                }`}
                            onClick={() => setSelectedReport(type.id)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{type.name}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">{type.description}</p>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    );
                })}
            </div>

            {/* Report Content */}
            {loading ? (
                <div className="space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm animate-pulse">
                            <CardHeader>
                                <div className="h-6 bg-slate-200/50 dark:bg-white/10 rounded w-1/3"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="h-4 bg-slate-200/50 dark:bg-white/10 rounded"></div>
                                    <div className="h-4 bg-slate-200/50 dark:bg-white/10 rounded w-3/4"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : error ? (
                <Card className="bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-500/30 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <p className="text-red-800">{error}</p>
                        <Button onClick={fetchReportData} variant="outline" className="mt-2">
                            ลองใหม่
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {selectedReport === "financial" && renderFinancialReport()}
                    {selectedReport === "visitor" && renderVisitorReport()}
                    {selectedReport === "maintenance" && renderMaintenanceReport()}
                </div>
            )}
        </div>
    );
}
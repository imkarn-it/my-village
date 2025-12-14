"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
} from 'recharts';
import {
    FileText,
    Download,
    Calendar,
    TrendingUp,
    Users,
    Building,
    DollarSign,
    Activity,
    Filter,
    Eye,
    AlertTriangle,
    CheckCircle,
    FileSpreadsheet,
    Mail,
    Printer,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { th } from "date-fns/locale";

type ProjectSummary = {
    id: string;
    name: string;
    code: string;
    totalUsers: number;
    activeUsers: number;
    totalAnnouncements: number;
    totalMaintenance: number;
    totalBookings: number;
    totalRevenue: number;
    status: "active" | "inactive" | "maintenance";
    createdAt: string;
};

type SystemMetric = {
    name: string;
    value: number;
    change: number;
    changeType: "increase" | "decrease";
    icon: any;
};

type ReportData = {
    totalProjects: number;
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    totalMaintenance: number;
    totalBookings: number;
    monthlyGrowth: number;
    userSatisfaction: number;
};

const mockProjects: ProjectSummary[] = [
    {
        id: "1",
        name: "My Village Condominium",
        code: "MV001",
        totalUsers: 200,
        activeUsers: 185,
        totalAnnouncements: 45,
        totalMaintenance: 123,
        totalBookings: 234,
        totalRevenue: 4850000,
        status: "active",
        createdAt: "2025-01-01T00:00:00Z"
    },
    {
        id: "2",
        name: "My Condo Sukhumvit",
        code: "MC002",
        totalUsers: 150,
        activeUsers: 142,
        totalAnnouncements: 32,
        totalMaintenance: 89,
        totalBookings: 189,
        totalRevenue: 3650000,
        status: "active",
        createdAt: "2025-02-15T00:00:00Z"
    },
    {
        id: "3",
        name: "City Tower",
        code: "CT003",
        totalUsers: 300,
        activeUsers: 278,
        totalAnnouncements: 67,
        totalMaintenance: 156,
        totalBookings: 412,
        totalRevenue: 7200000,
        status: "active",
        createdAt: "2025-03-01T00:00:00Z"
    }
];

const mockReportData: ReportData = {
    totalProjects: 15,
    totalUsers: 2847,
    activeUsers: 2634,
    totalRevenue: 45600000,
    totalMaintenance: 1234,
    totalBookings: 3456,
    monthlyGrowth: 12.5,
    userSatisfaction: 4.6
};

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const monthlyData = [
    { name: "ม.ค.", projects: 12, users: 2400, revenue: 15000000 },
    { name: "ก.พ.", projects: 13, users: 2540, revenue: 16500000 },
    { name: "มี.ค.", projects: 15, users: 2847, revenue: 45600000 },
];

export default function SuperAdminReportsPage() {
    const [reportData, setReportData] = useState<ReportData>(mockReportData);
    const [projects, setProjects] = useState<ProjectSummary[]>(mockProjects);
    const [selectedTimeRange, setSelectedTimeRange] = useState("month");
    const [selectedMetric, setSelectedMetric] = useState("overview");

    const systemMetrics: SystemMetric[] = [
        {
            name: "โครงการทั้งหมด",
            value: reportData.totalProjects,
            change: 15.2,
            changeType: "increase",
            icon: Building
        },
        {
            name: "ผู้ใช้ทั้งหมด",
            value: reportData.totalUsers,
            change: 8.7,
            changeType: "increase",
            icon: Users
        },
        {
            name: "ผู้ใช้ที่ใช้งาน",
            value: reportData.activeUsers,
            change: 5.3,
            changeType: "increase",
            icon: Activity
        },
        {
            name: "รายได้รวม",
            value: reportData.totalRevenue,
            change: 12.5,
            changeType: "increase",
            icon: DollarSign
        }
    ];

    const projectDistribution = projects.map(project => ({
        name: project.name,
        users: project.totalUsers,
        revenue: project.totalRevenue
    }));

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active": return "bg-green-100 text-green-800";
            case "inactive": return "bg-gray-100 text-gray-800";
            case "maintenance": return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "active": return "ใช้งาน";
            case "inactive": return "ไม่ใช้งาน";
            case "maintenance": return "ปิดปรับปรุง";
            default: return status;
        }
    };

    const exportToPDF = (type: "overview" | "detailed" | "financial") => {
        const pdf = new jsPDF();

        // Add Thai font support (using built-in font as fallback)
        pdf.setFont("helvetica");

        // Title
        pdf.setFontSize(20);
        pdf.text("System Report", 20, 20);

        // Date range
        pdf.setFontSize(12);
        pdf.text(`Generated: ${format(new Date(), "PPP", { locale: th })}`, 20, 35);
        pdf.text(`Period: ${selectedTimeRange === "month" ? "เดือนนี้" : selectedTimeRange}`, 20, 45);

        // System Metrics
        pdf.setFontSize(16);
        pdf.text("System Metrics", 20, 60);
        pdf.setFontSize(11);

        let yPosition = 70;
        systemMetrics.forEach((metric) => {
            const value = metric.name === "รายได้รวม"
                ? `฿${metric.value.toLocaleString('th-TH')}`
                : metric.value.toLocaleString('th-TH');
            pdf.text(`${metric.name}: ${value} (${metric.changeType === "increase" ? "+" : ""}${metric.change}%)`, 30, yPosition);
            yPosition += 10;
        });

        // Projects Summary
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.text("Projects Summary", 20, 20);

        // Create table for projects
        const tableData = projects.map(p => [
            p.name,
            p.code,
            p.totalUsers.toString(),
            p.activeUsers.toString(),
            `฿${p.totalRevenue.toLocaleString('th-TH')}`,
            getStatusLabel(p.status)
        ]);

        (pdf as any).autoTable({
            head: [["Project", "Code", "Users", "Active", "Revenue", "Status"]],
            body: tableData,
            startY: 30,
            theme: "grid",
            styles: { font: "helvetica", fontSize: 10 },
            headStyles: { fillColor: [59, 130, 246] }
        });

        // Save the PDF
        pdf.save(`report-${type}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    };

    const exportToExcel = () => {
        // Create CSV content
        const headers = ["ชื่อโครงการ", "รหัส", "ผู้ใช้ทั้งหมด", "ผู้ใช้ที่ใช้งาน", "แจ้งซ่อม", "จองพื้นที่", "รายได้", "สถานะ"];
        const rows = projects.map(p => [
            p.name,
            p.code,
            p.totalUsers.toString(),
            p.activeUsers.toString(),
            p.totalMaintenance.toString(),
            p.totalBookings.toString(),
            p.totalRevenue.toString(),
            getStatusLabel(p.status)
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
        link.setAttribute("download", `report-projects-${format(new Date(), "yyyy-MM-dd")}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const emailReport = async () => {
        // In a real app, this would send the report via email
        const emailContent = `
Subject: System Report - ${format(new Date(), "PPP", { locale: th })}

Total Projects: ${reportData.totalProjects}
Total Users: ${reportData.totalUsers}
Active Users: ${reportData.activeUsers}
Total Revenue: ฿${reportData.totalRevenue.toLocaleString('th-TH')}
Monthly Growth: ${reportData.monthlyGrowth}%
User Satisfaction: ${reportData.userSatisfaction}/5.0

This is an automated report from My Village System.
        `;

        // Copy to clipboard for now
        await navigator.clipboard.writeText(emailContent);
        alert("Report content copied to clipboard. Paste it in your email client.");
    };

    const printReport = () => {
        window.print();
    };

    const exportReport = (type: "overview" | "detailed" | "financial") => {
        exportToPDF(type);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">รายงาน Super Admin</h1>
                    <p className="text-gray-600">ภาพรวมข้อมูลระบบทั้งหมด</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex gap-2">
                        <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="day">วันนี้</SelectItem>
                                <SelectItem value="week">สัปดาห์นี้</SelectItem>
                                <SelectItem value="month">เดือนนี้</SelectItem>
                                <SelectItem value="quarter">ไตรมาสนี้</SelectItem>
                                <SelectItem value="year">ปีนี้</SelectItem>
                            </SelectContent>
                        </Select>
                        <DateRangePicker
                            placeholder="เลือกช่วงวัน"
                            className="w-[250px]"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={printReport}>
                            <Printer className="w-4 h-4 mr-2" />
                            พิมพ์
                        </Button>
                        <Button variant="outline" onClick={exportToExcel}>
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Export Excel
                        </Button>
                        <Button variant="outline" onClick={emailReport}>
                            <Mail className="w-4 h-4 mr-2" />
                            ส่งอีเมล
                        </Button>
                        <Button variant="outline" onClick={() => exportReport("overview")}>
                            <Download className="w-4 h-4 mr-2" />
                            Export PDF
                        </Button>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {systemMetrics.map((metric, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {metric.name === "รายได้รวม"
                                            ? `฿${metric.value.toLocaleString('th-TH')}`
                                            : metric.value.toLocaleString('th-TH')
                                        }
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        {metric.changeType === "increase" ? (
                                            <TrendingUp className="w-3 h-3 text-green-600" />
                                        ) : (
                                            <TrendingUp className="w-3 h-3 text-red-600 rotate-180" />
                                        )}
                                        <span className={`text-sm ${metric.changeType === "increase" ? "text-green-600" : "text-red-600"
                                            }`}>
                                            {metric.changeType === "increase" ? "+" : ""}{metric.change}%
                                        </span>
                                    </div>
                                </div>
                                <metric.icon className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Growth Trend */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            แนวโน้มการเติบโต
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="projects" stroke="#3b82f6" name="โครงการ" />
                                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" name="รายได้" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Project Distribution */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="w-5 h-5" />
                            การกระจายผู้ใช้ตามโครงการ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={projects}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="totalUsers"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {projects.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Project Summary Table */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Building className="w-5 h-5" />
                            สรุปภาพโครงการ ({projects.length})
                        </span>
                        <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4 mr-2" />
                            กรอง
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ชื่อโครงการ</TableHead>
                                    <TableHead>รหัส</TableHead>
                                    <TableHead>ผู้ใช้</TableHead>
                                    <TableHead>ใช้งาน</TableHead>
                                    <TableHead>แจ้งซ่อม</TableHead>
                                    <TableHead>จองพื้นที่</TableHead>
                                    <TableHead>รายได้</TableHead>
                                    <TableHead>สถานะ</TableHead>
                                    <TableHead>จัดการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projects.map((project) => (
                                    <TableRow key={project.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium">{project.name}</TableCell>
                                        <TableCell>{project.code}</TableCell>
                                        <TableCell>{project.totalUsers.toLocaleString('th-TH')}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{project.activeUsers}</span>
                                                <span className="text-sm text-gray-500">
                                                    ({((project.activeUsers / project.totalUsers) * 100).toFixed(1)}%)
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{project.totalMaintenance}</TableCell>
                                        <TableCell>{project.totalBookings}</TableCell>
                                        <TableCell className="font-medium">
                                            ฿{project.totalRevenue.toLocaleString('th-TH')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(project.status)}>
                                                {getStatusLabel(project.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">
                                                    <FileText className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Additional Reports */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>รายงานประจำเดือน</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full justify-start" variant="outline" onClick={() => exportReport("detailed")}>
                            <FileText className="w-4 h-4 mr-2" />
                            รายงานผู้ใช้
                        </Button>
                        <Button className="w-full justify-start" variant="outline" onClick={() => exportReport("financial")}>
                            <FileText className="w-4 h-4 mr-2" />
                            รายงานการเงิน
                        </Button>
                        <Button className="w-full justify-start" variant="outline" onClick={() => exportReport("detailed")}>
                            <FileText className="w-4 h-4 mr-2" />
                            รายงานการซ่อมบำรุง
                        </Button>
                        <Button className="w-full justify-start" variant="outline" onClick={() => exportReport("detailed")}>
                            <FileText className="w-4 h-4 mr-2" />
                            รายงานผู้มาติดต่อ
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>รายงานสรุปปี</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full justify-start" variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            ประจำปี 2025
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            การเปรียบเทียบประจำปี
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            แนวโน้มรายปี
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>รายงานพิเศษ</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full justify-start" variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            สรุปกิจกรรมทั้งระบบ
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            รายงานการใช้งานระบบ
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                            ปัญหาและข้อควรคุม
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
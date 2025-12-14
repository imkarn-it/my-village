"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
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
    AreaChart,
    Area,
    Legend,
} from 'recharts';
import {
    BarChart3,
    TrendingUp,
    Clock,
    AlertTriangle,
    DollarSign,
    Users,
    Package,
    Download,
    Wrench,
    FileText,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import jsPDF from "jspdf";
import "jspdf-autotable";

type AnalyticsData = {
    totalJobs: number;
    completedJobs: number;
    pendingJobs: number;
    inProgressJobs: number;
    overdueJobs: number;
    averageCompletionTime: number;
    totalCost: number;
    partsUsed: number;
    technicianPerformance: {
        id: string;
        name: string;
        completedJobs: number;
        averageTime: number;
        rating: number;
    }[];
    jobCategories: {
        name: string;
        count: number;
    }[];
    monthlyData: {
        month: string;
        jobs: number;
        completed: number;
        cost: number;
    }[];
    equipmentDowntime: {
        name: string;
        downtime: number;
    }[];
};

const mockData: AnalyticsData = {
    totalJobs: 156,
    completedJobs: 134,
    pendingJobs: 12,
    inProgressJobs: 8,
    overdueJobs: 2,
    averageCompletionTime: 2.5, // days
    totalCost: 284750,
    partsUsed: 287,
    technicianPerformance: [
        { id: "1", name: "สมชาย ใจดี", completedJobs: 45, averageTime: 2.1, rating: 4.8 },
        { id: "2", name: "สมศรี มั่งคั่ง", completedJobs: 38, averageTime: 2.8, rating: 4.6 },
        { id: "3", name: "วิชัย รุ่งเรือง", completedJobs: 32, averageTime: 2.3, rating: 4.7 },
        { id: "4", name: "บุญรอด มีสุข", completedJobs: 19, averageTime: 3.2, rating: 4.5 },
    ],
    jobCategories: [
        { name: "ไฟฟ้า", count: 45 },
        { name: "ประปา", count: 38 },
        { name: "แอร์", count: 32 },
        { name: "ลิฟต์", count: 18 },
        { name: "สนาม", count: 15 },
        { name: "อื่นๆ", count: 8 },
    ],
    monthlyData: [
        { month: "ม.ค.", jobs: 42, completed: 40, cost: 65000 },
        { month: "ก.พ.", jobs: 38, completed: 35, cost: 58000 },
        { month: "มี.ค.", jobs: 45, completed: 42, cost: 72000 },
        { month: "เม.ย.", jobs: 31, completed: 29, cost: 53750 },
    ],
    equipmentDowntime: [
        { name: "ลิฟต์ A", downtime: 4.5 },
        { name: "ปั๊มน้ำ 1", downtime: 2.2 },
        { name: "แอร์โถงล่าง", downtime: 1.8 },
        { name: "เครื่องทำน้ำอุ่น", downtime: 0.5 },
    ],
};

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function MaintenanceAnalytics() {
    const [data] = useState<AnalyticsData>(mockData);
    const [selectedTimeRange, setSelectedTimeRange] = useState("month");

    const exportToPDF = () => {
        const pdf = new jsPDF();
        pdf.setFont("helvetica");

        // Title
        pdf.setFontSize(20);
        pdf.text("Maintenance Analytics Report", 20, 20);

        // Date range
        pdf.setFontSize(12);
        pdf.text(`Generated: ${format(new Date(), "PPP", { locale: th })}`, 20, 35);
        pdf.text(`Period: ${selectedTimeRange === "month" ? "เดือนนี้" : selectedTimeRange}`, 20, 45);

        // Key Metrics
        pdf.setFontSize(16);
        pdf.text("Key Metrics", 20, 60);
        pdf.setFontSize(11);

        let yPosition = 70;
        const metrics = [
            [`Total Jobs: ${data.totalJobs}`],
            [`Completed: ${data.completedJobs}`],
            [`Pending: ${data.pendingJobs}`],
            [`Avg Completion Time: ${data.averageCompletionTime} days`],
            [`Total Cost: ฿${data.totalCost.toLocaleString('th-TH')}`],
        ];

        metrics.forEach((metric) => {
            pdf.text(metric[0], 30, yPosition);
            yPosition += 10;
        });

        // Technician Performance Table
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.text("Technician Performance", 20, 20);

        const tableData = data.technicianPerformance.map(t => [
            t.name,
            t.completedJobs.toString(),
            `${t.averageTime} days`,
            t.rating.toString(),
        ]);

        (pdf as unknown as { autoTable: (options: unknown) => void }).autoTable({
            head: [["Technician", "Jobs", "Avg Time", "Rating"]],
            body: tableData,
            startY: 30,
            theme: "grid",
            styles: { font: "helvetica", fontSize: 10 },
            headStyles: { fillColor: [59, 130, 246] }
        });

        // Save the PDF
        pdf.save(`maintenance-analytics-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    };

    const getCompletionRate = () => {
        return data.totalJobs > 0 ? ((data.completedJobs / data.totalJobs) * 100).toFixed(1) : "0";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">วิเคราะห์ข้อมูลซ่อมบำรุง</h1>
                    <p className="text-gray-600">สถิติและรายงานการทำงานของแผนกซ่อมบำรุง</p>
                </div>
                <div className="flex gap-2">
                    <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                    <Button variant="outline" onClick={exportToPDF}>
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">งานทั้งหมด</p>
                                <p className="text-2xl font-bold text-gray-900">{data.totalJobs}</p>
                                <p className="text-sm text-green-600">
                                    เสร็จ {data.completedJobs} ({getCompletionRate()}%)
                                </p>
                            </div>
                            <Wrench className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ระยะเวลาเฉลี่ย</p>
                                <p className="text-2xl font-bold text-gray-900">{data.averageCompletionTime}</p>
                                <p className="text-sm text-gray-600">วันทำงาน</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ต้นทุนรวม</p>
                                <p className="text-2xl font-bold text-gray-900">฿{data.totalCost.toLocaleString('th-TH')}</p>
                                <p className="text-sm text-gray-600">
                                    เฉลี่ย ฿{(data.totalCost / Math.max(data.completedJobs, 1)).toFixed(0)}/งาน
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">อะไหล่ที่ใช้</p>
                                <p className="text-2xl font-bold text-gray-900">{data.partsUsed}</p>
                                <p className="text-sm text-gray-600">รายการ</p>
                            </div>
                            <Package className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Jobs Trend */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            แนวโน้มงานรายเดือน
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={data.monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="jobs"
                                    stackId="1"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.6}
                                    name="งานทั้งหมด"
                                />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="completed"
                                    stackId="1"
                                    stroke="#10b981"
                                    fill="#10b981"
                                    fillOpacity={0.6}
                                    name="เสร็จสิ้น"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Job Categories */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            ประเภทงานซ่อมบำรุง
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data.jobCategories}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                    label={(props: any) => `${props.name}: ${props.count}`}
                                >
                                    {data.jobCategories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Technician Performance */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            ประสิทธิภาพช่าง
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.technicianPerformance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="completedJobs" fill="#3b82f6" name="งานที่เสร็จ" />
                                <Bar yAxisId="right" dataKey="rating" fill="#10b981" name="คะแนน" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Equipment Downtime */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            เวลาหยุดทำงานของอุปกรณ์ (ชั่วโมง)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.equipmentDowntime} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" />
                                <Tooltip />
                                <Bar dataKey="downtime" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Job Status */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>สถานะงาน</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                ทั้งหมด
                            </span>
                            <span className="font-medium">{data.totalJobs}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                เสร็จสิ้น
                            </span>
                            <span className="font-medium">{data.completedJobs}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                ดำเนินการ
                            </span>
                            <span className="font-medium">{data.inProgressJobs}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                รอดำเนินการ
                            </span>
                            <span className="font-medium">{data.pendingJobs}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                เลยกำหนด
                            </span>
                            <span className="font-medium text-red-600">{data.overdueJobs}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Performers */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>ช่างยอดเยี่ยม</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {data.technicianPerformance.slice(0, 3).map((tech, index) => (
                            <div key={tech.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                        index === 1 ? 'bg-gray-100 text-gray-800' :
                                            'bg-orange-100 text-orange-800'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium">{tech.name}</p>
                                        <p className="text-sm text-gray-500">{tech.completedJobs} งาน</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">{tech.rating} ⭐</p>
                                    <p className="text-sm text-gray-500">{tech.averageTime} วัน</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>รายงาน</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full justify-start" variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            รายงานประจำเดือน
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            รายงานต้นทุน
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            รายงานประสิทธิภาพ
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            รายงานอุปกรณ์
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
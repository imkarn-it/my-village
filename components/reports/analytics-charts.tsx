"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend,
    Area,
    AreaChart,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown, DollarSign, Users, AlertCircle } from "lucide-react";

interface ChartData {
    name: string;
    value: number;
    value2?: number;
    value3?: number;
}

interface PieChartData {
    name: string;
    value: number;
    percentage?: number;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

interface AnalyticsChartsProps {
    data: {
        revenueData?: ChartData[];
        visitorData?: ChartData[];
        satisfactionData?: ChartData[];
        maintenanceData?: ChartData[];
        pieData?: PieChartData[];
        performanceData?: ChartData[];
        trends?: ChartData[];
    };
    type: 'financial' | 'visitor' | 'maintenance' | 'operations';
    period?: string;
    onPeriodChange?: (period: string) => void;
}

export function FinancialAnalytics({ data, period, onPeriodChange }: { data: any; period?: string; onPeriodChange?: (period: string) => void }) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0
        }).format(value);
    };

    const revenueGrowth = 15.3;
    const expenseGrowth = -5.2;

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">รายได้ทั้งหมด</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(4850000)}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <TrendingUp className="w-3 h-3 text-green-600" />
                                    <span className="text-xs text-green-600">+{revenueGrowth}%</span>
                                </div>
                            </div>
                            <DollarSign className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ค่าใช้จ่าย</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(1230000)}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <TrendingDown className="w-3 h-3 text-green-600" />
                                    <span className="text-xs text-green-600">{expenseGrowth}%</span>
                                </div>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">กำไรสุทธิ</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(3620000)}</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <TrendingUp className="w-3 h-3 text-green-600" />
                                    <span className="text-xs text-green-600">+23.1%</span>
                                </div>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">อัตราการชำระ</p>
                                <p className="text-2xl font-bold text-gray-900">94.5%</p>
                                <div className="flex items-center gap-1 mt-1">
                                    <TrendingUp className="w-3 h-3 text-green-600" />
                                    <span className="text-xs text-green-600">+2.3%</span>
                                </div>
                            </div>
                            <Users className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Period Selector */}
            <div className="flex justify-end">
                <Select value={period} onValueChange={onPeriodChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="เลือกช่วงเวลา" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="month">เดือนปัจจุบัน</SelectItem>
                        <SelectItem value="quarter">ไตรมาสนี้</SelectItem>
                        <SelectItem value="year">ปีนี้</SelectItem>
                        <SelectItem value="custom">กำหนดเอง</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Revenue Trend */}
            <Card>
                <CardHeader>
                    <CardTitle>แนวโน้มรายได้และค่าใช้จ่าย</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data.revenueData || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}K`} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stackId="1"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.6}
                                name="รายได้"
                            />
                            <Area
                                type="monotone"
                                dataKey="value2"
                                stackId="2"
                                stroke="#ef4444"
                                fill="#ef4444"
                                fillOpacity={0.6}
                                name="ค่าใช้จ่าย"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Revenue by Category */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>รายได้ตามประเภท</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data.pieData || []}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    // @ts-ignore - Recharts type issue
                                      label={({ name, percentage }) => `${name} ${percentage}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {(data.pieData || []).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>การเปรียบเทียบรายเดือน</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.trends || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}K`} />
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="value" fill="#3b82f6" name="ปีนี้" />
                                <Bar dataKey="value2" fill="#94a3b8" name="ปีที่แล้ว" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export function VisitorAnalytics({ data, period, onPeriodChange }: { data: any; period?: string; onPeriodChange?: (period: string) => void }) {
    return (
        <div className="space-y-6">
            {/* Visitor Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ผู้มาติดต่อทั้งหมด</p>
                                <p className="text-2xl font-bold text-gray-900">3,456</p>
                                <p className="text-xs text-green-600">+12.5% จากเดือนที่แล้ว</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">อนุมัติแล้ว</p>
                                <p className="text-2xl font-bold text-gray-900">2,890</p>
                                <p className="text-xs text-green-600">83.6% อัตราการอนุมัติ</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">รอดำเนินการ</p>
                                <p className="text-2xl font-bold text-gray-900">456</p>
                                <p className="text-xs text-yellow-600">13.2% รอการอนุมัติ</p>
                            </div>
                            <Calendar className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ปฏิเสธ</p>
                                <p className="text-2xl font-bold text-gray-900">110</p>
                                <p className="text-xs text-red-600">3.2% อัตราการปฏิเสธ</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Visitor Flow */}
            <Card>
                <CardHeader>
                    <CardTitle>กระแสผู้มาติดต่อรายวัน</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.visitorData || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke="#3b82f6" name="ผู้มาติดต่อ" />
                            <Line type="monotone" dataKey="value2" stroke="#10b981" name="ที่อนุมัติ" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Visitor Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>การกระจายตามประเภท</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data.pieData || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {(data.pieData || []).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>ความพึงพอใจ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={data.satisfactionData || []}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="name" />
                                <PolarRadiusAxis />
                                <Radar name="คะแนน" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export function MaintenanceAnalytics({ data, period, onPeriodChange }: { data: any; period?: string; onPeriodChange?: (period: string) => void }) {
    return (
        <div className="space-y-6">
            {/* Maintenance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">งานทั้งหมด</p>
                                <p className="text-2xl font-bold text-gray-900">245</p>
                                <p className="text-xs text-blue-600">+18 จากเดือนที่แล้ว</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">เสร็จสิ้นแล้ว</p>
                                <p className="text-2xl font-bold text-green-600">220</p>
                                <p className="text-xs text-green-600">89.8% อัตราสำเร็จ</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ระยะเวลาเฉลี่ย</p>
                                <p className="text-2xl font-bold text-gray-900">2.5 วัน</p>
                                <p className="text-xs text-green-600">-0.5 วันจากเดือนที่แล้ว</p>
                            </div>
                            <Calendar className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">ค่าใช้จ่ายทั้งหมด</p>
                                <p className="text-2xl font-bold text-gray-900">฿284,500</p>
                                <p className="text-xs text-red-600">+15% จากเดือนที่แล้ว</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Task Completion Trend */}
            <Card>
                <CardHeader>
                    <CardTitle>แนวโน้มการดำเนินงาน</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data.trends || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="value" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="งานใหม่" />
                            <Area type="monotone" dataKey="value2" stackId="2" stroke="#10b981" fill="#10b981" name="เสร็จสิ้น" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>ประเภทการซ่อมบำรุง</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.maintenanceData || []} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={80} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3b82f6" name="จำนวนงาน" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>ประสิทธิภาพช่าง</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={data.performanceData || []}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="name" />
                                <PolarRadiusAxis />
                                <Radar name="ประสิทธิภาพ" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
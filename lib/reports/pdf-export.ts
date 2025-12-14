import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => void;
    }
}

type ReportData = {
    title: string;
    subtitle?: string;
    headers: string[];
    rows: string[][];
    summary?: Record<string, any>;
    charts?: Array<{
        title: string;
        type: string;
        data: any;
    }>;
};

export class PDFReportGenerator {
    private doc: jsPDF;

    constructor() {
        this.doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
    }

    private addHeader(title: string, subtitle?: string) {
        // Add logo or header image if available
        this.doc.setFontSize(20);
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(title, 14, 20);

        if (subtitle) {
            this.doc.setFontSize(12);
            this.doc.setTextColor(100, 100, 100);
            this.doc.text(subtitle, 14, 28);
        }

        // Add date
        this.doc.setFontSize(10);
        this.doc.setTextColor(150, 150, 150);
        this.doc.text(
            `วันที่: ${format(new Date(), 'd MMMM yyyy', { locale: th })}`,
            196,
            28,
            { align: 'right' }
        );
    }

    private addFooter(pageNumber: number, totalPages: number) {
        const pageHeight = this.doc.internal.pageSize.height;
        this.doc.setFontSize(10);
        this.doc.setTextColor(150, 150, 150);
        this.doc.text(
            `หน้า ${pageNumber} / ${totalPages}`,
            196,
            pageHeight - 10,
            { align: 'right' }
        );
    }

    private addTable(headers: string[], rows: string[][], startY: number = 40) {
        this.doc.autoTable({
            head: [headers],
            body: rows,
            startY,
            theme: 'striped',
            headStyles: {
                fillColor: [59, 130, 246], // blue-500
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [249, 250, 251] // gray-50
            },
            margin: { top: 10, right: 14, bottom: 20, left: 14 }
        });
    }

    private addSummary(summary: Record<string, any>, startY: number) {
        let yPosition = startY;

        this.doc.setFontSize(14);
        this.doc.setTextColor(0, 0, 0);
        this.doc.text('สรุปข้อมูล', 14, yPosition);
        yPosition += 10;

        this.doc.setFontSize(11);
        Object.entries(summary).forEach(([key, value]) => {
            const label = this.formatKey(key);
            const displayValue = this.formatValue(value);

            this.doc.text(`${label}:`, 14, yPosition);
            this.doc.text(displayValue, 60, yPosition);
            yPosition += 7;
        });
    }

    private formatKey(key: string): string {
        const translations: Record<string, string> = {
            totalRecords: 'จำนวนทั้งหมด',
            activeUsers: 'ผู้ใช้ที่ใช้งาน',
            totalRevenue: 'รายรับทั้งหมด',
            completionRate: 'อัตราการเสร็จสิ้น',
            avgRating: 'คะแนนเฉลี่ย',
            pendingCount: 'รอดำเนินการ',
            completedCount: 'เสร็จสิ้นแล้ว',
            cancelledCount: 'ถูกยกเลิก'
        };
        return translations[key] || key;
    }

    private formatValue(value: any): string {
        if (typeof value === 'number') {
            if (value >= 1000) {
                return value.toLocaleString('th-TH');
            }
            return value.toString();
        }
        if (typeof value === 'boolean') {
            return value ? 'ใช่' : 'ไม่';
        }
        if (typeof value === 'string' && value.includes('%')) {
            return value;
        }
        return String(value || '-');
    }

    generateReport(data: ReportData): void {
        // Add header
        this.addHeader(data.title, data.subtitle);

        let currentY = 40;

        // Add summary if provided
        if (data.summary) {
            this.addSummary(data.summary, currentY);
            currentY += 50;
        }

        // Add main table
        this.addTable(data.headers, data.rows, currentY);

        // Add page numbers
        const totalPages = this.doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            this.doc.setPage(i);
            this.addFooter(i, totalPages);
        }
    }

    save(filename: string): void {
        const thaiName = `${filename}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`;
        this.doc.save(thaiName);
    }

    // Static method for quick PDF generation
    static generateAndSave(data: ReportData, filename: string): void {
        const generator = new PDFReportGenerator();
        generator.generateReport(data);
        generator.save(filename);
    }
}

// Specific report generators
export class FinancialReportGenerator extends PDFReportGenerator {
    generateMonthlyRevenueReport(data: {
        month: string;
        year: number;
        revenue: number;
        expenses: number;
        profit: number;
        transactionCount: number;
        unitRevenue: Array<{ unitNumber: string; revenue: number }>;
    }): void {
        const reportData: ReportData = {
            title: 'รายงานรายได้ประจำเดือน',
            subtitle: `เดือน ${data.month} ${data.year}`,
            headers: ['ห้องพัก', 'รายได้ (บาท)', 'สัดส่วน'],
            rows: data.unitRevenue.map(item => [
                item.unitNumber,
                item.revenue.toLocaleString('th-TH'),
                `${((item.revenue / data.revenue) * 100).toFixed(1)}%`
            ]),
            summary: {
                totalRevenue: `฿${data.revenue.toLocaleString('th-TH')}`,
                totalExpenses: `฿${data.expenses.toLocaleString('th-TH')}`,
                netProfit: `฿${data.profit.toLocaleString('th-TH')}`,
                transactionCount: data.transactionCount
            }
        };

        this.generateReport(reportData);
    }
}

export class VisitorReportGenerator extends PDFReportGenerator {
    generateVisitorStatisticsReport(data: {
        period: string;
        totalVisitors: number;
        activeVisitors: number;
        approvedVisitors: number;
        rejectedVisitors: number;
        averageVisitDuration: number;
        visitorByProject: Array<{ projectName: string; count: number }>;
        visitorByType: Array<{ type: string; count: number }>;
    }): void {
        const reportData: ReportData = {
            title: 'รายงานสถิติผู้มาติดต่อ',
            subtitle: data.period,
            headers: ['โครงการ', 'จำนวนผู้มาติดต่อ', 'สัดส่วน'],
            rows: data.visitorByProject.map(item => [
                item.projectName,
                item.count.toLocaleString('th-TH'),
                `${((item.count / data.totalVisitors) * 100).toFixed(1)}%`
            ]),
            summary: {
                totalVisitors: data.totalVisitors,
                approvedVisitors: data.approvedVisitors,
                rejectedVisitors: data.rejectedVisitors,
                averageDuration: `${data.averageVisitDuration} นาที`
            }
        };

        this.generateReport(reportData);
    }
}

export class MaintenanceReportGenerator extends PDFReportGenerator {
    generateMaintenanceReport(data: {
        period: string;
        totalTickets: number;
        completedTickets: number;
        pendingTickets: number;
        averageCompletionTime: number;
        totalCost: number;
        categoryBreakdown: Array<{ category: string; count: number; cost: number }>;
        technicianPerformance: Array<{ name: string; tasksCompleted: number; avgTime: number; rating: number }>;
    }): void {
        const reportData: ReportData = {
            title: 'รายงานการซ่อมบำรุง',
            subtitle: data.period,
            headers: ['หมวดหมู่', 'จำนวนงาน', 'ค่าใช้จ่าย (บาท)'],
            rows: data.categoryBreakdown.map(item => [
                item.category,
                item.count.toLocaleString('th-TH'),
                item.cost.toLocaleString('th-TH')
            ]),
            summary: {
                totalTickets: data.totalTickets,
                completedTickets: data.completedTickets,
                pendingTickets: data.pendingTickets,
                avgCompletionTime: `${data.averageCompletionTime} นาที`,
                totalCost: `฿${data.totalCost.toLocaleString('th-TH')}`
            }
        };

        this.generateReport(reportData);
    }
}

// Utility function for downloading PDF
export const downloadPDF = (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(filename, 14, 20);

    // This is a simplified version - in production, you'd want to use
    // html2canvas or similar to convert the element to PDF
    doc.save(`${filename}.pdf`);
};
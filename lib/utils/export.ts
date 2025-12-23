/**
 * Export Utilities - Excel and PDF export
 */
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// ==========================================
// Excel Export
// ==========================================

type ExcelExportOptions = {
    filename: string
    sheetName?: string
    columns?: { key: string; header: string }[]
}

/**
 * Export data to Excel file
 */
export function exportToExcel<T extends Record<string, unknown>>(
    data: T[],
    options: ExcelExportOptions
): void {
    const { filename, sheetName = 'Sheet1', columns } = options

    // If columns specified, map data to only include those columns
    let exportData = data
    if (columns) {
        exportData = data.map(row => {
            const mappedRow: Record<string, unknown> = {}
            columns.forEach(col => {
                mappedRow[col.header] = row[col.key]
            })
            return mappedRow as T
        })
    }

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData)

    // Auto-width columns
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(key.length + 2, 15)
    }))
    ws['!cols'] = colWidths

    // Create workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)

    // Download file
    XLSX.writeFile(wb, `${filename}.xlsx`)
}

// ==========================================
// PDF Export
// ==========================================

type PdfExportOptions = {
    filename: string
    title: string
    subtitle?: string
    columns: { key: string; header: string }[]
    orientation?: 'portrait' | 'landscape'
}

/**
 * Export data to PDF file
 */
export function exportToPdf<T extends Record<string, unknown>>(
    data: T[],
    options: PdfExportOptions
): void {
    const { filename, title, subtitle, columns, orientation = 'portrait' } = options

    // Create PDF document
    const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4',
    })

    // Add title
    doc.setFontSize(18)
    doc.text(title, 14, 22)

    // Add subtitle if provided
    if (subtitle) {
        doc.setFontSize(11)
        doc.setTextColor(100)
        doc.text(subtitle, 14, 30)
    }

    // Prepare table data
    const tableHeaders = columns.map(col => col.header)
    const tableData = data.map(row =>
        columns.map(col => {
            const value = row[col.key]
            if (value === null || value === undefined) return ''
            if (value instanceof Date) return value.toLocaleDateString('th-TH')
            return String(value)
        })
    )

    // Add table
    autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        startY: subtitle ? 35 : 28,
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [59, 130, 246], // Blue
            textColor: 255,
            fontStyle: 'bold',
        },
        alternateRowStyles: {
            fillColor: [245, 247, 250],
        },
    })

    // Add footer with date
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(
            `Generated: ${new Date().toLocaleString('th-TH')} | Page ${i} of ${pageCount}`,
            14,
            doc.internal.pageSize.height - 10
        )
    }

    // Download file
    doc.save(`${filename}.pdf`)
}

// ==========================================
// Specific Export Functions for Reports
// ==========================================

type BillReport = {
    id: string
    unitNumber: string
    billType: string
    amount: number
    status: string
    dueDate: string
    paidAt?: string
}

/**
 * Export bills report to Excel
 */
export function exportBillsToExcel(bills: BillReport[]): void {
    exportToExcel(bills, {
        filename: `bills-report-${new Date().toISOString().split('T')[0]}`,
        sheetName: 'รายงานบิล',
        columns: [
            { key: 'unitNumber', header: 'ห้อง/บ้านเลขที่' },
            { key: 'billType', header: 'ประเภท' },
            { key: 'amount', header: 'จำนวนเงิน' },
            { key: 'status', header: 'สถานะ' },
            { key: 'dueDate', header: 'กำหนดชำระ' },
            { key: 'paidAt', header: 'วันที่ชำระ' },
        ]
    })
}

/**
 * Export bills report to PDF
 */
export function exportBillsToPdf(bills: BillReport[]): void {
    exportToPdf(bills, {
        filename: `bills-report-${new Date().toISOString().split('T')[0]}`,
        title: 'รายงานการเรียกเก็บเงิน',
        subtitle: `จำนวนทั้งหมด: ${bills.length} รายการ`,
        columns: [
            { key: 'unitNumber', header: 'ห้อง/บ้าน' },
            { key: 'billType', header: 'ประเภท' },
            { key: 'amount', header: 'จำนวนเงิน' },
            { key: 'status', header: 'สถานะ' },
            { key: 'dueDate', header: 'กำหนดชำระ' },
        ],
        orientation: 'landscape',
    })
}

type VisitorReport = {
    id: string
    visitorName: string
    unitNumber: string
    purpose: string
    checkInAt: string
    checkOutAt?: string
}

/**
 * Export visitors report to Excel
 */
export function exportVisitorsToExcel(visitors: VisitorReport[]): void {
    exportToExcel(visitors, {
        filename: `visitors-report-${new Date().toISOString().split('T')[0]}`,
        sheetName: 'รายงานผู้มาติดต่อ',
        columns: [
            { key: 'visitorName', header: 'ชื่อผู้มาติดต่อ' },
            { key: 'unitNumber', header: 'ห้อง/บ้าน' },
            { key: 'purpose', header: 'วัตถุประสงค์' },
            { key: 'checkInAt', header: 'เวลาเข้า' },
            { key: 'checkOutAt', header: 'เวลาออก' },
        ]
    })
}

/**
 * Export maintenance report to Excel
 */
export function exportMaintenanceToExcel(requests: Record<string, unknown>[]): void {
    exportToExcel(requests, {
        filename: `maintenance-report-${new Date().toISOString().split('T')[0]}`,
        sheetName: 'รายงานการแจ้งซ่อม',
        columns: [
            { key: 'title', header: 'หัวข้อ' },
            { key: 'category', header: 'หมวดหมู่' },
            { key: 'status', header: 'สถานะ' },
            { key: 'priority', header: 'ความเร่งด่วน' },
            { key: 'createdAt', header: 'วันที่แจ้ง' },
            { key: 'completedAt', header: 'วันที่เสร็จ' },
        ]
    })
}

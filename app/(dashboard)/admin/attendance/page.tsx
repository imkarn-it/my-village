'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Calendar, Download, Search, Users, Clock, AlertCircle } from 'lucide-react'

// Mock data
const mockAttendance = [
    { id: '1', name: 'สมชาย รักษาการณ์', role: 'security', date: '2025-12-24', clockIn: '08:00', clockOut: '17:00', hours: 9, status: 'present' },
    { id: '2', name: 'สมหญิง ดูแลดี', role: 'security', date: '2025-12-24', clockIn: '08:15', clockOut: '17:00', hours: 8.75, status: 'late' },
    { id: '3', name: 'สมศักดิ์ ช่างซ่อม', role: 'maintenance', date: '2025-12-24', clockIn: '08:00', clockOut: '16:00', hours: 8, status: 'present' },
    { id: '4', name: 'สมปอง รักษาความปลอดภัย', role: 'security', date: '2025-12-24', clockIn: null, clockOut: null, hours: 0, status: 'absent' },
]

export default function AdminAttendancePage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')

    const filteredData = mockAttendance.filter(record => {
        const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = filterRole === 'all' || record.role === filterRole
        const matchesStatus = filterStatus === 'all' || record.status === filterStatus
        return matchesSearch && matchesRole && matchesStatus
    })

    const stats = {
        total: mockAttendance.length,
        present: mockAttendance.filter(r => r.status === 'present').length,
        late: mockAttendance.filter(r => r.status === 'late').length,
        absent: mockAttendance.filter(r => r.status === 'absent').length,
    }

    const getStatusBadge = (status: string) => {
        const config: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline'; label: string }> = {
            present: { variant: 'default', label: 'มาทำงาน' },
            late: { variant: 'outline', label: 'มาสาย' },
            absent: { variant: 'destructive', label: 'ขาดงาน' },
            leave: { variant: 'secondary', label: 'ลา' },
        }
        const c = config[status] || config.present
        return <Badge variant={c.variant}>{c.label}</Badge>
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">รายงานการลงเวลา</h1>
                <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    ส่งออก Excel
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Users className="h-8 w-8 text-blue-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-sm text-muted-foreground">พนักงานทั้งหมด</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Clock className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.present}</p>
                                <p className="text-sm text-muted-foreground">มาทำงาน</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Clock className="h-8 w-8 text-yellow-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.late}</p>
                                <p className="text-sm text-muted-foreground">มาสาย</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                            <div>
                                <p className="text-2xl font-bold">{stats.absent}</p>
                                <p className="text-sm text-muted-foreground">ขาดงาน</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        วันที่ 24 ธันวาคม 2567
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="ค้นหาชื่อพนักงาน..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={filterRole} onValueChange={setFilterRole}>
                            <SelectTrigger className="w-full md:w-40">
                                <SelectValue placeholder="ตำแหน่ง" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                <SelectItem value="security">รปภ.</SelectItem>
                                <SelectItem value="maintenance">ช่างซ่อม</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full md:w-40">
                                <SelectValue placeholder="สถานะ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ทั้งหมด</SelectItem>
                                <SelectItem value="present">มาทำงาน</SelectItem>
                                <SelectItem value="late">มาสาย</SelectItem>
                                <SelectItem value="absent">ขาดงาน</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ชื่อ</TableHead>
                                <TableHead>ตำแหน่ง</TableHead>
                                <TableHead>เข้างาน</TableHead>
                                <TableHead>ออกงาน</TableHead>
                                <TableHead>ชั่วโมง</TableHead>
                                <TableHead>สถานะ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">{record.name}</TableCell>
                                    <TableCell>
                                        {record.role === 'security' ? 'รปภ.' : 'ช่างซ่อม'}
                                    </TableCell>
                                    <TableCell>{record.clockIn || '-'}</TableCell>
                                    <TableCell>{record.clockOut || '-'}</TableCell>
                                    <TableCell>{record.hours || '-'}</TableCell>
                                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

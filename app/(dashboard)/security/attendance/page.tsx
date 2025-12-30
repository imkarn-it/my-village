'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Coffee, LogIn, LogOut, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AttendanceRecord {
    id: string
    date: string
    clockIn: string | null
    clockOut: string | null
    status: string
    totalHours: string | null
    clockInLocation?: { lat: number; lng: number } | null
    clockOutLocation?: { lat: number; lng: number } | null
}

export default function AttendancePage() {
    const [loading, setLoading] = useState(false)
    const [fetchingRecord, setFetchingRecord] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null)
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

    // Update clock every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // Get current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    })
                },
                (error) => console.error('Location error:', error)
            )
        }
    }, [])

    // Fetch today's attendance record
    const fetchTodayRecord = useCallback(async () => {
        try {
            setFetchingRecord(true)
            const res = await fetch('/api/attendance?limit=1')
            const data = await res.json()

            if (data.success && data.data?.length > 0) {
                const today = new Date().toISOString().split('T')[0]
                const record = data.data.find((r: AttendanceRecord) => r.date === today)
                setTodayRecord(record || null)
            } else {
                setTodayRecord(null)
            }
        } catch (error) {
            console.error('Failed to fetch attendance:', error)
        } finally {
            setFetchingRecord(false)
        }
    }, [])

    useEffect(() => {
        fetchTodayRecord()
    }, [fetchTodayRecord])

    const handleClockIn = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/attendance/clock-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location }),
            })

            const data = await res.json()

            if (data.success) {
                setTodayRecord(data.data)
                toast.success('ลงเวลาเข้างานสำเร็จ', {
                    description: `เวลา ${currentTime.toLocaleTimeString('th-TH')}`,
                })
            } else {
                toast.error('ไม่สามารถลงเวลาได้', {
                    description: data.error || 'กรุณาลองใหม่อีกครั้ง',
                })
            }
        } catch {
            toast.error('เกิดข้อผิดพลาด', {
                description: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleClockOut = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/attendance/clock-out', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location }),
            })

            const data = await res.json()

            if (data.success) {
                setTodayRecord(data.data)
                toast.success('ลงเวลาออกงานสำเร็จ', {
                    description: `เวลา ${currentTime.toLocaleTimeString('th-TH')}`,
                })
            } else {
                toast.error('ไม่สามารถลงเวลาได้', {
                    description: data.error || 'กรุณาลองใหม่อีกครั้ง',
                })
            }
        } catch {
            toast.error('เกิดข้อผิดพลาด', {
                description: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
            })
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
            present: { variant: 'default', label: 'มาทำงาน' },
            absent: { variant: 'destructive', label: 'ขาดงาน' },
            leave: { variant: 'secondary', label: 'ลา' },
            late: { variant: 'outline', label: 'มาสาย' },
            pending: { variant: 'secondary', label: 'รอลงเวลา' },
        }
        const config = variants[status] || variants.pending
        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    return (
        <div className="container mx-auto py-6 px-4 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">ลงเวลาทำงาน</h1>

            {/* Current Time */}
            <Card className="mb-6 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <CardContent className="py-8 text-center">
                    <p className="text-lg opacity-80">
                        {currentTime.toLocaleDateString('th-TH', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                    <p className="text-5xl font-bold mt-2 font-mono">
                        {currentTime.toLocaleTimeString('th-TH')}
                    </p>
                    {location && (
                        <p className="mt-4 text-sm opacity-80 flex items-center justify-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Today's Record */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>บันทึกวันนี้</span>
                        {fetchingRecord ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : todayRecord ? (
                            getStatusBadge(todayRecord.status)
                        ) : (
                            <Badge variant="secondary">ยังไม่มีบันทึก</Badge>
                        )}
                    </CardTitle>
                    <CardDescription>
                        {new Date().toLocaleDateString('th-TH')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg text-center">
                            <LogIn className="h-6 w-6 mx-auto mb-2 text-green-500" />
                            <p className="text-sm text-muted-foreground">เข้างาน</p>
                            <p className="text-xl font-bold">
                                {todayRecord?.clockIn
                                    ? new Date(todayRecord.clockIn).toLocaleTimeString('th-TH')
                                    : '--:--:--'}
                            </p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg text-center">
                            <LogOut className="h-6 w-6 mx-auto mb-2 text-red-500" />
                            <p className="text-sm text-muted-foreground">ออกงาน</p>
                            <p className="text-xl font-bold">
                                {todayRecord?.clockOut
                                    ? new Date(todayRecord.clockOut).toLocaleTimeString('th-TH')
                                    : '--:--:--'}
                            </p>
                        </div>
                    </div>

                    {todayRecord?.totalHours && (
                        <div className="mt-4 p-4 bg-primary/10 rounded-lg text-center">
                            <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                            <p className="text-sm text-muted-foreground">ชั่วโมงทำงาน</p>
                            <p className="text-2xl font-bold">{parseFloat(todayRecord.totalHours).toFixed(2)} ชม.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
                <Button
                    size="lg"
                    className="h-20 text-lg bg-green-600 hover:bg-green-700"
                    disabled={loading || fetchingRecord || !!todayRecord?.clockIn}
                    onClick={handleClockIn}
                >
                    {loading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        <>
                            <LogIn className="h-6 w-6 mr-2" />
                            เข้างาน
                        </>
                    )}
                </Button>
                <Button
                    size="lg"
                    className="h-20 text-lg bg-red-600 hover:bg-red-700"
                    disabled={loading || fetchingRecord || !todayRecord?.clockIn || !!todayRecord?.clockOut}
                    onClick={handleClockOut}
                >
                    {loading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        <>
                            <LogOut className="h-6 w-6 mr-2" />
                            ออกงาน
                        </>
                    )}
                </Button>
            </div>

            {/* Break Button */}
            <Button
                variant="outline"
                size="lg"
                className="w-full mt-4 h-14"
                disabled={loading || !todayRecord?.clockIn || !!todayRecord?.clockOut}
            >
                <Coffee className="h-5 w-5 mr-2" />
                พักเบรก
            </Button>
        </div>
    )
}

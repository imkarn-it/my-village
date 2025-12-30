'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, QrCode, CheckCircle, AlertTriangle, Clock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { QRScanner } from '@/components/ui/qr-scanner'

interface Checkpoint {
    id: string
    name: string
    location: string | null
    qrCode: string | null
    isActive: boolean
}

interface PatrolLog {
    id: string
    checkpointId: string
    checkedAt: string
}

export default function PatrolPage() {
    const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
    const [patrolLogs, setPatrolLogs] = useState<PatrolLog[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [scanning, setScanning] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // Fetch checkpoints and patrol logs
    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const [checkpointsRes, logsRes] = await Promise.all([
                fetch('/api/patrol/checkpoints'),
                fetch('/api/patrol/logs?limit=50'),
            ])

            const checkpointsData = await checkpointsRes.json()
            const logsData = await logsRes.json()

            if (checkpointsData.success) {
                setCheckpoints(checkpointsData.data || [])
            }
            if (logsData.success) {
                setPatrolLogs(logsData.data || [])
            }
        } catch (error) {
            console.error('Failed to fetch data:', error)
            toast.error('ไม่สามารถโหลดข้อมูลได้')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Get today's logs for a checkpoint
    const getTodayLog = (checkpointId: string) => {
        const today = new Date().toISOString().split('T')[0]
        return patrolLogs.find(log =>
            log.checkpointId === checkpointId &&
            log.checkedAt?.startsWith(today)
        )
    }

    // Stats
    const stats = {
        total: checkpoints.length,
        checked: checkpoints.filter(c => getTodayLog(c.id)).length,
        pending: checkpoints.filter(c => !getTodayLog(c.id)).length,
    }

    const handleScanResult = async (result: string) => {
        setScanning(false)
        setSubmitting(true)

        // Find checkpoint by QR code or id
        const checkpoint = checkpoints.find(c =>
            c.qrCode === result ||
            c.id === result ||
            c.name.toLowerCase().includes(result.toLowerCase())
        )

        if (checkpoint) {
            try {
                const res = await fetch('/api/patrol/log', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ checkpointId: checkpoint.id }),
                })

                const data = await res.json()

                if (data.success) {
                    // Add new log to state
                    setPatrolLogs(prev => [data.data, ...prev])
                    toast.success('บันทึกการตรวจสำเร็จ', {
                        description: `${checkpoint.name} - ${currentTime.toLocaleTimeString('th-TH')}`,
                    })
                } else {
                    toast.error('ไม่สามารถบันทึกได้', {
                        description: data.error || 'กรุณาลองใหม่',
                    })
                }
            } catch {
                toast.error('เกิดข้อผิดพลาด', {
                    description: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
                })
            }
        } else {
            toast.error('ไม่พบจุดตรวจ', {
                description: 'QR Code ไม่ถูกต้อง',
            })
        }

        setSubmitting(false)
    }

    const getStatusBadge = (checkpointId: string) => {
        const log = getTodayLog(checkpointId)
        if (log) {
            return (
                <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    ตรวจแล้ว
                </Badge>
            )
        }
        return (
            <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                รอตรวจ
            </Badge>
        )
    }

    const getLastCheckedTime = (checkpointId: string) => {
        const log = getTodayLog(checkpointId)
        if (log?.checkedAt) {
            return new Date(log.checkedAt).toLocaleTimeString('th-TH')
        }
        return null
    }

    if (loading) {
        return (
            <div className="container mx-auto py-6 px-4 max-w-2xl flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 px-4 max-w-2xl">
            <h1 className="text-2xl font-bold mb-2">ตรวจจุด</h1>
            <p className="text-muted-foreground mb-6">
                {currentTime.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <Card className="bg-blue-50 dark:bg-blue-950">
                    <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                        <p className="text-xs text-muted-foreground">ทั้งหมด</p>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 dark:bg-green-950">
                    <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.checked}</p>
                        <p className="text-xs text-muted-foreground">ตรวจแล้ว</p>
                    </CardContent>
                </Card>
                <Card className="bg-yellow-50 dark:bg-yellow-950">
                    <CardContent className="p-3 text-center">
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        <p className="text-xs text-muted-foreground">รอตรวจ</p>
                    </CardContent>
                </Card>
            </div>

            {/* Scan Button */}
            <Button
                onClick={() => setScanning(true)}
                className="w-full mb-6 h-14 text-lg"
                disabled={submitting}
            >
                {submitting ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                    <>
                        <QrCode className="h-6 w-6 mr-2" />
                        สแกน QR จุดตรวจ
                    </>
                )}
            </Button>

            {/* QR Scanner Modal */}
            {scanning && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>สแกน QR Code</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <QRScanner
                                onScan={handleScanResult}
                                onError={(error: unknown) => {
                                    console.error(error)
                                    toast.error('เกิดข้อผิดพลาด', {
                                        description: 'ไม่สามารถเปิดกล้องได้',
                                    })
                                }}
                            />
                            <Button
                                variant="outline"
                                className="w-full mt-4"
                                onClick={() => setScanning(false)}
                            >
                                ยกเลิก
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Checkpoints List */}
            <Card>
                <CardHeader>
                    <CardTitle>จุดตรวจทั้งหมด ({stats.total})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {checkpoints.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>ยังไม่มีจุดตรวจ</p>
                            <p className="text-sm">กรุณาติดต่อ Admin เพื่อเพิ่มจุดตรวจ</p>
                        </div>
                    ) : (
                        checkpoints.map((checkpoint) => {
                            const lastChecked = getLastCheckedTime(checkpoint.id)
                            return (
                                <div
                                    key={checkpoint.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">{checkpoint.name}</p>
                                        {checkpoint.location && (
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {checkpoint.location}
                                            </p>
                                        )}
                                        {lastChecked && (
                                            <p className="text-xs text-green-600 mt-1">
                                                ตรวจเมื่อ {lastChecked}
                                            </p>
                                        )}
                                    </div>
                                    {getStatusBadge(checkpoint.id)}
                                </div>
                            )
                        })
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

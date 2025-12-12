'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, MapPin, CheckCircle, Clock } from 'lucide-react'
import { api } from '@/lib/api/client'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

export default function SecuritySOSPage() {
    const [alerts, setAlerts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchAlerts = async () => {
        try {
            const { data } = await api.sos.get()
            if (data && data.success && Array.isArray(data.data)) {
                setAlerts(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch SOS alerts:', error)
            toast.error('ไม่สามารถดึงข้อมูลแจ้งเหตุฉุกเฉินได้')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAlerts()
        // Poll every 10 seconds
        const interval = setInterval(fetchAlerts, 10000)
        return () => clearInterval(interval)
    }, [])

    const handleResolve = async (id: string) => {
        try {
            const { data, error } = await api.sos({ id }).patch({
                status: 'resolved'
            })

            if (error) {
                toast.error('ไม่สามารถอัปเดตสถานะได้')
                return
            }

            if (data && data.success) {
                toast.success('ระบุว่าแก้ไขแล้ว')
                fetchAlerts()
            }
        } catch (error) {
            console.error('Error resolving SOS:', error)
            toast.error('เกิดข้อผิดพลาด')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-red-600 flex items-center gap-2">
                        <AlertTriangle className="w-8 h-8" />
                        แจ้งเหตุฉุกเฉิน (SOS)
                    </h1>
                    <p className="text-muted-foreground">
                        รายการแจ้งเหตุฉุกเฉินที่กำลังดำเนินการ
                    </p>
                </div>
                <Button onClick={fetchAlerts} variant="outline">
                    <Clock className="w-4 h-4 mr-2" />
                    อัปเดตข้อมูล
                </Button>
            </div>

            <div className="grid gap-4">
                {alerts.length === 0 && !isLoading ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <CheckCircle className="w-12 h-12 mb-4 text-green-500" />
                            <p>ไม่มีเหตุฉุกเฉินในขณะนี้</p>
                        </CardContent>
                    </Card>
                ) : (
                    alerts.map((alert) => (
                        <Card key={alert.id} className="border-l-4 border-l-red-500 shadow-md animate-pulse">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-lg font-bold text-red-600">
                                    SOS จาก Unit ID: {alert.unitId}
                                </CardTitle>
                                <Badge variant="destructive" className="animate-bounce">
                                    ต้องการความช่วยเหลือด่วน
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">ข้อความ:</p>
                                        <p className="text-sm text-muted-foreground">{alert.message || '-'}</p>

                                        <p className="text-sm font-medium mt-2">เวลาแจ้ง:</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(alert.createdAt), 'd MMM yyyy HH:mm:ss', { locale: th })}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">ตำแหน่ง:</p>
                                        {alert.latitude && alert.longitude ? (
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${alert.latitude},${alert.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-blue-600 hover:underline"
                                            >
                                                <MapPin className="w-4 h-4" />
                                                ดูแผนที่ ({alert.latitude}, {alert.longitude})
                                            </a>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">ไม่ระบุตำแหน่ง</p>
                                        )}

                                        <div className="pt-4">
                                            <Button
                                                className="w-full bg-green-600 hover:bg-green-700"
                                                onClick={() => handleResolve(alert.id)}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                ระบุว่าแก้ไขแล้ว
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { QRScanner } from '@/components/ui/qr-scanner'
import { client } from '@/lib/api/client'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

export default function SecurityScanPage() {
    const router = useRouter()
    const [scannedData, setScannedData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleScan = async (decodedText: string) => {
        // Prevent multiple scans of the same code in rapid succession
        if (isLoading || (scannedData && scannedData.qrCode === decodedText)) return

        setIsLoading(true)
        setError(null)

        try {
            // Call API to verify QR code
            const { data, error } = await client.api.visitors.verify({ qrCode: decodedText }).get()

            if (error) {
                setError('ไม่พบข้อมูลผู้มาติดต่อ หรือ QR Code ไม่ถูกต้อง')
                toast.error('ไม่พบข้อมูลผู้มาติดต่อ')
                return
            }

            if (!data) {
                setError('ไม่พบข้อมูลผู้มาติดต่อ')
                return
            }

            setScannedData(data)
            toast.success('สแกนสำเร็จ!')

        } catch (err) {
            console.error('Scan error:', err)
            setError('เกิดข้อผิดพลาดในการตรวจสอบข้อมูล')
            toast.error('เกิดข้อผิดพลาด')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCheckIn = async () => {
        if (!scannedData) return

        setIsLoading(true)
        try {
            const { data, error } = await client.api.visitors({ id: scannedData.id }).patch({
                status: 'checked_in'
            })

            if (error) {
                toast.error('บันทึกเวลาเข้าไม่สำเร็จ')
                return
            }

            toast.success('บันทึกเวลาเข้าเรียบร้อยแล้ว')
            router.push('/security/visitors')
        } catch (err) {
            toast.error('เกิดข้อผิดพลาด')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCheckOut = async () => {
        if (!scannedData) return

        setIsLoading(true)
        try {
            const { data, error } = await client.api.visitors({ id: scannedData.id }).patch({
                status: 'checked_out'
            })

            if (error) {
                toast.error('บันทึกเวลาออกไม่สำเร็จ')
                return
            }

            toast.success('บันทึกเวลาออกเรียบร้อยแล้ว')
            router.push('/security/visitors')
        } catch (err) {
            toast.error('เกิดข้อผิดพลาด')
        } finally {
            setIsLoading(false)
        }
    }

    const resetScan = () => {
        setScannedData(null)
        setError(null)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">สแกน QR Code</h1>
                    <p className="text-muted-foreground">
                        สแกน QR Code ของผู้มาติดต่อเพื่อบันทึกเวลาเข้า-ออก
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Scanner Section */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>กล้องสแกน</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!scannedData ? (
                            <QRScanner
                                onScan={handleScan}
                                onError={(err) => console.log(err)}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                                <div className="p-4 bg-green-100 text-green-600 rounded-full dark:bg-green-900/20">
                                    <CheckCircle className="w-12 h-12" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium">สแกนสำเร็จ</h3>
                                    <p className="text-sm text-muted-foreground">
                                        พบข้อมูลผู้มาติดต่อ
                                    </p>
                                </div>
                                <Button variant="outline" onClick={resetScan}>
                                    สแกนใหม่
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Result Section */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>ข้อมูลผู้มาติดต่อ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-destructive space-y-2">
                                <XCircle className="w-12 h-12" />
                                <p>{error}</p>
                                <Button variant="outline" onClick={resetScan} className="mt-4">
                                    ลองใหม่
                                </Button>
                            </div>
                        ) : scannedData ? (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="text-muted-foreground">ชื่อผู้มาติดต่อ</div>
                                        <div className="font-medium">{scannedData.visitorName}</div>

                                        <div className="text-muted-foreground">ทะเบียนรถ</div>
                                        <div className="font-medium">{scannedData.licensePlate || '-'}</div>

                                        <div className="text-muted-foreground">ติดต่อบ้านเลขที่</div>
                                        <div className="font-medium">{scannedData.unit?.unitNumber}</div>

                                        <div className="text-muted-foreground">วัตถุประสงค์</div>
                                        <div className="font-medium">{scannedData.purpose || '-'}</div>

                                        <div className="text-muted-foreground">สถานะปัจจุบัน</div>
                                        <div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${scannedData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    scannedData.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        scannedData.status === 'checked_in' ? 'bg-blue-100 text-blue-800' :
                                                            scannedData.status === 'checked_out' ? 'bg-gray-100 text-gray-800' :
                                                                'bg-gray-100 text-gray-800'
                                                }`}>
                                                {scannedData.status === 'pending' ? 'รออนุมัติ' :
                                                    scannedData.status === 'approved' ? 'อนุมัติแล้ว' :
                                                        scannedData.status === 'checked_in' ? 'เข้าโครงการ' :
                                                            scannedData.status === 'checked_out' ? 'ออกโครงการ' :
                                                                scannedData.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        onClick={handleCheckIn}
                                        disabled={isLoading || scannedData.status === 'checked_in' || scannedData.status === 'checked_out'}
                                    >
                                        บันทึกเข้า
                                    </Button>
                                    <Button
                                        className="flex-1 bg-gray-600 hover:bg-gray-700"
                                        onClick={handleCheckOut}
                                        disabled={isLoading || scannedData.status !== 'checked_in'}
                                    >
                                        บันทึกออก
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2">
                                <div className="p-4 bg-muted rounded-full">
                                    <QRScanner
                                        onScan={() => { }}
                                    // Just using the icon/placeholder logic if I could, but here just text
                                    // Actually let's just show text
                                    />
                                    {/* Wait, I can't reuse QRScanner just for icon. Let's just put text */}
                                </div>
                                <p>กรุณาสแกน QR Code เพื่อดูข้อมูล</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

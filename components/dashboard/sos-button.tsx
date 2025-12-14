'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api/client'
import { useSession } from 'next-auth/react'

export function SOSButton() {
    const { data: session } = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSOS = async () => {
        setIsLoading(true)
        try {
            // Get location
            let latitude = ''
            let longitude = ''

            if (navigator.geolocation) {
                try {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy: true,
                            timeout: 5000,
                            maximumAge: 0
                        })
                    })
                    latitude = position.coords.latitude.toString()
                    longitude = position.coords.longitude.toString()
                } catch (error) {
                    console.error('Error getting location:', error)
                    toast.warning('ไม่สามารถระบุตำแหน่งได้ แต่กำลังส่งสัญญาณขอความช่วยเหลือ')
                }
            }

            // Send SOS
            const { data, error } = await api.sos.post({
                unitId: (session?.user as { unitId?: string })?.unitId || '', // Assuming unitId is in session or we fetch it
                latitude,
                longitude,
                message: 'ต้องการความช่วยเหลือด่วน'
            })

            if (error) {
                toast.error('เกิดข้อผิดพลาดในการส่งสัญญาณ')
                return
            }

            if (data && data.success) {
                toast.success('ส่งสัญญาณขอความช่วยเหลือแล้ว เจ้าหน้าที่กำลังเดินทางไป')
                setIsOpen(false)
            }

        } catch (error) {
            console.error('SOS Error:', error)
            toast.error('เกิดข้อผิดพลาด')
        } finally {
            setIsLoading(false)
        }
    }

    // Only show for residents
    if (session?.user?.role !== 'resident') return null

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="lg"
                    className="fixed bottom-6 right-6 z-50 rounded-full w-16 h-16 shadow-lg shadow-red-500/50 hover:scale-110 transition-transform duration-200 animate-pulse"
                >
                    <AlertTriangle className="w-8 h-8" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2 text-xl">
                        <AlertTriangle className="w-6 h-6" />
                        ยืนยันการแจ้งเหตุฉุกเฉิน
                    </DialogTitle>
                    <DialogDescription className="text-base pt-2">
                        คุณกำลังจะส่งสัญญาณขอความช่วยเหลือฉุกเฉิน (SOS) ไปยังเจ้าหน้าที่รักษาความปลอดภัยและนิติบุคคล
                        <br /><br />
                        <strong>ตำแหน่งของคุณจะถูกส่งไปด้วยเพื่อให้เจ้าหน้าที่เข้าช่วยเหลือได้ทันที</strong>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSOS}
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                กำลังส่งสัญญาณ...
                            </>
                        ) : (
                            'ยืนยันแจ้งเหตุ'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

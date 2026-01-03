'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, Settings, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
    useProjectFeatures,
    useUpdateProjectFeatures,
    FEATURE_KEYS,
    FEATURE_LABELS,
    FEATURE_ICONS,
    type ProjectFeaturesMap,
} from '@/lib/features'

export default function FeatureSettingsPage() {
    const { data: features, isLoading } = useProjectFeatures()
    const updateFeatures = useUpdateProjectFeatures()

    const [localFeatures, setLocalFeatures] = useState<Partial<ProjectFeaturesMap>>({})
    const [hasChanges, setHasChanges] = useState(false)

    const handleToggle = (key: typeof FEATURE_KEYS[number], enabled: boolean) => {
        setLocalFeatures(prev => ({ ...prev, [key]: enabled }))
        setHasChanges(true)
    }

    const handleSave = async () => {
        try {
            await updateFeatures.mutateAsync({ features: localFeatures })
            toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว')
            setHasChanges(false)
            setLocalFeatures({})
        } catch {
            toast.error('เกิดข้อผิดพลาดในการบันทึก')
        }
    }

    const handleReset = () => {
        setLocalFeatures({})
        setHasChanges(false)
    }

    const getFeatureState = (key: typeof FEATURE_KEYS[number]): boolean => {
        if (key in localFeatures) {
            return localFeatures[key] ?? true
        }
        return features?.[key] ?? true
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                            <Settings className="w-5 h-5 text-white" />
                        </div>
                        ตั้งค่าฟีเจอร์
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        เปิด/ปิดฟีเจอร์ต่างๆ สำหรับโปรเจคนี้
                    </p>
                </div>

                {hasChanges && (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleReset}>
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={updateFeatures.isPending}
                            className="bg-gradient-to-r from-violet-500 to-purple-500"
                        >
                            {updateFeatures.isPending && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            บันทึก
                        </Button>
                    </div>
                )}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {FEATURE_KEYS.map((key) => {
                    const isEnabled = getFeatureState(key)
                    const label = FEATURE_LABELS[key]
                    const icon = FEATURE_ICONS[key]

                    return (
                        <Card
                            key={key}
                            className={`transition-all duration-200 ${isEnabled
                                    ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20'
                                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 opacity-75'
                                }`}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{icon}</span>
                                        <div>
                                            <CardTitle className="text-base">{label}</CardTitle>
                                            <CardDescription className="text-xs">
                                                {isEnabled ? (
                                                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                        <CheckCircle className="w-3 h-3" />
                                                        เปิดใช้งาน
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-slate-500">
                                                        <XCircle className="w-3 h-3" />
                                                        ปิดใช้งาน
                                                    </span>
                                                )}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={isEnabled}
                                        onCheckedChange={(checked) => handleToggle(key, checked)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {getFeatureDescription(key)}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Info */}
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <CardHeader>
                    <CardTitle className="text-blue-900 dark:text-blue-100 text-base">
                        💡 หมายเหตุ
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• การปิดฟีเจอร์จะซ่อนเมนูและหน้าที่เกี่ยวข้องจากผู้ใช้ทุกคน</li>
                        <li>• ข้อมูลเดิมจะยังคงอยู่ในฐานข้อมูล สามารถเปิดใช้งานใหม่ได้ทุกเมื่อ</li>
                        <li>• ผู้ใช้ที่กำลังใช้งานฟีเจอร์อยู่จะไม่สามารถเข้าถึงได้หลังจากปิด</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}

function getFeatureDescription(key: string): string {
    const descriptions: Record<string, string> = {
        maintenance: 'ให้ลูกบ้านแจ้งซ่อมและติดตามสถานะการซ่อมได้',
        facilities: 'จองห้องประชุม สระว่ายน้ำ ฟิตเนส ฯลฯ',
        parcels: 'บันทึกพัสดุที่มาถึงและแจ้งเตือนลูกบ้าน',
        transport: 'ให้ลูกบ้านเรียกแท็กซี่หรือมอเตอร์ไซค์',
        sos: 'ปุ่มแจ้งเหตุฉุกเฉินพร้อมส่งพิกัด GPS',
        visitors: 'ลงทะเบียนผู้มาติดต่อและสร้าง QR Code',
        support: 'ส่ง Ticket สอบถามหรือร้องเรียนนิติบุคคล',
    }
    return descriptions[key] || ''
}

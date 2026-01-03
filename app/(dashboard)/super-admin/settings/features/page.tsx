'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Settings, CheckCircle, XCircle, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import {
    FEATURE_KEYS,
    FEATURE_LABELS,
    FEATURE_ICONS,
    type FeatureKey,
} from '@/lib/features'

// Types
interface Project {
    id: string
    name: string
}

type ProjectFeaturesMap = Record<FeatureKey, boolean>

export default function SuperAdminFeaturesPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [selectedProjectId, setSelectedProjectId] = useState<string>('')
    const [features, setFeatures] = useState<ProjectFeaturesMap | null>(null)
    const [localFeatures, setLocalFeatures] = useState<Partial<ProjectFeaturesMap>>({})
    const [hasChanges, setHasChanges] = useState(false)
    const [isLoadingProjects, setIsLoadingProjects] = useState(true)
    const [isLoadingFeatures, setIsLoadingFeatures] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Fetch all projects
    useEffect(() => {
        async function fetchProjects() {
            try {
                const res = await fetch('/api/projects')
                const data = await res.json()
                if (data.success) {
                    setProjects(data.data || [])
                    if (data.data?.length > 0) {
                        setSelectedProjectId(data.data[0].id)
                    }
                }
            } catch (error) {
                console.error('Failed to fetch projects', error)
                toast.error('ไม่สามารถโหลดข้อมูลโปรเจกต์ได้')
            } finally {
                setIsLoadingProjects(false)
            }
        }
        fetchProjects()
    }, [])

    // Fetch features when project changes
    useEffect(() => {
        if (!selectedProjectId) return

        async function fetchFeatures() {
            setIsLoadingFeatures(true)
            try {
                const res = await fetch(`/api/projects/${selectedProjectId}/features`)
                const data = await res.json()
                setFeatures(data)
                setLocalFeatures({})
                setHasChanges(false)
            } catch (error) {
                console.error('Failed to fetch features', error)
                toast.error('ไม่สามารถโหลดข้อมูลฟีเจอร์ได้')
            } finally {
                setIsLoadingFeatures(false)
            }
        }
        fetchFeatures()
    }, [selectedProjectId])

    const handleToggle = (key: FeatureKey, enabled: boolean) => {
        setLocalFeatures(prev => ({ ...prev, [key]: enabled }))
        setHasChanges(true)
    }

    const handleSave = async () => {
        if (!selectedProjectId) return

        setIsSaving(true)
        try {
            const res = await fetch(`/api/projects/${selectedProjectId}/features`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ features: localFeatures }),
            })
            const data = await res.json()

            if (data.success) {
                toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว')
                setFeatures(data.data)
                setLocalFeatures({})
                setHasChanges(false)
            } else {
                toast.error(data.error || 'เกิดข้อผิดพลาดในการบันทึก')
            }
        } catch {
            toast.error('เกิดข้อผิดพลาดในการบันทึก')
        } finally {
            setIsSaving(false)
        }
    }

    const handleReset = () => {
        setLocalFeatures({})
        setHasChanges(false)
    }

    const getFeatureState = (key: FeatureKey): boolean => {
        if (key in localFeatures) {
            return localFeatures[key] ?? true
        }
        return features?.[key] ?? true
    }

    if (isLoadingProjects) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                            <Settings className="w-5 h-5 text-white" />
                        </div>
                        ตั้งค่าฟีเจอร์โปรเจกต์
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        เปิด/ปิดฟีเจอร์สำหรับแต่ละโปรเจกต์
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="เลือกโปรเจกต์" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((project) => (
                                    <SelectItem key={project.id} value={project.id}>
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {hasChanges && (
                        <>
                            <Button variant="outline" onClick={handleReset}>
                                ยกเลิก
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-gradient-to-r from-emerald-500 to-teal-500"
                            >
                                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                บันทึก
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Features Grid */}
            {isLoadingFeatures ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
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
            )}

            {/* Info */}
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <CardHeader>
                    <CardTitle className="text-blue-900 dark:text-blue-100 text-base">
                        💡 หมายเหตุ
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• การปิดฟีเจอร์จะซ่อนเมนูและหน้าที่เกี่ยวข้องจากผู้ใช้ทุกคนในโปรเจกต์นั้น</li>
                        <li>• ข้อมูลเดิมจะยังคงอยู่ในฐานข้อมูล สามารถเปิดใช้งานใหม่ได้ทุกเมื่อ</li>
                        <li>• การเปลี่ยนแปลงจะมีผลทันทีหลังบันทึก</li>
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

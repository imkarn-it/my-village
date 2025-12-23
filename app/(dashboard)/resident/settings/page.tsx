"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Bell, Shield, Mail, Volume2, Loader2, Check } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

type NotificationPreferences = {
    parcelNotifications: boolean
    billNotifications: boolean
    announcementNotifications: boolean
    maintenanceNotifications: boolean
    visitorNotifications: boolean
    emailNotifications: boolean
    soundEnabled: boolean
    showPhone: boolean
}

const defaultPreferences: NotificationPreferences = {
    parcelNotifications: true,
    billNotifications: true,
    announcementNotifications: true,
    maintenanceNotifications: true,
    visitorNotifications: true,
    emailNotifications: true,
    soundEnabled: true,
    showPhone: true,
}

export default function ResidentSettingsPage(): React.JSX.Element {
    const { data: session } = useSession()
    const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [initialPreferences, setInitialPreferences] = useState<NotificationPreferences>(defaultPreferences)

    useEffect(() => {
        // Load preferences from localStorage (in production, fetch from API)
        const saved = localStorage.getItem('notificationPreferences')
        if (saved) {
            const parsed = JSON.parse(saved)
            setPreferences(parsed)
            setInitialPreferences(parsed)
        }
        setIsLoading(false)
    }, [])

    useEffect(() => {
        // Check if preferences changed
        setHasChanges(JSON.stringify(preferences) !== JSON.stringify(initialPreferences))
    }, [preferences, initialPreferences])

    function handleToggle(key: keyof NotificationPreferences) {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    async function handleSave() {
        setIsSaving(true)
        try {
            // Save to localStorage (in production, save to API)
            localStorage.setItem('notificationPreferences', JSON.stringify(preferences))
            setInitialPreferences(preferences)
            setHasChanges(false)
            toast.success("บันทึกการตั้งค่าเรียบร้อย")
        } catch {
            toast.error("เกิดข้อผิดพลาดในการบันทึก")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ตั้งค่า</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        จัดการการตั้งค่าการใช้งานของคุณ
                    </p>
                </div>
                {hasChanges && (
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                กำลังบันทึก...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                บันทึกการตั้งค่า
                            </>
                        )}
                    </Button>
                )}
            </div>

            <div className="grid gap-6">
                {/* Notifications */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-blue-500" />
                            <CardTitle>การแจ้งเตือน</CardTitle>
                        </div>
                        <CardDescription>จัดการการแจ้งเตือนต่างๆ</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>แจ้งเตือนพัสดุ</Label>
                                <p className="text-sm text-slate-500">รับการแจ้งเตือนเมื่อมีพัสดุมาถึง</p>
                            </div>
                            <Switch
                                checked={preferences.parcelNotifications}
                                onCheckedChange={() => handleToggle('parcelNotifications')}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>แจ้งเตือนบิลค่าน้ำ/ค่าส่วนกลาง</Label>
                                <p className="text-sm text-slate-500">รับการแจ้งเตือนเมื่อมีบิลใหม่</p>
                            </div>
                            <Switch
                                checked={preferences.billNotifications}
                                onCheckedChange={() => handleToggle('billNotifications')}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>ข่าวสารประชาสัมพันธ์</Label>
                                <p className="text-sm text-slate-500">รับข่าวสารจากนิติบุคคล</p>
                            </div>
                            <Switch
                                checked={preferences.announcementNotifications}
                                onCheckedChange={() => handleToggle('announcementNotifications')}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>แจ้งเตือนการแจ้งซ่อม</Label>
                                <p className="text-sm text-slate-500">รับการอัพเดทสถานะการแจ้งซ่อม</p>
                            </div>
                            <Switch
                                checked={preferences.maintenanceNotifications}
                                onCheckedChange={() => handleToggle('maintenanceNotifications')}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>แจ้งเตือนผู้มาติดต่อ</Label>
                                <p className="text-sm text-slate-500">รับการแจ้งเตือนเมื่อมีผู้มาติดต่อ</p>
                            </div>
                            <Switch
                                checked={preferences.visitorNotifications}
                                onCheckedChange={() => handleToggle('visitorNotifications')}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Email & Sound */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-purple-500" />
                            <CardTitle>อีเมลและเสียง</CardTitle>
                        </div>
                        <CardDescription>จัดการการแจ้งเตือนทางอีเมลและเสียง</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>รับการแจ้งเตือนทางอีเมล</Label>
                                <p className="text-sm text-slate-500">ส่งการแจ้งเตือนไปยังอีเมล {session?.user?.email}</p>
                            </div>
                            <Switch
                                checked={preferences.emailNotifications}
                                onCheckedChange={() => handleToggle('emailNotifications')}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5 flex items-center gap-2">
                                <Volume2 className="w-4 h-4 text-slate-500" />
                                <div>
                                    <Label>เปิดเสียงแจ้งเตือน</Label>
                                    <p className="text-sm text-slate-500">เล่นเสียงเมื่อมีการแจ้งเตือนใหม่</p>
                                </div>
                            </div>
                            <Switch
                                checked={preferences.soundEnabled}
                                onCheckedChange={() => handleToggle('soundEnabled')}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy & Security */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-500" />
                            <CardTitle>ความเป็นส่วนตัวและความปลอดภัย</CardTitle>
                        </div>
                        <CardDescription>จัดการข้อมูลส่วนตัวและความปลอดภัย</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>แสดงเบอร์โทรศัพท์</Label>
                                <p className="text-sm text-slate-500">อนุญาตให้นิติบุคคลเห็นเบอร์โทรศัพท์</p>
                            </div>
                            <Switch
                                checked={preferences.showPhone}
                                onCheckedChange={() => handleToggle('showPhone')}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Floating Save Button (Mobile) */}
            {hasChanges && (
                <div className="fixed bottom-20 left-0 right-0 p-4 md:hidden">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                กำลังบันทึก...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                บันทึกการตั้งค่า
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    )
}

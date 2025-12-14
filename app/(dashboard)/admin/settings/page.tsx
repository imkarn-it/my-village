import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Bell, Database } from "lucide-react"

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ตั้งค่าระบบ</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                    จัดการการตั้งค่าของระบบและผู้ดูแล
                </p>
            </div>

            <div className="grid gap-6">
                {/* System Notifications */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-purple-500" />
                            <CardTitle>การแจ้งเตือนระบบ</CardTitle>
                        </div>
                        <CardDescription>จัดการการแจ้งเตือนสำหรับผู้ดูแลระบบ</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>แจ้งเตือนการแจ้งซ่อมใหม่</Label>
                                <p className="text-sm text-slate-500">รับการแจ้งเตือนเมื่อลูกบ้านแจ้งซ่อม</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>แจ้งเตือนการชำระเงิน</Label>
                                <p className="text-sm text-slate-500">รับการแจ้งเตือนเมื่อมีการชำระเงินเข้ามา</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                {/* System Maintenance */}
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-blue-500" />
                            <CardTitle>การดูแลรักษาระบบ</CardTitle>
                        </div>
                        <CardDescription>ตั้งค่าการสำรองข้อมูลและบำรุงรักษา</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>สำรองข้อมูลอัตโนมัติ</Label>
                                <p className="text-sm text-slate-500">สำรองข้อมูลทุกวันเวลา 00:00 น.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>โหมดปิดปรับปรุง</Label>
                                <p className="text-sm text-slate-500">ปิดการใช้งานระบบชั่วคราวสำหรับลูกบ้าน</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

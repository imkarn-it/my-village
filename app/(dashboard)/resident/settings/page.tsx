import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Bell, Moon, Shield } from "lucide-react"

export default function ResidentSettingsPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ตั้งค่า</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                    จัดการการตั้งค่าการใช้งานของคุณ
                </p>
            </div>

            <div className="grid gap-6">
                {/* Notifications */}
                <Card>
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
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>แจ้งเตือนบิลค่าน้ำ/ค่าส่วนกลาง</Label>
                                <p className="text-sm text-slate-500">รับการแจ้งเตือนเมื่อมีบิลใหม่</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>ข่าวสารประชาสัมพันธ์</Label>
                                <p className="text-sm text-slate-500">รับข่าวสารจากนิติบุคคล</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy & Security */}
                <Card>
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
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

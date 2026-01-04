import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MapPin, Phone, User, CheckCircle2, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { sosAlerts, users, units } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

export default async function SecurityAlertsPage(): Promise<React.JSX.Element> {
    const alerts = await db.select({
        alert: sosAlerts,
        user: users,
        unit: units,
    })
        .from(sosAlerts)
        .leftJoin(users, eq(sosAlerts.userId, users.id))
        .leftJoin(units, eq(users.unitId, units.id))
        .orderBy(desc(sosAlerts.createdAt));

    return (
        <div className="space-y-8">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    แจ้งเหตุฉุกเฉิน (SOS Alerts)
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                    รายการแจ้งเตือนเหตุฉุกเฉินทั้งหมด
                </p>
            </div>

            <div className="grid gap-4">
                {alerts.length > 0 ? (
                    alerts.map(({ alert, user, unit }: typeof alerts[number]) => (
                        <Card key={alert.id} className={`border-l-4 ${alert.status === 'active' ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10' : 'border-l-slate-200 dark:border-l-slate-700'}`}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={alert.status === 'active' ? "destructive" : "secondary"}>
                                                {alert.status === 'active' ? 'กำลังดำเนินการ' : 'แก้ไขแล้ว'}
                                            </Badge>
                                            <span className="text-sm text-slate-500">
                                                {alert.createdAt ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: th }) : ''}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            <AlertTriangle className={`w-5 h-5 ${alert.status === 'active' ? 'text-red-500' : 'text-slate-400'}`} />
                                            ขอความช่วยเหลือ
                                        </h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                {user?.name || 'ไม่ระบุชื่อ'}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                ห้อง {unit?.unitNumber || 'ไม่ระบุ'}
                                            </div>
                                            {user?.phone && (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="w-4 h-4" />
                                                    {user.phone}
                                                </div>
                                            )}
                                        </div>
                                        {alert.message && (
                                            <p className="text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-black/20 p-3 rounded-lg mt-2">
                                                &quot;{alert.message}&quot;
                                            </p>
                                        )}
                                    </div>

                                    {alert.status === 'active' && (
                                        <div className="flex items-center gap-2">
                                            <Button className="bg-red-500 hover:bg-red-600 text-white w-full md:w-auto">
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                รับเรื่อง/เข้าตรวจสอบ
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">เหตุการณ์ปกติ</h3>
                        <p className="text-slate-500">ไม่มีการแจ้งเตือนเหตุฉุกเฉินในขณะนี้</p>
                    </div>
                )}
            </div>
        </div>
    );
}

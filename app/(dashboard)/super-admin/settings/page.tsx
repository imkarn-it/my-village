"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Settings,
    Mail,
    Shield,
    Bell,
    Palette,
    Database,
    Globe,
    Clock,
    Download,
    Upload,
    Users,
    CreditCard,
    Smartphone,
    FileText,
    CheckCircle,
    AlertTriangle,
    Info,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";

type SystemSettings = {
    general: {
        siteName: string;
        siteDescription: string;
        defaultLanguage: string;
        timezone: string;
        dateFormat: string;
        currency: string;
    };
    email: {
        smtpHost: string;
        smtpPort: number;
        smtpSecure: boolean;
        smtpUser: string;
        smtpPassword: string;
        fromEmail: string;
        fromName: string;
    };
    security: {
        sessionTimeout: number; // minutes
        passwordMinLength: number;
        passwordRequireSpecialChars: boolean;
        twoFactorAuthEnabled: boolean;
        maxLoginAttempts: number;
        lockoutDuration: number; // minutes
    };
    notifications: {
        emailNotifications: boolean;
        pushNotifications: boolean;
        smsNotifications: boolean;
        autoReminderEnabled: boolean;
        reminderDays: number;
    };
    backup: {
        autoBackupEnabled: boolean;
        backupFrequency: string;
        retentionDays: number;
        backupLocation: string;
        lastBackup: string;
    };
    maintenance: {
        maintenanceMode: boolean;
        maintenanceMessage: string;
        scheduledMaintenance: string;
    };
    limits: {
        maxUsersPerProject: number;
        maxResidentsPerUnit: number;
        maxStoragePerProject: number; // MB
    };
};

const mockSettings: SystemSettings = {
    general: {
        siteName: "My Village",
        siteDescription: "ระบบจัดการหมู่บ้านและคอนโดมิเนียมแบบครบวงจร",
        defaultLanguage: "th",
        timezone: "Asia/Bangkok",
        dateFormat: "dd/MM/yyyy",
        currency: "THB",
    },
    email: {
        smtpHost: "smtp.gmail.com",
        smtpPort: 587,
        smtpSecure: false,
        smtpUser: "noreply@myvillage.com",
        smtpPassword: "••••••••",
        fromEmail: "noreply@myvillage.com",
        fromName: "My Village System",
    },
    security: {
        sessionTimeout: 480,
        passwordMinLength: 8,
        passwordRequireSpecialChars: true,
        twoFactorAuthEnabled: false,
        maxLoginAttempts: 5,
        lockoutDuration: 15,
    },
    notifications: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        autoReminderEnabled: true,
        reminderDays: 3,
    },
    backup: {
        autoBackupEnabled: true,
        backupFrequency: "daily",
        retentionDays: 30,
        backupLocation: "cloud",
        lastBackup: "2025-12-13 02:00:00",
    },
    maintenance: {
        maintenanceMode: false,
        maintenanceMessage: "ระบบกำลังปรับปรุงชั่วคราว กรุณากลับมาใหม่ในภายหลัง",
        scheduledMaintenance: "",
    },
    limits: {
        maxUsersPerProject: 1000,
        maxResidentsPerUnit: 10,
        maxStoragePerProject: 10240, // 10GB
    },
};

export default function SuperAdminSettings() {
    const [settings, setSettings] = useState<SystemSettings>(mockSettings);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            // TODO: Implement settings API when available
            // For now, use mock data
            await new Promise(resolve => setTimeout(resolve, 300));
            setSettings(mockSettings);
        } catch (error) {
            // Fallback to mock data
            setSettings(mockSettings);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (section: keyof SystemSettings) => {
        setSaving(true);
        try {
            // TODO: Implement settings save API when available
            // Mock implementation
            console.log("Saving settings section:", section, settings[section]);
            await new Promise(resolve => setTimeout(resolve, 500));
            toast.success(`บันทึกการตั้งค่า ${section} เรียบร้อยแล้ว`);
        } catch (err: unknown) {
            console.error("Error saving settings:", err);
            const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึก";
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleSettingChange = (section: keyof SystemSettings, field: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const handleBackupNow = async () => {
        try {
            toast.info("กำลังสร้างข้อมูลสำรอง...");
            // TODO: Implement backup API when available
            // Mock implementation
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success("สร้างข้อมูลสำรองสำเร็จแล้ว");
            fetchSettings();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "ไม่สามารถสร้างข้อมูลสำรองได้";
            toast.error(errorMessage);
        }
    };

    const handleRestoreBackup = async (file: File) => {
        if (!confirm("การกู้คืนข้อมูลจะทับข้อมูลปัจจุบันทั้งหมด ต้องการดำเนินการต่อหรือไม่?")) {
            return;
        }

        // TODO: Implement restore backup API when available
        // Mock implementation
        console.log("Restoring backup from file:", file.name);
        toast.info("กำลังกู้คืนข้อมูล...");
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success("กู้คืนข้อมูลสำเร็จแล้ว ระบบจะรีสตาร์ทอัตโนมัติ");
    };

    const exportSettings = () => {
        const settingsStr = JSON.stringify(settings, null, 2);
        const blob = new Blob([settingsStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `system-settings-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("ส่งออกการตั้งค่าแล้ว");
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Card key={i}>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                                        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">การตั้งค่าระบบ</h1>
                    <p className="text-slate-600 dark:text-slate-400">จัดการการตั้งค่าและการกำหนดค่าระบบทั้งหมด</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportSettings}>
                        <Download className="w-4 h-4 mr-2" />
                        ส่งออกการตั้งค่า
                    </Button>
                    <Button onClick={() => handleSave(activeTab as keyof SystemSettings)} disabled={saving}>
                        {saving ? (
                            <>
                                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                กำลังบันทึก...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                บันทึกการเปลี่ยนแปลง
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-7 lg:grid-cols-7">
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <span className="hidden sm:inline">ทั่วไป</span>
                    </TabsTrigger>
                    <TabsTrigger value="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="hidden sm:inline">อีเมล</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span className="hidden sm:inline">ความปลอดภัย</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        <span className="hidden sm:inline">การแจ้งเตือน</span>
                    </TabsTrigger>
                    <TabsTrigger value="backup" className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        <span className="hidden sm:inline">ข้อมูลสำรอง</span>
                    </TabsTrigger>
                    <TabsTrigger value="maintenance" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">ซ่อมบำรุง</span>
                    </TabsTrigger>
                    <TabsTrigger value="limits" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline">ขีดจำกัด</span>
                    </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-6">
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                การตั้งค่าทั่วไป
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="siteName">ชื่อระบบ</Label>
                                    <Input
                                        id="siteName"
                                        value={settings.general.siteName}
                                        onChange={(e) => handleSettingChange("general", "siteName", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="siteDescription">คำอธิบายระบบ</Label>
                                    <Input
                                        id="siteDescription"
                                        value={settings.general.siteDescription}
                                        onChange={(e) => handleSettingChange("general", "siteDescription", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="defaultLanguage">ภาษาเริ่มต้น</Label>
                                    <Select
                                        value={settings.general.defaultLanguage}
                                        onValueChange={(value) => handleSettingChange("general", "defaultLanguage", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="th">ไทย</SelectItem>
                                            <SelectItem value="en">English</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="timezone">โซนเวลา</Label>
                                    <Select
                                        value={settings.general.timezone}
                                        onValueChange={(value) => handleSettingChange("general", "timezone", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Asia/Bangkok">Asia/Bangkok (GMT+7)</SelectItem>
                                            <SelectItem value="UTC">UTC</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dateFormat">รูปแบบวันที่</Label>
                                    <Select
                                        value={settings.general.dateFormat}
                                        onValueChange={(value) => handleSettingChange("general", "dateFormat", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                                            <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                                            <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency">สกุลเงิน</Label>
                                    <Select
                                        value={settings.general.currency}
                                        onValueChange={(value) => handleSettingChange("general", "currency", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="THB">THB (บาท)</SelectItem>
                                            <SelectItem value="USD">USD (ดอลลาร์)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Email Settings */}
                <TabsContent value="email" className="space-y-6">
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Mail className="w-5 h-5" />
                                การตั้งค่าอีเมล
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium">คำแนะนำ:</p>
                                        <ul className="list-disc list-inside mt-1 space-y-1">
                                            <li>ใช้ Gmail หรือ Google Workspace แนะนำให้เปิด &quot;App Passwords&quot;</li>
                                            <li>สำหรับ SMTP จำเป็นต้องมี SSL Certificate ที่ถูกต้อง</li>
                                            <li>ทดสอบส่งอีเมลก่อนบันทึกการตั้งค่า</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="smtpHost">SMTP Host</Label>
                                    <Input
                                        id="smtpHost"
                                        placeholder="smtp.gmail.com"
                                        value={settings.email.smtpHost}
                                        onChange={(e) => handleSettingChange("email", "smtpHost", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtpPort">SMTP Port</Label>
                                    <Input
                                        id="smtpPort"
                                        type="number"
                                        value={settings.email.smtpPort}
                                        onChange={(e) => handleSettingChange("email", "smtpPort", parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtpUser">SMTP Username</Label>
                                    <Input
                                        id="smtpUser"
                                        placeholder="noreply@myvillage.com"
                                        value={settings.email.smtpUser}
                                        onChange={(e) => handleSettingChange("email", "smtpUser", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                                    <Input
                                        id="smtpPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={settings.email.smtpPassword}
                                        onChange={(e) => handleSettingChange("email", "smtpPassword", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fromEmail">From Email</Label>
                                    <Input
                                        id="fromEmail"
                                        value={settings.email.fromEmail}
                                        onChange={(e) => handleSettingChange("email", "fromEmail", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fromName">From Name</Label>
                                    <Input
                                        id="fromName"
                                        value={settings.email.fromName}
                                        onChange={(e) => handleSettingChange("email", "fromName", e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-2 flex items-center space-x-2">
                                    <Switch
                                        id="smtpSecure"
                                        checked={settings.email.smtpSecure}
                                        onCheckedChange={(checked) => handleSettingChange("email", "smtpSecure", checked)}
                                    />
                                    <Label htmlFor="smtpSecure">ใช้ SSL/TLS</Label>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Button variant="outline" onClick={() => {
                                    toast.info("กำลังส่งอีเมลทดสอบ...");
                                    // Test email functionality here
                                }}>
                                    <Mail className="w-4 h-4 mr-2" />
                                    ทดสอบส่งอีเมล
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="space-y-6">
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                การตั้งค่าความปลอดภัย
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="sessionTimeout">ระยะเวลาหมดอายุ Session (นาที)</Label>
                                    <Input
                                        id="sessionTimeout"
                                        type="number"
                                        value={settings.security.sessionTimeout}
                                        onChange={(e) => handleSettingChange("security", "sessionTimeout", parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="passwordMinLength">ความยาวรหัสผ่านขั้นต่ำ</Label>
                                    <Input
                                        id="passwordMinLength"
                                        type="number"
                                        min="6"
                                        max="32"
                                        value={settings.security.passwordMinLength}
                                        onChange={(e) => handleSettingChange("security", "passwordMinLength", parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxLoginAttempts">จำนวนครั้งที่ล็อกอินผิดได้</Label>
                                    <Input
                                        id="maxLoginAttempts"
                                        type="number"
                                        min="3"
                                        max="10"
                                        value={settings.security.maxLoginAttempts}
                                        onChange={(e) => handleSettingChange("security", "maxLoginAttempts", parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lockoutDuration">ระยะเวลาล็อกเอาท์ (นาที)</Label>
                                    <Input
                                        id="lockoutDuration"
                                        type="number"
                                        min="5"
                                        max="60"
                                        value={settings.security.lockoutDuration}
                                        onChange={(e) => handleSettingChange("security", "lockoutDuration", parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="passwordRequireSpecialChars" className="text-base">ต้องมีอักขระพิเศษในรหัสผ่าน</Label>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">เช่น !@#$%^&amp;*()</p>
                                    </div>
                                    <Switch
                                        id="passwordRequireSpecialChars"
                                        checked={settings.security.passwordRequireSpecialChars}
                                        onCheckedChange={(checked) => handleSettingChange("security", "passwordRequireSpecialChars", checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="twoFactorAuthEnabled" className="text-base">เปิดใช้งาน Two-Factor Authentication</Label>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">เพิ่มความปลอดภัยด้วยการยืนยัน 2 ขั้นตอน</p>
                                    </div>
                                    <Switch
                                        id="twoFactorAuthEnabled"
                                        checked={settings.security.twoFactorAuthEnabled}
                                        onCheckedChange={(checked) => handleSettingChange("security", "twoFactorAuthEnabled", checked)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="w-5 h-5" />
                                การตั้งค่าการแจ้งเตือน
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="emailNotifications" className="text-base">การแจ้งเตือนทางอีเมล</Label>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">ส่งอีเมลแจ้งเตือนเหตุการณ์ต่างๆ</p>
                                    </div>
                                    <Switch
                                        id="emailNotifications"
                                        checked={settings.notifications.emailNotifications}
                                        onCheckedChange={(checked) => handleSettingChange("notifications", "emailNotifications", checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="pushNotifications" className="text-base">การแจ้งเตือน Push</Label>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">แจ้งเตือนผ่านเบราวเซอร์</p>
                                    </div>
                                    <Switch
                                        id="pushNotifications"
                                        checked={settings.notifications.pushNotifications}
                                        onCheckedChange={(checked) => handleSettingChange("notifications", "pushNotifications", checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="smsNotifications" className="text-base">การแจ้งเตือนทาง SMS</Label>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">แจ้งเตือนผ่านข้อความ SMS</p>
                                    </div>
                                    <Switch
                                        id="smsNotifications"
                                        checked={settings.notifications.smsNotifications}
                                        onCheckedChange={(checked) => handleSettingChange("notifications", "smsNotifications", checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="autoReminderEnabled" className="text-base">การแจ้งเตือนอัตโนมัติ</Label>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">ส่งการแจ้งเตือนค่าบริการ งานซ่อมบำรุง ฯลฯ</p>
                                    </div>
                                    <Switch
                                        id="autoReminderEnabled"
                                        checked={settings.notifications.autoReminderEnabled}
                                        onCheckedChange={(checked) => handleSettingChange("notifications", "autoReminderEnabled", checked)}
                                    />
                                </div>

                                {settings.notifications.autoReminderEnabled && (
                                    <div className="space-y-2">
                                        <Label htmlFor="reminderDays">จำนวนวันก่อนแจ้งเตือน</Label>
                                        <Input
                                            id="reminderDays"
                                            type="number"
                                            min="1"
                                            max="30"
                                            value={settings.notifications.reminderDays}
                                            onChange={(e) => handleSettingChange("notifications", "reminderDays", parseInt(e.target.value))}
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Backup Settings */}
                <TabsContent value="backup" className="space-y-6">
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="w-5 h-5" />
                                การตั้งค่าข้อมูลสำรอง
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-green-800">ข้อมูลสำรองล่าสุด</p>
                                        <p className="text-sm text-green-600">{settings.backup.lastBackup}</p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="autoBackupEnabled" className="text-base">สำรองข้อมูลอัตโนมัติ</Label>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">สร้างข้อมูลสำรองตามรอบเวลา</p>
                                        </div>
                                        <Switch
                                            id="autoBackupEnabled"
                                            checked={settings.backup.autoBackupEnabled}
                                            onCheckedChange={(checked) => handleSettingChange("backup", "autoBackupEnabled", checked)}
                                        />
                                    </div>

                                    {settings.backup.autoBackupEnabled && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="backupFrequency">ความถี่ในการสำรอง</Label>
                                                <Select
                                                    value={settings.backup.backupFrequency}
                                                    onValueChange={(value) => handleSettingChange("backup", "backupFrequency", value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="hourly">รายชั่วโมง</SelectItem>
                                                        <SelectItem value="daily">รายวัน</SelectItem>
                                                        <SelectItem value="weekly">รายสัปดาห์</SelectItem>
                                                        <SelectItem value="monthly">รายเดือน</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="retentionDays">เก็บข้อมูลสำรอง (วัน)</Label>
                                                <Input
                                                    id="retentionDays"
                                                    type="number"
                                                    min="7"
                                                    max="365"
                                                    value={settings.backup.retentionDays}
                                                    onChange={(e) => handleSettingChange("backup", "retentionDays", parseInt(e.target.value))}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="backupLocation">ที่จัดเก็บข้อมูลสำรอง</Label>
                                                <Select
                                                    value={settings.backup.backupLocation}
                                                    onValueChange={(value) => handleSettingChange("backup", "backupLocation", value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="cloud">Cloud Storage</SelectItem>
                                                        <SelectItem value="local">Local Storage</SelectItem>
                                                        <SelectItem value="both">ทั้งสองที่</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button onClick={handleBackupNow} className="flex-1">
                                    <Download className="w-4 h-4 mr-2" />
                                    สร้างข้อมูลสำรองตอนนี้
                                </Button>

                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept=".json,.sql,.backup"
                                        onChange={(e) => e.target.files?.[0] && handleRestoreBackup(e.target.files[0])}
                                        className="hidden"
                                        id="restore-backup"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => document.getElementById('restore-backup')?.click()}
                                        className="w-full"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        กู้คืนข้อมูลสำรอง
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Maintenance Settings */}
                <TabsContent value="maintenance" className="space-y-6">
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                การตั้งค่าซ่อมบำรุงระบบ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                    <div className="text-sm text-amber-800">
                                        <p className="font-medium">คำเตือน:</p>
                                        <p>การเปิด Maintenance Mode จะทำให้ผู้ใช้ทั่วไปไม่สามารถเข้าใช้งานระบบได้</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="maintenanceMode" className="text-base">โหมดซ่อมบำรุง</Label>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">ปิดระบบชั่วคราวเพื่อซ่อมบำรุง</p>
                                    </div>
                                    <Switch
                                        id="maintenanceMode"
                                        checked={settings.maintenance.maintenanceMode}
                                        onCheckedChange={(checked) => handleSettingChange("maintenance", "maintenanceMode", checked)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="maintenanceMessage">ข้อความประกาศซ่อมบำรุง</Label>
                                    <Textarea
                                        id="maintenanceMessage"
                                        placeholder="ระบบกำลังปรับปรุงชั่วคราว..."
                                        value={settings.maintenance.maintenanceMessage}
                                        onChange={(e) => handleSettingChange("maintenance", "maintenanceMessage", e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="scheduledMaintenance">กำหนดเวลาซ่อมบำรุด</Label>
                                    <Input
                                        id="scheduledMaintenance"
                                        type="datetime-local"
                                        value={settings.maintenance.scheduledMaintenance}
                                        onChange={(e) => handleSettingChange("maintenance", "scheduledMaintenance", e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Limits Settings */}
                <TabsContent value="limits" className="space-y-6">
                    <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                การตั้งค่าขีดจำกัด
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="maxUsersPerProject">ผู้ใช้สูงสุดต่อโครงการ</Label>
                                    <Input
                                        id="maxUsersPerProject"
                                        type="number"
                                        min="10"
                                        value={settings.limits.maxUsersPerProject}
                                        onChange={(e) => handleSettingChange("limits", "maxUsersPerProject", parseInt(e.target.value))}
                                    />
                                    <p className="text-sm text-slate-500 dark:text-slate-400">จำนวนผู้ใช้ทั้งหมดในแต่ละโครงการ</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="maxResidentsPerUnit">ผู้อยู่อาศัยสูงสุดต่อห้อง</Label>
                                    <Input
                                        id="maxResidentsPerUnit"
                                        type="number"
                                        min="1"
                                        value={settings.limits.maxResidentsPerUnit}
                                        onChange={(e) => handleSettingChange("limits", "maxResidentsPerUnit", parseInt(e.target.value))}
                                    />
                                    <p className="text-sm text-slate-500 dark:text-slate-400">จำนวนคนสูงสุดในแต่ละห้องพัก</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="maxStoragePerProject">พื้นที่จัดเก็บสูงสุดต่อโครงการ (MB)</Label>
                                    <Input
                                        id="maxStoragePerProject"
                                        type="number"
                                        min="1024"
                                        value={settings.limits.maxStoragePerProject}
                                        onChange={(e) => handleSettingChange("limits", "maxStoragePerProject", parseInt(e.target.value))}
                                    />
                                    <p className="text-sm text-slate-500 dark:text-slate-400">ขนาดไฟล์ทั้งหมดรวมกัน</p>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium">หมายเหตุ:</p>
                                        <ul className="list-disc list-inside mt-1 space-y-1">
                                            <li>การเปลี่ยนแปลงขีดจำกัดอาจส่งผลกระทบต่อผู้ใช้ปัจจุบัน</li>
                                            <li>ควรแจ้งให้ผู้ใช้ทราบก่อนปรับขีดจำกัดลด</li>
                                            <li>พื้นที่จัดเก็บรวมภาพถ่าย เอกสาร และข้อมูลทั้งหมด</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
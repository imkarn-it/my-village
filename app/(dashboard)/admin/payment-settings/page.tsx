"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Loader2, Save, QrCode, Building2, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api/client"

type PaymentMethod = "promptpay" | "bank_transfer"
type PromptPayType = "phone" | "tax_id" | "ewallet"

interface PaymentSettings {
    id?: string
    paymentMethod: PaymentMethod
    promptpayType?: PromptPayType
    promptpayId?: string
    accountName?: string
    bankName?: string
    accountNumber?: string // New field
    requireSlipUpload?: boolean
    autoVerifyPayment?: boolean
}

export default function PaymentSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState<PaymentSettings>({
        paymentMethod: "promptpay",
        requireSlipUpload: true,
        autoVerifyPayment: false,
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const { data, error } = await api.admin["payment-settings"].get()

            if (error) {
                console.error("Error fetching settings:", error)
                return
            }

            if (data?.success && data.data) {
                // Map old values if necessary
                const loadedSettings = data.data as any
                if (loadedSettings.paymentMethod === 'self_qr') loadedSettings.paymentMethod = 'promptpay'

                setSettings(loadedSettings)
            }
        } catch (err) {
            console.error("Failed to fetch payment settings:", err)
            toast.error("ไม่สามารถโหลดการตั้งค่าได้")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)

            // Prepare settings for API
            // Map 'promptpay' back to 'self_qr' if backend expects it, or update backend to accept new values
            // For now, let's assume we send new values and backend handles it or we map it

            // Actually, let's keep using 'self_qr' for promptpay in backend to avoid schema migration issues for now
            // But wait, user wants to choose between QR and Bank Transfer.
            // Let's send the data as is, and we'll update the backend to handle it.

            const cleanSettings = Object.fromEntries(
                Object.entries(settings).filter(([_, v]) => v !== null && v !== undefined)
            ) as any

            console.log("Saving settings:", cleanSettings)

            const { data, error } = await api.admin["payment-settings"].post(cleanSettings)

            if (error) {
                console.error("Save error:", error)
                toast.error("ไม่สามารถบันทึกการตั้งค่าได้")
                return
            }

            if (data?.success) {
                toast.success("บันทึกการตั้งค่าเรียบร้อยแล้ว")
                fetchSettings()
            }
        } catch (err) {
            console.error("Failed to save settings:", err)
            toast.error("เกิดข้อผิดพลาดในการบันทึก")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    ตั้งค่าการชำระเงิน
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    เลือกวิธีการชำระเงินและกำหนดค่าบัญชีรับเงิน
                </p>
            </div>

            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white">รูปแบบการชำระเงินหลัก</CardTitle>
                    <CardDescription>เลือกรูปแบบที่ต้องการให้แสดงเป็นค่าเริ่มต้นสำหรับลูกบ้าน</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={settings.paymentMethod}
                        onValueChange={(value) => setSettings({ ...settings, paymentMethod: value as PaymentMethod })}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <div>
                            <RadioGroupItem value="promptpay" id="promptpay" className="peer sr-only" />
                            <Label
                                htmlFor="promptpay"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                                <QrCode className="mb-3 h-6 w-6" />
                                <div className="text-center">
                                    <span className="block font-semibold">PromptPay QR</span>
                                    <span className="text-xs text-muted-foreground">สร้าง QR Code อัตโนมัติ</span>
                                </div>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="bank_transfer" id="bank_transfer" className="peer sr-only" />
                            <Label
                                htmlFor="bank_transfer"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                                <Building2 className="mb-3 h-6 w-6" />
                                <div className="text-center">
                                    <span className="block font-semibold">โอนเงินผ่านเลขบัญชี</span>
                                    <span className="text-xs text-muted-foreground">แสดงเลขบัญชีธนาคาร</span>
                                </div>
                            </Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* PromptPay Configuration */}
            {settings.paymentMethod === 'promptpay' && (
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 animate-in fade-in slide-in-from-top-4">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                            <QrCode className="w-5 h-5" />
                            ตั้งค่า PromptPay
                        </CardTitle>
                        <CardDescription>ข้อมูลสำหรับสร้าง QR Code รับเงิน</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="promptpay-type">ประเภท ID</Label>
                                <Select
                                    value={settings.promptpayType}
                                    onValueChange={(value) => setSettings({ ...settings, promptpayType: value as PromptPayType })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="เลือกประเภท" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="phone">เบอร์โทรศัพท์</SelectItem>
                                        <SelectItem value="tax_id">เลขประจำตัวผู้เสียภาษี / นิติบุคคล</SelectItem>
                                        <SelectItem value="ewallet">E-Wallet ID</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="promptpay-id">
                                    {settings.promptpayType === "phone" && "เบอร์โทรศัพท์"}
                                    {settings.promptpayType === "tax_id" && "เลขประจำตัวผู้เสียภาษี (13 หลัก)"}
                                    {settings.promptpayType === "ewallet" && "E-Wallet ID"}
                                    {!settings.promptpayType && "PromptPay ID"}
                                </Label>
                                <Input
                                    id="promptpay-id"
                                    placeholder="ระบุตัวเลขเท่านั้น"
                                    value={settings.promptpayId || ""}
                                    onChange={(e) => setSettings({ ...settings, promptpayId: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="account-name-pp">ชื่อบัญชีที่แสดง</Label>
                            <Input
                                id="account-name-pp"
                                placeholder="เช่น นิติบุคคลหมู่บ้าน..."
                                value={settings.accountName || ""}
                                onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bank Transfer Configuration */}
            {settings.paymentMethod === 'bank_transfer' && (
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 animate-in fade-in slide-in-from-top-4">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            ตั้งค่าบัญชีธนาคาร
                        </CardTitle>
                        <CardDescription>ข้อมูลบัญชีธนาคารสำหรับให้ลูกบ้านโอนเงิน</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="bank-name">ธนาคาร</Label>
                                <Input
                                    id="bank-name"
                                    placeholder="เช่น กสิกรไทย, ไทยพาณิชย์"
                                    value={settings.bankName || ""}
                                    onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="account-number">เลขที่บัญชี</Label>
                                <Input
                                    id="account-number"
                                    placeholder="xxx-x-xxxxx-x"
                                    value={settings.accountNumber || ""}
                                    onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="account-name-bank">ชื่อบัญชี</Label>
                            <Input
                                id="account-name-bank"
                                placeholder="ชื่อบัญชีนิติบุคคล..."
                                value={settings.accountName || ""}
                                onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Common Settings */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>ต้องการให้อัพโหลดสลิป</Label>
                            <p className="text-sm text-slate-500">บังคับให้ลูกบ้านแนบหลักฐานการโอนเงินทุกครั้ง</p>
                        </div>
                        <Switch
                            checked={settings.requireSlipUpload}
                            onCheckedChange={(checked) => setSettings({ ...settings, requireSlipUpload: checked })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            กำลังบันทึก...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            บันทึกการตั้งค่า
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

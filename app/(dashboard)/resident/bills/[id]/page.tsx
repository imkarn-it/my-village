"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    ArrowLeft,
    QrCode,
    Upload,
    Loader2,
    CheckCircle2,
    Clock,
    Calendar,
    Building2,
    Info,
    CreditCard
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { api } from "@/lib/api/client"
import Image from "next/image"

export default function BillDetailPage() {
    const params = useParams()
    const billId = params.id as string

    const [loading, setLoading] = useState(true)
    const [bill, setBill] = useState<any>(null)
    const [qrData, setQRData] = useState<any>(null)
    const [generatingQR, setGeneratingQR] = useState(false)
    const [uploadingSlip, setUploadingSlip] = useState(false)
    const [slipFile, setSlipFile] = useState<File | null>(null)

    useEffect(() => {
        fetchBill()
    }, [billId])

    const fetchBill = async () => {
        try {
            setLoading(true)
            console.log("Fetching bill:", billId)

            // Use native fetch to call the API directly
            const response = await fetch(`/api/bills/${billId}`)
            const result = await response.json()

            console.log("=== Bill API Response ===")
            console.log("result:", result)
            console.log("status:", response.status)

            if (!response.ok || !result.success) {
                console.error("Bill fetch error:", result)
                toast.error("ไม่สามารถโหลดข้อมูลบิลได้")
                return
            }

            if (result.data) {
                console.log("Bill loaded:", result.data)
                setBill(result.data)
            }
        } catch (err) {
            console.error("Failed to fetch bill:", err)
            toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล")
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateQR = async () => {
        try {
            setGeneratingQR(true)
            // @ts-ignore
            const { data, error } = await api.bills[billId]['generate-qr'].post()

            if (error) {
                throw new Error(String(error.value))
            }

            if (data?.success) {
                setQRData(data.data)
                if (bill.projectPaymentMethod === 'bank_transfer') {
                    toast.success("ดึงข้อมูลบัญชีเรียบร้อยแล้ว")
                } else {
                    toast.success("สร้าง QR Code เรียบร้อยแล้ว")
                }
            }
        } catch (err) {
            console.error("Failed to generate QR:", err)
            toast.error("ไม่สามารถดึงข้อมูลการชำระเงินได้")
        } finally {
            setGeneratingQR(false)
        }
    }

    const handleSlipUpload = async () => {
        if (!slipFile) {
            toast.error("กรุณาเลือกไฟล์สลิป")
            return
        }

        try {
            setUploadingSlip(true)

            // Upload via API route (server-side with Service Role Key)
            const formData = new FormData()
            formData.append('file', slipFile)
            formData.append('billId', billId)

            const uploadResponse = await fetch('/api/upload-payment-slip', {
                method: 'POST',
                body: formData,
            })

            const uploadResult = await uploadResponse.json()

            if (!uploadResult.success || !uploadResult.url) {
                throw new Error(uploadResult.error || 'Failed to upload')
            }

            // Update bill with slip URL
            const response = await fetch(`/api/bills/${billId}/upload-slip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slipUrl: uploadResult.url }),
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to update bill')
            }

            toast.success("อัพโหลดสลิปเรียบร้อยแล้ว รอการตรวจสอบจากเจ้าหน้าที่")
            setSlipFile(null)
            fetchBill()
        } catch (err) {
            console.error("Failed to upload slip:", err)
            toast.error("ไม่สามารถอัพโหลดสลิปได้")
        } finally {
            setUploadingSlip(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        )
    }

    if (!bill) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400">ไม่พบข้อมูลบิล</p>
            </div>
        )
    }

    const isPending = bill.status === "pending" || bill.status === "pending_verification"
    const isPendingVerification = bill.status === "pending_verification"
    const isPaid = bill.status === "paid"

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/resident/bills">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        รายละเอียดบิล
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        ชำระเงินและตรวจสอบสถานะ
                    </p>
                </div>
            </div>

            {/* Bill Info */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700/50">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-slate-900 dark:text-white">ข้อมูลบิล</CardTitle>
                        <Badge
                            className={
                                isPaid
                                    ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                                    : "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                            }
                        >
                            {isPaid ? (
                                <>
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    ชำระแล้ว
                                </>
                            ) : (
                                <>
                                    <Clock className="w-3 h-3 mr-1" />
                                    รอชำระ
                                </>
                            )}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-600 dark:text-slate-400">ประเภทบิล</Label>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                {bill.billType || '-'}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600 dark:text-slate-400">ยอดชำระ</Label>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                ฿{Number(bill.amount || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                กำหนดชำระ
                            </Label>
                            <p className="text-slate-900 dark:text-white">
                                {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : '-'}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                ห้อง
                            </Label>
                            <p className="text-slate-900 dark:text-white">
                                {bill.unit?.unitNumber || '-'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Section */}
            {isPending && (
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                            <QrCode className="w-5 h-5" />
                            ชำระเงิน
                        </CardTitle>
                        <CardDescription>
                            {bill.projectPaymentMethod === 'bank_transfer'
                                ? "โอนเงินผ่านบัญชีธนาคารและแนบสลิป"
                                : "สแกน QR Code เพื่อชำระเงินผ่านแอพธนาคาร"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
                            <div className="flex gap-3">
                                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="space-y-1 text-sm">
                                    <p className="font-medium text-blue-900 dark:text-blue-100">
                                        วิธีการชำระเงิน
                                    </p>
                                    <ol className="list-decimal list-inside text-blue-700 dark:text-blue-300 space-y-1">
                                        {bill.projectPaymentMethod === 'bank_transfer' ? (
                                            <>
                                                <li>คลิกปุ่ม "แสดงข้อมูลบัญชี" ด้านล่าง</li>
                                                <li>โอนเงินเข้าบัญชีธนาคารตามที่ระบุ</li>
                                                <li>ตรวจสอบจำนวนเงินให้ถูกต้อง</li>
                                                <li>อัพโหลดสลิปเพื่อยืนยันการชำระเงิน</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>คลิกปุ่ม "แสดง QR Code" ด้านล่าง</li>
                                                <li>เปิดแอพธนาคารและสแกน QR Code</li>
                                                <li>ตรวจสอบจำนวนเงินให้ถูกต้อง</li>
                                                <li>กดยืนยันการชำระเงินในแอพธนาคาร</li>
                                                <li>อัพโหลดสลิปเพื่อยืนยันการชำระเงิน</li>
                                            </>
                                        )}
                                    </ol>
                                </div>
                            </div>
                        </div>

                        {!qrData ? (
                            <Button
                                onClick={handleGenerateQR}
                                disabled={generatingQR}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                            >
                                {generatingQR ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        กำลังโหลดข้อมูล...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        {bill.projectPaymentMethod === 'bank_transfer' ? "แสดงข้อมูลบัญชี" : "แสดง QR Code"}
                                    </>
                                )}
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border-2 border-purple-500/20">
                                    {qrData.type === 'promptpay' ? (
                                        <>
                                            <div className="flex justify-center mb-4">
                                                {qrData.qrDataUrl ? (
                                                    <Image
                                                        src={qrData.qrDataUrl}
                                                        alt="QR Code สำหรับชำระเงิน"
                                                        width={300}
                                                        height={300}
                                                        className="rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="w-[300px] h-[300px] bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <Separator className="my-4" />
                                            <div className="space-y-2 text-center">
                                                <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400">
                                                    <Building2 className="w-4 h-4" />
                                                    <p className="text-sm">{qrData.accountInfo.bankName}</p>
                                                </div>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {qrData.accountInfo.accountName}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    PromptPay: {qrData.accountInfo.promptpayId}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-6 text-center py-4">
                                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">ธนาคาร</p>
                                                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                                    {qrData.accountInfo.bankName || '-'}
                                                </p>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">ชื่อบัญชี</p>
                                                <p className="text-lg font-medium text-slate-900 dark:text-white">
                                                    {qrData.accountInfo.accountName || '-'}
                                                </p>
                                            </div>

                                            <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <p className="text-sm text-slate-500 dark:text-slate-400">เลขที่บัญชี</p>
                                                <div className="flex items-center justify-center gap-2">
                                                    <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white tracking-wider">
                                                        {qrData.accountInfo.accountNumber || '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-6 text-center">
                                        <p className="text-sm text-slate-500 mb-1">ยอดชำระ</p>
                                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                            ฿{Number(qrData.amount).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <Label htmlFor="slip-upload" className="text-slate-900 dark:text-white">
                                        อัพโหลดสลิปการโอนเงิน
                                    </Label>
                                    <Input
                                        id="slip-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setSlipFile(e.target.files?.[0] || null)}
                                        className="cursor-pointer"
                                    />
                                    <Button
                                        onClick={handleSlipUpload}
                                        disabled={!slipFile || uploadingSlip}
                                        className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg"
                                    >
                                        {uploadingSlip ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                กำลังอัพโหลด...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4 mr-2" />
                                                ส่งสลิปเพื่อตรวจสอบ
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Pending Verification */}
            {isPendingVerification && (
                <Card className="bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="font-medium text-amber-900 dark:text-amber-100">
                                    รอการตรวจสอบ
                                </p>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    เจ้าหน้าที่กำลังตรวจสอบการชำระเงินของคุณ
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Paid */}
            {isPaid && (
                <Card className="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="font-medium text-emerald-900 dark:text-emerald-100">
                                    ชำระเงินเรียบร้อยแล้ว
                                </p>
                                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                    ขอบคุณที่ชำระเงินตรงเวลา
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

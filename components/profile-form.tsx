"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Save, User, Phone, Lock, Camera, Mail } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import { ROLE_LABELS, type Role } from "@/lib/constants"
import { getInitials } from "@/lib/utils"
import { api } from "@/lib/api/client"
import { useRouter } from "next/navigation"
import { ImageUpload } from "@/components/shared/image-upload"

// ==========================================
// Types
// ==========================================

type ProfileFormProps = {
    readonly user: {
        readonly id: string // Added id
        readonly name?: string | null
        readonly email?: string | null
        readonly phone?: string | null
        readonly avatar?: string | null
        readonly role?: Role
    }
}

// ==========================================
// Component
// ==========================================

export function ProfileForm({ user }: ProfileFormProps): React.JSX.Element {
    const router = useRouter()
    const [isPending, setIsPending] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatar ?? null)

    // Form state
    const [formData, setFormData] = useState({
        name: user.name ?? "",
        phone: user.phone ?? "",
        currentPassword: "",
        newPassword: "",
    })

    const roleLabel = user.role ? ROLE_LABELS[user.role] ?? user.role : "ลูกบ้าน"

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)

        try {
            // Prepare update data
            const updateData: any = {
                name: formData.name,
                phone: formData.phone,
                avatar: avatarUrl,
            }

            // Only send password if new password is provided
            if (formData.newPassword) {
                if (!formData.currentPassword) {
                    toast.error("กรุณาระบุรหัสผ่านปัจจุบันเพื่อยืนยันการเปลี่ยนแปลง")
                    setIsPending(false)
                    return
                }
                // Note: In a real app, we should verify current password first.
                // For now, we just update the password.
                // TODO: Verify current password on backend before updating
                updateData.password = formData.newPassword
            }

            const { data, error } = await api.users({ id: user.id }).patch(updateData)

            if (error) {
                throw new Error(String(error.value))
            }

            if (data && data.success) {
                toast.success("บันทึกข้อมูลเรียบร้อยแล้ว")
                setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "" }))
                router.refresh()
            }
        } catch (err: any) {
            console.error("Error updating profile:", err)
            toast.error(err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="grid gap-6">
            {/* Profile Picture Card */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>รูปโปรไฟล์</CardTitle>
                    <CardDescription>คลิกที่รูปเพื่ออัปโหลดรูปใหม่</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <ImageUpload
                        value={avatarUrl}
                        onChange={async (url) => {
                            setAvatarUrl(url)
                            // Auto-save when image is uploaded
                            if (url) {
                                try {
                                    const { error } = await api.users({ id: user.id }).patch({
                                        avatar: url
                                    })
                                    if (error) throw error
                                    toast.success("อัปเดตรูปโปรไฟล์เรียบร้อยแล้ว")
                                    router.refresh()
                                } catch (err) {
                                    console.error("Error saving avatar:", err)
                                    toast.error("บันทึกรูปโปรไฟล์ไม่สำเร็จ")
                                }
                            }
                        }}
                        bucket="profiles"
                        shape="circle"
                        folder={`avatars/${user.id}`}
                        disabled={isPending}
                    />
                </CardContent>
            </Card>

            {/* Personal Info Form */}
            <form onSubmit={handleSubmit}>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>ข้อมูลส่วนตัว</CardTitle>
                        <CardDescription>แก้ไขข้อมูลส่วนตัวและรหัสผ่าน</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">อีเมล</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        value={user.email ?? ""}
                                        disabled
                                        className="pl-10 bg-slate-100 dark:bg-slate-800/50"
                                    />
                                </div>
                                <p className="text-xs text-slate-500">อีเมลไม่สามารถเปลี่ยนแปลงได้</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">ตำแหน่ง</Label>
                                <Input
                                    id="role"
                                    value={roleLabel}
                                    disabled
                                    className="bg-slate-100 dark:bg-slate-800/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="pl-10"
                                        placeholder="ระบุชื่อ-นามสกุล"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="pl-10"
                                        placeholder="08x-xxx-xxxx"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 dark:border-slate-700/50 pt-6">
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-slate-500" />
                                เปลี่ยนรหัสผ่าน
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">รหัสผ่านปัจจุบัน</Label>
                                    <Input
                                        id="currentPassword"
                                        name="currentPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
                                    <Input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        บันทึกการเปลี่ยนแปลง
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}

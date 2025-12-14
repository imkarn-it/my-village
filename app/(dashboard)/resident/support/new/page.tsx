"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Home, MessageSquare, Send, AlertCircle, CheckCircle, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { FileUpload } from "@/components/ui/file-upload";

type Unit = {
    id: string;
    unitNumber: string;
    building: string;
    floor: number;
};

type SupportTicket = {
    id: string;
    unitId: string;
    subject: string;
    message: string;
    status: "open" | "in_progress" | "resolved" | "closed";
    createdAt: string;
    updatedAt: string;
};

const commonIssues = [
    "แจ้งซ่อมอุปกรณ์ในห้อง",
    "แจ้งปัญหาไฟฟ้า/น้ำ",
    "ขอความช่วยเหลือด้านความปลอดภัย",
    "สอบถามข้อมูลค่าบริการ",
    "ขออนุญาตทำสิ่งใดสิ่งหนึ่ง",
    "ร้องเรียนปัญหาจากลูกบ้านอื่น",
    "อื่นๆ",
];

export default function NewSupportTicketPage() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loadingUnits, setLoadingUnits] = useState(true);
    const [createdTicket, setCreatedTicket] = useState<SupportTicket | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        unitId: "",
        subject: "",
        message: "",
        category: "",
    });

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const { data } = await api.units.get({
                    query: { limit: "100" }
                });
                if (data && data.success && Array.isArray(data.data)) {
                    setUnits(data.data.filter(u => u.building !== null) as Unit[]);
                }
            } catch (error) {
                console.error("Failed to fetch units:", error);
                toast.error("ไม่สามารถโหลดข้อมูลห้องพักได้");
            } finally {
                setLoadingUnits(false);
            }
        };
        fetchUnits();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPending(true);

        try {
            // Create FormData for file upload
            const formDataToSubmit = new FormData();

            // Add form fields
            Object.entries(formData).forEach(([key, value]) => {
                formDataToSubmit.append(key, value);
            });

            // Add files
            uploadedFiles.forEach((file, index) => {
                formDataToSubmit.append(`attachments[${index}]`, file);
            });

            // @ts-ignore - FormData type issue
            const { data, error } = await api.support.post(formDataToSubmit);

            if (error) {
                throw new Error(String(error.value));
            }

            if (data && data.success) {
                // @ts-ignore - Type conversion issue
                setCreatedTicket(data.data as SupportTicket);
                toast.success("สร้างตั๋วงความเรียบร้อยแล้ว");
            }
        } catch (err: unknown) {
            console.error("Error creating support ticket:", err);
            toast.error(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสร้างตั๋วงความ");
        } finally {
            setIsPending(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCategorySelect = (category: string) => {
        setFormData(prev => ({
            ...prev,
            subject: category === "อื่นๆ" ? "" : category,
            category,
        }));
    };

    if (createdTicket) {
        return (
            <div className="space-y-6 max-w-2xl mx-auto">
                <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-gray-900">สร้างตั๋วงความสำเร็จ</h1>
                        <p className="text-gray-600">ตั๋วงความของคุณถูกส่งให้นิติบุคคลเรียบร้อยแล้ว</p>
                    </div>
                </div>

                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-500">รหัสตั๋วง</Label>
                                <p className="font-mono text-lg">#{createdTicket.id.slice(0, 8)}...</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500">เรื่อง</Label>
                                <p className="font-medium">{createdTicket.subject}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500">รายละเอียด</Label>
                                <p className="text-gray-700 whitespace-pre-wrap">{createdTicket.message}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500">สถานะ</Label>
                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    เปิดใหม่
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    <Link href="/resident/support" className="flex-1">
                        <Button variant="outline" className="w-full">
                            ดูตั๋วงความทั้งหมด
                        </Button>
                    </Link>
                    <Link href="/resident/support/new" className="flex-1">
                        <Button className="w-full">
                            สร้างตั๋วงความใหม่
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/resident/support">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900">สร้างตั๋วงความใหม่</h1>
                    <p className="text-gray-600">ติดต่อนิติบุคคลเพื่อขอความช่วยเหลือ</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            รายละเอียดตั๋วงความ
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Unit Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="unitId">
                                ห้องพัก <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                <Select
                                    value={formData.unitId}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, unitId: value }))}
                                    required
                                >
                                    <SelectTrigger className="pl-10 w-full">
                                        <SelectValue placeholder={loadingUnits ? "กำลังโหลด..." : "เลือกห้องพัก"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((unit) => (
                                            <SelectItem key={unit.id} value={unit.id}>
                                                {unit.unitNumber} (ชั้น {unit.floor})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Quick Categories */}
                        <div className="space-y-2">
                            <Label>หมวดหมู่ที่พบบ่อย</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {commonIssues.map((issue) => (
                                    <Button
                                        key={issue}
                                        type="button"
                                        variant={formData.category === issue ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleCategorySelect(issue)}
                                        className="text-sm h-auto py-2 px-3 whitespace-normal text-center"
                                    >
                                        {issue}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="space-y-2">
                            <Label htmlFor="subject">
                                เรื่อง <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="subject"
                                name="subject"
                                placeholder="ระบุหัวข้อที่ต้องการติดต่อ"
                                required
                                value={formData.subject}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <Label htmlFor="message">
                                รายละเอียด <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="message"
                                name="message"
                                placeholder="กรุณาอธิบายรายละเอียดปัญหาหรือสิ่งที่ต้องการความช่วยเหลือ..."
                                rows={5}
                                required
                                value={formData.message}
                                onChange={handleChange}
                            />
                        </div>

                        {/* File Upload */}
                        <div className="space-y-2">
                            <Label>แนบเอกสาร (ถ้ามี)</Label>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <Paperclip className="w-4 h-4" />
                                <span>แนบรูปภาพหรือเอกสารที่เกี่ยวข้อง</span>
                            </div>
                            <FileUpload
                                accept="image/*,.pdf,.doc,.docx"
                                maxFiles={3}
                                maxSize={5 * 1024 * 1024}
                                onChange={(files) => setUploadedFiles(files)}
                                value={uploadedFiles}
                            />
                            <p className="text-xs text-gray-500">
                                รองรับไฟล์รูปภาพและเอกสาร PDF, Word (สูงสุด 5MB ต่อไฟล์)
                            </p>
                        </div>

                        {/* Note */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">หมายเหตุ:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>ตั๋วงความจะถูกส่งไปยังนิติบุคคลเพื่อดำเนินการ</li>
                                        <li>คุณสามารถติดตามสถานะได้ในหน้าตั๋วงความของฉัน</li>
                                        <li>กรณีฉุกเฉิน กรุณาติดต่อแจ้งเหตุฉุกเฉินทันที</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-3 pt-4">
                            <Link href="/resident/support" className="flex-1">
                                <Button type="button" variant="outline" className="w-full">
                                    ยกเลิก
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="flex-1"
                            >
                                {isPending ? (
                                    <>กำลังส่ง...</>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        ส่งตั๋วงความ
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
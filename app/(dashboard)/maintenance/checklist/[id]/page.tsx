"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    CheckCircle,
    Camera,
    FileText,
    AlertTriangle,
    Clock,
    User,
    MapPin,
    Wrench,
    Save,
    ArrowLeft,
    Star,
    Signature,
    Upload,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

type ChecklistItem = {
    id: string;
    category: string;
    task: string;
    required: boolean;
    completed: boolean;
    notes?: string;
    photo?: string;
};

type ChecklistTemplate = {
    id: string;
    name: string;
    category: string;
    items: ChecklistItem[];
};

type RepairTicket = {
    id: string;
    ticketNumber: string;
    title: string;
    location: string;
    unit: string;
    requester: string;
    reportedDate: string;
    priority: "low" | "medium" | "high" | "urgent";
    category: string;
    description: string;
    status: "pending" | "assigned" | "in_progress" | "completed" | "verified";
    assignedTo?: string;
};

const checklistTemplates: ChecklistTemplate[] = [
    {
        id: "air-conditioning",
        name: "ซ่อมแอร์",
        category: "ไกล์อากาศและระบบระบายอากาศ",
        items: [
            { id: "1", category: "การตรวจเช็คก่อนซ่อม", task: "ตรวจสอบอาการและวิเคราะห์สาเหตุ", required: true, completed: false },
            { id: "2", category: "การตรวจเช็คก่อนซ่อม", task: "ตรวจสอบแรงดันและปริมาณก๊าซ", required: true, completed: false },
            { id: "3", category: "การดำเนินการซ่อม", task: "เติมก๊าซน้ำยาแอร์ (ถ้าจำเป็น)", required: true, completed: false },
            { id: "4", category: "การดำเนินการซ่อม", task: "ทำความสะอาดคอยล์ร้อนและคอยเย็น", required: true, completed: false },
            { id: "5", category: "การดำเนินการซ่อม", task: "ตรวจสอบการทำงานของคอมเพรสเซอร์", required: true, completed: false },
            { id: "6", category: "การทดสอบหลังซ่อม", task: "ทดสอบการทำงานของแอร์ (15 นาที)", required: true, completed: false },
            { id: "7", category: "การทดสอบหลังซ่อม", task: "ตรวจสอบอุณหภูมิที่ออกจากแอร์", required: true, completed: false },
            { id: "8", category: "การทดสอบหลังซ่อม", task: "ตรวจสอบการรั่วของน้ำยาแอร์", required: true, completed: false },
        ]
    },
    {
        id: "electrical",
        name: "ระบบไฟฟ้า",
        category: "ระบบไฟฟ้า",
        items: [
            { id: "1", category: "การตรวจเช็คความปลอดภัย", task: "ตัดไฟฟ้าก่อนทำการซ่อม", required: true, completed: false },
            { id: "2", category: "การตรวจเช็คความปลอดภัย", task: "ตรวจสอบสายไฟที่เสียหาย", required: true, completed: false },
            { id: "3", category: "การดำเนินการซ่อม", task: "เปลี่ยนหลอดไฟหรืออุปกรณ์ที่เสีย", required: true, completed: false },
            { id: "4", category: "การดำเนินการซ่อม", task: "ต่อสายไฟใหม่ (ถ้าจำเป็น)", required: true, completed: false },
            { id: "5", category: "การดำเนินการซ่อม", task: "เปลี่ยนปลั๊กไฟหรือสวิตช์", required: true, completed: false },
            { id: "6", category: "การทดสอบหลังซ่อม", task: "ตรวจสอบฉนวนกันช็อต", required: true, completed: false },
            { id: "7", category: "การทดสอบหลังซ่อม", task: "ทดสอบเปิด-ปิดไฟฟ้า", required: true, completed: false },
            { id: "8", category: "การทดสอบหลังซ่อม", task: "ตรวจสอบปริมาณกระแสไฟฟ้า", required: true, completed: false },
        ]
    },
    {
        id: "plumbing",
        name: "ระบบประปา",
        category: "ระบบประปาและท่อระบายน้ำ",
        items: [
            { id: "1", category: "การตรวจเช็คก่อนซ่อม", task: "ปิดน้ำก่อนทำการซ่อม", required: true, completed: false },
            { id: "2", category: "การตรวจเช็คก่อนซ่อม", task: "ตรวจสอบจุดรั่วของน้ำ", required: true, completed: false },
            { id: "3", category: "การดำเนินการซ่อม", task: "เปลี่ยนท่อหรือข้อต่อที่เสียหาย", required: true, completed: false },
            { id: "4", category: "การดำเนินการซ่อม", task: "เปลี่ยนก๊อกน้ำหรือวาล์ว", required: true, completed: false },
            { id: "5", category: "การดำเนินการซ่อม", task: "อุดตันหรือทำความสะอาดท่อ", required: true, completed: false },
            { id: "6", category: "การทดสอบหลังซ่อม", task: "เปิดน้ำทดสอบการรั่ว", required: true, completed: false },
            { id: "7", category: "การทดสอบหลังซ่อม", task: "ทดสอบแรงดันน้ำ", required: true, completed: false },
            { id: "8", category: "การทดสอบหลังซ่อม", task: "ตรวจสอบการระบายน้ำ", required: true, completed: false },
        ]
    },
    {
        id: "general",
        name: "งานทั่วไป",
        category: "อื่นๆ",
        items: [
            { id: "1", category: "การตรวจเช็คเบื้องต้น", task: "ตรวจสอบปัญหาที่รายงาน", required: true, completed: false },
            { id: "2", category: "การตรวจเช็คเบื้องต้น", task: "เตรียมอุปกรณ์และเครื่องมือ", required: true, completed: false },
            { id: "3", category: "การดำเนินการซ่อม", task: "ดำเนินการตามที่กำหนด", required: true, completed: false },
            { id: "4", category: "การทดสอบหลังซ่อม", task: "ตรวจสอบผลลัพธ์ที่ได้", required: true, completed: false },
            { id: "5", category: "การทดสอบหลังซ่อม", task: "ทำความสะอาดบริเวณที่ทำงาน", required: true, completed: false },
        ]
    }
];

const mockTicket: RepairTicket = {
    id: "1",
    ticketNumber: "MT-2025-001",
    title: "ซ่อมแอร์ห้อง A-205",
    location: "อาคาร A ชั้น 2",
    unit: "A-205",
    requester: "สมศักดิ์ ใจดี",
    reportedDate: "2025-12-13T09:00:00Z",
    priority: "medium",
    category: "ไกล์อากาศและระบบระบายอากาศ",
    description: "แอร์ไม่เย็น มีเสียงดังผิดปกติ",
    status: "in_progress",
    assignedTo: "ช่างไกล์อากาศ"
};

export default function RepairChecklistPage() {
    const params = useParams();
    const router = useRouter();
    const [ticket] = useState<RepairTicket>(mockTicket);
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [selectedPhotoItem, setSelectedPhotoItem] = useState<string>("");
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [residentSignature] = useState<string>("");
    const [residentRating, setResidentRating] = useState<number>(0);
    const [residentFeedback, setResidentFeedback] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Load ticket data
        // setTicket(await api.maintenance.tickets({ id: params.id }).get());

        // Auto-select template based on category
        const template = checklistTemplates.find(t =>
            ticket.category.toLowerCase().includes(t.name.toLowerCase()) ||
            t.category === ticket.category
        );
        if (template) {
            setSelectedTemplate(template);
            setChecklist(template.items.map(item => ({ ...item })));
        }
    }, [params.id, ticket.category]);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent": return "bg-red-100 text-red-800";
            case "high": return "bg-orange-100 text-orange-800";
            case "medium": return "bg-yellow-100 text-yellow-800";
            case "low": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-800";
            case "verified": return "bg-blue-100 text-blue-800";
            case "in_progress": return "bg-yellow-100 text-yellow-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const handleChecklistChange = (itemId: string, completed: boolean) => {
        setChecklist(prev =>
            prev.map(item =>
                item.id === itemId ? { ...item, completed } : item
            )
        );
    };

    const handleNotesChange = (itemId: string, notes: string) => {
        setChecklist(prev =>
            prev.map(item =>
                item.id === itemId ? { ...item, notes } : item
            )
        );
    };

    const handlePhotoCapture = (itemId: string) => {
        setSelectedPhotoItem(itemId);
        setShowPhotoModal(true);
    };

    const handleTemplateChange = (template: ChecklistTemplate) => {
        setSelectedTemplate(template);
        setChecklist(template.items.map(item => ({ ...item })));
    };

    const calculateProgress = () => {
        if (checklist.length === 0) return 0;
        const completed = checklist.filter(item => item.completed).length;
        return Math.round((completed / checklist.length) * 100);
    };

    const isChecklistComplete = () => {
        const requiredItems = checklist.filter(item => item.required);
        return requiredItems.length > 0 && requiredItems.every(item => item.completed);
    };

    const handleSaveChecklist = async () => {
        if (!isChecklistComplete()) {
            alert("กรุณาทำเครื่องหมายรายการที่จำเป็นทั้งหมด");
            return;
        }

        setIsSaving(true);
        try {
            // Save checklist data
            const checklistData = {
                ticketId: ticket.id,
                template: selectedTemplate?.id,
                items: checklist,
                completionTime: new Date().toISOString(),
                signature: residentSignature,
                rating: residentRating,
                feedback: residentFeedback
            };

            // await api.maintenance.checklists.post(checklistData);
            console.log("Saving checklist:", checklistData);

            // Update ticket status to completed
            // await api.maintenance.tickets({ id: ticket.id }).patch({
            //     status: "completed",
            //     completedAt: new Date().toISOString()
            // });

            alert("บันทึก Checklist และปิดงานเรียบร้อยแล้ว");
            router.push("/maintenance/completed");
        } catch (error) {
            console.error("Error saving checklist:", error);
            alert("เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่");
        } finally {
            setIsSaving(false);
        }
    };

    const groupedChecklist = checklist.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, ChecklistItem[]>);

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Checklist การตรวจสอบหลังซ่อม</h1>
                    <p className="text-gray-600">{ticket.ticketNumber}</p>
                </div>
                <Button
                    onClick={handleSaveChecklist}
                    disabled={!isChecklistComplete() || isSaving}
                    className="bg-green-600 hover:bg-green-700"
                >
                    {isSaving ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            กำลังบันทึก...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            บันทึกและปิดงาน
                        </>
                    )}
                </Button>
            </div>

            {/* Ticket Information */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            ข้อมูลใบแจ้งซ่อม
                        </span>
                        <div className="flex gap-2">
                            <Badge className={getPriorityColor(ticket.priority)}>
                                {ticket.priority === "urgent" && "ด่วนที่สุด"}
                                {ticket.priority === "high" && "สูง"}
                                {ticket.priority === "medium" && "ปานกลาง"}
                                {ticket.priority === "low" && "ต่ำ"}
                            </Badge>
                            <Badge className={getStatusColor(ticket.status)}>
                                {ticket.status === "in_progress" && "กำลังดำเนินการ"}
                                {ticket.status === "completed" && "เสร็จสิ้น"}
                                {ticket.status === "verified" && "ตรวจสอบแล้ว"}
                            </Badge>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg">{ticket.title}</h3>
                        <p className="text-gray-600 mt-1">{ticket.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{ticket.location} - {ticket.unit}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>ผู้แจ้ง: {ticket.requester}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-gray-400" />
                            <span>ประเภท: {ticket.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>แจ้ง: {format(new Date(ticket.reportedDate), "d MMM yyyy HH:mm", { locale: th })}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Template Selection */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>เลือกแม่แบบ Checklist</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {checklistTemplates.map((template) => (
                            <Button
                                key={template.id}
                                variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                                onClick={() => handleTemplateChange(template)}
                                className="h-auto p-3 flex flex-col items-center gap-2"
                            >
                                <Wrench className="w-6 h-6" />
                                <span className="text-sm font-medium">{template.name}</span>
                                <span className="text-xs text-gray-500">{template.items.length} รายการ</span>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Progress */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">ความคืบหน้า</h3>
                        <span className="text-2xl font-bold text-blue-600">{calculateProgress()}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${calculateProgress()}%` }}
                        />
                    </div>
                    {!isChecklistComplete() && (
                        <Alert className="mt-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                กรุณาทำเครื่องหมายรายการที่จำเป็นทั้งหมด (*)
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Checklist Items */}
            {selectedTemplate && (
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>รายการตรวจสอบ ({selectedTemplate.name})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {Object.entries(groupedChecklist).map(([category, items]) => (
                            <div key={category}>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                    {category}
                                </h4>
                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <div key={item.id} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    id={item.id}
                                                    checked={item.completed}
                                                    onCheckedChange={(checked) => handleChecklistChange(item.id, checked as boolean)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <label
                                                        htmlFor={item.id}
                                                        className="flex items-center gap-2 font-medium cursor-pointer"
                                                    >
                                                        {item.task}
                                                        {item.required && <span className="text-red-500">*</span>}
                                                    </label>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handlePhotoCapture(item.id)}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <Camera className="w-3 h-3" />
                                                            {item.photo ? "แก้ไขรูป" : "ถ่ายรูป"}
                                                        </Button>
                                                        {item.photo && (
                                                            <div className="flex items-center gap-1 text-sm text-green-600">
                                                                <CheckCircle className="w-3 h-3" />
                                                                มีรูปภาพ
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <Textarea
                                                placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)..."
                                                value={item.notes || ""}
                                                onChange={(e) => handleNotesChange(item.id, e.target.value)}
                                                className="mt-3"
                                                rows={2}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Resident Confirmation */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        การยืนยันจากผู้อยู่อาศัย
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">ความพึงพอใจ</label>
                        <div className="flex gap-2 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Button
                                    key={star}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setResidentRating(star)}
                                    className="p-1"
                                >
                                    <Star
                                        className={`w-6 h-6 ${star <= residentRating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                            }`}
                                    />
                                </Button>
                            ))}
                        </div>
                    </div>

                    <Textarea
                        placeholder="ความคิดเห็นเพิ่มเติมจากผู้อยู่อาศัย..."
                        value={residentFeedback}
                        onChange={(e) => setResidentFeedback(e.target.value)}
                        rows={3}
                    />

                    <Button
                        variant="outline"
                        onClick={() => setShowSignatureModal(true)}
                        className="w-full"
                    >
                        <Signature className="w-4 h-4 mr-2" />
                        {residentSignature ? "ดูลายเซ็น" : "เพิ่มลายเซ็นผู้อยู่อาศัย"}
                    </Button>

                    {residentSignature && (
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <Image src={residentSignature} alt="Assinatura" width={200} height={80} className="h-20 w-auto" />
                            <p className="text-sm text-gray-600 mt-2">ลายเซ็น: {ticket.requester}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Photo Modal */}
            <Dialog open={showPhotoModal} onOpenChange={setShowPhotoModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>ถ่ายรูปภาพ</DialogTitle>
                        <DialogDescription>
                            ถ่ายรูปสำหรับรายการ: {checklist.find(i => i.id === selectedPhotoItem)?.task}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Camera placeholder */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">คลิกเพื่อเปิดกล้องถ่ายรูป</p>
                            <Button>
                                <Camera className="w-4 h-4 mr-2" />
                                เปิดกล้อง
                            </Button>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1">
                                <Upload className="w-4 h-4 mr-2" />
                                อัปโหลดรูป
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowPhotoModal(false)}
                                className="flex-1"
                            >
                                ยกเลิก
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Signature Modal */}
            <Dialog open={showSignatureModal} onOpenChange={setShowSignatureModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>ลายเซ็นผู้อยู่อาศัย</DialogTitle>
                        <DialogDescription>
                            กรุณาขอลายเซ็นจากคุณ {ticket.requester} เพื่อยืนยันการซ่อมเสร็จสิ้น
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Signature placeholder */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                            <Signature className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">พื้นที่ลงนาม</p>
                            <Button variant="outline">
                                เริ่มลงนาม
                            </Button>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={() => setShowSignatureModal(false)} className="flex-1">
                                บันทึกลายเซ็น
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowSignatureModal(false)}
                                className="flex-1"
                            >
                                ยกเลิก
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
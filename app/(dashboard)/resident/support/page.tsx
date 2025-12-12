"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    MessageSquare,
    Send,
    Clock,
    CheckCircle2,
    Plus,
    ChevronRight,
    User,
    Calendar,
    MessageCircle,
} from "lucide-react";

// Mock data
const tickets = [
    {
        id: 1,
        subject: "สอบถามเรื่องค่าส่วนกลาง",
        message: "อยากทราบรายละเอียดค่าส่วนกลางที่เพิ่มขึ้นจากเดือนที่แล้ว",
        status: "replied",
        createdAt: "8 ธ.ค. 2567",
        repliedAt: "9 ธ.ค. 2567",
        reply: "ค่าส่วนกลางที่เพิ่มขึ้นเนื่องจากมีการปรับปรุงระบบ CCTV และเพิ่มไฟส่องสว่างในพื้นที่จอดรถ ครับ",
    },
    {
        id: 2,
        subject: "แจ้งเสียงดังจากห้องข้างเคียง",
        message: "มีเสียงดังรบกวนจากห้อง A103 ในช่วงกลางคืนบ่อยครั้ง",
        status: "open",
        createdAt: "10 ธ.ค. 2567",
        repliedAt: null,
        reply: null,
    },
];

export default function SupportPage(): React.JSX.Element {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                            <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        ติดต่อนิติบุคคล
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        สอบถามหรือแจ้งปัญหาต่างๆ กับทางนิติบุคคล
                    </p>
                </div>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02]">
                    <Plus className="w-4 h-4 mr-2" />
                    สร้างข้อความใหม่
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* New Message Form */}
                <Card className="lg:col-span-1 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700/50">
                        <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                            <Send className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            ส่งข้อความใหม่
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="text-slate-700 dark:text-slate-300">หัวข้อ</Label>
                            <Input
                                id="subject"
                                placeholder="ระบุหัวข้อ..."
                                className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message" className="text-slate-700 dark:text-slate-300">รายละเอียด</Label>
                            <Textarea
                                id="message"
                                placeholder="อธิบายรายละเอียด..."
                                rows={5}
                                className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20 resize-none"
                            />
                        </div>
                        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300">
                            <Send className="w-4 h-4 mr-2" />
                            ส่งข้อความ
                        </Button>
                    </CardContent>
                </Card>

                {/* Tickets List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        ประวัติการติดต่อ
                    </h2>

                    {tickets.length > 0 ? (
                        <div className="space-y-4">
                            {tickets.map((ticket) => (
                                <Card
                                    key={ticket.id}
                                    className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 cursor-pointer group"
                                >
                                    <CardContent className="p-5 space-y-4">
                                        {/* Header */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    {ticket.status === "replied" ? (
                                                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            ตอบกลับแล้ว
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            รอตอบกลับ
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                    {ticket.subject}
                                                </h3>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-600 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                                        </div>

                                        {/* My Message */}
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 rounded-xl rounded-tl-none p-3">
                                                    {ticket.message}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {ticket.createdAt}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Reply */}
                                        {ticket.reply && (
                                            <div className="flex gap-3 flex-row-reverse">
                                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <MessageSquare className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-purple-50 dark:bg-purple-500/10 rounded-xl rounded-tr-none p-3 text-right">
                                                        {ticket.reply}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1 text-right flex items-center gap-1 justify-end">
                                                        <Calendar className="w-3 h-3" />
                                                        {ticket.repliedAt}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    ยังไม่มีข้อความ
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-sm">
                                    คุณยังไม่เคยติดต่อนิติบุคคล สามารถส่งข้อความใหม่ได้ทางด้านซ้าย
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MoreHorizontal, Bell, Pin, Calendar, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useState } from "react";
import { useAnnouncements } from "@/lib/hooks/use-announcements";
import { AnnouncementsSkeleton } from "@/components/shared/skeletons";
import { ErrorMessage } from "@/components/shared/error-message";

export default function AnnouncementsPage() {
    const { announcements, loading, error, refresh, deleteAnnouncement, togglePin } = useAnnouncements();
    const [searchQuery, setSearchQuery] = useState("");

    // Filter announcements based on search
    const filteredAnnouncements = announcements.filter(item =>
        item.announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.announcement.content?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบประกาศนี้?")) return;
        await deleteAnnouncement(id);
    };

    const handleTogglePin = async (id: string, currentStatus: boolean) => {
        await togglePin(id, currentStatus);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        จัดการประกาศ
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        {loading ? "กำลังโหลด..." : `ประกาศทั้งหมด ${filteredAnnouncements.length} รายการ`}
                    </p>
                </div>
                <Link href="/admin/announcements/new">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-[1.02]">
                        <Plus className="w-5 h-5 mr-2" />
                        สร้างประกาศใหม่
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4 bg-white/80 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="ค้นหาหัวข้อประกาศ..."
                        className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-purple-500/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <AnnouncementsSkeleton />
            ) : error ? (
                <ErrorMessage message={error} onRetry={refresh} />
            ) : filteredAnnouncements.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-500">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Bell className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-lg font-medium">ไม่พบประกาศ</p>
                    <p className="text-sm">ลองค้นหาด้วยคำอื่น หรือสร้างประกาศใหม่</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAnnouncements.map(({ announcement, creator }) => (
                        <Card key={announcement.id} className="group bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/5 flex flex-col">
                            <CardHeader className="relative pb-2">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1">
                                        {announcement.isPinned && (
                                            <Badge variant="secondary" className="mb-2 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20">
                                                <Pin className="w-3 h-3 mr-1" />
                                                ปักหมุด
                                            </Badge>
                                        )}
                                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2">
                                            {announcement.title}
                                        </CardTitle>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="-mr-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                                                <MoreHorizontal className="w-4 h-4 text-slate-500" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <Link href={`/admin/announcements/${announcement.id}/edit`}>
                                                <DropdownMenuItem>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    แก้ไข
                                                </DropdownMenuItem>
                                            </Link>
                                            <DropdownMenuItem onClick={() => handleTogglePin(announcement.id, announcement.isPinned || false)}>
                                                <Pin className="w-4 h-4 mr-2" />
                                                {announcement.isPinned ? "เลิกปักหมุด" : "ปักหมุด"}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10"
                                                onClick={() => handleDelete(announcement.id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                ลบ
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3">
                                    {announcement.content || "ไม่มีรายละเอียด"}
                                </p>
                            </CardContent>
                            <CardFooter className="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-xs text-slate-500">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3" />
                                    {announcement.createdAt ? format(new Date(announcement.createdAt), 'd MMM yyyy', { locale: th }) : '-'}
                                </div>
                                {creator && (
                                    <div className="flex items-center gap-2">
                                        <span>โดย {creator.name}</span>
                                    </div>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

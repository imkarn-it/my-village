"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Bell,
    Search,
    Pin,
    Calendar,
    ChevronRight,
    Megaphone,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useAnnouncements } from "@/lib/hooks/use-announcements";
import { ErrorMessage } from "@/components/shared/error-message";

const getCategoryStyle = (isPinned: boolean) => {
    if (isPinned) {
        return {
            bg: "bg-gradient-to-r from-red-500/10 to-orange-500/10",
            text: "text-red-400",
            border: "border-red-500/20",
            label: "ประกาศสำคัญ"
        };
    }
    return {
        bg: "bg-gradient-to-r from-purple-500/10 to-pink-500/10",
        text: "text-purple-400",
        border: "border-purple-500/20",
        label: "ทั่วไป"
    };
};

export default function AnnouncementsPage() {
    const { announcements, loading, error, refresh } = useAnnouncements();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredAnnouncements = announcements.filter(item =>
        item.announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.announcement.content?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                            <Megaphone className="w-5 h-5 text-white" />
                        </div>
                        ประกาศ
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        ประกาศและข่าวสารจากนิติบุคคล
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                    placeholder="ค้นหาประกาศ..."
                    className="pl-10 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 h-32 animate-pulse" />
                    ))}
                </div>
            ) : error ? (
                <ErrorMessage message={error} onRetry={refresh} />
            ) : filteredAnnouncements.length === 0 ? (
                <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-4">
                            <Bell className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            ไม่มีประกาศ
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
                            ยังไม่มีประกาศใดๆ ในขณะนี้
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredAnnouncements.map((item) => {
                        const { announcement, creator } = item;
                        const style = getCategoryStyle(announcement.isPinned || false);
                        return (
                            <Card
                                key={announcement.id}
                                className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-purple-500/5"
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            {/* Category & Pinned */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {announcement.isPinned && (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                                    >
                                                        <Pin className="w-3 h-3 mr-1" />
                                                        ปักหมุด
                                                    </Badge>
                                                )}
                                                <Badge
                                                    variant="outline"
                                                    className={`${style.bg} ${style.text} ${style.border}`}
                                                >
                                                    {style.label}
                                                </Badge>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                                                {announcement.title}
                                            </h3>

                                            {/* Content preview */}
                                            <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">
                                                {announcement.content || "ไม่มีรายละเอียด"}
                                            </p>

                                            {/* Date & Author */}
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {announcement.createdAt ? format(new Date(announcement.createdAt), 'd MMM yyyy', { locale: th }) : '-'}
                                                </div>
                                                {creator && (
                                                    <div className="flex items-center gap-2">
                                                        <span>โดย {creator.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-600 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-2" />
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

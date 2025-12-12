import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import type { Announcement, User } from "@/types/entities";

export type AnnouncementWithCreator = {
    announcement: Announcement;
    creator: Pick<User, "id" | "name" | "email" | "role"> | null;
};

export function useAnnouncements() {
    const [announcements, setAnnouncements] = useState<AnnouncementWithCreator[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnnouncements = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await api.announcements.get({
                query: {}
            });

            if (error) {
                throw new Error(error.value ? String(error.value) : "Failed to fetch announcements");
            }

            if (data && data.success && Array.isArray(data.data)) {
                const mappedData = data.data.map((item: any) => ({
                    announcement: {
                        ...item,
                        createdAt: item.createdAt ? new Date(item.createdAt) : null,
                        updatedAt: item.updatedAt ? new Date(item.updatedAt) : null,
                    },
                    creator: item.author || null
                }));

                setAnnouncements(mappedData);
            }
        } catch (err) {
            console.error("Error fetching announcements:", err);
            setError("ไม่สามารถโหลดข้อมูลประกาศได้ กรุณาลองใหม่อีกครั้ง");
            toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const refresh = () => {
        fetchAnnouncements();
    };

    const deleteAnnouncement = async (id: string) => {
        try {
            const { data, error } = await api.announcements({ id }).delete();

            if (error) {
                throw new Error(String(error.value));
            }

            if (data && data.success) {
                toast.success("ลบประกาศเรียบร้อยแล้ว");
                refresh();
                return true;
            }
            return false;
        } catch (err) {
            toast.error("ไม่สามารถลบประกาศได้");
            console.error(err);
            return false;
        }
    };

    const togglePin = async (id: string, currentStatus: boolean) => {
        try {
            const { data, error } = await api.announcements({ id }).patch({
                isPinned: !currentStatus
            });

            if (error) {
                throw new Error(String(error.value));
            }

            if (data && data.success) {
                toast.success(currentStatus ? "เลิกปักหมุดแล้ว" : "ปักหมุดเรียบร้อยแล้ว");
                refresh();
                return true;
            }
            return false;
        } catch (err) {
            toast.error("ไม่สามารถแก้ไขสถานะได้");
            console.error(err);
            return false;
        }
    };

    return {
        announcements,
        loading,
        error,
        refresh,
        deleteAnnouncement,
        togglePin
    };
}

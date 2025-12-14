"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle2, Trash2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ParcelActionsProps {
    parcelId: string;
    isPickedUp: boolean;
}

export function ParcelActions({ parcelId, isPickedUp }: ParcelActionsProps) {
    const router = useRouter();

    const handleDeliver = async () => {
        try {
            const { data, error } = await api.parcels({ id: parcelId }).patch({
                pickedUp: true
            });

            if (error) {
                toast.error("ไม่สามารถอัปเดตสถานะได้");
                return;
            }

            if (data && data.success) {
                toast.success("ยืนยันการรับของเรียบร้อยแล้ว");
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to update parcel:", error);
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        }
    };

    const handleDelete = async () => {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?")) return;

        try {
            // @ts-ignore - Eden Treaty type inference issue
            const { data, error } = await api.parcels({ id: parcelId }).delete();

            if (error) {
                toast.error("ไม่สามารถลบรายการได้");
                return;
            }

            if (data && data.success) {
                toast.success("ลบรายการเรียบร้อยแล้ว");
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to delete parcel:", error);
            toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800">
                    <MoreHorizontal className="w-4 h-4 text-slate-500" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>จัดการ</DropdownMenuLabel>
                {!isPickedUp && (
                    <DropdownMenuItem
                        className="text-emerald-600 dark:text-emerald-400 cursor-pointer"
                        onClick={handleDeliver}
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        ยืนยันการรับของ
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10 cursor-pointer"
                    onClick={handleDelete}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    ลบรายการ
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

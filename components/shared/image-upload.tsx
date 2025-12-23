"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImagePlus, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
    value: string | null
    onChange: (value: string | null) => void
    disabled?: boolean
    bucket: string
    folder?: string
    className?: string
    shape?: "square" | "circle"
}

export function ImageUpload({
    value,
    onChange,
    disabled,
    bucket,
    folder = "uploads",
    className,
    shape = "square",
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น")
            return
        }

        // Validate file size (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("ขนาดไฟล์ต้องไม่เกิน 5MB")
            return
        }

        try {
            setIsUploading(true)

            const formData = new FormData()
            formData.append("file", file)
            formData.append("bucket", bucket)
            if (folder) {
                formData.append("folder", folder)
            }
            if (value) {
                formData.append("oldUrl", value)
            }

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Upload failed")
            }

            const data = await response.json()
            onChange(data.url)
            toast.success("อัปโหลดรูปภาพเรียบร้อยแล้ว")
        } catch (error) {
            console.error("Upload error:", error)
            toast.error("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ")
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const handleRemove = async () => {
        if (value) {
            try {
                await fetch("/api/upload", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ url: value }),
                })
            } catch (error) {
                console.error("Error deleting image:", error)
            }
        }
        onChange(null)
    }

    return (
        <div className={cn("flex items-center gap-4", className)}>
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleUpload}
                disabled={disabled || isUploading}
            />

            {value ? (
                <div
                    className={cn(
                        "relative w-40 h-40 overflow-hidden border border-slate-200 dark:border-slate-700 group cursor-pointer",
                        shape === "circle" ? "rounded-full" : "rounded-xl"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Image
                        src={value}
                        alt="Upload"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleRemove()
                            }}
                            disabled={disabled}
                            className="rounded-full"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "w-40 h-40 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors bg-slate-50 dark:bg-slate-800/50",
                        (disabled || isUploading) && "opacity-50 cursor-not-allowed",
                        shape === "circle" ? "rounded-full" : "rounded-xl"
                    )}
                >
                    {isUploading ? (
                        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                    ) : (
                        <ImagePlus className="w-8 h-8 text-slate-400" />
                    )}
                    <span className="text-xs text-slate-500 font-medium">
                        {isUploading ? "กำลังอัปโหลด..." : "อัปโหลดรูปภาพ"}
                    </span>
                </div>
            )}
        </div>
    )
}

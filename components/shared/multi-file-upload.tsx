"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImagePlus, X, Loader2, FileImage } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface MultiFileUploadProps {
    values: string[]
    onChange: (values: string[]) => void
    disabled?: boolean
    bucket: string
    folder?: string
    className?: string
    maxFiles?: number
    accept?: string
}

export function MultiFileUpload({
    values,
    onChange,
    disabled,
    bucket,
    folder = "uploads",
    className,
    maxFiles = 5,
    accept = "image/*",
}: MultiFileUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<number[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        // Check max files
        if (values.length + files.length > maxFiles) {
            toast.error(`สามารถอัปโหลดได้สูงสุด ${maxFiles} ไฟล์`)
            return
        }

        // Validate each file
        const validFiles: File[] = []
        for (const file of Array.from(files)) {
            if (accept === "image/*" && !file.type.startsWith("image/")) {
                toast.error(`${file.name} ไม่ใช่ไฟล์รูปภาพ`)
                continue
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} มีขนาดเกิน 5MB`)
                continue
            }
            validFiles.push(file)
        }

        if (validFiles.length === 0) return

        try {
            setIsUploading(true)
            setUploadProgress(new Array(validFiles.length).fill(0))

            const uploadedUrls: string[] = []

            for (let i = 0; i < validFiles.length; i++) {
                const file = validFiles[i]
                const formData = new FormData()
                formData.append("file", file)
                formData.append("bucket", bucket)
                if (folder) {
                    formData.append("folder", folder)
                }

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                })

                if (!response.ok) {
                    throw new Error(`Upload failed for ${file.name}`)
                }

                const data = await response.json()
                uploadedUrls.push(data.url)

                setUploadProgress(prev => {
                    const newProgress = [...prev]
                    newProgress[i] = 100
                    return newProgress
                })
            }

            onChange([...values, ...uploadedUrls])
            toast.success(`อัปโหลด ${uploadedUrls.length} ไฟล์เรียบร้อย`)
        } catch (error) {
            console.error("Upload error:", error)
            toast.error("เกิดข้อผิดพลาดในการอัปโหลด")
        } finally {
            setIsUploading(false)
            setUploadProgress([])
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const handleRemove = async (index: number) => {
        const url = values[index]
        try {
            await fetch("/api/upload", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            })
        } catch (error) {
            console.error("Error deleting file:", error)
        }
        onChange(values.filter((_, i) => i !== index))
    }

    return (
        <div className={cn("space-y-4", className)}>
            <input
                type="file"
                accept={accept}
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleUpload}
                disabled={disabled || isUploading}
            />

            {/* Preview Grid */}
            {values.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {values.map((url, index) => (
                        <div
                            key={index}
                            className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group"
                        >
                            <Image
                                src={url}
                                alt={`Upload ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                disabled={disabled}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            {values.length < maxFiles && (
                <div
                    onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors bg-slate-50 dark:bg-slate-800/50",
                        (disabled || isUploading) && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                            <span className="text-sm text-slate-500">
                                กำลังอัปโหลด... ({uploadProgress.filter(p => p === 100).length}/{uploadProgress.length})
                            </span>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <ImagePlus className="w-6 h-6 text-slate-400" />
                                <FileImage className="w-6 h-6 text-slate-400" />
                            </div>
                            <span className="text-sm text-slate-500 font-medium">
                                คลิกเพื่ออัปโหลดหลายไฟล์
                            </span>
                            <span className="text-xs text-slate-400">
                                ({values.length}/{maxFiles} ไฟล์)
                            </span>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

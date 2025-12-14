"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Upload,
    File,
    X,
    Image as ImageIcon,
    FileText,
    AlertCircle,
    CheckCircle,
} from "lucide-react";

interface FileUploadProps {
    accept?: string;
    maxFiles?: number;
    maxSize?: number; // in bytes
    onUpload?: (files: File[]) => Promise<void>;
    onChange?: (files: File[]) => void;
    value?: File[];
    disabled?: boolean;
    className?: string;
}

interface UploadedFile {
    file: File;
    preview?: string;
    id: string;
    status: "pending" | "uploading" | "success" | "error";
    progress?: number;
    error?: string;
}

export function FileUpload({
    accept = "image/*,.pdf,.doc,.docx",
    maxFiles = 5,
    maxSize = 5 * 1024 * 1024, // 5MB
    onUpload,
    onChange,
    value = [],
    disabled = false,
    className = "",
}: FileUploadProps) {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(
        value.map(file => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            status: "pending" as const,
        }))
    );

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (disabled) return;

        const newFiles: UploadedFile[] = acceptedFiles.map(file => {
            const preview = file.type.startsWith('image/')
                ? URL.createObjectURL(file)
                : undefined;

            return {
                file,
                preview,
                id: Math.random().toString(36).substr(2, 9),
                status: "pending",
            };
        });

        const updatedFiles = [...uploadedFiles, ...newFiles].slice(0, maxFiles);
        setUploadedFiles(updatedFiles);
        onChange?.(updatedFiles.map(f => f.file));

        // Auto upload if onUpload is provided
        if (onUpload) {
            for (const fileObj of newFiles) {
                try {
                    setUploadedFiles(prev =>
                        prev.map(f =>
                            f.id === fileObj.id
                                ? { ...f, status: "uploading" as const, progress: 0 }
                                : f
                        )
                    );

                    // Simulate upload progress
                    for (let progress = 0; progress <= 100; progress += 10) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        setUploadedFiles(prev =>
                            prev.map(f =>
                                f.id === fileObj.id
                                    ? { ...f, progress }
                                    : f
                            )
                        );
                    }

                    await onUpload([fileObj.file]);

                    setUploadedFiles(prev =>
                        prev.map(f =>
                            f.id === fileObj.id
                                ? { ...f, status: "success" as const, progress: 100 }
                                : f
                        )
                    );
                } catch (error) {
                    setUploadedFiles(prev =>
                        prev.map(f =>
                            f.id === fileObj.id
                                ? {
                                    ...f,
                                    status: "error" as const,
                                    error: error instanceof Error ? error.message : "Upload failed"
                                }
                                : f
                        )
                    );
                }
            }
        }
    }, [uploadedFiles, maxFiles, disabled, onUpload, onChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: accept.split(',').reduce((acc, type) => {
            if (type.includes('*')) {
                const ext = type.split('/')[0];
                acc[ext] = [type];
            } else {
                const ext = type.split('.').pop();
                if (ext) acc[ext] = [type];
            }
            return acc;
        }, {} as Record<string, string[]>),
        maxSize,
        maxFiles: maxFiles - uploadedFiles.length,
        disabled: disabled || uploadedFiles.length >= maxFiles,
    });

    const removeFile = (id: string) => {
        const file = uploadedFiles.find(f => f.id === id);
        if (file?.preview) {
            URL.revokeObjectURL(file.preview);
        }

        const updatedFiles = uploadedFiles.filter(f => f.id !== id);
        setUploadedFiles(updatedFiles);
        onChange?.(updatedFiles.map(f => f.file));
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) {
            return <ImageIcon className="h-5 w-5" />;
        }
        if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) {
            return <FileText className="h-5 w-5" />;
        }
        return <File className="h-5 w-5" />;
    };

    const getStatusIcon = (status: UploadedFile['status']) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'uploading':
                return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
            default:
                return null;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    ${uploadedFiles.length >= maxFiles ? 'pointer-events-none opacity-50' : ''}
                `}
            >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-lg font-medium text-gray-700">
                    {isDragActive ? 'วางไฟล์ที่นี่...' : 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                    รองรับ {accept} (สูงสุด {formatFileSize(maxSize)} ต่อไฟล์, สูงสุด {maxFiles} ไฟล์)
                </p>
                {uploadedFiles.length >= maxFiles && (
                    <p className="text-sm text-red-500 mt-2">คุณอัปโหลดไฟล์ครบ {maxFiles} ไฟล์แล้ว</p>
                )}
            </div>

            {/* File List */}
            {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">ไฟล์ที่อัปโหลด ({uploadedFiles.length})</h4>
                    {uploadedFiles.map((fileObj) => (
                        <div
                            key={fileObj.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
                        >
                            {/* Preview/Icon */}
                            <div className="flex-shrink-0">
                                {fileObj.preview ? (
                                    <div className="relative h-12 w-12">
                                        <Image
                                            src={fileObj.preview}
                                            alt={fileObj.file.name}
                                            fill
                                            className="object-cover rounded"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                                        {getFileIcon(fileObj.file)}
                                    </div>
                                )}
                            </div>

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {fileObj.file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(fileObj.file.size)} • {fileObj.file.type}
                                </p>

                                {/* Progress Bar */}
                                {fileObj.status === 'uploading' && fileObj.progress !== undefined && (
                                    <div className="mt-2">
                                        <Progress value={fileObj.progress} className="h-1" />
                                    </div>
                                )}

                                {/* Error Message */}
                                {fileObj.status === 'error' && fileObj.error && (
                                    <p className="text-xs text-red-500 mt-1">{fileObj.error}</p>
                                )}
                            </div>

                            {/* Status Icon */}
                            <div className="flex items-center gap-2">
                                {getStatusIcon(fileObj.status)}
                                {!disabled && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(fileObj.id)}
                                        disabled={fileObj.status === 'uploading'}
                                        className="h-8 w-8 p-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Hook for file upload with progress tracking
export function useFileUpload() {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = async (file: File, uploadUrl: string) => {
        setIsUploading(true);
        setProgress(0);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Create XMLHttpRequest for progress tracking
            return new Promise<string>((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = (event.loaded / event.total) * 100;
                        setProgress(percentComplete);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response.url || response.fileUrl);
                    } else {
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error('Upload failed'));
                });

                xhr.open('POST', uploadUrl);
                xhr.send(formData);
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Upload failed';
            setError(errorMessage);
            throw err;
        } finally {
            setIsUploading(false);
            setProgress(0);
        }
    };

    return {
        uploadFile,
        isUploading,
        progress,
        error,
    };
}
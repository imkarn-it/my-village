"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    File,
    Download,
    Eye,
    ExternalLink,
    X,
    Image as ImageIcon,
    FileText,
    Music,
    Video,
    Archive,
} from "lucide-react";

interface FileViewerProps {
    file: {
        id: string;
        name: string;
        url: string;
        type: string;
        size?: number;
        uploadedAt?: string;
    };
    onRemove?: (id: string) => void;
    showRemove?: boolean;
}

interface AttachmentProps {
    url: string;
    filename: string;
    type: string;
    size?: number;
    className?: string;
}

export function FileViewer({ file, onRemove, showRemove = false }: FileViewerProps) {
    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) {
            return ImageIcon;
        }
        if (type.includes('pdf') || type.includes('document')) {
            return FileText;
        }
        if (type.startsWith('audio/')) {
            return Music;
        }
        if (type.startsWith('video/')) {
            return Video;
        }
        if (type.includes('zip') || type.includes('rar')) {
            return Archive;
        }
        return File;
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return "Unknown size";
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const isImage = file.type.startsWith('image/');
    const Icon = getFileIcon(file.type);

    const handleDownload = async () => {
        try {
            const response = await fetch(file.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
            {/* Preview/Icon */}
            <div className="flex-shrink-0">
                {isImage ? (
                    <div className="relative h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.open(file.url, '_blank')}>
                        <Image
                            src={file.url}
                            alt={file.name}
                            fill
                            className="object-cover rounded"
                        />
                    </div>
                ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                        <Icon className="h-6 w-6 text-gray-500" />
                    </div>
                )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                </h4>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    {file.uploadedAt && (
                        <span>
                            {new Date(file.uploadedAt).toLocaleDateString('th-TH')}
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(file.url, '_blank')}
                    className="h-8 w-8 p-0"
                >
                    <Eye className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    className="h-8 w-8 p-0"
                >
                    <Download className="h-4 w-4" />
                </Button>
                {showRemove && onRemove && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(file.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

export function Attachment({ url, filename, type, size, className = "" }: AttachmentProps) {
    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) {
            return ImageIcon;
        }
        if (mimeType.includes('pdf') || mimeType.includes('document')) {
            return FileText;
        }
        if (mimeType.startsWith('audio/')) {
            return Music;
        }
        if (mimeType.startsWith('video/')) {
            return Video;
        }
        if (mimeType.includes('zip') || mimeType.includes('rar')) {
            return Archive;
        }
        return File;
    };

    const Icon = getFileIcon(type);
    const isImage = type.startsWith('image/');

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm ${className}`}>
            {isImage ? (
                <div className="relative h-4 w-4">
                    <Image
                        src={url}
                        alt={filename}
                        fill
                        className="object-cover rounded-full"
                    />
                </div>
            ) : (
                <Icon className="h-4 w-4 text-gray-500" />
            )}
            <span className="truncate max-w-[150px]" title={filename}>
                {filename}
            </span>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(url, '_blank')}
                className="h-5 w-5 p-0 ml-1"
            >
                <ExternalLink className="h-3 w-3" />
            </Button>
        </div>
    );
}

// Gallery component for multiple images
export function ImageGallery({ images }: { images: Array<{ url: string; alt?: string }> }) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const openImage = (index: number) => {
        setSelectedIndex(index);
    };

    const closeImage = () => {
        setSelectedIndex(null);
    };

    const navigateImage = (direction: 'prev' | 'next') => {
        if (selectedIndex === null) return;

        let newIndex = selectedIndex;
        if (direction === 'prev') {
            newIndex = selectedIndex === 0 ? images.length - 1 : selectedIndex - 1;
        } else {
            newIndex = selectedIndex === images.length - 1 ? 0 : selectedIndex + 1;
        }
        setSelectedIndex(newIndex);
    };

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="relative group cursor-pointer overflow-hidden rounded-lg"
                        onClick={() => openImage(index)}
                    >
                        <div className="relative w-full h-32">
                            <Image
                                src={image.url}
                                alt={image.alt || `Image ${index + 1}`}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                            />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for selected image */}
            {selectedIndex !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-4xl h-[80vh]">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={closeImage}
                            className="absolute -top-12 right-0 text-white hover:bg-white hover:bg-opacity-20 z-50"
                        >
                            <X className="h-6 w-6" />
                        </Button>

                        <Image
                            src={images[selectedIndex].url}
                            alt={images[selectedIndex].alt || `Image ${selectedIndex + 1}`}
                            fill
                            className="object-contain rounded-lg"
                        />

                        {images.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigateImage('prev')}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigateImage('next')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Button>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                                    {selectedIndex + 1} / {images.length}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
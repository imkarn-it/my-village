'use client'

import { useEffect, useState } from 'react'
import { generateQRCode } from '@/lib/qr-generator'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

interface QRCodeDisplayProps {
    text: string
    width?: number
    height?: number
    className?: string
}

export function QRCodeDisplay({
    text,
    width = 200,
    height = 200,
    className
}: QRCodeDisplayProps) {
    const [dataUrl, setDataUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const generate = async () => {
            try {
                setIsLoading(true)
                const url = await generateQRCode(text)
                setDataUrl(url)
            } catch (error) {
                console.error('Failed to generate QR code:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (text) {
            generate()
        }
    }, [text])

    if (isLoading) {
        return (
            <div
                className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
                style={{ width, height }}
            >
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        )
    }

    if (!dataUrl) {
        return (
            <div
                className={`flex items-center justify-center bg-gray-100 rounded-lg text-xs text-gray-400 ${className}`}
                style={{ width, height }}
            >
                Error
            </div>
        )
    }

    return (
        <div className={className}>
            <Image
                src={dataUrl}
                alt={`QR Code: ${text}`}
                width={width}
                height={height}
                className="rounded-lg"
            />
        </div>
    )
}

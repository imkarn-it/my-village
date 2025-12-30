'use client'

import { useState, useRef, useCallback } from 'react'
import Tesseract from 'tesseract.js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Loader2, RotateCcw, Check } from 'lucide-react'

interface LicensePlateScannerProps {
    onResult: (plateNumber: string) => void
    onError?: (error: string) => void
}

export function LicensePlateScanner({ onResult, onError }: LicensePlateScannerProps) {
    const [scanning, setScanning] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    // Start camera
    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: 1280, height: 720 }
            })
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
        } catch (error) {
            onError?.('ไม่สามารถเข้าถึงกล้องได้')
            console.error('Camera error:', error)
        }
    }, [onError])

    // Stop camera
    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
    }, [])

    // Capture image
    const captureImage = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return

        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        if (!ctx) return

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)

        const imageData = canvas.toDataURL('image/png')
        setPreview(imageData)
        stopCamera()
        processImage(imageData)
    }, [stopCamera])

    // Process image with OCR
    const processImage = async (imageData: string) => {
        setScanning(true)
        setProgress(0)

        try {
            const result = await Tesseract.recognize(imageData, 'tha+eng', {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 100))
                    }
                }
            })

            // Clean up the result - Thai license plates format
            const text = result.data.text.trim()
            // Extract plate number pattern (Thai plates: กข 1234 or 1กข 1234)
            const platePattern = /([ก-ฮ]{1,2})\s*(\d{1,4})|(\d{1,2})\s*([ก-ฮ]{1,2})\s*(\d{1,4})/g
            const matches = text.match(platePattern)

            if (matches && matches.length > 0) {
                const plateNumber = matches[0].replace(/\s+/g, ' ').trim()
                setResult(plateNumber)
                onResult(plateNumber)
            } else {
                // Fallback: return cleaned text
                const cleaned = text.replace(/[^ก-ฮ0-9\s]/g, '').trim()
                if (cleaned) {
                    setResult(cleaned)
                    onResult(cleaned)
                } else {
                    onError?.('ไม่พบเลขทะเบียน กรุณาลองใหม่')
                }
            }
        } catch (error) {
            onError?.('เกิดข้อผิดพลาดในการอ่านป้ายทะเบียน')
            console.error('OCR error:', error)
        } finally {
            setScanning(false)
            setProgress(0)
        }
    }

    // Reset
    const reset = useCallback(() => {
        setPreview(null)
        setResult(null)
        startCamera()
    }, [startCamera])

    // Confirm result
    const confirmResult = () => {
        if (result) {
            onResult(result)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    สแกนป้ายทะเบียน
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!preview ? (
                    <>
                        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                                onLoadedMetadata={() => videoRef.current?.play()}
                            />
                            {/* Overlay guide */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="border-2 border-dashed border-primary/50 rounded-lg w-3/4 h-1/3" />
                            </div>
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex gap-2">
                            <Button onClick={startCamera} variant="outline" className="flex-1">
                                เปิดกล้อง
                            </Button>
                            <Button onClick={captureImage} className="flex-1">
                                <Camera className="h-4 w-4 mr-2" />
                                ถ่ายภาพ
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                            <img
                                src={preview}
                                alt="Captured"
                                className="w-full h-full object-cover"
                            />
                            {scanning && (
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                    <p>กำลังอ่านป้ายทะเบียน... {progress}%</p>
                                </div>
                            )}
                        </div>

                        {result && (
                            <div className="p-4 bg-primary/10 rounded-lg text-center">
                                <p className="text-sm text-muted-foreground mb-1">ผลการอ่าน:</p>
                                <p className="text-2xl font-bold">{result}</p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button onClick={reset} variant="outline" className="flex-1">
                                <RotateCcw className="h-4 w-4 mr-2" />
                                ถ่ายใหม่
                            </Button>
                            {result && (
                                <Button onClick={confirmResult} className="flex-1">
                                    <Check className="h-4 w-4 mr-2" />
                                    ยืนยัน
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default LicensePlateScanner

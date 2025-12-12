'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Camera, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface QRScannerProps {
    onScan: (decodedText: string) => void
    onError?: (error: any) => void
    fps?: number
    qrbox?: number
    aspectRatio?: number
}

export function QRScanner({
    onScan,
    onError,
    fps = 10,
    qrbox = 250,
    aspectRatio = 1.0,
}: QRScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)
    const [scanError, setScanError] = useState<string | null>(null)
    const [isScanning, setIsScanning] = useState(false)

    useEffect(() => {
        // Cleanup function to clear scanner when component unmounts
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error)
            }
        }
    }, [])

    const startScanning = () => {
        setScanError(null)
        setIsScanning(true)

        // Small timeout to ensure DOM element exists
        setTimeout(() => {
            try {
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(console.error)
                }

                const scanner = new Html5QrcodeScanner(
                    'reader',
                    {
                        fps,
                        qrbox,
                        aspectRatio,
                        showTorchButtonIfSupported: true,
                    },
                    /* verbose= */ false
                )

                scannerRef.current = scanner

                scanner.render(
                    (decodedText) => {
                        onScan(decodedText)
                        // Optional: Stop scanning after success
                        // scanner.clear()
                        // setIsScanning(false)
                    },
                    (errorMessage) => {
                        // Ignore common errors like "QR code not found" to avoid log spam
                        if (onError) onError(errorMessage)
                    }
                )
            } catch (err) {
                console.error('Failed to start scanner:', err)
                setScanError('Failed to start camera. Please ensure camera permissions are granted.')
                setIsScanning(false)
            }
        }, 100)
    }

    const stopScanning = () => {
        if (scannerRef.current) {
            scannerRef.current.clear()
                .then(() => {
                    setIsScanning(false)
                })
                .catch((err) => {
                    console.error('Failed to stop scanner:', err)
                })
        }
    }

    return (
        <div className="w-full max-w-md mx-auto space-y-4">
            {scanError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{scanError}</AlertDescription>
                </Alert>
            )}

            <Card className="p-4 overflow-hidden bg-black/5 border-dashed border-2">
                {!isScanning ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                        <div className="p-4 bg-muted rounded-full">
                            <Camera className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-medium">Ready to Scan</h3>
                            <p className="text-sm text-muted-foreground">
                                Allow camera access to scan QR codes
                            </p>
                        </div>
                        <Button onClick={startScanning}>
                            Start Camera
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div id="reader" className="w-full rounded-lg overflow-hidden" />
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={stopScanning}
                        >
                            Stop Camera
                        </Button>
                    </div>
                )}
            </Card>

            <div className="text-xs text-center text-muted-foreground">
                <p>Position the QR code within the frame to scan</p>
            </div>
        </div>
    )
}

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFeatureGate, type FeatureKey, FEATURE_LABELS, FEATURE_ICONS } from '@/lib/features'
import { Loader2, ShieldOff, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface FeatureDisabledPageProps {
    featureKey: FeatureKey
    backUrl?: string
}

/**
 * Page shown when a feature is disabled
 */
export function FeatureDisabledPage({ featureKey, backUrl = '/dashboard' }: FeatureDisabledPageProps) {
    const router = useRouter()
    const label = FEATURE_LABELS[featureKey]
    const icon = FEATURE_ICONS[featureKey]

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <Card className="max-w-md w-full text-center">
                <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <ShieldOff className="w-8 h-8 text-slate-400" />
                    </div>
                    <CardTitle className="text-xl">
                        {icon} ฟีเจอร์ไม่พร้อมใช้งาน
                    </CardTitle>
                    <CardDescription>
                        ฟีเจอร์ "{label}" ถูกปิดใช้งานสำหรับโปรเจกต์ของคุณ
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        กรุณาติดต่อผู้ดูแลระบบหากต้องการเปิดใช้งานฟีเจอร์นี้
                    </p>
                    <Button onClick={() => router.push(backUrl)} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        กลับหน้าหลัก
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

/**
 * Loading component for feature check
 */
function FeatureLoading() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">กำลังตรวจสอบสิทธิ์...</p>
            </div>
        </div>
    )
}

/**
 * Higher-Order Component to protect pages based on feature toggles
 * 
 * Usage:
 * ```tsx
 * // In your page component
 * function MaintenancePage() { ... }
 * export default withFeaturePage('maintenance')(MaintenancePage)
 * ```
 */
export function withFeaturePage<P extends object>(
    featureKey: FeatureKey,
    options?: {
        redirectOnDisabled?: boolean
        redirectUrl?: string
        backUrl?: string
    }
) {
    const { redirectOnDisabled = false, redirectUrl = '/dashboard', backUrl } = options || {}

    return function (WrappedComponent: React.ComponentType<P>) {
        function FeatureProtectedPage(props: P) {
            const router = useRouter()
            const { isEnabled, isLoading } = useFeatureGate(featureKey)

            useEffect(() => {
                if (!isLoading && !isEnabled && redirectOnDisabled) {
                    router.replace(`${redirectUrl}?error=feature_disabled&feature=${featureKey}`)
                }
            }, [isEnabled, isLoading, router])

            if (isLoading) {
                return <FeatureLoading />
            }

            if (!isEnabled) {
                if (redirectOnDisabled) {
                    return <FeatureLoading /> // Show loading while redirecting
                }
                return <FeatureDisabledPage featureKey={featureKey} backUrl={backUrl} />
            }

            return <WrappedComponent {...props} />
        }

        // Copy display name for debugging
        const wrappedName = WrappedComponent.displayName || WrappedComponent.name || 'Component'
        FeatureProtectedPage.displayName = `withFeaturePage(${wrappedName})`

        return FeatureProtectedPage
    }
}

/**
 * Hook for checking feature access in pages
 * Returns loading state and whether user can access the feature
 */
export function useFeaturePageAccess(featureKey: FeatureKey) {
    const { isEnabled, isLoading } = useFeatureGate(featureKey)

    return {
        canAccess: isEnabled,
        isLoading,
        FeatureDisabledComponent: () => <FeatureDisabledPage featureKey={featureKey} />,
    }
}

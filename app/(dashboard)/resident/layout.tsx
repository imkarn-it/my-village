import { DashboardLayout } from "@/components/layouts/dashboard-layout"

// ==========================================
// Types
// ==========================================

type ResidentLayoutProps = {
    readonly children: React.ReactNode
}

// ==========================================
// Component
// ==========================================

import { SOSButton } from "@/components/dashboard/sos-button"

export default function ResidentLayout({ children }: ResidentLayoutProps): React.JSX.Element {
    return (
        <DashboardLayout>
            {children}
            <SOSButton />
        </DashboardLayout>
    )
}

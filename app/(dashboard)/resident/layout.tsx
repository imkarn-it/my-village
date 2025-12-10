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

export default function ResidentLayout({ children }: ResidentLayoutProps): React.JSX.Element {
    return <DashboardLayout>{children}</DashboardLayout>
}

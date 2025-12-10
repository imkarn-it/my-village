// ==========================================
// Types
// ==========================================

type AuthLayoutProps = {
    readonly children: React.ReactNode
}

// ==========================================
// Component
// ==========================================

export default function AuthLayout({ children }: AuthLayoutProps): React.JSX.Element {
    return <>{children}</>
}

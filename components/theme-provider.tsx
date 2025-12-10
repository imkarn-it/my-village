"use client"

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

// ==========================================
// Types
// ==========================================

type AppThemeProviderProps = ThemeProviderProps

// ==========================================
// Component
// ==========================================

export function ThemeProvider({ children, ...props }: AppThemeProviderProps): React.JSX.Element {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

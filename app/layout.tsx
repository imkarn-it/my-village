import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

// ==========================================
// Fonts
// ==========================================

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

// ==========================================
// Metadata
// ==========================================

export const metadata: Metadata = {
  title: {
    default: "My Village - ระบบจัดการหมู่บ้าน",
    template: "%s | My Village",
  },
  description: "ระบบจัดการหมู่บ้านและคอนโดมิเนียมแบบครบวงจร",
  keywords: ["หมู่บ้าน", "คอนโด", "นิติบุคคล", "ระบบจัดการ"],
}

// ==========================================
// Types
// ==========================================

type RootLayoutProps = Readonly<{
  children: React.ReactNode
}>

// ==========================================
// Component
// ==========================================

export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}

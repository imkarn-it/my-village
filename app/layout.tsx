import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "@/components/providers"
import { ServiceWorkerRegistration } from "@/components/shared/service-worker-registration"
import { PWAInstallPrompt } from "@/components/shared/pwa-install-prompt"
import { GoogleAnalytics } from "@/components/shared/google-analytics"
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
  description: "ระบบจัดการหมู่บ้านและคอนโดมิเนียมแบบครบวงจร - แจ้งซ่อม บิล ผู้มาติดต่อ พัสดุ และอื่นๆ",
  keywords: ["หมู่บ้าน", "คอนโด", "นิติบุคคล", "ระบบจัดการ", "แจ้งซ่อม", "บิล", "ผู้มาติดต่อ", "พัสดุ"],
  authors: [{ name: "My Village Team" }],
  creator: "My Village",
  publisher: "My Village",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "https://my-village.app",
    siteName: "My Village",
    title: "My Village - ระบบจัดการหมู่บ้าน",
    description: "ระบบจัดการหมู่บ้านและคอนโดมิเนียมแบบครบวงจร",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Village - ระบบจัดการหมู่บ้าน",
    description: "ระบบจัดการหมู่บ้านและคอนโดมิเนียมแบบครบวงจร",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "My Village",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Providers>
            {children}
            <Toaster richColors position="top-right" />
            <ServiceWorkerRegistration />
            <PWAInstallPrompt />
            <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}


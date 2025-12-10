// Environment configuration helper
// ใช้สำหรับ access environment variables อย่างปลอดภัย

export const config = {
    // Environment
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',

    // App
    app: {
        name: process.env.NEXT_PUBLIC_APP_NAME || 'My Village',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    },

    // Supabase
    supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    },

    // Database
    database: {
        url: process.env.DATABASE_URL!,
    },

    // Auth
    auth: {
        secret: process.env.AUTH_SECRET!,
        url: process.env.AUTH_URL || 'http://localhost:3000',
    },

    // Feature Flags
    features: {
        analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    },
} as const

// Type for config
export type Config = typeof config

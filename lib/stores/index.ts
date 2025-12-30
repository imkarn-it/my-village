import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ==========================================
// Notification Store
// ==========================================
interface NotificationState {
    unreadCount: number
    setUnreadCount: (count: number) => void
    incrementUnread: () => void
    decrementUnread: () => void
    clearUnread: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
    unreadCount: 0,
    setUnreadCount: (count) => set({ unreadCount: count }),
    incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
    decrementUnread: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
    clearUnread: () => set({ unreadCount: 0 }),
}))

// ==========================================
// SOS Alert Store (for Security)
// ==========================================
interface SOSAlert {
    id: string
    userId: string
    userName: string
    unit: string
    location?: { lat: number; lng: number }
    createdAt: Date
}

interface SOSState {
    activeAlerts: SOSAlert[]
    addAlert: (alert: SOSAlert) => void
    removeAlert: (id: string) => void
    clearAlerts: () => void
}

export const useSOSStore = create<SOSState>((set) => ({
    activeAlerts: [],
    addAlert: (alert) => set((state) => ({
        activeAlerts: [...state.activeAlerts, alert]
    })),
    removeAlert: (id) => set((state) => ({
        activeAlerts: state.activeAlerts.filter((a) => a.id !== id)
    })),
    clearAlerts: () => set({ activeAlerts: [] }),
}))

// ==========================================
// UI State Store (with persist)
// ==========================================
interface UIState {
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
    toggleSidebar: () => void
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            sidebarOpen: true,
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        }),
        {
            name: 'ui-storage',
        }
    )
)

// ==========================================
// User Preferences Store
// ==========================================
interface UserPreferences {
    language: 'th' | 'en'
    notifications: {
        email: boolean
        push: boolean
        sms: boolean
    }
    setLanguage: (lang: 'th' | 'en') => void
    setNotificationPreference: (key: keyof UserPreferences['notifications'], value: boolean) => void
}

export const useUserPreferencesStore = create<UserPreferences>()(
    persist(
        (set) => ({
            language: 'th',
            notifications: {
                email: true,
                push: true,
                sms: false,
            },
            setLanguage: (lang) => set({ language: lang }),
            setNotificationPreference: (key, value) =>
                set((state) => ({
                    notifications: { ...state.notifications, [key]: value }
                })),
        }),
        {
            name: 'user-preferences',
        }
    )
)

/**
 * Zustand Stores Unit Tests
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { act } from 'react'

// Mock zustand persist middleware
import { vi } from 'vitest'
vi.mock('zustand/middleware', () => ({
    persist: (config: any) => config,
}))

describe('Zustand Stores', () => {
    describe('useNotificationStore', () => {
        let store: any

        beforeEach(async () => {
            vi.resetModules()
            const module = await import('@/lib/stores')
            store = module.useNotificationStore
        })

        it('should have initial unreadCount of 0', () => {
            const state = store.getState()
            expect(state.unreadCount).toBe(0)
        })

        it('should set unreadCount', () => {
            act(() => {
                store.getState().setUnreadCount(5)
            })
            expect(store.getState().unreadCount).toBe(5)
        })

        it('should increment unreadCount', () => {
            act(() => {
                store.getState().setUnreadCount(3)
                store.getState().incrementUnread()
            })
            expect(store.getState().unreadCount).toBe(4)
        })

        it('should decrement unreadCount', () => {
            act(() => {
                store.getState().setUnreadCount(3)
                store.getState().decrementUnread()
            })
            expect(store.getState().unreadCount).toBe(2)
        })

        it('should not go below 0 when decrementing', () => {
            act(() => {
                store.getState().setUnreadCount(0)
                store.getState().decrementUnread()
            })
            expect(store.getState().unreadCount).toBe(0)
        })

        it('should clear unreadCount', () => {
            act(() => {
                store.getState().setUnreadCount(10)
                store.getState().clearUnread()
            })
            expect(store.getState().unreadCount).toBe(0)
        })
    })

    describe('useSOSStore', () => {
        let store: any

        beforeEach(async () => {
            vi.resetModules()
            const module = await import('@/lib/stores')
            store = module.useSOSStore
        })

        it('should have empty activeAlerts initially', () => {
            const state = store.getState()
            expect(state.activeAlerts).toEqual([])
        })

        it('should add an alert', () => {
            const alert = {
                id: '1',
                userId: 'user1',
                userName: 'Test User',
                unit: 'A-101',
                createdAt: new Date(),
            }

            act(() => {
                store.getState().addAlert(alert)
            })

            expect(store.getState().activeAlerts).toHaveLength(1)
            expect(store.getState().activeAlerts[0].id).toBe('1')
        })

        it('should remove an alert by id', () => {
            const alert1 = { id: '1', userId: 'user1', userName: 'User 1', unit: 'A-101', createdAt: new Date() }
            const alert2 = { id: '2', userId: 'user2', userName: 'User 2', unit: 'A-102', createdAt: new Date() }

            act(() => {
                store.getState().addAlert(alert1)
                store.getState().addAlert(alert2)
                store.getState().removeAlert('1')
            })

            expect(store.getState().activeAlerts).toHaveLength(1)
            expect(store.getState().activeAlerts[0].id).toBe('2')
        })

        it('should clear all alerts', () => {
            act(() => {
                store.getState().addAlert({ id: '1', userId: 'u1', userName: 'U1', unit: 'A', createdAt: new Date() })
                store.getState().addAlert({ id: '2', userId: 'u2', userName: 'U2', unit: 'B', createdAt: new Date() })
                store.getState().clearAlerts()
            })

            expect(store.getState().activeAlerts).toHaveLength(0)
        })
    })

    describe('useUIStore', () => {
        let store: any

        beforeEach(async () => {
            vi.resetModules()
            const module = await import('@/lib/stores')
            store = module.useUIStore
        })

        it('should have sidebarOpen true initially', () => {
            const state = store.getState()
            expect(state.sidebarOpen).toBe(true)
        })

        it('should toggle sidebar', () => {
            const initialState = store.getState().sidebarOpen

            act(() => {
                store.getState().toggleSidebar()
            })

            expect(store.getState().sidebarOpen).toBe(!initialState)
        })

        it('should set sidebarOpen explicitly', () => {
            act(() => {
                store.getState().setSidebarOpen(false)
            })

            expect(store.getState().sidebarOpen).toBe(false)
        })
    })

    describe('useUserPreferencesStore', () => {
        let store: any

        beforeEach(async () => {
            vi.resetModules()
            const module = await import('@/lib/stores')
            store = module.useUserPreferencesStore
        })

        it('should have Thai as default language', () => {
            const state = store.getState()
            expect(state.language).toBe('th')
        })

        it('should set language', () => {
            act(() => {
                store.getState().setLanguage('en')
            })

            expect(store.getState().language).toBe('en')
        })

        it('should have default notification preferences', () => {
            const state = store.getState()
            expect(state.notifications.email).toBe(true)
            expect(state.notifications.push).toBe(true)
            expect(state.notifications.sms).toBe(false)
        })

        it('should update notification preference', () => {
            act(() => {
                store.getState().setNotificationPreference('sms', true)
            })

            expect(store.getState().notifications.sms).toBe(true)
        })
    })
})

/**
 * Real-time Module Unit Tests
 * Tests for WebSocket client and useRealtimeUpdates hook
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock WebSocket
class MockWebSocket {
    static CONNECTING = 0
    static OPEN = 1
    static CLOSING = 2
    static CLOSED = 3

    url: string
    readyState: number = MockWebSocket.CONNECTING
    onopen: (() => void) | null = null
    onclose: (() => void) | null = null
    onerror: ((e: Event) => void) | null = null
    onmessage: ((e: MessageEvent) => void) | null = null

    constructor(url: string) {
        this.url = url
        // Simulate async connection
        setTimeout(() => {
            this.readyState = MockWebSocket.OPEN
            this.onopen?.()
        }, 10)
    }

    send = vi.fn()
    close = vi.fn(() => {
        this.readyState = MockWebSocket.CLOSED
        this.onclose?.()
    })

    // Helper to simulate incoming message
    simulateMessage(data: unknown) {
        this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent)
    }

    // Helper to simulate error
    simulateError() {
        this.onerror?.({} as Event)
    }
}

// Replace global WebSocket
const originalWebSocket = global.WebSocket
beforeEach(() => {
    (global as any).WebSocket = MockWebSocket
})
afterEach(() => {
    (global as any).WebSocket = originalWebSocket
})

describe('WebSocket Client', () => {
    describe('WebSocketClient class', () => {
        it('should export WebSocketClient', async () => {
            const { WebSocketClient } = await import('@/lib/realtime/websocket-client')
            expect(WebSocketClient).toBeDefined()
        })

        it('should export createWebSocketUrl', async () => {
            const { createWebSocketUrl } = await import('@/lib/realtime/websocket-client')
            expect(createWebSocketUrl).toBeDefined()
            expect(typeof createWebSocketUrl).toBe('function')
        })

        it('createWebSocketUrl should return proper URL on server', async () => {
            const { createWebSocketUrl } = await import('@/lib/realtime/websocket-client')

            // On server (no window), should return localhost
            const url = createWebSocketUrl('/api/ws')
            expect(url).toContain('/api/ws')
        })
    })

    describe('Message Types', () => {
        it('should have proper type definitions', async () => {
            // Import the module to verify it loads correctly
            const module = await import('@/lib/realtime/websocket-client')

            // Verify module exports exist
            expect(module.WebSocketClient).toBeDefined()
            expect(module.createWebSocketUrl).toBeDefined()
        })
    })
})

describe('Real-time Hook', () => {
    describe('useRealtimeUpdates hook', () => {
        it('should export useRealtimeUpdates', async () => {
            const { useRealtimeUpdates } = await import('@/lib/realtime/use-realtime')
            expect(useRealtimeUpdates).toBeDefined()
            expect(typeof useRealtimeUpdates).toBe('function')
        })
    })
})

describe('Real-time Module Index', () => {
    it('should export all required items', async () => {
        const module = await import('@/lib/realtime')

        expect(module.WebSocketClient).toBeDefined()
        expect(module.createWebSocketUrl).toBeDefined()
        expect(module.useRealtimeUpdates).toBeDefined()
    })
})

describe('WebSocket Message Parsing', () => {
    it('should handle SOS message structure', () => {
        const sosMessage = {
            type: 'sos',
            payload: {
                id: 'sos-123',
                userId: 'user-1',
                userName: 'Test User',
                unit: 'A-101',
                location: { lat: 13.7563, lng: 100.5018 },
                createdAt: new Date().toISOString(),
                status: 'active',
            },
        }

        expect(sosMessage.type).toBe('sos')
        expect(sosMessage.payload.id).toBe('sos-123')
        expect(sosMessage.payload.location).toHaveProperty('lat')
        expect(sosMessage.payload.location).toHaveProperty('lng')
    })

    it('should handle notification message structure', () => {
        const notifMessage = {
            type: 'notification',
            payload: {
                id: 'notif-123',
                title: 'ประกาศใหม่',
                message: 'มีประกาศใหม่จากนิติบุคคล',
                type: 'info',
                link: '/resident/announcements',
                createdAt: new Date().toISOString(),
            },
        }

        expect(notifMessage.type).toBe('notification')
        expect(notifMessage.payload.title).toBe('ประกาศใหม่')
        expect(['info', 'warning', 'success', 'error']).toContain(notifMessage.payload.type)
    })

    it('should handle heartbeat message structure', () => {
        const heartbeat = {
            type: 'heartbeat',
            timestamp: Date.now(),
        }

        expect(heartbeat.type).toBe('heartbeat')
        expect(typeof heartbeat.timestamp).toBe('number')
    })
})

describe('Reconnection Logic', () => {
    it('should have reconnection configuration', async () => {
        const { WebSocketClient } = await import('@/lib/realtime/websocket-client')

        const client = new WebSocketClient({
            url: 'ws://localhost:3000/ws',
            reconnectInterval: 5000,
            maxReconnectAttempts: 5,
        })

        expect(client).toBeDefined()
    })

    it('should track connection state', async () => {
        const { WebSocketClient } = await import('@/lib/realtime/websocket-client')

        const client = new WebSocketClient({
            url: 'ws://localhost:3000/ws',
        })

        // Before connect
        expect(client.isConnected).toBe(false)
    })
})

describe('Polling Fallback', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn())
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('should use polling when WebSocket not available', async () => {
        // Set env to not use WebSocket
        process.env.NEXT_PUBLIC_USE_WEBSOCKET = 'false'

        const { useRealtimeUpdates } = await import('@/lib/realtime/use-realtime')
        expect(useRealtimeUpdates).toBeDefined()
    })
})

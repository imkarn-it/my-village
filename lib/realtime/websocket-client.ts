/**
 * WebSocket Client for Real-time Updates
 * Handles connection, reconnection, and message handling
 */

// Message types for type-safe communication
export interface SOSMessage {
    type: 'sos'
    payload: {
        id: string
        userId: string
        userName: string
        unit: string
        location?: { lat: number; lng: number }
        createdAt: string
        status: 'active' | 'resolved'
    }
}

export interface NotificationMessage {
    type: 'notification'
    payload: {
        id: string
        title: string
        message: string
        type: 'info' | 'warning' | 'success' | 'error'
        link?: string
        createdAt: string
    }
}

export interface HeartbeatMessage {
    type: 'heartbeat'
    timestamp: number
}

export type WebSocketMessage = SOSMessage | NotificationMessage | HeartbeatMessage

// WebSocket client options
export interface WebSocketClientOptions {
    url: string
    reconnectInterval?: number
    maxReconnectAttempts?: number
    heartbeatInterval?: number
    onMessage?: (message: WebSocketMessage) => void
    onConnect?: () => void
    onDisconnect?: () => void
    onError?: (error: Event) => void
}

// Default options
const DEFAULT_OPTIONS = {
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000,
}

/**
 * WebSocket client class with automatic reconnection
 */
export class WebSocketClient {
    private ws: WebSocket | null = null
    private options: Required<WebSocketClientOptions>
    private reconnectAttempts = 0
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null
    private heartbeatTimer: ReturnType<typeof setInterval> | null = null
    private isManualClose = false

    constructor(options: WebSocketClientOptions) {
        this.options = {
            ...DEFAULT_OPTIONS,
            onMessage: () => { },
            onConnect: () => { },
            onDisconnect: () => { },
            onError: () => { },
            ...options,
        }
    }

    /**
     * Connect to WebSocket server
     */
    connect(): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            return
        }

        this.isManualClose = false

        try {
            this.ws = new WebSocket(this.options.url)
            this.setupEventHandlers()
        } catch (error) {
            console.error('[WebSocket] Connection error:', error)
            this.scheduleReconnect()
        }
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void {
        this.isManualClose = true
        this.cleanup()

        if (this.ws) {
            this.ws.close()
            this.ws = null
        }
    }

    /**
     * Send a message to the server
     */
    send(data: unknown): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data))
        } else {
            console.warn('[WebSocket] Cannot send - not connected')
        }
    }

    /**
     * Get current connection state
     */
    get isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN
    }

    /**
     * Get ready state
     */
    get readyState(): number {
        return this.ws?.readyState ?? WebSocket.CLOSED
    }

    private setupEventHandlers(): void {
        if (!this.ws) return

        this.ws.onopen = () => {
            console.log('[WebSocket] Connected')
            this.reconnectAttempts = 0
            this.startHeartbeat()
            this.options.onConnect()
        }

        this.ws.onclose = () => {
            console.log('[WebSocket] Disconnected')
            this.cleanup()
            this.options.onDisconnect()

            if (!this.isManualClose) {
                this.scheduleReconnect()
            }
        }

        this.ws.onerror = (event) => {
            console.error('[WebSocket] Error:', event)
            this.options.onError(event)
        }

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as WebSocketMessage
                this.handleMessage(message)
            } catch (error) {
                console.error('[WebSocket] Failed to parse message:', error)
            }
        }
    }

    private handleMessage(message: WebSocketMessage): void {
        // Handle heartbeat internally
        if (message.type === 'heartbeat') {
            // Respond to server heartbeat
            this.send({ type: 'heartbeat', timestamp: Date.now() })
            return
        }

        // Pass other messages to handler
        this.options.onMessage(message)
    }

    private scheduleReconnect(): void {
        if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
            console.error('[WebSocket] Max reconnect attempts reached')
            return
        }

        this.reconnectAttempts++
        console.log(
            `[WebSocket] Reconnecting in ${this.options.reconnectInterval}ms (attempt ${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`
        )

        this.reconnectTimer = setTimeout(() => {
            this.connect()
        }, this.options.reconnectInterval)
    }

    private startHeartbeat(): void {
        this.heartbeatTimer = setInterval(() => {
            if (this.isConnected) {
                this.send({ type: 'heartbeat', timestamp: Date.now() })
            }
        }, this.options.heartbeatInterval)
    }

    private cleanup(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }

        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer)
            this.heartbeatTimer = null
        }
    }
}

/**
 * Create WebSocket URL from current location
 */
export function createWebSocketUrl(path: string): string {
    if (typeof window === 'undefined') {
        return `ws://localhost:3000${path}`
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}${path}`
}

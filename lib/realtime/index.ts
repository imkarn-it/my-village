/**
 * Real-time Updates Module
 * WebSocket client and React hooks for real-time SOS alerts and notifications
 */

// WebSocket client
export {
    WebSocketClient,
    createWebSocketUrl,
    type WebSocketMessage,
    type SOSMessage,
    type NotificationMessage,
    type HeartbeatMessage,
    type WebSocketClientOptions,
} from './websocket-client'

// React hooks
export { useRealtimeUpdates, type UseRealtimeOptions, type UseRealtimeReturn } from './use-realtime'

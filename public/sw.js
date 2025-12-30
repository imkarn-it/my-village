const CACHE_NAME = 'village-app-v1'
const STATIC_ASSETS = [
    '/',
    '/login',
    '/manifest.json',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS)
        })
    )
    // Activate immediately
    self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            )
        })
    )
    // Take control of all pages
    self.clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    const request = event.request

    // Skip non-GET requests
    if (request.method !== 'GET') return

    // Skip API requests (always fetch fresh)
    if (request.url.includes('/api/')) return

    // Skip external requests
    if (!request.url.startsWith(self.location.origin)) return

    event.respondWith(
        fetch(request)
            .then((response) => {
                // Clone response for caching
                const responseClone = response.clone()

                // Cache successful responses
                if (response.status === 200) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone)
                    })
                }

                return response
            })
            .catch(() => {
                // Fallback to cache
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse
                    }

                    // Return offline page for navigation requests
                    if (request.mode === 'navigate') {
                        return caches.match('/')
                    }

                    return new Response('Offline', { status: 503 })
                })
            })
    )
})

// Push notification event
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {}

    const options = {
        body: data.body || 'คุณมีการแจ้งเตือนใหม่',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: {
            url: data.url || '/',
        },
        actions: [
            { action: 'open', title: 'เปิดดู' },
            { action: 'close', title: 'ปิด' },
        ],
    }

    event.waitUntil(
        self.registration.showNotification(data.title || 'My Village', options)
    )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close()

    if (event.action === 'close') return

    const url = event.notification.data?.url || '/'

    event.waitUntil(
        self.clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Try to focus existing window
                for (const client of clientList) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus()
                    }
                }
                // Open new window
                return self.clients.openWindow(url)
            })
    )
})

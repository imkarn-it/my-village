import { treaty } from '@elysiajs/eden'
import type { App } from '@/app/api/[[...slugs]]/route'

/**
 * Eden Treaty client for type-safe API calls
 * Usage:
 * 
 * import { api } from '@/lib/api/client'
 * 
 * // GET request
 * const { data } = await api.announcements.get({ query: { projectId: 'xxx' } })
 * 
 * // POST request
 * const { data } = await api.announcements.post({ 
 *   projectId: 'xxx',
 *   title: 'New announcement',
 *   content: '...'
 * })
 */
export const client = treaty<App>(
    typeof window === 'undefined'
        ? 'http://localhost:3000'  // Server-side
        : window.location.origin     // Client-side
)

// Export API endpoints for easier access
export const { api } = client

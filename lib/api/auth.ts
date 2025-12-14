import { auth } from '@/lib/auth'
import type { Session } from 'next-auth'

export type AuthUser = {
    readonly id: string
    readonly email: string
    readonly name: string | null
    readonly role: string
    readonly projectId: string | null
    readonly unitId: string | null
}

/**
 * Gets current user session from Next.js Auth.js
 * @returns User object if authenticated, null otherwise
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    try {
        const session: Session | null = await auth()

        if (!session || !session.user) {
            return null
        }

        return {
            // @ts-ignore - Session type issue
            id: session.user.id as string,
            email: (session.user.email || '') as string,
            name: session.user.name ?? null,
            role: (session.user as any).role ?? 'resident',
            projectId: (session.user as any).projectId ?? null,
            unitId: (session.user as any).unitId ?? null,
        }
    } catch (error: unknown) {
        console.error('Auth error:', error)
        return null
    }
}

/**
 * Require authentication - throws error if not authenticated
 * Use in Elysia routes with .derive()
 * 
 * @example
 * ```ts
 * const app = new Elysia()
 *   .derive(async () => {
 *     const user = await requireAuth()
 *     return { user }
 *   })
 *   .get('/protected', ({ user }) => {
 *     return { message: `Hello ${user.email}` }
 *   })
 * ```
 */
export async function requireAuth(): Promise<AuthUser> {
    const user = await getCurrentUser()

    if (!user) {
        throw new Error('Unauthorized - Please login')
    }

    return user
}

/**
 * Optional auth - returns user or null without throwing
 * Use for public routes that need user data if available
 */
export async function optionalAuth(): Promise<AuthUser | null> {
    return await getCurrentUser()
}

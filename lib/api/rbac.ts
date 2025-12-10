import { status } from 'elysia'
import type { AuthUser } from './auth'

export type Role = 'resident' | 'admin' | 'security' | 'maintenance' | 'super_admin'

/**
 * Check if user has required role(s)
 * @throws Error with 403 status if user doesn't have required role
 * 
 * @example
 * ```ts
 * .post('/admin-only', ({ user, body }) => {
 *   requireRole(['admin', 'super_admin'])(user)
 *   // Only admin or super_admin can reach here
 * })
 * ```
 */
export function requireRole(allowedRoles: readonly Role[] | Role): (user: AuthUser) => void {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

    return (user: AuthUser): void => {
        if (!roles.includes(user.role as Role)) {
            throw status(403, `Forbidden - Requires role: ${roles.join(' or ')}`)
        }
    }
}

/**
 * Shortcut: Require admin or super_admin role
 */
export function requireAdmin(user: AuthUser): void {
    requireRole(['admin', 'super_admin'])(user)
}

/**
 * Shortcut: Require security, admin, or super_admin role
 */
export function requireSecurity(user: AuthUser): void {
    requireRole(['security', 'admin', 'super_admin'])(user)
}

/**
 * Shortcut: Require maintenance, admin, or super_admin role
 */
export function requireMaintenance(user: AuthUser): void {
    requireRole(['maintenance', 'admin', 'super_admin'])(user)
}

/**
 * Check if user belongs to the same project
 * Super admin can access all projects
 */
export function requireSameProject(user: AuthUser, resourceProjectId: string): void {
    if (user.role === 'super_admin') {
        return // Super admin bypass
    }

    if (user.projectId !== resourceProjectId) {
        throw status(403, 'Forbidden - Access denied to this project')
    }
}

/**
 * Check if user owns the resource (same unit)
 * Admin and super admin can access all units
 */
export function requireOwnership(user: AuthUser, resourceUnitId: string): void {
    if (user.role === 'admin' || user.role === 'super_admin') {
        return // Admin bypass
    }

    if (user.unitId !== resourceUnitId) {
        throw status(403, 'Forbidden - You can only access your own resources')
    }
}

/**
 * Check if user can modify resource
 * Only admins or the owner can modify
 */
export function canModify(user: AuthUser, resourceUserId: string): boolean {
    if (user.role === 'admin' || user.role === 'super_admin') {
        return true
    }

    return user.id === resourceUserId
}

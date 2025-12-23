/**
 * Audit Middleware for Elysia
 * Integrates AuditService with API routes
 */
import { auditService, type AuditAction } from '@/lib/services/audit.service'

interface AuditContext {
    userId?: string
    action: AuditAction
    entityType: string
    entityId: string
    oldValues?: Record<string, unknown>
    newValues?: Record<string, unknown>
    ipAddress?: string
    userAgent?: string
    requestId?: string
}

/**
 * Log an audit event after a successful API operation
 */
export async function logAudit(context: AuditContext): Promise<void> {
    try {
        await auditService.log({
            action: context.action,
            entityType: context.entityType,
            entityId: context.entityId,
            userId: context.userId || undefined,
            oldValues: context.oldValues,
            newValues: context.newValues,
            context: {
                ipAddress: context.ipAddress,
                userAgent: context.userAgent,
                requestId: context.requestId,
            },
        })
    } catch (error) {
        // Don't throw - audit logging should not break the main operation
        console.error('Audit logging failed:', error)
    }
}

/**
 * Extract request metadata for audit logging
 */
export function getRequestMeta(request: Request): {
    ipAddress: string | undefined
    userAgent: string | undefined
    requestId: string
} {
    return {
        ipAddress: request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            undefined,
        userAgent: request.headers.get('user-agent') || undefined,
        requestId: request.headers.get('x-request-id') || crypto.randomUUID(),
    }
}

/**
 * Audit helper for CREATE operations
 */
export async function auditCreate(
    request: Request,
    userId: string | undefined,
    entityType: string,
    entityId: string,
    newValues: Record<string, unknown>
): Promise<void> {
    const meta = getRequestMeta(request)
    await logAudit({
        action: 'CREATE',
        entityType,
        entityId,
        userId,
        newValues,
        ...meta,
    })
}

/**
 * Audit helper for UPDATE operations
 */
export async function auditUpdate(
    request: Request,
    userId: string | undefined,
    entityType: string,
    entityId: string,
    oldValues: Record<string, unknown>,
    newValues: Record<string, unknown>
): Promise<void> {
    const meta = getRequestMeta(request)
    await logAudit({
        action: 'UPDATE',
        entityType,
        entityId,
        userId,
        oldValues,
        newValues,
        ...meta,
    })
}

/**
 * Audit helper for DELETE operations
 */
export async function auditDelete(
    request: Request,
    userId: string | undefined,
    entityType: string,
    entityId: string,
    deletedData: Record<string, unknown>
): Promise<void> {
    const meta = getRequestMeta(request)
    await logAudit({
        action: 'DELETE',
        entityType,
        entityId,
        userId,
        oldValues: deletedData,
        ...meta,
    })
}

/**
 * Audit helper for LOGIN events
 */
export async function auditLogin(
    request: Request,
    userId: string,
    success: boolean,
    email: string
): Promise<void> {
    const meta = getRequestMeta(request)
    await logAudit({
        action: 'LOGIN',
        entityType: 'users',
        entityId: userId,
        userId,
        newValues: { email, success, timestamp: new Date().toISOString() },
        ...meta,
    })
}

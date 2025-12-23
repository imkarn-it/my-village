import { db } from '@/lib/db'
import { auditLogs, users, type NewAuditLog } from '@/lib/db/schema'
import { eq, desc, and, gte, lte } from 'drizzle-orm'

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'LOGIN' | 'LOGOUT' | 'ACCESS' | 'EXPORT'

export type AuditLogParams = {
    userId?: string
    userEmail?: string
    userRole?: string
    action: AuditAction
    entityType: string
    entityId: string
    oldValues?: Record<string, unknown>
    newValues?: Record<string, unknown>
    context?: {
        ipAddress?: string
        userAgent?: string
        requestId?: string
    }
}

export type AuditFilters = {
    entityType?: string
    entityId?: string
    userId?: string
    action?: AuditAction
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
}

/**
 * AuditService - บริการเก็บ Log การเปลี่ยนแปลงข้อมูล
 */
export class AuditService {
    /**
     * บันทึก Audit Log
     */
    async log(params: AuditLogParams): Promise<void> {
        const changedFields = this.getChangedFields(params.oldValues, params.newValues)

        await db.insert(auditLogs).values({
            userId: params.userId,
            userEmail: params.userEmail,
            userRole: params.userRole,
            action: params.action,
            entityType: params.entityType,
            entityId: params.entityId,
            oldValues: params.oldValues,
            newValues: params.newValues,
            changedFields,
            ipAddress: params.context?.ipAddress,
            userAgent: params.context?.userAgent,
            requestId: params.context?.requestId,
        })
    }

    /**
     * ดึง Logs ของ Entity เฉพาะ
     */
    async getLogsForEntity(entityType: string, entityId: string, limit = 50) {
        return db
            .select()
            .from(auditLogs)
            .where(
                and(
                    eq(auditLogs.entityType, entityType),
                    eq(auditLogs.entityId, entityId)
                )
            )
            .orderBy(desc(auditLogs.createdAt))
            .limit(limit)
    }

    /**
     * ดึง Logs ของ User
     */
    async getLogsByUser(userId: string, limit = 50) {
        return db
            .select()
            .from(auditLogs)
            .where(eq(auditLogs.userId, userId))
            .orderBy(desc(auditLogs.createdAt))
            .limit(limit)
    }

    /**
     * ค้นหา Logs ด้วย Filters
     */
    async searchLogs(filters: AuditFilters) {
        const conditions = []

        if (filters.entityType) {
            conditions.push(eq(auditLogs.entityType, filters.entityType))
        }
        if (filters.entityId) {
            conditions.push(eq(auditLogs.entityId, filters.entityId))
        }
        if (filters.userId) {
            conditions.push(eq(auditLogs.userId, filters.userId))
        }
        if (filters.action) {
            conditions.push(eq(auditLogs.action, filters.action))
        }
        if (filters.startDate) {
            conditions.push(gte(auditLogs.createdAt, filters.startDate))
        }
        if (filters.endDate) {
            conditions.push(lte(auditLogs.createdAt, filters.endDate))
        }

        const query = db
            .select({
                log: auditLogs,
                user: {
                    id: users.id,
                    name: users.name,
                    email: users.email,
                },
            })
            .from(auditLogs)
            .leftJoin(users, eq(auditLogs.userId, users.id))
            .orderBy(desc(auditLogs.createdAt))
            .limit(filters.limit ?? 100)
            .offset(filters.offset ?? 0)

        if (conditions.length > 0) {
            return query.where(and(...conditions))
        }

        return query
    }

    /**
     * หา fields ที่เปลี่ยนแปลง
     */
    private getChangedFields(
        oldValues?: Record<string, unknown>,
        newValues?: Record<string, unknown>
    ): string[] | null {
        if (!oldValues || !newValues) return null

        const changedFields: string[] = []
        const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)])

        for (const key of allKeys) {
            if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
                changedFields.push(key)
            }
        }

        return changedFields.length > 0 ? changedFields : null
    }
}

// Singleton instance
export const auditService = new AuditService()

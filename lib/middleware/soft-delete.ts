/**
 * Soft Delete Utilities
 * Provides helpers for soft delete and restore operations
 */
import { db } from '@/lib/db'
import {
    users, projects, announcements, visitors, parcels,
    bills, maintenanceRequests, facilities, bookings, supportTickets
} from '@/lib/db/schema'
import { eq, isNull, isNotNull, and } from 'drizzle-orm'
import type { PgTable } from 'drizzle-orm/pg-core'

// Table mapping for soft delete operations
export const softDeleteTables = {
    users,
    projects,
    announcements,
    visitors,
    parcels,
    bills,
    maintenanceRequests,
    facilities,
    bookings,
    supportTickets,
} as const

export type SoftDeleteTable = keyof typeof softDeleteTables

/**
 * Soft delete a record by setting deletedAt and deletedBy
 */
export async function softDelete<T extends SoftDeleteTable>(
    tableName: T,
    id: string,
    deletedBy: string | null
): Promise<{ success: boolean; error?: string }> {
    try {
        const table = softDeleteTables[tableName] as PgTable<any>

        await db.update(table as any)
            .set({
                deletedAt: new Date(),
                deletedBy: deletedBy,
            })
            .where(eq((table as any).id, id))

        return { success: true }
    } catch (error) {
        console.error(`Soft delete failed for ${tableName}:`, error)
        return { success: false, error: 'Failed to delete record' }
    }
}

/**
 * Restore a soft-deleted record
 */
export async function restoreDeleted<T extends SoftDeleteTable>(
    tableName: T,
    id: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const table = softDeleteTables[tableName] as PgTable<any>

        await db.update(table as any)
            .set({
                deletedAt: null,
                deletedBy: null,
            })
            .where(eq((table as any).id, id))

        return { success: true }
    } catch (error) {
        console.error(`Restore failed for ${tableName}:`, error)
        return { success: false, error: 'Failed to restore record' }
    }
}

/**
 * Hard delete a record permanently
 * Use with caution - this cannot be undone
 */
export async function hardDelete<T extends SoftDeleteTable>(
    tableName: T,
    id: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const table = softDeleteTables[tableName] as PgTable<any>

        await db.delete(table as any)
            .where(eq((table as any).id, id))

        return { success: true }
    } catch (error) {
        console.error(`Hard delete failed for ${tableName}:`, error)
        return { success: false, error: 'Failed to delete record permanently' }
    }
}

/**
 * Check if a record is soft-deleted
 */
export async function isDeleted<T extends SoftDeleteTable>(
    tableName: T,
    id: string
): Promise<boolean> {
    try {
        const table = softDeleteTables[tableName] as PgTable<any>

        const result = await db.select({ deletedAt: (table as any).deletedAt })
            .from(table as any)
            .where(eq((table as any).id, id))
            .limit(1)

        return result.length > 0 && result[0].deletedAt !== null
    } catch (error) {
        console.error(`Check deleted failed for ${tableName}:`, error)
        return false
    }
}

/**
 * Create a where clause to exclude soft-deleted records
 */
export function excludeDeleted(table: any) {
    return isNull(table.deletedAt)
}

/**
 * Create a where clause to include only soft-deleted records
 */
export function onlyDeleted(table: any) {
    return isNotNull(table.deletedAt)
}

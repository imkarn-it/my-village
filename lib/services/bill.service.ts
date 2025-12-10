import { db } from '@/lib/db'
import { bills } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { status } from 'elysia'

export type CreateBillInput = {
    unitId: string
    billType: string
    amount: string
    dueDate?: string
    status?: string
}

export type UpdateBillInput = {
    status?: string
    paidAt?: string
    paymentRef?: string
}

/**
 * Service layer for Bills
 * Handles billing business logic
 */
export abstract class BillService {
    /**
     * Get all bills for a unit
     */
    static async getAll(unitId?: string, limit: number = 50) {
        return await db.query.bills.findMany({
            where: unitId ? eq(bills.unitId, unitId) : undefined,
            orderBy: desc(bills.createdAt),
            limit,
        })
    }

    /**
     * Get bill by ID
     */
    static async getById(id: string) {
        const result = await db.query.bills.findFirst({
            where: eq(bills.id, id),
        })

        if (!result) {
            throw status(404, 'Bill not found')
        }

        return result
    }

    /**
     * Create new bill
     */
    static async create(data: CreateBillInput) {
        const [result] = await db.insert(bills)
            .values({
                ...data,
                status: data.status ?? 'pending',
            })
            .returning()

        return result
    }

    /**
     * Update bill (usually for payment)
     */
    static async update(id: string, data: UpdateBillInput) {
        const updateData: any = { ...data }

        // Convert paidAt string to Date if provided
        if (data.paidAt) {
            updateData.paidAt = new Date(data.paidAt)
        }

        const [result] = await db.update(bills)
            .set(updateData)
            .where(eq(bills.id, id))
            .returning()

        if (!result) {
            throw status(404, 'Bill not found')
        }

        return result
    }

    /**
     * Mark bill as paid
     */
    static async markAsPaid(id: string, paymentRef: string) {
        return await this.update(id, {
            status: 'paid',
            paidAt: new Date().toISOString(),
            paymentRef,
        })
    }

    /**
     * Get pending bills for a unit
     */
    static async getPending(unitId: string) {
        return await db.query.bills.findMany({
            where: eq(bills.unitId, unitId),
            orderBy: desc(bills.dueDate),
        }).then(results => results.filter(b => b.status === 'pending'))
    }

    /**
     * Get total amount due for a unit
     */
    static async getTotalDue(unitId: string) {
        const pending = await this.getPending(unitId)
        return pending.reduce((sum, bill) => {
            return sum + parseFloat(bill.amount)
        }, 0)
    }
}

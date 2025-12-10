import { db } from '@/lib/db'
import { bookings } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { status } from 'elysia'

export type CreateBookingInput = {
    facilityId: string
    unitId: string
    userId: string
    bookingDate: string
    startTime: string
    endTime: string
}

/**
 * Service layer for Bookings
 */
export abstract class BookingService {
    static async getAll(facilityId?: string, unitId?: string, limit: number = 50) {
        let whereConditions = undefined

        if (facilityId && unitId) {
            whereConditions = and(
                eq(bookings.facilityId, facilityId),
                eq(bookings.unitId, unitId)
            )
        } else if (facilityId) {
            whereConditions = eq(bookings.facilityId, facilityId)
        } else if (unitId) {
            whereConditions = eq(bookings.unitId, unitId)
        }

        return await db.query.bookings.findMany({
            where: whereConditions,
            orderBy: desc(bookings.createdAt),
            limit,
        })
    }

    static async getById(id: string) {
        const result = await db.query.bookings.findFirst({
            where: eq(bookings.id, id),
        })

        if (!result) {
            throw status(404, 'Booking not found')
        }

        return result
    }

    static async create(data: CreateBookingInput) {
        // Check for conflicts
        const hasConflict = await this.checkConflict(
            data.facilityId,
            data.bookingDate,
            data.startTime,
            data.endTime
        )

        if (hasConflict) {
            throw status(409, 'Time slot already booked')
        }

        const [result] = await db.insert(bookings)
            .values({
                ...data,
                status: 'pending',
            })
            .returning()

        return result
    }

    static async checkConflict(
        facilityId: string,
        date: string,
        startTime: string,
        endTime: string
    ): Promise<boolean> {
        const existing = await db.query.bookings.findMany({
            where: and(
                eq(bookings.facilityId, facilityId),
                eq(bookings.bookingDate, date)
            ),
        })

        // Simple time overlap check
        return existing.some(booking => {
            return !(endTime <= booking.startTime || startTime >= booking.endTime)
        })
    }

    static async approve(id: string) {
        const [result] = await db.update(bookings)
            .set({ status: 'approved' })
            .where(eq(bookings.id, id))
            .returning()

        if (!result) {
            throw status(404, 'Booking not found')
        }

        return result
    }

    static async cancel(id: string) {
        const [result] = await db.update(bookings)
            .set({ status: 'cancelled' })
            .where(eq(bookings.id, id))
            .returning()

        if (!result) {
            throw status(404, 'Booking not found')
        }

        return result
    }
}

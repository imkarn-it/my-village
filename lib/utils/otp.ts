/**
 * OTP (One-Time Password) Utility
 * Used for email/phone verification
 */

import { randomInt } from 'crypto'
import { db } from '@/lib/db'
import { passwordResetTokens } from '@/lib/db/schema'
import { eq, and, gt, lt } from 'drizzle-orm'

const OTP_LENGTH = 6
const OTP_EXPIRY_MINUTES = 10

/**
 * Generate a random OTP code
 */
export function generateOTP(): string {
    const min = Math.pow(10, OTP_LENGTH - 1)
    const max = Math.pow(10, OTP_LENGTH) - 1
    return randomInt(min, max).toString()
}

/**
 * Create and store OTP for a user
 */
export async function createOTP(email: string): Promise<{ otp: string; expiresAt: Date }> {
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

    // Delete any existing OTPs for this email
    await db.delete(passwordResetTokens)
        .where(eq(passwordResetTokens.email, email))

    // Create new OTP record
    await db.insert(passwordResetTokens).values({
        token: otp,
        email,
        expiresAt,
    })

    return { otp, expiresAt }
}

/**
 * Verify OTP for a user
 */
export async function verifyOTP(email: string, otp: string): Promise<boolean> {
    const record = await db.query.passwordResetTokens.findFirst({
        where: and(
            eq(passwordResetTokens.email, email),
            eq(passwordResetTokens.token, otp),
            gt(passwordResetTokens.expiresAt, new Date())
        ),
    })

    if (!record) {
        return false
    }

    // Delete the OTP after successful verification
    await db.delete(passwordResetTokens)
        .where(eq(passwordResetTokens.id, record.id))

    return true
}

/**
 * Delete expired OTPs (cleanup)
 */
export async function cleanupExpiredOTPs(): Promise<number> {
    const now = new Date()
    // lt = less than: delete where expiresAt < now (i.e., expired)
    const result = await db.delete(passwordResetTokens)
        .where(lt(passwordResetTokens.expiresAt, now))
        .returning()

    return result.length
}

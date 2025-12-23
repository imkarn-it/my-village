import { Elysia, t } from 'elysia'
import { db } from '@/lib/db'
import { users, passwordResetTokens } from '@/lib/db/schema'
import { eq, and, gt } from 'drizzle-orm'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'

const authApi = new Elysia({ prefix: '/auth' })
    // Forgot Password - Request reset link
    .post('/forgot-password', async ({ body }) => {
        const { email } = body

        // Find user
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        })

        // Always return success (don't reveal if email exists)
        if (!user) {
            return { success: true, message: 'หากอีเมลถูกต้อง คุณจะได้รับลิงก์สำหรับรีเซ็ตรหัสผ่าน' }
        }

        // Generate token
        const token = randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        // Save token
        await db.insert(passwordResetTokens).values({
            email,
            token,
            expiresAt,
        })

        // In production, send email here
        // For now, log the reset link (simulation)
        console.log(`[Password Reset] Token for ${email}: ${token}`)
        console.log(`[Password Reset] Link: /reset-password?token=${token}`)

        return {
            success: true,
            message: 'หากอีเมลถูกต้อง คุณจะได้รับลิงก์สำหรับรีเซ็ตรหัสผ่าน',
            // DEV ONLY: Return token for testing
            ...(process.env.NODE_ENV === 'development' && { token })
        }
    }, {
        body: t.Object({
            email: t.String({ format: 'email' })
        }),
        detail: { tags: ['auth'], summary: 'Request password reset' }
    })

    // Verify Reset Token
    .get('/verify-reset-token', async ({ query }) => {
        const { token } = query

        if (!token) {
            return { valid: false }
        }

        const resetToken = await db.query.passwordResetTokens.findFirst({
            where: and(
                eq(passwordResetTokens.token, token),
                gt(passwordResetTokens.expiresAt, new Date())
            )
        })

        if (!resetToken || resetToken.usedAt) {
            return { valid: false }
        }

        return { valid: true }
    }, {
        query: t.Object({
            token: t.String()
        }),
        detail: { tags: ['auth'], summary: 'Verify password reset token' }
    })

    // Reset Password
    .post('/reset-password', async ({ body }) => {
        const { token, password } = body

        // Find valid token
        const resetToken = await db.query.passwordResetTokens.findFirst({
            where: and(
                eq(passwordResetTokens.token, token),
                gt(passwordResetTokens.expiresAt, new Date())
            )
        })

        if (!resetToken || resetToken.usedAt) {
            return { success: false, error: 'ลิงก์หมดอายุหรือไม่ถูกต้อง' }
        }

        // Find user
        const user = await db.query.users.findFirst({
            where: eq(users.email, resetToken.email)
        })

        if (!user) {
            return { success: false, error: 'ไม่พบผู้ใช้งาน' }
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Update password
        await db.update(users)
            .set({ password: hashedPassword, updatedAt: new Date() })
            .where(eq(users.id, user.id))

        // Mark token as used
        await db.update(passwordResetTokens)
            .set({ usedAt: new Date() })
            .where(eq(passwordResetTokens.id, resetToken.id))

        return { success: true, message: 'รีเซ็ตรหัสผ่านสำเร็จ' }
    }, {
        body: t.Object({
            token: t.String(),
            password: t.String({ minLength: 6 })
        }),
        detail: { tags: ['auth'], summary: 'Reset password with token' }
    })

export default authApi

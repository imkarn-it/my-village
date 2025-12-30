/**
 * Email Service - Gmail SMTP via Nodemailer
 */
import nodemailer from 'nodemailer'

// Email configuration from environment
const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
}

const from = process.env.SMTP_FROM || 'My Village <noreply@myvillage.com>'

// Create reusable transporter
const transporter = nodemailer.createTransport(config)

// Email templates
type EmailTemplate = {
    subject: string
    html: string
    text?: string
}

// Template functions
export const emailTemplates = {
    paymentVerified: (data: {
        name: string
        billId: string
        amount: number
        verifiedAt: Date
    }): EmailTemplate => ({
        subject: '✅ ชำระเงินสำเร็จ - My Village',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #10b981;">✅ ยืนยันการชำระเงินเรียบร้อย</h2>
                <p>สวัสดีคุณ ${data.name},</p>
                <p>เราได้รับการชำระเงินของคุณเรียบร้อยแล้ว</p>
                <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>หมายเลขบิล:</strong> ${data.billId}</p>
                    <p><strong>จำนวนเงิน:</strong> ฿${data.amount.toLocaleString()}</p>
                    <p><strong>ตรวจสอบเมื่อ:</strong> ${data.verifiedAt.toLocaleString('th-TH')}</p>
                </div>
                <p>ขอบคุณที่ใช้บริการ</p>
                <p style="color: #6b7280;">My Village Team</p>
            </div>
        `,
        text: `ยืนยันการชำระเงินเรียบร้อย\n\nสวัสดีคุณ ${data.name},\nหมายเลขบิล: ${data.billId}\nจำนวนเงิน: ฿${data.amount.toLocaleString()}\n\nขอบคุณที่ใช้บริการ`,
    }),

    supportReply: (data: {
        name: string
        ticketId: string
        ticketTitle: string
        reply: string
        repliedBy: string
    }): EmailTemplate => ({
        subject: `💬 ตอบกลับ Ticket #${data.ticketId} - My Village`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3b82f6;">💬 มีการตอบกลับ Ticket ของคุณ</h2>
                <p>สวัสดีคุณ ${data.name},</p>
                <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>Ticket:</strong> ${data.ticketTitle}</p>
                    <p><strong>ตอบกลับโดย:</strong> ${data.repliedBy}</p>
                </div>
                <div style="background: #e0f2fe; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #3b82f6;">
                    <p>${data.reply}</p>
                </div>
                <p style="color: #6b7280;">My Village Team</p>
            </div>
        `,
    }),

    bookingApproved: (data: {
        name: string
        facilityName: string
        date: string
        time: string
        bookingId: string
    }): EmailTemplate => ({
        subject: '✅ การจองได้รับการอนุมัติ - My Village',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #10b981;">✅ การจองได้รับการอนุมัติแล้ว</h2>
                <p>สวัสดีคุณ ${data.name},</p>
                <p>การจองของคุณได้รับการอนุมัติเรียบร้อยแล้ว</p>
                <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>สถานที่:</strong> ${data.facilityName}</p>
                    <p><strong>วันที่:</strong> ${data.date}</p>
                    <p><strong>เวลา:</strong> ${data.time}</p>
                    <p><strong>หมายเลขการจอง:</strong> ${data.bookingId}</p>
                </div>
                <p style="color: #6b7280;">My Village Team</p>
            </div>
        `,
    }),

    billCreated: (data: {
        name: string
        billId: string
        amount: number
        dueDate: string
        description: string
    }): EmailTemplate => ({
        subject: '📄 มีบิลใหม่รอชำระ - My Village',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #f59e0b;">📄 มีบิลใหม่รอชำระ</h2>
                <p>สวัสดีคุณ ${data.name},</p>
                <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>รายการ:</strong> ${data.description}</p>
                    <p><strong>จำนวนเงิน:</strong> ฿${data.amount.toLocaleString()}</p>
                    <p><strong>กำหนดชำระ:</strong> ${data.dueDate}</p>
                    <p><strong>หมายเลขบิล:</strong> ${data.billId}</p>
                </div>
                <p><a href="${process.env.NEXTAUTH_URL}/resident/bills/${data.billId}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">ชำระเงินเลย</a></p>
                <p style="color: #6b7280;">My Village Team</p>
            </div>
        `,
    }),

    passwordReset: (data: {
        name: string
        resetUrl: string
    }): EmailTemplate => ({
        subject: '🔐 รีเซ็ตรหัสผ่าน - My Village',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #8b5cf6;">🔐 รีเซ็ตรหัสผ่าน</h2>
                <p>สวัสดีคุณ ${data.name},</p>
                <p>เราได้รับคำขอรีเซ็ตรหัสผ่านของคุณ คลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
                <p><a href="${data.resetUrl}" style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">รีเซ็ตรหัสผ่าน</a></p>
                <p style="color: #6b7280; font-size: 14px;">ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>
                <p style="color: #6b7280; font-size: 14px;">หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยอีเมลนี้</p>
            </div>
        `,
    }),

    otp: (data: {
        name: string
        otp: string
        expiryMinutes?: number
    }): EmailTemplate => ({
        subject: '🔑 รหัส OTP ของคุณ - My Village',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3b82f6;">🔑 รหัสยืนยันตัวตน</h2>
                <p>สวัสดีคุณ ${data.name},</p>
                <p>รหัส OTP สำหรับยืนยันตัวตนของคุณคือ:</p>
                <div style="background: #f3f4f6; padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${data.otp}</span>
                </div>
                <p style="color: #6b7280; font-size: 14px;">รหัสนี้จะหมดอายุใน ${data.expiryMinutes || 10} นาที</p>
                <p style="color: #6b7280; font-size: 14px;">หากคุณไม่ได้ขอรหัสนี้ กรุณาเพิกเฉยอีเมลนี้</p>
                <p style="color: #6b7280;">My Village Team</p>
            </div>
        `,
        text: `รหัส OTP ของคุณคือ: ${data.otp}\n\nรหัสนี้จะหมดอายุใน ${data.expiryMinutes || 10} นาที`,
    }),
}

// Email sending function
export async function sendEmail(
    to: string | string[],
    template: EmailTemplate
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        // Check if SMTP is configured
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log('[Email] SMTP not configured, skipping email send')
            return { success: true, messageId: 'skipped' }
        }

        const result = await transporter.sendMail({
            from,
            to: Array.isArray(to) ? to.join(', ') : to,
            subject: template.subject,
            html: template.html,
            text: template.text,
        })

        console.log(`[Email] Sent to ${to}: ${result.messageId}`)
        return { success: true, messageId: result.messageId }
    } catch (error) {
        console.error('[Email] Error sending email:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

// Convenience functions
export const emailService = {
    sendPaymentVerified: (to: string, data: Parameters<typeof emailTemplates.paymentVerified>[0]) =>
        sendEmail(to, emailTemplates.paymentVerified(data)),

    sendSupportReply: (to: string, data: Parameters<typeof emailTemplates.supportReply>[0]) =>
        sendEmail(to, emailTemplates.supportReply(data)),

    sendBookingApproved: (to: string, data: Parameters<typeof emailTemplates.bookingApproved>[0]) =>
        sendEmail(to, emailTemplates.bookingApproved(data)),

    sendBillCreated: (to: string, data: Parameters<typeof emailTemplates.billCreated>[0]) =>
        sendEmail(to, emailTemplates.billCreated(data)),

    sendPasswordReset: (to: string, data: Parameters<typeof emailTemplates.passwordReset>[0]) =>
        sendEmail(to, emailTemplates.passwordReset(data)),

    // Test email
    sendTest: (to: string) =>
        sendEmail(to, {
            subject: '🧪 ทดสอบอีเมล - My Village',
            html: '<h1>ทดสอบอีเมลสำเร็จ!</h1><p>ระบบส่งอีเมลทำงานถูกต้อง</p>',
        }),
}

export default emailService

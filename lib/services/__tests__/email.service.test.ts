import { describe, test, expect } from 'vitest'
import { emailTemplates, emailService } from '../email.service'

describe('Email Service', () => {
    describe('emailTemplates', () => {
        test('paymentVerified template should have correct structure', () => {
            const template = emailTemplates.paymentVerified({
                name: 'Test User',
                billId: 'BILL-001',
                amount: 5000,
                verifiedAt: new Date('2025-12-24'),
            })

            expect(template.subject).toContain('ชำระเงินสำเร็จ')
            expect(template.html).toContain('Test User')
            expect(template.html).toContain('BILL-001')
            expect(template.html).toContain('5,000')
        })

        test('supportReply template should have correct structure', () => {
            const template = emailTemplates.supportReply({
                name: 'Test User',
                ticketId: 'TKT-001',
                ticketTitle: 'Test Ticket',
                reply: 'Test reply content',
                repliedBy: 'Admin',
            })

            expect(template.subject).toContain('TKT-001')
            expect(template.html).toContain('Test Ticket')
            expect(template.html).toContain('Test reply content')
            expect(template.html).toContain('Admin')
        })

        test('bookingApproved template should have correct structure', () => {
            const template = emailTemplates.bookingApproved({
                name: 'Test User',
                facilityName: 'สระว่ายน้ำ',
                date: '25 ธ.ค. 2567',
                time: '14:00 - 16:00',
                bookingId: 'BK-001',
            })

            expect(template.subject).toContain('อนุมัติ')
            expect(template.html).toContain('สระว่ายน้ำ')
            expect(template.html).toContain('BK-001')
        })

        test('billCreated template should have correct structure', () => {
            const template = emailTemplates.billCreated({
                name: 'Test User',
                billId: 'BILL-002',
                amount: 3500,
                dueDate: '31 ธ.ค. 2567',
                description: 'ค่าส่วนกลาง',
            })

            expect(template.subject).toContain('บิลใหม่')
            expect(template.html).toContain('ค่าส่วนกลาง')
            expect(template.html).toContain('3,500')
        })

        test('passwordReset template should have correct structure', () => {
            const template = emailTemplates.passwordReset({
                name: 'Test User',
                resetUrl: 'https://example.com/reset?token=abc123',
            })

            expect(template.subject).toContain('รีเซ็ตรหัสผ่าน')
            expect(template.html).toContain('Test User')
            expect(template.html).toContain('https://example.com/reset?token=abc123')
        })
    })

    describe('emailService convenience functions', () => {
        test('should have all convenience methods', () => {
            expect(typeof emailService.sendPaymentVerified).toBe('function')
            expect(typeof emailService.sendSupportReply).toBe('function')
            expect(typeof emailService.sendBookingApproved).toBe('function')
            expect(typeof emailService.sendBillCreated).toBe('function')
            expect(typeof emailService.sendPasswordReset).toBe('function')
            expect(typeof emailService.sendTest).toBe('function')
        })
    })

    describe('sendEmail function', () => {
        test('should export sendEmail function', async () => {
            const { sendEmail } = await import('../email.service')
            expect(typeof sendEmail).toBe('function')
        })
    })
})

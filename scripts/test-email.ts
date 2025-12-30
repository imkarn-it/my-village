/**
 * Test script to send email using configured SMTP
 * Run: bun run scripts/test-email.ts
 */
import emailService from '../lib/services/email.service'

async function testEmail() {
    console.log('Testing email service...')
    console.log('SMTP_USER:', process.env.SMTP_USER ? '✅ Configured' : '❌ Not set')
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✅ Configured' : '❌ Not set')

    const result = await emailService.sendTest('zkarnitthinarakul@gmail.com')

    if (result.success) {
        console.log('✅ Email sent successfully!')
        console.log('Message ID:', result.messageId)
    } else {
        console.log('❌ Email failed:', result.error)
    }
}

testEmail().catch(console.error)

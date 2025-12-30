import { describe, test, expect, vi } from 'vitest'
import { generateOTP } from '../otp'

describe('OTP Utility', () => {
    describe('generateOTP', () => {
        test('should generate a 6-digit OTP', () => {
            const otp = generateOTP()
            expect(otp).toMatch(/^\d{6}$/)
        })

        test('should generate different OTPs each time', () => {
            const otps = new Set<string>()
            for (let i = 0; i < 10; i++) {
                otps.add(generateOTP())
            }
            // Most should be unique (allow for rare collisions)
            expect(otps.size).toBeGreaterThan(5)
        })

        test('should only contain digits', () => {
            for (let i = 0; i < 10; i++) {
                const otp = generateOTP()
                expect(/^\d+$/.test(otp)).toBe(true)
            }
        })

        test('should not start with zero', () => {
            // OTP should be a valid 6-digit number
            for (let i = 0; i < 20; i++) {
                const otp = generateOTP()
                expect(parseInt(otp, 10)).toBeGreaterThanOrEqual(100000)
                expect(parseInt(otp, 10)).toBeLessThanOrEqual(999999)
            }
        })
    })
})

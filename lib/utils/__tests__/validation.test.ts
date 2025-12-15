import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePhone,
  validateIdCard,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateDateRange,
  validatePassword,
} from '../validation'

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.th')).toBe(true)
      expect(validateEmail('admin+tag@company.com')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test @example.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
      expect(validateEmail(null)).toBe(false)
      expect(validateEmail(undefined)).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('should validate Thai mobile numbers', () => {
      expect(validatePhone('0812345678')).toBe(true)
      expect(validatePhone('0923456789')).toBe(true)
      expect(validatePhone('0634567890')).toBe(true)
    })

    it('should validate Thai landline numbers', () => {
      expect(validatePhone('021234567')).toBe(true)
      expect(validatePhone('032345678')).toBe(true)
    })

    it('should validate international format', () => {
      expect(validatePhone('66812345678')).toBe(true)
    })

    it('should accept phone numbers with formatting', () => {
      expect(validatePhone('08-1234-5678')).toBe(true)
      expect(validatePhone('(02) 123-4567')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('0112345678')).toBe(false) // Invalid prefix
      expect(validatePhone('')).toBe(false)
      expect(validatePhone(null)).toBe(false)
      expect(validatePhone(undefined)).toBe(false)
    })
  })

  describe('validateIdCard', () => {
    it('should validate correct 13-digit Thai ID cards', () => {
      // Valid Thai ID card with correct checksum
      expect(validateIdCard('1234567890123')).toBe(false) // Invalid checksum
      expect(validateIdCard('1100700271283')).toBe(true) // Valid checksum
    })

    it('should reject ID cards with all same digits', () => {
      expect(validateIdCard('1111111111111')).toBe(false)
      expect(validateIdCard('0000000000')).toBe(false)
    })

    it('should validate old 10-digit format', () => {
      expect(validateIdCard('1234567890')).toBe(true)
    })

    it('should reject invalid ID cards', () => {
      expect(validateIdCard('123')).toBe(false)
      expect(validateIdCard('')).toBe(false)
      expect(validateIdCard(null)).toBe(false)
      expect(validateIdCard(undefined)).toBe(false)
    })
  })

  describe('validateRequired', () => {
    it('should validate non-empty values', () => {
      expect(validateRequired('text')).toBe(true)
      expect(validateRequired(123)).toBe(true)
      expect(validateRequired(true)).toBe(true)
      expect(validateRequired(false)).toBe(true)
      expect(validateRequired([1, 2, 3])).toBe(true)
      expect(validateRequired({ key: 'value' })).toBe(true)
    })

    it('should reject empty values', () => {
      expect(validateRequired('')).toBe(false)
      expect(validateRequired('   ')).toBe(false)
      expect(validateRequired(null)).toBe(false)
      expect(validateRequired(undefined)).toBe(false)
      expect(validateRequired([])).toBe(false)
      expect(validateRequired({})).toBe(false)
    })
  })

  describe('validateMinLength', () => {
    it('should validate strings meeting minimum length', () => {
      expect(validateMinLength('hello', 5)).toBe(true)
      expect(validateMinLength('hello world', 5)).toBe(true)
    })

    it('should reject strings below minimum length', () => {
      expect(validateMinLength('hi', 5)).toBe(false)
      expect(validateMinLength('', 1)).toBe(false)
      expect(validateMinLength(null, 1)).toBe(false)
      expect(validateMinLength(undefined, 1)).toBe(false)
    })
  })

  describe('validateMaxLength', () => {
    it('should validate strings within maximum length', () => {
      expect(validateMaxLength('hello', 10)).toBe(true)
      expect(validateMaxLength('', 10)).toBe(true)
    })

    it('should reject strings exceeding maximum length', () => {
      expect(validateMaxLength('hello world', 5)).toBe(false)
    })

    it('should accept null/undefined for max length', () => {
      expect(validateMaxLength(null, 10)).toBe(true)
      expect(validateMaxLength(undefined, 10)).toBe(true)
    })
  })

  describe('validateDateRange', () => {
    it('should validate correct date ranges', () => {
      const start = new Date('2024-01-01')
      const end = new Date('2024-12-31')
      expect(validateDateRange(start, end)).toBe(true)
      expect(validateDateRange(start, start)).toBe(true) // Same date is valid
    })

    it('should validate string date ranges', () => {
      expect(validateDateRange('2024-01-01', '2024-12-31')).toBe(true)
    })

    it('should reject invalid date ranges', () => {
      const start = new Date('2024-12-31')
      const end = new Date('2024-01-01')
      expect(validateDateRange(start, end)).toBe(false)
    })

    it('should reject invalid dates', () => {
      expect(validateDateRange('invalid', '2024-12-31')).toBe(false)
      expect(validateDateRange(null, new Date())).toBe(false)
      expect(validateDateRange(new Date(), null)).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongPass123!')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject weak passwords', () => {
      const result1 = validatePassword('weak')
      expect(result1.valid).toBe(false)
      expect(result1.errors.length).toBeGreaterThan(0)

      const result2 = validatePassword('12345678')
      expect(result2.valid).toBe(false)
      expect(result2.errors).toContain('รหัสผ่านต้องมีตัวอักษรพิมพ์เล็ก')

      const result3 = validatePassword('password')
      expect(result3.valid).toBe(false)
      expect(result3.errors).toContain('รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่')
    })

    it('should require minimum length', () => {
      const result = validatePassword('Short1!')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร')
    })

    it('should require special characters', () => {
      const result = validatePassword('Password123')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('รหัสผ่านต้องมีอักขระพิเศษ')
    })
  })
})
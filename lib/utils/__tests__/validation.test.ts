import { describe, expect, test } from 'vitest'
import { validateEmail, validatePhone, validateIdCard, validateRequired } from '../validation'

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    test('validates correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('user+tag@example.org')).toBe(true)
    })

    test('rejects invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test@.com')).toBe(false)
      expect(validateEmail('test@example')).toBe(false)
    })

    test('handles edge cases', () => {
      expect(validateEmail('')).toBe(false)
      expect(validateEmail(null as any)).toBe(false)
      expect(validateEmail(undefined as any)).toBe(false)
    })
  })

  describe('validatePhone', () => {
    test('validates Thai phone numbers', () => {
      expect(validatePhone('0812345678')).toBe(true)
      expect(validatePhone('0912345678')).toBe(true)
      expect(validatePhone('0612345678')).toBe(true)
      expect(validatePhone('081-234-5678')).toBe(true)
      expect(validatePhone('+66812345678')).toBe(true)
    })

    test('rejects invalid phone numbers', () => {
      expect(validatePhone('012345678')).toBe(false)
      expect(validatePhone('081234567')).toBe(false)
      expect(validatePhone('08123456789')).toBe(false)
      expect(validatePhone('12345678')).toBe(false)
    })

    test('handles edge cases', () => {
      expect(validatePhone('')).toBe(false)
      expect(validatePhone(null as any)).toBe(false)
      expect(validatePhone(undefined as any)).toBe(false)
    })
  })

  describe('validateIdCard', () => {
    test('validates Thai ID card numbers', () => {
      expect(validateIdCard('1103700404121')).toBe(true) // Valid Thai ID
      expect(validateIdCard('1-1037-00404-12-1')).toBe(true) // With dashes
      expect(validateIdCard('4100216810')).toBe(true) // 10 digit ID (older format)
    })

    test('rejects invalid ID card numbers', () => {
      expect(validateIdCard('123456789012')).toBe(false) // Too short
      expect(validateIdCard('12345678901234')).toBe(false) // Too long
      expect(validateIdCard('0000000000000')).toBe(false) // All zeros
      expect(validateIdCard('1234567890123')).toBe(false) // Invalid check digit
    })

    test('handles edge cases', () => {
      expect(validateIdCard('')).toBe(false)
      expect(validateIdCard(null as any)).toBe(false)
      expect(validateIdCard(undefined as any)).toBe(false)
    })
  })

  describe('validateRequired', () => {
    test('validates required fields', () => {
      expect(validateRequired('test')).toBe(true)
      expect(validateRequired(0)).toBe(true)
      expect(validateRequired(false)).toBe(true)
      expect(validateRequired([1, 2, 3])).toBe(true) // Non-empty array
      expect(validateRequired({ key: 'value' })).toBe(true) // Non-empty object
    })

    test('rejects empty values', () => {
      expect(validateRequired('')).toBe(false)
      expect(validateRequired(null)).toBe(false)
      expect(validateRequired(undefined)).toBe(false)
      expect(validateRequired([])).toBe(false) // Empty array
      expect(validateRequired({})).toBe(false) // Empty object
    })

    test('handles whitespace strings', () => {
      expect(validateRequired('   ')).toBe(false)
      expect(validateRequired('\t\n')).toBe(false)
    })
  })
})
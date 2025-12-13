import { describe, expect, test } from 'vitest'
import { formatCurrency, formatDate, formatThaiDate, formatTime } from '../format'

describe('Format Utils', () => {
  describe('formatCurrency', () => {
    test('formats positive numbers correctly', () => {
      expect(formatCurrency(1000)).toBe('฿1,000.00')
      expect(formatCurrency(1234.56)).toBe('฿1,234.56')
    })

    test('formats zero correctly', () => {
      expect(formatCurrency(0)).toBe('฿0.00')
    })

    test('formats negative numbers correctly', () => {
      expect(formatCurrency(-500)).toBe('-฿500.00')
    })

    test('handles decimal places', () => {
      expect(formatCurrency(1000.5)).toBe('฿1,000.50')
      expect(formatCurrency(1000.123)).toBe('฿1,000.12')
    })
  })

  describe('formatDate', () => {
    test('formats date in ISO format', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(date)).toBe('2024-01-15')
    })

    test('handles string dates', () => {
      expect(formatDate('2024-01-15')).toBe('2024-01-15')
    })

    test('handles invalid dates', () => {
      expect(formatDate(null as any)).toBe('')
      expect(formatDate('')).toBe('')
    })
  })

  describe('formatThaiDate', () => {
    test('formats date in Thai format', () => {
      const date = new Date('2024-01-15')
      expect(formatThaiDate(date)).toBe('15 มกราคม 2567')
    })

    test('formats different months correctly', () => {
      const febDate = new Date('2024-02-01')
      expect(formatThaiDate(febDate)).toBe('1 กุมภาพันธ์ 2567')

      const aprDate = new Date('2024-04-15')
      expect(formatThaiDate(aprDate)).toBe('15 เมษายน 2567')
    })

    test('handles Buddhist year calculation', () => {
      const date = new Date('2023-12-31')
      expect(formatThaiDate(date)).toBe('31 ธันวาคม 2566')
    })
  })

  describe('formatTime', () => {
    test('formats time in 24-hour format', () => {
      const date = new Date('2024-01-15T14:30:00')
      expect(formatTime(date)).toBe('14:30')
    })

    test('handles midnight', () => {
      const date = new Date('2024-01-15T00:00:00')
      expect(formatTime(date)).toBe('00:00')
    })

    test('handles single digit minutes', () => {
      const date = new Date('2024-01-15T09:05:00')
      expect(formatTime(date)).toBe('09:05')
    })
  })
})
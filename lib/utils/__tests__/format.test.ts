import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  formatCurrency,
  formatDate,
  formatThaiDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatFileSize,
  formatPhoneNumber,
  formatIdCard,
} from '../format'

describe('Format Utils', () => {
  describe('formatCurrency', () => {
    it('should format numbers as Thai currency', () => {
      expect(formatCurrency(1000)).toBe('฿1,000.00')
      expect(formatCurrency(1234.56)).toBe('฿1,234.56')
      expect(formatCurrency(0)).toBe('฿0.00')
    })

    it('should handle negative numbers', () => {
      expect(formatCurrency(-500)).toBe('-฿500.00')
    })

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('฿1,000,000.00')
    })
  })

  describe('formatDate', () => {
    it('should format Date objects', () => {
      const date = new Date('2024-12-16T10:30:00')
      expect(formatDate(date)).toBe('2024-12-16')
    })

    it('should format date strings', () => {
      expect(formatDate('2024-12-16')).toBe('2024-12-16')
    })

    it('should handle null/undefined', () => {
      expect(formatDate(null)).toBe('')
      expect(formatDate(undefined)).toBe('')
    })

    it('should handle invalid dates', () => {
      expect(formatDate('invalid')).toBe('')
    })
  })

  describe('formatThaiDate', () => {
    it('should format dates in Thai format with Buddhist year', () => {
      const date = new Date('2024-01-15')
      const result = formatThaiDate(date)
      expect(result).toContain('15')
      expect(result).toContain('มกราคม')
      expect(result).toContain('2567') // 2024 + 543
    })

    it('should handle all months', () => {
      const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ]

      months.forEach((month, index) => {
        const date = new Date(2024, index, 15)
        const result = formatThaiDate(date)
        expect(result).toContain(month)
      })
    })

    it('should handle null/undefined', () => {
      expect(formatThaiDate(null)).toBe('')
      expect(formatThaiDate(undefined)).toBe('')
    })
  })

  describe('formatTime', () => {
    it('should format time in 24-hour format', () => {
      const date = new Date('2024-12-16T14:30:00')
      const result = formatTime(date)
      expect(result).toMatch(/14:30/)
    })

    it('should handle null/undefined', () => {
      expect(formatTime(null)).toBe('')
      expect(formatTime(undefined)).toBe('')
    })
  })

  describe('formatDateTime', () => {
    it('should format date and time together', () => {
      const date = new Date('2024-01-15T14:30:00')
      const result = formatDateTime(date)
      expect(result).toContain('15')
      expect(result).toContain('มกราคม')
      expect(result).toContain('2567')
      expect(result).toMatch(/14:30/)
    })

    it('should handle null/undefined', () => {
      expect(formatDateTime(null)).toBe('')
      expect(formatDateTime(undefined)).toBe('')
    })
  })

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      // Mock current time
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-12-16T12:00:00'))
    })

    it('should show "เมื่อสักครู่" for recent times', () => {
      const date = new Date('2024-12-16T11:59:30')
      expect(formatRelativeTime(date)).toBe('เมื่อสักครู่')
    })

    it('should show minutes ago', () => {
      const date = new Date('2024-12-16T11:55:00')
      expect(formatRelativeTime(date)).toBe('5 นาทีที่แล้ว')
    })

    it('should show hours ago', () => {
      const date = new Date('2024-12-16T10:00:00')
      expect(formatRelativeTime(date)).toBe('2 ชั่วโมงที่แล้ว')
    })

    it('should show days ago', () => {
      const date = new Date('2024-12-14T12:00:00')
      expect(formatRelativeTime(date)).toBe('2 วันที่แล้ว')
    })

    it('should show full date for older dates', () => {
      const date = new Date('2024-11-01T12:00:00')
      const result = formatRelativeTime(date)
      expect(result).toContain('พฤศจิกายน')
    })

    it('should handle null/undefined', () => {
      expect(formatRelativeTime(null)).toBe('')
      expect(formatRelativeTime(undefined)).toBe('')
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500.0 B')
    })

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB')
      expect(formatFileSize(2048)).toBe('2.0 KB')
    })

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1.0 MB')
      expect(formatFileSize(5242880)).toBe('5.0 MB')
    })

    it('should format gigabytes', () => {
      expect(formatFileSize(1073741824)).toBe('1.0 GB')
    })

    it('should handle zero', () => {
      expect(formatFileSize(0)).toBe('0.0 B')
    })
  })

  describe('formatPhoneNumber', () => {
    it('should format 10-digit mobile numbers', () => {
      expect(formatPhoneNumber('0812345678')).toBe('081-234-5678')
      expect(formatPhoneNumber('0923456789')).toBe('092-345-6789')
    })

    it('should format 9-digit landline numbers', () => {
      expect(formatPhoneNumber('021234567')).toBe('02-123-4567')
    })

    it('should handle already formatted numbers', () => {
      expect(formatPhoneNumber('08-1234-5678')).toBe('081-234-5678')
    })

    it('should return original for invalid formats', () => {
      expect(formatPhoneNumber('123')).toBe('123')
    })
  })

  describe('formatIdCard', () => {
    it('should format 13-digit ID cards', () => {
      expect(formatIdCard('1234567890123')).toBe('1234-567890-12-3')
    })

    it('should handle already formatted ID cards', () => {
      expect(formatIdCard('1-2345-67890-12-3')).toBe('1234-567890-12-3')
    })

    it('should return original for invalid formats', () => {
      expect(formatIdCard('123')).toBe('123')
    })
  })
})
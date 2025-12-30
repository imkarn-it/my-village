import { describe, test, expect } from 'vitest'
import {
    escapeHtml,
    stripHtml,
    sanitizeInput,
    sanitizeFilename,
    sanitizeUrl,
    sanitizeEmail,
    sanitizePhone,
    sanitizeObject,
    hasXSSPatterns,
} from '../sanitize'

describe('Sanitize Utilities', () => {
    describe('escapeHtml', () => {
        test('should escape HTML special characters', () => {
            expect(escapeHtml('<script>alert("xss")</script>')).toBe(
                '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
            )
        })

        test('should escape ampersand', () => {
            expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
        })

        test('should return empty string for non-string', () => {
            expect(escapeHtml(null as any)).toBe('')
            expect(escapeHtml(undefined as any)).toBe('')
        })
    })

    describe('stripHtml', () => {
        test('should remove HTML tags', () => {
            expect(stripHtml('<p>Hello <strong>World</strong></p>')).toBe('Hello World')
        })

        test('should handle text without HTML', () => {
            expect(stripHtml('Plain text')).toBe('Plain text')
        })
    })

    describe('sanitizeInput', () => {
        test('should remove null bytes', () => {
            expect(sanitizeInput('Hello\0World')).toBe('HelloWorld')
        })

        test('should remove control characters', () => {
            expect(sanitizeInput('Hello\x00\x08World')).toBe('HelloWorld')
        })

        test('should trim whitespace', () => {
            expect(sanitizeInput('  Hello World  ')).toBe('Hello World')
        })
    })

    describe('sanitizeFilename', () => {
        test('should remove path traversal', () => {
            expect(sanitizeFilename('../../../etc/passwd')).toBe('___etc_passwd')
        })

        test('should replace special characters', () => {
            expect(sanitizeFilename('file<name>.txt')).toBe('file_name_.txt')
        })

        test('should limit length', () => {
            const longName = 'a'.repeat(300) + '.txt'
            expect(sanitizeFilename(longName).length).toBeLessThanOrEqual(255)
        })
    })

    describe('sanitizeUrl', () => {
        test('should accept valid https URLs', () => {
            expect(sanitizeUrl('https://example.com/path')).toBe('https://example.com/path')
        })

        test('should accept valid http URLs', () => {
            expect(sanitizeUrl('http://example.com')).toBe('http://example.com/')
        })

        test('should reject javascript: URLs', () => {
            expect(sanitizeUrl('javascript:alert(1)')).toBeNull()
        })

        test('should reject data: URLs', () => {
            expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull()
        })

        test('should reject invalid URLs', () => {
            expect(sanitizeUrl('not a url')).toBeNull()
        })
    })

    describe('sanitizeEmail', () => {
        test('should accept valid email', () => {
            expect(sanitizeEmail('Test@Example.COM')).toBe('test@example.com')
        })

        test('should reject invalid email', () => {
            expect(sanitizeEmail('not-an-email')).toBeNull()
            expect(sanitizeEmail('missing@domain')).toBeNull()
        })

        test('should trim whitespace', () => {
            expect(sanitizeEmail('  user@example.com  ')).toBe('user@example.com')
        })
    })

    describe('sanitizePhone', () => {
        test('should keep only digits and plus', () => {
            expect(sanitizePhone('+66 (0) 123-456-789')).toBe('+660123456789')
        })

        test('should handle Thai phone number', () => {
            expect(sanitizePhone('081-234-5678')).toBe('0812345678')
        })
    })

    describe('sanitizeObject', () => {
        test('should sanitize all string values', () => {
            const input = {
                name: '  John  ',
                bio: 'Hello\0World',
                nested: {
                    value: '  Nested  '
                }
            }

            const result = sanitizeObject(input)

            expect(result.name).toBe('John')
            expect(result.bio).toBe('HelloWorld')
            expect((result.nested as any).value).toBe('Nested')
        })

        test('should leave non-string values unchanged', () => {
            const input = {
                count: 42,
                active: true,
                items: ['a', 'b', 'c']
            }

            const result = sanitizeObject(input)

            expect(result.count).toBe(42)
            expect(result.active).toBe(true)
        })
    })

    describe('hasXSSPatterns', () => {
        test('should detect script tags', () => {
            expect(hasXSSPatterns('<script>alert(1)</script>')).toBe(true)
        })

        test('should detect javascript: protocol', () => {
            expect(hasXSSPatterns('javascript:alert(1)')).toBe(true)
        })

        test('should detect event handlers', () => {
            expect(hasXSSPatterns('onclick=alert(1)')).toBe(true)
            expect(hasXSSPatterns('onerror = alert(1)')).toBe(true)
        })

        test('should detect iframe', () => {
            expect(hasXSSPatterns('<iframe src="evil.com">')).toBe(true)
        })

        test('should return false for safe content', () => {
            expect(hasXSSPatterns('Hello World')).toBe(false)
            expect(hasXSSPatterns('Regular text with < and >')).toBe(false)
        })
    })
})

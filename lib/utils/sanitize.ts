/**
 * Input Sanitization Utilities
 * ป้องกัน XSS และ injection attacks
 */

/**
 * HTML entities to escape
 */
const HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
    if (typeof str !== 'string') return ''
    return str.replace(/[&<>"'`=/]/g, char => HTML_ENTITIES[char] || char)
}

/**
 * Remove HTML tags from string
 */
export function stripHtml(str: string): string {
    if (typeof str !== 'string') return ''
    return str.replace(/<[^>]*>/g, '')
}

/**
 * Sanitize user input - removes dangerous characters
 */
export function sanitizeInput(str: string): string {
    if (typeof str !== 'string') return ''

    return str
        // Remove null bytes
        .replace(/\0/g, '')
        // Remove control characters
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // Trim whitespace
        .trim()
}

/**
 * Sanitize for SQL (basic - use parameterized queries instead!)
 * This is a fallback, always prefer ORM/parameterized queries
 */
export function sanitizeSql(str: string): string {
    if (typeof str !== 'string') return ''

    return str
        // Escape single quotes
        .replace(/'/g, "''")
        // Remove semicolons (prevent statement termination)
        .replace(/;/g, '')
        // Remove comments
        .replace(/--/g, '')
        .replace(/\/\*/g, '')
        .replace(/\*\//g, '')
}

/**
 * Sanitize filename - only allow safe characters
 */
export function sanitizeFilename(filename: string): string {
    if (typeof filename !== 'string') return ''

    return filename
        // Remove path traversal
        .replace(/\.\./g, '')
        // Only allow alphanumeric, dash, underscore, dot
        .replace(/[^a-zA-Z0-9\-_\.]/g, '_')
        // Remove multiple dots
        .replace(/\.+/g, '.')
        // Limit length
        .slice(0, 255)
}

/**
 * Sanitize URL - validate and clean URLs
 */
export function sanitizeUrl(url: string): string | null {
    if (typeof url !== 'string') return null

    try {
        const parsed = new URL(url)

        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return null
        }

        // Prevent javascript: URLs that might slip through
        if (parsed.href.toLowerCase().includes('javascript:')) {
            return null
        }

        return parsed.href
    } catch {
        return null
    }
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string | null {
    if (typeof email !== 'string') return null

    const sanitized = email.toLowerCase().trim()

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitized)) {
        return null
    }

    return sanitized
}

/**
 * Sanitize phone number - keep only digits and + for country code
 */
export function sanitizePhone(phone: string): string {
    if (typeof phone !== 'string') return ''

    return phone.replace(/[^\d+]/g, '')
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
    const result: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            result[key] = sanitizeInput(value)
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            result[key] = sanitizeObject(value as Record<string, unknown>)
        } else if (Array.isArray(value)) {
            result[key] = value.map(item =>
                typeof item === 'string' ? sanitizeInput(item) : item
            )
        } else {
            result[key] = value
        }
    }

    return result as T
}

/**
 * Check for potential XSS patterns
 */
export function hasXSSPatterns(str: string): boolean {
    if (typeof str !== 'string') return false

    const xssPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i, // onclick, onerror, etc.
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /<form/i,
        /data:/i,
        /vbscript:/i,
    ]

    return xssPatterns.some(pattern => pattern.test(str))
}

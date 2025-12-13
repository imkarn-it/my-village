/**
 * Validation utilities for common validation needs
 */

export function validateEmail(email: string | null | undefined): boolean {
  if (!email || typeof email !== 'string') return false

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

export function validatePhone(phone: string | null | undefined): boolean {
  if (!phone || typeof phone !== 'string') return false

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')

  // Thai phone numbers are 9 or 10 digits (starting with 0 or 66)
  if (cleaned.length === 9) {
    // Landline numbers
    return /^(02|03|04|05|07|09)[0-9]{7}$/.test(cleaned)
  } else if (cleaned.length === 10) {
    // Mobile numbers
    return /^(06|08|09)[0-9]{8}$/.test(cleaned)
  } else if (cleaned.length === 11 && cleaned.startsWith('66')) {
    // International format
    return /^66[0-9]{9}$/.test(cleaned)
  }

  return false
}

export function validateIdCard(id: string | null | undefined): boolean {
  if (!id || typeof id !== 'string') return false

  // Remove all non-digit characters
  const cleaned = id.replace(/\D/g, '')

  // Thai ID card can be 13 digits (new format) or 10 digits (old format)
  if (cleaned.length === 13) {
    // Check if all digits are the same (invalid)
    if (/^(\d)\1{12}$/.test(cleaned)) return false

    // Calculate checksum digit
    let sum = 0
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleaned[i]!) * (13 - i)
    }

    const checkDigit = (11 - (sum % 11)) % 10
    return checkDigit === parseInt(cleaned[12]!)
  } else if (cleaned.length === 10) {
    // Old 10-digit format (simplified validation)
    // Check if all digits are the same (invalid)
    if (/^(\d)\1{9}$/.test(cleaned)) return false
    return true
  }

  return false
}

export function validateRequired(value: any): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') {
    // Don't consider empty objects as valid
    return Object.keys(value).length > 0
  }

  // Numbers, booleans are always valid if they exist
  return true
}

export function validateMinLength(value: string | null | undefined, min: number): boolean {
  if (!value) return false
  return value.trim().length >= min
}

export function validateMaxLength(value: string | null | undefined, max: number): boolean {
  if (!value) return true // Empty string is valid for max length
  return value.trim().length <= max
}

export function validateDateRange(start: Date | string | null, end: Date | string | null): boolean {
  if (!start || !end) return false

  const startDate = typeof start === 'string' ? new Date(start) : start
  const endDate = typeof end === 'string' ? new Date(end) : end

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false

  return startDate <= endDate
}

export function validateFileUpload(file: File | null, allowedTypes: string[], maxSizeMB: number = 5): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'กรุณาเลือกไฟล์' }
  }

  // Check file type
  const fileType = file.type.toLowerCase()
  const isValidType = allowedTypes.some(type => fileType.includes(type.toLowerCase()))

  if (!isValidType) {
    return { valid: false, error: 'ประเภทไฟล์ไม่อนุญาต' }
  }

  // Check file size (convert MB to bytes)
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `ขนาดไฟล์ต้องไม่เกิน ${maxSizeMB} MB` }
  }

  return { valid: true }
}

export function validatePassword(password: string | null | undefined): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!password || password.length < 8) {
    errors.push('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร')
  }

  if (!/[a-z]/.test(password || '')) {
    errors.push('รหัสผ่านต้องมีตัวอักษรพิมพ์เล็ก')
  }

  if (!/[A-Z]/.test(password || '')) {
    errors.push('รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่')
  }

  if (!/\d/.test(password || '')) {
    errors.push('รหัสผ่านต้องมีตัวเลข')
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password || '')) {
    errors.push('รหัสผ่านต้องมีอักขระพิเศษ')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
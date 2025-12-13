/**
 * Format utilities for common formatting needs
 */

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ''

  if (typeof date === 'string') {
    date = new Date(date)
  }

  if (isNaN(date.getTime())) return ''

  return date.toISOString().split('T')[0]!
}

export function formatThaiDate(date: Date | string | null | undefined): string {
  if (!date) return ''

  if (typeof date === 'string') {
    date = new Date(date)
  }

  if (isNaN(date.getTime())) return ''

  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ]

  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear() + 543 // Buddhist year

  return `${day} ${month} ${year}`
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return ''

  if (typeof date === 'string') {
    date = new Date(date)
  }

  if (isNaN(date.getTime())) return ''

  return date.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return ''

  if (typeof date === 'string') {
    date = new Date(date)
  }

  if (isNaN(date.getTime())) return ''

  return `${formatThaiDate(date)} ${formatTime(date)}`
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return ''

  if (typeof date === 'string') {
    date = new Date(date)
  }

  if (isNaN(date.getTime())) return ''

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'เมื่อสักครู่'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} นาทีที่แล้ว`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} ชั่วโมงที่แล้ว`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} วันที่แล้ว`
  } else {
    return formatThaiDate(date)
  }
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

export function formatPhoneNumber(phone: string): string {
  // Format Thai phone numbers
  const cleaned = phone.replace(/\D/g, '')

  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  } else if (cleaned.length === 9) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3')
  }

  return phone
}

export function formatIdCard(id: string): string {
  // Format Thai ID card (XXXX-XXXXXX-XX-XX)
  const cleaned = id.replace(/\D/g, '')

  if (cleaned.length === 13) {
    return cleaned.replace(/(\d{4})(\d{6})(\d{2})(\d{2})/, '$1-$2-$3-$4')
  }

  return id
}
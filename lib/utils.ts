import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"

/**
 * Combines class names using clsx and tailwind-merge
 * Handles conditional classes and removes conflicts
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date to Thai locale string
 */
export function formatDate(date: Date | string | null, pattern = "d MMM yyyy"): string {
  if (!date) return "-"
  const dateObj = typeof date === "string" ? new Date(date) : date
  return format(dateObj, pattern, { locale: th })
}

/**
 * Formats a date to Thai locale time string
 */
export function formatTime(date: Date | string | null, pattern = "HH:mm"): string {
  if (!date) return "-"
  const dateObj = typeof date === "string" ? new Date(date) : date
  return format(dateObj, pattern, { locale: th })
}

/**
 * Formats a date to Thai locale datetime string
 */
export function formatDateTime(date: Date | string | null): string {
  if (!date) return "-"
  const dateObj = typeof date === "string" ? new Date(date) : date
  return format(dateObj, "d MMM yyyy HH:mm", { locale: th })
}

/**
 * Formats a date relative to now (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return "-"
  const dateObj = typeof date === "string" ? new Date(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: th })
}

/**
 * Formats a number as Thai Baht currency
 */
export function formatCurrency(amount: number | string | null): string {
  if (amount === null || amount === undefined) return "฿0"
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount
  return `฿${numAmount.toLocaleString("th-TH")}`
}

/**
 * Truncates text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Gets initials from a name (e.g., "John Doe" -> "JD")
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Generates a random color based on a string (for avatars)
 */
export function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = hash % 360
  return `hsl(${hue}, 70%, 50%)`
}

/**
 * Delays execution for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Type-safe object keys
 */
export function objectKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}

/**
 * Type-safe object entries
 */
export function objectEntries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][]
}

/**
 * Type Guards and Type Utilities
 * Generic functions for type checking and type-safe operations
 */

// ==========================================
// Type Guards
// ==========================================

/**
 * Checks if a value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined
}

/**
 * Checks if a value is null or undefined
 */
export function isNullish(value: unknown): value is null | undefined {
    return value === null || value === undefined
}

/**
 * Checks if a value is a string
 */
export function isString(value: unknown): value is string {
    return typeof value === "string"
}

/**
 * Checks if a value is a number
 */
export function isNumber(value: unknown): value is number {
    return typeof value === "number" && !Number.isNaN(value)
}

/**
 * Checks if a value is an object (excluding null)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * Checks if a value is an array
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
    return Array.isArray(value)
}

/**
 * Checks if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
    return isString(value) && value.trim().length > 0
}

/**
 * Checks if a value is a non-empty array
 */
export function isNonEmptyArray<T>(value: unknown): value is [T, ...T[]] {
    return isArray(value) && value.length > 0
}

// ==========================================
// Type-safe Object Utilities
// ==========================================

/**
 * Type-safe Object.keys
 */
export function objectKeys<T extends Record<string, unknown>>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[]
}

/**
 * Type-safe Object.entries
 */
export function objectEntries<T extends Record<string, unknown>>(
    obj: T
): [keyof T, T[keyof T]][] {
    return Object.entries(obj) as [keyof T, T[keyof T]][]
}

/**
 * Type-safe Object.fromEntries
 */
export function objectFromEntries<K extends string, V>(
    entries: readonly [K, V][]
): Record<K, V> {
    return Object.fromEntries(entries) as Record<K, V>
}

/**
 * Picks specific keys from an object
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    keys: readonly K[]
): Pick<T, K> {
    const result = {} as Pick<T, K>
    for (const key of keys) {
        if (key in obj) {
            result[key] = obj[key]
        }
    }
    return result
}

/**
 * Omits specific keys from an object
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    keys: readonly K[]
): Omit<T, K> {
    const result = { ...obj }
    for (const key of keys) {
        delete result[key]
    }
    return result as Omit<T, K>
}

// ==========================================
// Array Utilities
// ==========================================

/**
 * Filters out null and undefined values from an array
 */
export function compact<T>(arr: readonly (T | null | undefined)[]): T[] {
    return arr.filter(isDefined)
}

/**
 * Gets unique values from an array
 */
export function unique<T>(arr: readonly T[]): T[] {
    return [...new Set(arr)]
}

/**
 * Groups array items by a key
 */
export function groupBy<T, K extends string | number>(
    arr: readonly T[],
    keyFn: (item: T) => K
): Record<K, T[]> {
    const result = {} as Record<K, T[]>
    for (const item of arr) {
        const key = keyFn(item)
        if (!result[key]) {
            result[key] = []
        }
        result[key].push(item)
    }
    return result
}

/**
 * Safely gets the first element of an array
 */
export function first<T>(arr: readonly T[]): T | undefined {
    return arr[0]
}

/**
 * Safely gets the last element of an array
 */
export function last<T>(arr: readonly T[]): T | undefined {
    return arr[arr.length - 1]
}

// ==========================================
// Error Utilities
// ==========================================

/**
 * Extracts error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }
    if (isString(error)) {
        return error
    }
    return "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
}

/**
 * Creates a type-safe error handler
 */
export function createErrorHandler(
    fallbackMessage: string
): (error: unknown) => string {
    return (error: unknown): string => {
        const message = getErrorMessage(error)
        return message || fallbackMessage
    }
}

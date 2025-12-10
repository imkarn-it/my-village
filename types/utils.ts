/**
 * Utility Types
 * Reusable generic types and utility type helpers
 */

// ==========================================
// Object Utilities
// ==========================================

/**
 * Makes all properties of T optional and nullable
 */
export type Nullable<T> = {
    [P in keyof T]: T[P] | null
}

/**
 * Makes specific properties of T required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Makes specific properties of T optional
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Deeply makes all properties readonly
 */
export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * Extracts the value type from a Record
 */
export type ValueOf<T> = T[keyof T]

// ==========================================
// Function Utilities
// ==========================================

/**
 * Extracts the return type of an async function
 */
export type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> =
    T extends (...args: unknown[]) => Promise<infer R> ? R : never

/**
 * Represents a function that returns a Promise
 */
export type AsyncFunction<TArgs extends unknown[] = unknown[], TReturn = unknown> =
    (...args: TArgs) => Promise<TReturn>

// ==========================================
// Array Utilities
// ==========================================

/**
 * Extracts the element type from an array
 */
export type ArrayElement<T extends readonly unknown[]> = T extends readonly (infer E)[] ? E : never

/**
 * Non-empty array type
 */
export type NonEmptyArray<T> = readonly [T, ...T[]]

// ==========================================
// String Utilities
// ==========================================

/**
 * String literal types for common use cases
 */
export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never

// ==========================================
// Status Types (Domain Specific)
// ==========================================

/**
 * Common status values used across the application
 */
export type EntityStatus = "active" | "inactive" | "pending" | "archived"

/**
 * Request/approval status
 */
export type ApprovalStatus = "pending" | "approved" | "rejected" | "cancelled"

/**
 * Delivery/pickup status
 */
export type DeliveryStatus = "pending" | "picked_up" | "returned"

/**
 * Visitor status
 */
export type VisitorStatus = "checked_in" | "checked_out"

// ==========================================
// ID Types
// ==========================================

/**
 * Brand type for type-safe IDs
 */
export type BrandedId<T extends string> = string & { readonly __brand: T }

export type UserId = BrandedId<"UserId">
export type UnitId = BrandedId<"UnitId">
export type ProjectId = BrandedId<"ProjectId">
export type AnnouncementId = BrandedId<"AnnouncementId">

// ==========================================
// Date Utilities
// ==========================================

/**
 * ISO date string type
 */
export type ISODateString = string & { readonly __type: "ISODateString" }

/**
 * Date range type
 */
export type DateRange = {
    readonly start: Date
    readonly end: Date
}

/**
 * API Response Types
 * Standardized response structures for all API endpoints
 */

// ==========================================
// Base Response Types
// ==========================================

/**
 * Standard API success response
 */
export type ApiSuccessResponse<TData> = {
    readonly success: true
    readonly data: TData
    readonly message?: string
}

/**
 * Standard API error response
 */
export type ApiErrorResponse = {
    readonly success: false
    readonly error: string
    readonly code?: string
    readonly details?: Record<string, readonly string[]>
}

/**
 * Combined API response type using discriminated union
 */
export type ApiResponse<TData> = ApiSuccessResponse<TData> | ApiErrorResponse

// ==========================================
// Pagination Types
// ==========================================

/**
 * Pagination metadata
 */
export type PaginationMeta = {
    readonly page: number
    readonly limit: number
    readonly total: number
    readonly totalPages: number
}

/**
 * Paginated data wrapper
 */
export type PaginatedData<TItem> = {
    readonly items: readonly TItem[]
    readonly pagination: PaginationMeta
}

/**
 * Paginated API response
 */
export type PaginatedApiResponse<TItem> = ApiSuccessResponse<PaginatedData<TItem>>

// ==========================================
// Type Guards
// ==========================================

/**
 * Type guard for success response
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
    return response.success === true
}

/**
 * Type guard for error response
 */
export function isApiError<T>(response: ApiResponse<T>): response is ApiErrorResponse {
    return response.success === false
}

// ==========================================
// Helper Functions
// ==========================================

/**
 * Creates a success response
 */
export function createSuccessResponse<T>(data: T, message?: string): ApiSuccessResponse<T> {
    return {
        success: true,
        data,
        message,
    }
}

/**
 * Creates an error response
 */
export function createErrorResponse(
    error: string,
    code?: string,
    details?: Record<string, readonly string[]>
): ApiErrorResponse {
    return {
        success: false,
        error,
        code,
        details,
    }
}

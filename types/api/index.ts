/**
 * API Types Index
 * Re-exports all API-related types
 */

export type {
    ApiSuccessResponse,
    ApiErrorResponse,
    ApiResponse,
    PaginationMeta,
    PaginatedData,
    PaginatedApiResponse,
} from "./response"

export {
    isApiSuccess,
    isApiError,
    createSuccessResponse,
    createErrorResponse,
} from "./response"

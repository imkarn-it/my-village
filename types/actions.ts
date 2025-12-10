/**
 * Standard action result types for server actions
 * Centralized type definitions to avoid duplication
 */

/**
 * Base action result - success or error state
 */
export type ActionResult<TData = undefined> =
    | { success: true; data?: TData }
    | { success: false; error: string; fieldErrors?: Record<string, readonly string[]> };

/**
 * Form action state type for useActionState hook
 */
export type FormActionState = {
    readonly error?: string;
    readonly fieldErrors?: Record<string, readonly string[]>;
    readonly success?: boolean;
};

/**
 * Pagination params for list queries
 */
export type PaginationParams = {
    readonly page?: number;
    readonly limit?: number;
    readonly search?: string;
};

/**
 * Paginated result type
 */
export type PaginatedResult<T> = {
    readonly data: readonly T[];
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
};

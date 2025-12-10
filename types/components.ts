/**
 * Component prop types
 * Centralized prop definitions for reusable components
 */

import type { ReactNode } from "react"
import type { Role } from "@/lib/constants"

/**
 * Base layout props shared across dashboard layouts
 */
export type DashboardLayoutProps = {
    readonly children: ReactNode
}

/**
 * Navigation item structure
 */
export type NavigationItem = {
    readonly href: string
    readonly label: string
    readonly icon: ReactNode
    readonly badge?: string | number
}

/**
 * User session display props
 */
export type UserSessionProps = {
    readonly name: string
    readonly email: string
    readonly avatar?: string
    readonly role: Role
}

/**
 * Status badge variants
 */
export type StatusVariant =
    | "pending"
    | "approved"
    | "rejected"
    | "completed"
    | "cancelled"
    | "active"
    | "inactive"

/**
 * Status badge props
 */
export type StatusBadgeProps = {
    readonly status: StatusVariant
    readonly label?: string
}

/**
 * Data table column definition
 */
export type TableColumn<T> = {
    readonly key: keyof T | string
    readonly header: string
    readonly render?: (item: T) => ReactNode
    readonly sortable?: boolean
    readonly width?: string
}

/**
 * Data table props
 */
export type DataTableProps<T> = {
    readonly data: readonly T[]
    readonly columns: readonly TableColumn<T>[]
    readonly loading?: boolean
    readonly emptyMessage?: string
    readonly onRowClick?: (item: T) => void
}

/**
 * Form field error state
 */
export type FieldErrors = Record<string, readonly string[]>

/**
 * Base form props
 */
export type BaseFormProps = {
    readonly isLoading?: boolean
    readonly errors?: FieldErrors
    readonly onSubmit?: () => void
}

/**
 * Modal/Dialog props
 */
export type ModalProps = {
    readonly isOpen: boolean
    readonly onClose: () => void
    readonly title?: string
    readonly description?: string
    readonly children: ReactNode
}

/**
 * Confirmation dialog props
 */
export type ConfirmDialogProps = ModalProps & {
    readonly onConfirm: () => void
    readonly confirmLabel?: string
    readonly cancelLabel?: string
    readonly variant?: "default" | "destructive"
}

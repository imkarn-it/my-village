/**
 * Central types index file
 * Re-exports all type modules for convenient imports
 */

// ==========================================
// Entity Types (Database Models)
// ==========================================

export type {
    User,
    Unit,
    Project,
    Announcement,
    Visitor,
    Parcel,
    Bill,
    MaintenanceRequest,
    Facility,
    Booking,
    SosAlert,
    NewUser,
    NewUnit,
    NewProject,
    NewAnnouncement,
    NewVisitor,
    NewParcel,
    NewBill,
    NewMaintenanceRequest,
    NewFacility,
    NewBooking,
    NewSosAlert,
    UserBasicInfo,
    UnitBasicInfo,
    AnnouncementPreview,
} from "./entities"

// ==========================================
// Action Types (Server Actions)
// ==========================================

export type {
    ActionResult,
    FormActionState,
    PaginationParams,
    PaginatedResult,
} from "./actions"

// ==========================================
// API Types
// ==========================================

export type {
    ApiSuccessResponse,
    ApiErrorResponse,
    ApiResponse,
    PaginationMeta,
    PaginatedData,
    PaginatedApiResponse,
} from "./api"

export {
    isApiSuccess,
    isApiError,
    createSuccessResponse,
    createErrorResponse,
} from "./api"

// ==========================================
// Component Types
// ==========================================

export type {
    DashboardLayoutProps,
    NavigationItem,
    UserSessionProps,
    StatusVariant,
    StatusBadgeProps,
    TableColumn,
    DataTableProps,
    FieldErrors,
    BaseFormProps,
    ModalProps,
    ConfirmDialogProps,
} from "./components"

// ==========================================
// Utility Types
// ==========================================

export type {
    Nullable,
    RequireFields,
    OptionalFields,
    DeepReadonly,
    ValueOf,
    AsyncReturnType,
    AsyncFunction,
    ArrayElement,
    NonEmptyArray,
    StringLiteral,
    EntityStatus,
    ApprovalStatus,
    DeliveryStatus,
    VisitorStatus,
    BrandedId,
    UserId,
    UnitId,
    ProjectId,
    AnnouncementId,
    ISODateString,
    DateRange,
} from "./utils"

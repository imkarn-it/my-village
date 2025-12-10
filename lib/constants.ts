// User roles
export const ROLES = {
    RESIDENT: 'resident',
    ADMIN: 'admin',
    SECURITY: 'security',
    MAINTENANCE: 'maintenance',
    SUPER_ADMIN: 'super_admin',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

// Role labels (Thai)
export const ROLE_LABELS: Record<Role, string> = {
    [ROLES.RESIDENT]: 'ลูกบ้าน',
    [ROLES.ADMIN]: 'นิติบุคคล',
    [ROLES.SECURITY]: 'รปภ.',
    [ROLES.MAINTENANCE]: 'ช่างซ่อมบำรุง',
    [ROLES.SUPER_ADMIN]: 'ผู้ดูแลระบบ',
}

// Status types
export const STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    ACTIVE: 'active',
    INACTIVE: 'inactive',
} as const

export type Status = (typeof STATUS)[keyof typeof STATUS]

// Status labels (Thai)
export const STATUS_LABELS: Record<Status, string> = {
    [STATUS.PENDING]: 'รอดำเนินการ',
    [STATUS.APPROVED]: 'อนุมัติ',
    [STATUS.REJECTED]: 'ไม่อนุมัติ',
    [STATUS.IN_PROGRESS]: 'กำลังดำเนินการ',
    [STATUS.COMPLETED]: 'เสร็จสิ้น',
    [STATUS.CANCELLED]: 'ยกเลิก',
    [STATUS.ACTIVE]: 'ใช้งาน',
    [STATUS.INACTIVE]: 'ไม่ใช้งาน',
}

// Priority types
export const PRIORITY = {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    URGENT: 'urgent',
} as const

export type Priority = (typeof PRIORITY)[keyof typeof PRIORITY]

// Priority labels (Thai)
export const PRIORITY_LABELS: Record<Priority, string> = {
    [PRIORITY.LOW]: 'ต่ำ',
    [PRIORITY.NORMAL]: 'ปกติ',
    [PRIORITY.HIGH]: 'สูง',
    [PRIORITY.URGENT]: 'เร่งด่วน',
}

// Bill types
export const BILL_TYPES = {
    COMMON_FEE: 'common_fee',
    WATER: 'water',
    ELECTRICITY: 'electricity',
    PARKING: 'parking',
    OTHER: 'other',
} as const

export type BillType = (typeof BILL_TYPES)[keyof typeof BILL_TYPES]

// Bill type labels (Thai)
export const BILL_TYPE_LABELS: Record<BillType, string> = {
    [BILL_TYPES.COMMON_FEE]: 'ค่าส่วนกลาง',
    [BILL_TYPES.WATER]: 'ค่าน้ำ',
    [BILL_TYPES.ELECTRICITY]: 'ค่าไฟ',
    [BILL_TYPES.PARKING]: 'ค่าที่จอดรถ',
    [BILL_TYPES.OTHER]: 'อื่นๆ',
}

// Maintenance categories
export const MAINTENANCE_CATEGORIES = {
    PLUMBING: 'plumbing',
    ELECTRICAL: 'electrical',
    AIR_CONDITIONING: 'air_conditioning',
    GENERAL: 'general',
    OTHER: 'other',
} as const

export type MaintenanceCategory = (typeof MAINTENANCE_CATEGORIES)[keyof typeof MAINTENANCE_CATEGORIES]

// Maintenance category labels (Thai)
export const MAINTENANCE_CATEGORY_LABELS: Record<MaintenanceCategory, string> = {
    [MAINTENANCE_CATEGORIES.PLUMBING]: 'ประปา',
    [MAINTENANCE_CATEGORIES.ELECTRICAL]: 'ไฟฟ้า',
    [MAINTENANCE_CATEGORIES.AIR_CONDITIONING]: 'แอร์',
    [MAINTENANCE_CATEGORIES.GENERAL]: 'ทั่วไป',
    [MAINTENANCE_CATEGORIES.OTHER]: 'อื่นๆ',
}

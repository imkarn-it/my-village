# Coding Guidelines

> มาตรฐานการเขียน TypeScript และ React สำหรับ My Village

## 📌 Core Principles (บังคับเสมอ!)

### 1. ใช้ `type` แทน `interface`

```typescript
// ✅ ถูกต้อง
type User = {
    id: string
    name: string
}

// ❌ ผิด
interface User {
    id: string
    name: string
}
```

### 2. หลีกเลี่ยง `any` ทุกกรณี

```typescript
// ✅ ถูกต้อง
function handleError(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }
    return "Unknown error"
}

// ❌ ผิด
function handleError(error: any): string {}
```

### 3. ใช้ `readonly` กับค่าที่ไม่ควรแก้ไข

```typescript
type User = {
    readonly id: string
    readonly createdAt: Date
    name: string  // อันนี้แก้ได้
}
```

### 4. กำหนด Return Type อย่างชัดเจน

```typescript
// ✅ Components
export function MyComponent(): React.JSX.Element {
    return <div>Hello</div>
}

export default async function Page(): Promise<React.JSX.Element> {
    return <div>Page</div>
}

// ✅ Functions
function calculateTotal(items: Item[]): number {
    return items.reduce((sum, item) => sum + item.price, 0)
}
```

---

## 📁 File Naming

```
✅ ถูกต้อง:
- page.tsx, layout.tsx, loading.tsx
- user-profile.tsx
- create-announcement.tsx

❌ ผิด:
- Page.tsx
- UserProfile.tsx
- createAnnouncement.tsx
```

---

## 📂 File Structure Pattern

### Page Component

```typescript
// 1. Imports
import { Card } from "@/components/ui/card"
import { db } from "@/lib/db"
import type { User } from "@/types"

// 2. Types (ถ้ามี local types)
type PageProps = {
    readonly params: { id: string }
}

// 3. Constants
const MAX_ITEMS = 100 as const

// 4. Helper Functions
function calculateTotal(items: Item[]): number {
    return items.reduce((sum, item) => sum + item.price, 0)
}

// 5. Main Component
export default async function Page({ params }: PageProps): Promise<React.JSX.Element> {
    const data = await fetchData()
    
    return (
        <div>{/* JSX */}</div>
    )
}
```

### Client Component

```typescript
"use client"

// 1. Imports
import { useState } from "react"
import { Button } from "@/components/ui/button"

// 2. Types
type ButtonProps = {
    readonly onClick: () => void
    readonly label: string
}

// 3. Component
export function MyButton({ onClick, label }: ButtonProps): React.JSX.Element {
    const [count, setCount] = useState(0)
    
    function handleClick(): void {
        setCount(prev => prev + 1)
        onClick()
    }
    
    return (
        <Button onClick={handleClick}>
            {label} ({count})
        </Button>
    )
}
```

---

## 🔒 Import Paths

ใช้ `@/` alias เสมอ:

```typescript
// ✅ ถูกต้อง
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import type { User } from "@/types"

// ❌ ผิด - Relative paths
import { Button } from "../../components/ui/button"
```

---

## 🗃️ Database Queries

```typescript
// ✅ ถูกต้อง - เลือกเฉพาะ columns ที่ต้องการ
const users = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
}).from(users)

// ❌ ผิด - Select ทั้งหมด (มี password!)
const users = await db.select().from(users)
```

---

## ⚠️ Error Handling

```typescript
// ✅ ถูกต้อง
try {
    await riskyOperation()
} catch (error: unknown) {
    console.error("Operation failed:", error)
    if (error instanceof Error) {
        return { error: error.message }
    }
    return { error: "Unknown error" }
}

// ❌ ผิด
try {
    await riskyOperation()
} catch (error) {  // implicit any!
    return { error: error.message }
}
```

---

## 📝 Common Type Utilities

```typescript
// Pick/Omit
type UserPublic = Pick<User, "id" | "name" | "email">
type UserWithoutPassword = Omit<User, "password">

// Readonly
type DeepReadonly<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> }

// Record
type RolePermissions = Record<Role, readonly string[]>
```

---

## 🎨 Component Conventions

- ใช้ **PascalCase** สำหรับ Component names
- ใช้ **camelCase** สำหรับ variables และ functions
- ใช้ **SCREAMING_SNAKE_CASE** สำหรับ constants

```typescript
// Component
export function UserProfile(): React.JSX.Element { }

// Variable
const userName = "John"
const isLoggedIn = true

// Constant
const MAX_ITEMS = 100
const API_BASE_URL = "/api"
```

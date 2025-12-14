# UI Design Patterns

> UI Components และ Design Patterns สำหรับ My Village

## 🚨 CRITICAL RULES (อย่าละเมิด!)

### 1. Card MUST use Glassmorphism
```tsx
// ✅ CORRECT - ใช้ pattern นี้เสมอ
<Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">

// ❌ WRONG - ห้ามใช้ <Card> เปล่าๆ
<Card>
```

### 2. Text Color MUST use Slate (ไม่ใช่ Gray)
```tsx
// ✅ CORRECT
className="text-slate-900 dark:text-white"         // หัวข้อ
className="text-slate-600 dark:text-slate-400"     // รายละเอียด
className="text-slate-500 dark:text-slate-400"     // ข้อความรอง

// ❌ WRONG - ห้ามใช้ gray
className="text-gray-900"
className="text-gray-600"
```

### 3. Background MUST use Opacity
```tsx
// ✅ CORRECT - ใช้ opacity
className="bg-slate-100/50 dark:bg-white/5"        // inner elements
className="bg-slate-200/50 dark:bg-white/10"       // progress bars

// ❌ WRONG - ห้ามใช้สีทึบ
className="bg-slate-800"
className="bg-gray-200"
```

---

## 🎨 Color Palette

| Role | Gradient | Ring Color |
|------|----------|------------|
| Resident | `emerald-500 → cyan-500` | `ring-emerald-500` |
| Admin | `purple-500 → pink-500` | `ring-purple-500` |
| Security | `blue-500 → indigo-500` | `ring-blue-500` |
| Maintenance | `orange-500 → red-500` | `ring-orange-500` |
| Super Admin | `violet-500 → purple-500` | `ring-violet-500` |

### Status Colors (Dark Mode Compatible!)
```tsx
const statusColors = {
    success: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
    warning: "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
    error: "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20",
    info: "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
    neutral: "bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20",
}
```

---

## 🏗️ Design Tokens

### Cards (Glassmorphism - MUST USE!)
```tsx
// Base Card
<Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">

// Interactive Card
<Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 hover:shadow-xl transition-all duration-300 cursor-pointer">

// Selected Card
<Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm ring-2 ring-purple-500 shadow-lg shadow-purple-500/10">

// Error Card
<Card className="bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-500/30 backdrop-blur-sm">
```

### Gradient Buttons
```tsx
// Resident
<Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-emerald-500/25">

// Admin
<Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25">

// Security
<Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25">
```

### Status Badges (Dark Mode Compatible!)
```tsx
// Pending
<Badge className="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20">

// Approved / Success
<Badge className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20">

// Rejected / Error
<Badge className="bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20">

// In Progress / Info
<Badge className="bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20">

// Completed
<Badge className="bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20">
```

### Hover Effects
```tsx
<div className="hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
```

### Input Fields
```tsx
<Input className="h-12 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 focus:border-emerald-500" />
```

### Inner Elements (ภายใน Cards)
```tsx
// Row Item
<div className="p-4 bg-slate-100/50 dark:bg-white/5 rounded-lg">

// Progress Bar Track
<div className="w-full bg-slate-200/50 dark:bg-white/10 rounded-full h-2">

// Loading Skeleton
<div className="h-4 bg-slate-200/50 dark:bg-white/10 rounded animate-pulse">
```

---

## 📐 Typography

- **Base:** 18px
- **h1:** text-3xl (30px) `text-slate-900 dark:text-white font-bold`
- **h2:** text-2xl (24px) `text-slate-900 dark:text-white font-semibold`
- **h3:** text-xl (20px) `text-slate-800 dark:text-white font-medium`
- **Body:** text-base (18px) `text-slate-700 dark:text-slate-300`
- **Small:** text-sm (16px) `text-slate-600 dark:text-slate-400`
- **Muted:** text-sm (16px) `text-slate-500 dark:text-slate-400`

---

## 🎭 Icons

ใช้ **Lucide React**:
```tsx
import { Home, User, Package, Bell, AlertTriangle } from "lucide-react"

<Home className="w-5 h-5" />
```

---

## 📱 Page Template

```tsx
export default function Page(): React.JSX.Element {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Page Title
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Page description
                </p>
            </div>
            
            {/* Content */}
            <Card className="bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Content</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Your content here</p>
                </CardContent>
            </Card>
        </div>
    )
}
```

---

## 🧩 shadcn/ui Components

ติดตั้งด้วย:
```bash
bunx shadcn@latest add [component-name]
```

**Installed Components:**
- button, card, input, label
- dialog, dropdown-menu
- toast (sonner), badge
- tabs, table, separator
- avatar, skeleton, alert
- select, checkbox, radio-group
- form, popover, calendar
- switch, textarea, scroll-area

---

## 🎬 Animation & Motion

### Page Transitions (AUTOMATIC)

ทุก route ใน `(dashboard)` มี `template.tsx` ที่ wrap content ด้วย `PageTransition`:

```
app/(dashboard)/
├── admin/template.tsx      ✅
├── resident/template.tsx   ✅
├── security/template.tsx   ✅
├── maintenance/template.tsx ✅
├── super-admin/template.tsx ✅
├── bills/template.tsx      ✅
└── reports/template.tsx    ✅
```

**ไม่ต้องเพิ่ม animation ใน pages เอง** - `template.tsx` จัดการให้แล้ว!

### Animation Components

Import จาก `@/components/ui/page-transition`:

```tsx
import {
    FadeIn,
    SlideIn,
    ScaleIn,
    StaggerContainer,
    StaggerItem,
    AnimatedCard,
    AnimatedListItem,
} from "@/components/ui/page-transition"
```

### Staggered Lists

สำหรับ list ที่ต้องการให้ items ขึ้นมาทีละตัว:

```tsx
<StaggerContainer staggerDelay={0.1}>
    {items.map((item, i) => (
        <StaggerItem key={item.id}>
            <Card>...</Card>
        </StaggerItem>
    ))}
</StaggerContainer>
```

### Animated Cards

สำหรับ cards ที่ต้องการ hover animation:

```tsx
<AnimatedCard delay={0.1}>
    <Card className="...glassmorphism...">
        ...
    </Card>
</AnimatedCard>
```

### Loading Skeletons

Import จาก `@/components/ui/loading-skeleton`:

```tsx
import {
    LoadingSkeleton,        // Base shimmer
    PageLoading,            // Full page spinner
    CardSkeleton,           // Card loading
    TableSkeleton,          // Table loading
    ListSkeleton,           // List loading
    DashboardCardSkeleton,  // Stats cards loading
} from "@/components/ui/loading-skeleton"
```

### Example: Loading State with Animation

```tsx
if (loading) {
    return (
        <div className="space-y-6">
            <DashboardCardSkeleton count={4} />
            <TableSkeleton rows={5} columns={4} />
        </div>
    )
}
```

### 🚨 Animation Rules

1. **ห้ามใช้ raw motion.div** ใน pages - ใช้ components ที่มีอยู่แล้ว
2. **ไม่ต้องเพิ่ม PageTransition ใน pages** - template.tsx จัดการให้
3. **ใช้ StaggerContainer/StaggerItem** สำหรับ lists
4. **ใช้ loading-skeleton components** สำหรับ loading states


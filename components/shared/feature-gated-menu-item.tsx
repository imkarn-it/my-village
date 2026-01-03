'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { FeatureGate, type FeatureKey } from '@/lib/features'
import type { LucideIcon } from 'lucide-react'

export interface MenuItem {
    label: string
    href: string
    icon: LucideIcon
    featureKey?: FeatureKey
    count?: number
    submenu?: { label: string; href: string }[]
}

interface FeatureGatedMenuItemProps {
    item: MenuItem
    isActive: boolean
    onClick?: () => void
    colorClass?: {
        active: string
        inactive: string
        iconActive: string
        iconInactive: string
    }
}

const defaultColors = {
    active: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-white shadow-lg shadow-purple-500/10 border border-purple-500/20',
    inactive: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50',
    iconActive: 'text-purple-500 dark:text-purple-400',
    iconInactive: 'text-slate-500',
}

export function FeatureGatedMenuItem({
    item,
    isActive,
    onClick,
    colorClass = defaultColors,
}: FeatureGatedMenuItemProps) {
    const menuContent = (
        <Link
            href={item.href}
            onClick={onClick}
            className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all duration-300',
                isActive ? colorClass.active : colorClass.inactive
            )}
        >
            <item.icon
                className={cn(
                    'w-5 h-5 transition-colors',
                    isActive ? colorClass.iconActive : colorClass.iconInactive
                )}
            />
            <span>{item.label}</span>
            {item.count && item.count > 0 && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                    {item.count}
                </span>
            )}
        </Link>
    )

    // If feature key is defined, wrap with FeatureGate
    if (item.featureKey) {
        return (
            <FeatureGate feature={item.featureKey}>
                {menuContent}
            </FeatureGate>
        )
    }

    return menuContent
}

// Color presets for different roles
export const MENU_COLORS = {
    admin: {
        active: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-white shadow-lg shadow-purple-500/10 border border-purple-500/20',
        inactive: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50',
        iconActive: 'text-purple-500 dark:text-purple-400',
        iconInactive: 'text-slate-500',
    },
    security: {
        active: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-white shadow-lg shadow-blue-500/10 border border-blue-500/20',
        inactive: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50',
        iconActive: 'text-blue-500 dark:text-blue-400',
        iconInactive: 'text-slate-500',
    },
    maintenance: {
        active: 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-600 dark:text-white shadow-lg shadow-orange-500/10 border border-orange-500/20',
        inactive: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50',
        iconActive: 'text-orange-500 dark:text-orange-400',
        iconInactive: 'text-slate-500',
    },
    superAdmin: {
        active: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-white shadow-lg shadow-emerald-500/10 border border-emerald-500/20',
        inactive: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50',
        iconActive: 'text-emerald-500 dark:text-emerald-400',
        iconInactive: 'text-slate-500',
    },
}

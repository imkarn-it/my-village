"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ==========================================
// Types
// ==========================================

type ThemeOption = "light" | "dark" | "system"

type ThemeMenuItem = {
    readonly value: ThemeOption
    readonly label: string
    readonly icon: typeof Sun
    readonly iconClassName: string
}

// ==========================================
// Constants
// ==========================================

const THEME_MENU_ITEMS = [
    {
        value: "light",
        label: "สว่าง",
        icon: Sun,
        iconClassName: "text-amber-500",
    },
    {
        value: "dark",
        label: "มืด",
        icon: Moon,
        iconClassName: "text-blue-400",
    },
    {
        value: "system",
        label: "ตามระบบ",
        icon: Monitor,
        iconClassName: "text-slate-500",
    },
] as const satisfies readonly ThemeMenuItem[]

// ==========================================
// Component
// ==========================================

export function ThemeToggle(): React.JSX.Element {
    const { setTheme, theme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Avoid hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                disabled
            >
                <Sun className="h-5 w-5" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        )
    }

    function handleThemeChange(newTheme: ThemeOption): void {
        setTheme(newTheme)
    }

    function getMenuItemClassName(itemValue: ThemeOption): string {
        return `cursor-pointer ${theme === itemValue ? "bg-slate-100 dark:bg-slate-800" : ""}`
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    {resolvedTheme === "dark" ? (
                        <Moon className="h-5 w-5 text-blue-400" />
                    ) : (
                        <Sun className="h-5 w-5 text-amber-500" />
                    )}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
            >
                {THEME_MENU_ITEMS.map((item) => {
                    const IconComponent = item.icon
                    return (
                        <DropdownMenuItem
                            key={item.value}
                            onClick={() => handleThemeChange(item.value)}
                            className={getMenuItemClassName(item.value)}
                        >
                            <IconComponent className={`mr-2 h-4 w-4 ${item.iconClassName}`} />
                            <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                        </DropdownMenuItem>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

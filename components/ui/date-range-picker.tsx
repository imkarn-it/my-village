"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { format, addDays, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { th } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type DateRange = {
    from: Date | undefined;
    to: Date | undefined;
};

type DateRangePickerProps = {
    value?: DateRange;
    onChange?: (range: DateRange | undefined) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    numberOfMonths?: number;
    align?: "start" | "center" | "end";
};

export function DateRangePicker({
    value,
    onChange,
    placeholder = "เลือกช่วงวัน",
    className,
    disabled = false,
    numberOfMonths = 2,
    align = "start"
}: DateRangePickerProps) {
    const [open, setOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const handleSelect = (range: DateRange | undefined) => {
        if (onChange) {
            onChange(range);
        }
        setOpen(false);
    };

    const handlePreset = (days: number) => {
        const now = new Date();
        const from = now;
        const to = addDays(now, days);
        onChange?.({ from, to });
    };

    const renderPresetButtons = () => {
        const presets = [
            { label: "วันนี้", days: 0 },
            { label: "7 วัน", days: 7 },
            { label: "30 วัน", days: 30 },
            { label: "3 เดือน", days: 90 },
        ];

        return (
            <div className="flex gap-1 flex-wrap">
                {presets.map(({ label, days }) => (
                    <Button
                        key={label}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreset(days)}
                    >
                        {label}
                    </Button>
                ))}
            </div>
        );
    };

    const renderCalendar = () => {
        return (
            <div className="space-y-4">
                {renderPresetButtons()}
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMonth(addDays(currentMonth, -numberOfMonths * 30))}
                        disabled={disabled}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium">
                        {format(currentMonth, "MMMM yyyy", { locale: th })}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMonth(addDays(currentMonth, numberOfMonths * 30))}
                        disabled={disabled}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <Calendar
                    mode="range"
                    defaultMonth={currentMonth}
                    selected={value}
                    onSelect={(range) => {
                        if (range && range.from && range.to) {
                            handleSelect({ from: range.from, to: range.to });
                        }
                    }}
                    numberOfMonths={numberOfMonths}
                    locale={th}
                    className="rounded-md border"
                />
            </div>
        );
    };

    const formatDate = (date: Date | undefined) => {
        if (!date) return "";
        return format(date, "d MMM yyyy", { locale: th });
    };

    const displayValue = () => {
        if (value?.from && value?.to) {
            if (format(value.from, "MMM yyyy", { locale: th }) === format(value.to, "MMM yyyy", { locale: th })) {
                return `${format(value.from, "d MMM", { locale: th })} - ${format(value.to, "d MMM yyyy", { locale: th })}`;
            }
            return `${formatDate(value.from)} - ${formatDate(value.to)}`;
        }
        if (value?.from) {
            return `ตั้งแต่: ${formatDate(value.from)}`;
        }
        if (value?.to) {
            return `ถึงถึง: ${formatDate(value.to)}`;
        }
        return placeholder;
    };

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            disabled && "cursor-not-allowed opacity-50",
                            className
                        )}
                        disabled={disabled}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {displayValue()}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align={align}>
                    {renderCalendar()}
                </PopoverContent>
            </Popover>
        </div>
    );
}
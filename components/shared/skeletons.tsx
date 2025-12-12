import { Card } from "@/components/ui/card";

export function AnnouncementsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card
                    key={i}
                    className="h-64 animate-pulse bg-slate-100 dark:bg-slate-800 border-none"
                />
            ))}
        </div>
    );
}

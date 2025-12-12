import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
            <AlertCircle className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">{message}</p>
            {onRetry && (
                <Button variant="outline" className="mt-4" onClick={onRetry}>
                    ลองใหม่อีกครั้ง
                </Button>
            )}
        </div>
    );
}

import type { ReactNode } from 'react';

import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';

type FormFieldFooterProps = {
    helper?: ReactNode;
    error?: string;
    className?: string;
};

/** Reserves equal space under paired form fields so inputs stay aligned. */
export function FormFieldFooter({
    helper,
    error,
    className,
}: FormFieldFooterProps) {
    return (
        <div className={cn('min-h-11 space-y-1', className)}>
            {helper ? (
                <p className="text-muted-foreground text-xs leading-snug">
                    {helper}
                </p>
            ) : (
                <span className="block min-h-5" aria-hidden />
            )}
            <InputError message={error} />
        </div>
    );
}

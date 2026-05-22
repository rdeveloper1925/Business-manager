import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type AppPageShellProps = {
    children: ReactNode;
    className?: string;
    /** Constrains form/narrow pages without centering them in the main area. */
    width?: 'xl' | '3xl' | 'full';
};

const widthClass: Record<NonNullable<AppPageShellProps['width']>, string> = {
    xl: 'max-w-xl',
    '3xl': 'max-w-3xl',
    full: 'max-w-full',
};

export function AppPageShell({
    children,
    className,
    width = 'full',
}: AppPageShellProps) {
    return (
        <div
            className={cn(
                'flex w-full flex-col gap-6 p-4',
                widthClass[width],
                className,
            )}
        >
            {children}
        </div>
    );
}

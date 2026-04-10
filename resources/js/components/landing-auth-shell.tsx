import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

/** Background orbs and shell colors aligned with the marketing `LandingPages/_layout`. */
export function LandingAuthShell({
    children,
    className,
}: PropsWithChildren<{ className?: string }>) {
    return (
        <div className="landing-shell relative min-h-svh">
            <div className="pointer-events-none fixed inset-0 z-0 opacity-90">
                <div className="absolute -left-16 top-20 h-64 w-64 rounded-full bg-[color-mix(in_oklab,var(--landing-primary)_48%,transparent)] blur-3xl landing-animate-float" />
                <div className="absolute top-72 right-0 h-80 w-80 rounded-full bg-[color-mix(in_oklab,var(--landing-accent)_40%,transparent)] blur-3xl landing-animate-float" />
            </div>
            <div className={cn('relative z-10', className)}>{children}</div>
        </div>
    );
}

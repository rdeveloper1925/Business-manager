import { Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { LandingAuthShell } from '@/components/landing-auth-shell';
import type { AuthLayoutProps } from '@/types';
import { home } from '@/routes';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <LandingAuthShell className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="group flex flex-col items-center gap-3 font-medium"
                        >
                            <div className="inline-flex items-center gap-3">
                                <AppLogo />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="landing-title text-xl font-semibold tracking-tight">
                                {title}
                            </h1>
                            <p className="landing-copy text-center text-sm">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </LandingAuthShell>
    );
}

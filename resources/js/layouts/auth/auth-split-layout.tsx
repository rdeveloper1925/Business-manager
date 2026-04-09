import { Link, usePage } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="landing-shell relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col overflow-hidden p-10 text-white lg:flex lg:border-r lg:border-[var(--landing-border)]">
                <div className="absolute inset-0 bg-[var(--landing-primary-strong)]" />
                <div className="pointer-events-none absolute inset-0 opacity-90">
                    <div className="absolute -left-8 top-16 h-56 w-56 rounded-full bg-[color-mix(in_oklab,var(--landing-accent)_45%,transparent)] blur-3xl landing-animate-float" />
                    <div className="absolute right-0 bottom-20 h-72 w-72 rounded-full bg-[color-mix(in_oklab,white_22%,transparent)] blur-3xl landing-animate-float" />
                </div>
                <Link
                    href={home()}
                    className="relative z-20 flex items-center gap-3 text-lg font-semibold tracking-wide text-white"
                >
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/15 font-semibold text-white ring-2 ring-white/25">
                        BM
                    </span>
                    <span>{name}</span>
                </Link>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <AppLogo />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="landing-title text-xl font-semibold tracking-tight">
                            {title}
                        </h1>
                        <p className="landing-copy text-sm text-balance">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}

import { Head, Link, usePage } from '@inertiajs/react';
import { Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { home } from '@/routes';
import {
    contact as landingContact,
    demo as landingDemo,
    overview as landingOverview,
} from '@/routes/landing';

type NavigationItem = {
    href: string;
    label: string;
};

const navigation: NavigationItem[] = [
    { href: home.url(), label: 'Home' },
    { href: landingOverview.url(), label: 'Product' },
    { href: landingDemo.url(), label: 'Request Demo' },
    { href: landingContact.url(), label: 'Contact' },
];

function LandingThemeToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isLight = resolvedAppearance === 'light';

    return (
        <div
            className="landing-surface-muted flex shrink-0 items-center gap-0.5 rounded-lg border p-1"
            role="group"
            aria-label="Color theme"
        >
            <button
                type="button"
                onClick={() => updateAppearance('light')}
                aria-pressed={isLight}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-semibold transition sm:px-3 ${
                    isLight
                        ? 'bg-[var(--landing-primary)] text-white shadow-sm'
                        : 'landing-copy hover:bg-[color-mix(in_oklab,var(--landing-surface-muted)_70%,transparent)] hover:text-[var(--landing-text)]'
                }`}
            >
                <Sun className="size-4 shrink-0" aria-hidden />
                <span className="hidden sm:inline">Light</span>
                <span className="sr-only sm:hidden">Light mode</span>
            </button>
            <button
                type="button"
                onClick={() => updateAppearance('dark')}
                aria-pressed={!isLight}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-semibold transition sm:px-3 ${
                    !isLight
                        ? 'bg-[var(--landing-primary)] text-white shadow-sm'
                        : 'landing-copy hover:bg-[color-mix(in_oklab,var(--landing-surface-muted)_70%,transparent)] hover:text-[var(--landing-text)]'
                }`}
            >
                <Moon className="size-4 shrink-0" aria-hidden />
                <span className="hidden sm:inline">Dark</span>
                <span className="sr-only sm:hidden">Dark mode</span>
            </button>
        </div>
    );
}

export default function LandingLayout({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    const { url } = usePage();

    return (
        <>
            <Head title={title}>
                <meta name="description" content={description} />
            </Head>
            <div className="landing-shell min-h-screen">
                <div className="pointer-events-none fixed inset-0 z-0 opacity-90">
                    <div className="absolute -left-16 top-20 h-64 w-64 rounded-full bg-[color-mix(in_oklab,var(--landing-primary)_48%,transparent)] blur-3xl landing-animate-float" />
                    <div className="absolute right-0 top-72 h-80 w-80 rounded-full bg-[color-mix(in_oklab,var(--landing-accent)_40%,transparent)] blur-3xl landing-animate-float" />
                </div>

                <header className="sticky top-0 z-20 border-b border-[var(--landing-border)] bg-[color-mix(in_oklab,var(--landing-surface)_90%,transparent)] backdrop-blur">
                    <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 lg:px-8">
                        <Link
                            href={home.url()}
                            prefetch="hover"
                            className="group inline-flex items-center gap-3 landing-animate-up"
                        >
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[var(--landing-primary)] font-semibold text-white shadow-md ring-2 ring-[color-mix(in_oklab,var(--landing-primary)_35%,transparent)]">
                                BM
                            </span>
                            <span className="text-sm font-semibold tracking-wide landing-title transition group-hover:opacity-90">
                                Business Manager
                            </span>
                        </Link>
                        <div className="flex flex-wrap items-center justify-end gap-3">
                            <nav className="landing-surface-muted landing-animate-up-delay flex max-w-full flex-wrap items-center gap-1 rounded-lg border p-1">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        prefetch="hover"
                                        className={`rounded-md px-3 py-2 text-sm transition ${
                                            url === item.href
                                                ? 'bg-[var(--landing-primary)] text-white shadow-sm'
                                                : 'landing-copy hover:bg-[color-mix(in_oklab,var(--landing-surface-muted)_55%,transparent)] hover:text-[var(--landing-text)]'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                            <LandingThemeToggle />
                        </div>
                    </div>
                </header>

                <main className="relative z-10">{children}</main>

                <footer className="landing-surface relative z-10 border-t">
                    <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-8 text-sm landing-copy lg:flex-row lg:items-center lg:justify-between lg:px-8">
                        <p>Business Manager Platform for Operations and Finance Teams</p>
                        <div className="flex items-center gap-5">
                            <Link
                                href={landingOverview.url()}
                                prefetch="hover"
                                className="transition hover:text-[var(--landing-text)]"
                            >
                                Product
                            </Link>
                            <Link
                                href={landingDemo.url()}
                                prefetch="hover"
                                className="transition hover:text-[var(--landing-text)]"
                            >
                                Demo
                            </Link>
                            <Link
                                href={landingContact.url()}
                                prefetch="hover"
                                className="transition hover:text-[var(--landing-text)]"
                            >
                                Contact
                            </Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

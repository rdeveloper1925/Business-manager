import { Link } from '@inertiajs/react';
import { contact as landingContact, demo as landingDemo, overview as landingOverview } from '@/routes/landing';
import LandingLayout from './_layout';

const corePillars = [
    {
        name: 'Customer Data',
        details: 'Centralized customer profiles, lifecycle history, engagement notes, and account ownership.',
    },
    {
        name: 'Suppliers',
        details: 'Supplier directory with contract terms, lead times, cost tracking, and purchase performance.',
    },
    {
        name: 'Inventory',
        details: 'Live stock levels, movement visibility, reorder thresholds, and warehouse accountability.',
    },
    {
        name: 'Invoicing',
        details: 'Fast invoice generation, status tracking, due-date reminders, and payment reconciliation.',
    },
    {
        name: 'Reporting',
        details: 'Executive and operational dashboards covering sales, margins, expenses, and fulfillment KPIs.',
    },
    {
        name: 'Receipts & Financial Records',
        details: 'Digital receipt storage and auditable records for books, taxes, and period close.',
    },
];

const headlineMetrics = [
    { label: 'Data silos reduced', value: '68%' },
    { label: 'Invoice cycle acceleration', value: '41%' },
    { label: 'Month-end close improvement', value: '32%' },
    { label: 'Supplier response consistency', value: '2.3x' },
];

const operatingFlow = [
    {
        title: 'Capture',
        text: 'Collect customer, supplier, and transaction data in structured workflows.',
    },
    {
        title: 'Coordinate',
        text: 'Align procurement, inventory, invoicing, and finance teams in one system.',
    },
    {
        title: 'Control',
        text: 'Monitor risk, cash movement, stock exposure, and compliance checkpoints.',
    },
    {
        title: 'Report',
        text: 'Publish decision-ready dashboards for operations and leadership.',
    },
];

export default function LandingPage() {
    return (
        <LandingLayout
            title="Business Manager Platform"
            description="A unified business management platform for customer, supplier, inventory, invoicing, reporting, and finance workflows."
        >
            <section className="relative overflow-hidden border-b landing-surface">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--landing-primary)_18%,transparent),transparent_52%)]" />
                <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:px-8">
                    <div className="relative landing-animate-up">
                        <p className="landing-tag mb-4 inline-flex rounded-full border px-4 py-1 text-xs font-medium uppercase tracking-[0.18em]">
                            Operations + Finance in one platform
                        </p>
                        <h1 className="landing-title text-4xl font-semibold tracking-tight sm:text-5xl">
                            Run your business from one modern command center.
                        </h1>
                        <p className="landing-copy mt-6 max-w-2xl text-lg leading-8">
                            Business Manager unifies customer data, supplier workflows, inventory control, invoicing, reports, receipts, and financial records so your team can execute faster with confidence.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <Link
                                href={landingDemo.url()}
                                prefetch="hover"
                                className="landing-btn-primary rounded-md px-5 py-3 text-sm font-semibold transition"
                            >
                                Request a Demo
                            </Link>
                            <Link
                                href={landingOverview.url()}
                                prefetch="hover"
                                className="landing-btn-secondary rounded-md border px-5 py-3 text-sm font-semibold transition"
                            >
                                Explore Product
                            </Link>
                        </div>
                    </div>

                    <div className="landing-surface-muted landing-animate-up-delay rounded-2xl border p-6 shadow-xl shadow-black/5">
                        <h2 className="landing-title text-lg font-semibold">What teams gain quickly</h2>
                        <ul className="landing-copy mt-6 space-y-4 text-sm">
                            <li className="landing-surface rounded-lg border p-4">
                                Faster month-end close with organized receipts and financial records.
                            </li>
                            <li className="landing-surface rounded-lg border p-4">
                                Better purchasing decisions using supplier performance and inventory trends.
                            </li>
                            <li className="landing-surface rounded-lg border p-4">
                                Fewer billing delays through structured invoicing and payment tracking.
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8">
                <div className="mb-8 max-w-3xl">
                    <h2 className="landing-title text-3xl font-semibold">Everything your business operations need</h2>
                    <p className="landing-copy mt-3">
                        Designed for teams that want practical control, clear reporting, and reliable execution.
                    </p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {corePillars.map((pillar) => (
                        <article
                            key={pillar.name}
                            className="landing-surface rounded-xl border p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5"
                        >
                            <h3 className="landing-title text-lg font-semibold">{pillar.name}</h3>
                            <p className="landing-copy mt-3 text-sm leading-6">{pillar.details}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="landing-surface border-y">
                <div className="mx-auto w-full max-w-7xl px-6 py-14 lg:px-8">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {headlineMetrics.map((metric) => (
                            <article key={metric.label} className="landing-surface-muted rounded-xl border p-5">
                                <p className="landing-title text-2xl font-semibold">{metric.value}</p>
                                <p className="landing-copy mt-2 text-sm">{metric.label}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8">
                <div className="mb-8 max-w-3xl">
                    <h2 className="landing-title text-3xl font-semibold">How teams operate with Business Manager</h2>
                    <p className="landing-copy mt-3">
                        A practical framework that scales from daily transactions to executive reporting.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {operatingFlow.map((step) => (
                        <article key={step.title} className="landing-surface rounded-xl border p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--landing-primary)]">
                                {step.title}
                            </p>
                            <p className="landing-copy mt-3 text-sm leading-6">{step.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="landing-muted-bg border-y border-[var(--landing-border)]">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-14 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                    <div>
                        <h2 className="landing-title text-2xl font-semibold">See Business Manager in action</h2>
                        <p className="landing-copy mt-2">
                            Book a personalized walkthrough and discover how your workflows can be streamlined.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Link
                            href={landingDemo.url()}
                            prefetch="hover"
                            className="landing-btn-accent rounded-md px-5 py-3 text-sm font-semibold transition"
                        >
                            Schedule Demo
                        </Link>
                        <Link
                            href={landingContact.url()}
                            prefetch="hover"
                            className="landing-btn-secondary rounded-md border px-5 py-3 text-sm font-semibold transition"
                        >
                            Contact Team
                        </Link>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}

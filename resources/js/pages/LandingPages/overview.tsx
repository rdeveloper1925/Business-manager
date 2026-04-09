import { Link } from '@inertiajs/react';
import LandingLayout from './_layout';

const modules = [
    {
        title: 'Customer Data Management',
        points: [
            'Maintain complete account profiles and ownership history.',
            'Track interactions, service requests, and account health indicators.',
            'Align teams around a single source of customer truth.',
        ],
    },
    {
        title: 'Supplier Operations',
        points: [
            'Record supplier agreements, SLAs, and procurement history.',
            'Compare cost trends and delivery reliability over time.',
            'Improve vendor strategy with transparent performance metrics.',
        ],
    },
    {
        title: 'Inventory Control',
        points: [
            'View stock by location with movement and adjustment trails.',
            'Set reorder thresholds and avoid preventable stockouts.',
            'Connect inventory behavior to revenue and fulfillment outcomes.',
        ],
    },
    {
        title: 'Invoicing Workflows',
        points: [
            'Generate invoices quickly with accurate line-item details.',
            'Monitor open, overdue, and paid statuses in real time.',
            'Support cleaner AR operations and stronger cash collection.',
        ],
    },
    {
        title: 'Reporting and Analytics',
        points: [
            'Monitor KPI dashboards for leadership and department heads.',
            'Break down trends by customer segments, suppliers, and products.',
            'Move from manual exports to reliable decision-ready reporting.',
        ],
    },
    {
        title: 'Receipts and Financial Records',
        points: [
            'Digitize receipt capture and map records to financial categories.',
            'Create clean audit trails for internal and external reviews.',
            'Keep finance teams prepared for close, compliance, and tax periods.',
        ],
    },
];

const adoptionSteps = [
    'Discovery and process mapping',
    'Data migration and validation',
    'Role-based training and rollout',
    'Performance baseline and optimization',
];

const stakeholders = [
    {
        role: 'Operations',
        impact: 'Track stock, procurement, and fulfillment execution in one dashboard.',
    },
    {
        role: 'Finance',
        impact: 'Consolidate invoicing, receipts, and records for cleaner month-end close.',
    },
    {
        role: 'Leadership',
        impact: 'Access high-trust reporting across customers, suppliers, and performance.',
    },
];

export default function LandingOverviewPage() {
    return (
        <LandingLayout
            title="Product Overview"
            description="Explore core modules across customer management, suppliers, inventory, invoicing, reporting, receipts, and financial records."
        >
            <section className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8">
                <div className="max-w-3xl landing-animate-up">
                    <p className="landing-tag inline-flex rounded-full border px-4 py-1 text-xs font-medium uppercase tracking-[0.18em]">
                        Product Overview
                    </p>
                    <h1 className="landing-title mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                        Built for modern business operations
                    </h1>
                    <p className="landing-copy mt-5 text-lg leading-8">
                        Business Manager connects operational workflows and financial discipline. Each module shares context so teams can act from aligned data, not fragmented tools.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2">
                    {modules.map((module) => (
                        <article
                            key={module.title}
                            className="landing-surface rounded-xl border p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5"
                        >
                            <h2 className="landing-title text-xl font-semibold">{module.title}</h2>
                            <ul className="landing-copy mt-4 space-y-3 text-sm">
                                {module.points.map((point) => (
                                    <li key={point} className="flex gap-3">
                                        <span className="mt-1 h-2 w-2 rounded-full bg-[var(--landing-primary)]" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>
            </section>

            <section className="landing-surface border-y">
                <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-14 lg:grid-cols-2 lg:px-8">
                    <article className="landing-surface-muted rounded-xl border p-6">
                        <h2 className="landing-title text-xl font-semibold">Implementation path</h2>
                        <ol className="landing-copy mt-5 space-y-3 text-sm">
                            {adoptionSteps.map((step, index) => (
                                <li key={step} className="flex gap-3">
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--landing-primary)] text-xs font-semibold text-white">
                                        {index + 1}
                                    </span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </article>
                    <article className="landing-surface-muted rounded-xl border p-6">
                        <h2 className="landing-title text-xl font-semibold">Cross-team outcomes</h2>
                        <div className="mt-5 space-y-4">
                            {stakeholders.map((stakeholder) => (
                                <div key={stakeholder.role} className="landing-surface rounded-lg border p-4">
                                    <p className="text-sm font-semibold text-[var(--landing-primary)]">{stakeholder.role}</p>
                                    <p className="landing-copy mt-2 text-sm">{stakeholder.impact}</p>
                                </div>
                            ))}
                        </div>
                    </article>
                </div>
            </section>

            <section className="landing-muted-bg border-y border-[var(--landing-border)]">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-12 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                    <p className="landing-copy">
                        Want to see the workflow and reporting experience with your own use cases?
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link
                            href="/demo"
                            className="landing-btn-primary rounded-md px-5 py-3 text-sm font-semibold transition"
                        >
                            Request Demo
                        </Link>
                        <Link
                            href="/contact"
                            className="landing-btn-secondary rounded-md border px-5 py-3 text-sm font-semibold transition"
                        >
                            Talk to Sales
                        </Link>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}

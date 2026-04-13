import { Link } from '@inertiajs/react';
import LandingLayout from './_layout';

const demoTopics = [
    'Customer and supplier workflow mapping',
    'Inventory visibility and reorder automation',
    'Invoicing pipeline and payment reconciliation',
    'Reporting dashboards for leadership and operations',
    'Receipt capture and finance record compliance',
];

const agenda = [
    'Current-state workflow review',
    'Module walkthrough based on your priorities',
    'Data migration and integration considerations',
    'Timeline and adoption planning',
];

const prepChecklist = [
    'Top three operational bottlenecks',
    'Monthly invoice volume and approval flow',
    'Inventory turnover and reorder model',
    'Reporting cadence for leadership',
];

export default function LandingDemoPage() {
    return (
        <LandingLayout
            title="Request Demo"
            description="Request a Business Manager demo tailored to your customer, supplier, inventory, and finance processes."
        >
            <section className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8">
                <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
                    <div className="landing-animate-up">
                        <p className="landing-tag inline-flex rounded-full border px-4 py-1 text-xs font-medium uppercase tracking-[0.18em]">
                            Personalized Demo
                        </p>
                        <h1 className="landing-title mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                            See exactly how Business Manager fits your team
                        </h1>
                        <p className="landing-copy mt-5 text-lg leading-8">
                            A product specialist will walk through your operational setup, financial process, and reporting priorities so you can evaluate with real context.
                        </p>
                        <ul className="landing-copy mt-8 space-y-3">
                            {demoTopics.map((topic) => (
                                <li key={topic} className="flex gap-3">
                                    <span className="mt-1 h-2 w-2 rounded-full bg-[var(--landing-accent)]" />
                                    <span>{topic}</span>
                                </li>
                            ))}
                        </ul>
                        <article className="landing-surface mt-8 rounded-xl border p-5">
                            <h2 className="landing-title text-lg font-semibold">Typical demo agenda</h2>
                            <ol className="landing-copy mt-4 space-y-3 text-sm">
                                {agenda.map((item, index) => (
                                    <li key={item} className="flex gap-3">
                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--landing-primary)] text-xs font-semibold text-white">
                                            {index + 1}
                                        </span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ol>
                        </article>
                    </div>

                    <div className="landing-surface-muted landing-animate-up-delay rounded-2xl border p-8">
                        <h2 className="landing-title text-xl font-semibold">Demo Request Details</h2>
                        <p className="landing-copy mt-2 text-sm">
                            Share this information with our team to prepare a focused session:
                        </p>
                        <ul className="landing-copy mt-5 space-y-4 text-sm">
                            <li className="landing-surface rounded-lg border p-4">
                                Company name, team size, and active locations
                            </li>
                            <li className="landing-surface rounded-lg border p-4">
                                Current tools used for invoicing, inventory, and reporting
                            </li>
                            <li className="landing-surface rounded-lg border p-4">
                                Key challenges in customer operations or financial tracking
                            </li>
                        </ul>
                        <div className="mt-8 rounded-lg border border-[color-mix(in_oklab,var(--landing-primary)_30%,transparent)] bg-[color-mix(in_oklab,var(--landing-primary)_14%,transparent)] p-4 text-sm text-[var(--landing-text)]">
                            Email demo requests to{' '}
                            <span className="font-semibold text-[var(--landing-primary)]">demo@businessmanager.app</span>{' '}
                            and we will coordinate next steps.
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/contact"
                                className="landing-btn-primary rounded-md px-4 py-2.5 text-sm font-semibold transition"
                            >
                                Contact Sales
                            </Link>
                            <Link
                                href="/overview"
                                className="landing-btn-secondary rounded-md border px-4 py-2.5 text-sm font-semibold transition"
                            >
                                Review Features
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="landing-muted-bg border-y border-[var(--landing-border)]">
                <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
                    <h2 className="landing-title text-2xl font-semibold">How to prepare for the best demo</h2>
                    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {prepChecklist.map((item) => (
                            <article key={item} className="landing-surface rounded-xl border p-5">
                                <p className="landing-copy text-sm">{item}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}

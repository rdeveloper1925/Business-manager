import { Link } from '@inertiajs/react';
import LandingLayout from './_layout';

const channels = [
    {
        title: 'General Inquiries',
        value: 'hello@businessmanager.app',
        caption: 'Product questions, pricing details, and implementation planning.',
    },
    {
        title: 'Sales Team',
        value: '+1 (415) 555-0142',
        caption: 'Speak with a specialist about your workflows and rollout scope.',
    },
    {
        title: 'Support',
        value: 'support@businessmanager.app',
        caption: 'Assistance for existing customers and operational troubleshooting.',
    },
];

const officeLocations = [
    { city: 'San Francisco', hours: '8:00 AM - 6:00 PM', focus: 'Sales and onboarding' },
    { city: 'Chicago', hours: '8:00 AM - 6:00 PM', focus: 'Customer operations support' },
    { city: 'London', hours: '9:00 AM - 5:00 PM', focus: 'EMEA success and advisory' },
];

const commonQuestions = [
    'How quickly can we migrate customer and inventory data?',
    'Can Finance and Operations use role-specific dashboards?',
    'What is included in implementation and training support?',
];

export default function LandingContactPage() {
    return (
        <LandingLayout
            title="Contact"
            description="Connect with the Business Manager team for sales, support, and implementation guidance."
        >
            <section className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-8">
                <div className="max-w-3xl landing-animate-up">
                    <p className="landing-tag inline-flex rounded-full border px-4 py-1 text-xs font-medium uppercase tracking-[0.18em]">
                        Contact Information
                    </p>
                    <h1 className="landing-title mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                        Reach the right team quickly
                    </h1>
                    <p className="landing-copy mt-5 text-lg leading-8">
                        Whether you are evaluating a solution, planning deployment, or already operating on Business Manager, we are here to help.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 md:grid-cols-3">
                    {channels.map((channel) => (
                        <article key={channel.title} className="landing-surface rounded-xl border p-6 transition hover:-translate-y-0.5">
                            <h2 className="landing-title text-lg font-semibold">{channel.title}</h2>
                            <p className="mt-4 text-base font-medium text-[var(--landing-primary)]">{channel.value}</p>
                            <p className="landing-copy mt-3 text-sm leading-6">{channel.caption}</p>
                        </article>
                    ))}
                </div>

                <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
                    <article className="landing-surface rounded-2xl border p-8">
                        <h2 className="landing-title text-2xl font-semibold">Office Hours and Response Time</h2>
                        <p className="landing-copy mt-3">
                            Monday to Friday, 8:00 AM to 6:00 PM local time. Typical first response for new requests is under one business day.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-4">
                            <Link
                                href="/demo"
                                className="landing-btn-primary rounded-md px-5 py-3 text-sm font-semibold transition"
                            >
                                Book a Demo
                            </Link>
                            <Link
                                href="/overview"
                                className="landing-btn-secondary rounded-md border px-5 py-3 text-sm font-semibold transition"
                            >
                                View Product Overview
                            </Link>
                        </div>
                    </article>

                    <article className="landing-surface-muted rounded-2xl border p-8">
                        <h2 className="landing-title text-2xl font-semibold">Regional Availability</h2>
                        <div className="mt-5 space-y-4">
                            {officeLocations.map((location) => (
                                <div key={location.city} className="landing-surface rounded-lg border p-4">
                                    <p className="landing-title font-semibold">{location.city}</p>
                                    <p className="landing-copy mt-1 text-sm">{location.hours}</p>
                                    <p className="mt-2 text-sm text-[var(--landing-primary)]">{location.focus}</p>
                                </div>
                            ))}
                        </div>
                    </article>
                </div>
            </section>

            <section className="landing-muted-bg border-y border-[var(--landing-border)]">
                <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
                    <h2 className="landing-title text-2xl font-semibold">Frequently asked before first call</h2>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        {commonQuestions.map((question) => (
                            <article key={question} className="landing-surface rounded-xl border p-5">
                                <p className="landing-copy text-sm leading-6">{question}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
}

export default function AppLogo() {
    return (
        <>
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--landing-primary)] font-semibold text-white shadow-md ring-2 ring-[color-mix(in_oklab,var(--landing-primary)_35%,transparent)]">
                BM
            </span>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold tracking-wide text-[var(--landing-text)]">
                    Business Manager
                </span>
            </div>
        </>
    );
}

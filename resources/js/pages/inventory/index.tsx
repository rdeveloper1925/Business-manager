import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import { InventorySummaryCards } from '@/components/inventory/inventory-summary-cards';
import { LowStockAlertsTable } from '@/components/inventory/low-stock-alerts-table';
import { RecentTransactionsFeed } from '@/components/inventory/recent-transactions-feed';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { dashboard as inventoryDashboard } from '@/routes/inventory';
import { index as partsIndex } from '@/routes/inventory/parts';
import { create as transactionsCreate } from '@/routes/inventory/transactions';
import type {
    InventoryTransactionSummary,
    LowStockPart,
    SummaryCards,
} from '@/types/inventory';

export default function InventoryDashboard({
    summaryCards,
    lowStockParts,
    recentTransactions,
}: {
    summaryCards: SummaryCards;
    lowStockParts: LowStockPart[];
    recentTransactions: InventoryTransactionSummary[];
}) {
    return (
        <>
            <Head title="Inventory" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Inventory
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Stock levels, alerts, and recent activity
                        </p>
                    </div>
                    <Button type="button" asChild>
                        <Link href={transactionsCreate.url()} prefetch>
                            <Plus className="size-4" aria-hidden />
                            New transaction
                        </Link>
                    </Button>
                </div>

                <InventorySummaryCards cards={summaryCards} />

                <div className="grid gap-6 xl:grid-cols-2">
                    <section className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-lg font-semibold">Low stock alerts</h2>
                            <Button variant="link" size="sm" className="h-auto px-0" asChild>
                                <Link href={partsIndex.url()} prefetch>
                                    View all parts
                                </Link>
                            </Button>
                        </div>
                        <div className="landing-surface overflow-hidden rounded-xl border shadow-sm shadow-black/5">
                            <LowStockAlertsTable parts={lowStockParts} />
                        </div>
                    </section>

                    <section className="flex flex-col gap-3">
                        <h2 className="text-lg font-semibold">Recent transactions</h2>
                        <div className="landing-surface overflow-hidden rounded-xl border shadow-sm shadow-black/5">
                            <RecentTransactionsFeed
                                transactions={recentTransactions}
                            />
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}

InventoryDashboard.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard.url() },
        { title: 'Inventory', href: inventoryDashboard.url() },
    ],
};

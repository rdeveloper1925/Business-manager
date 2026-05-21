import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import { InventoryStatusCard } from '@/components/inventory/inventory-status-card';
import { PartInfoCard } from '@/components/inventory/part-info-card';
import { TransactionHistoryTable } from '@/components/inventory/transaction-history-table';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { dashboard as inventoryDashboard } from '@/routes/inventory';
import { edit as partsEdit, index as partsIndex } from '@/routes/inventory/parts';
import { create as transactionsCreate } from '@/routes/inventory/transactions';
import type { Part, StockSummary } from '@/types/inventory';

export default function PartsShow({
    part,
    summary,
}: {
    part: Part;
    summary: StockSummary;
}) {
    const transactions = part.inventory_transactions ?? [];

    return (
        <>
            <Head title={part.part_name} />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-3">
                        <Button variant="outline" size="sm" className="w-fit" asChild>
                            <Link href={partsIndex.url()} prefetch>
                                ← Back to parts
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {part.part_name}
                            </h1>
                            <p className="font-mono text-sm text-muted-foreground">
                                {part.part_number}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link
                                href={partsEdit.url({ part: part.part_id })}
                                prefetch
                            >
                                Edit part
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link
                                href={transactionsCreate.url({
                                    query: { part_id: part.part_id },
                                })}
                                prefetch
                            >
                                <Plus className="size-4" aria-hidden />
                                Record transaction
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <PartInfoCard part={part} />
                    <InventoryStatusCard
                        part={part}
                        inventory={part.inventory ?? null}
                        summary={summary}
                    />
                </div>

                <section className="flex flex-col gap-3">
                    <h2 className="text-lg font-semibold">Transaction history</h2>
                    <div className="landing-surface overflow-hidden rounded-xl border shadow-sm shadow-black/5">
                        <TransactionHistoryTable transactions={transactions} />
                    </div>
                </section>
            </div>
        </>
    );
}

PartsShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard.url() },
        { title: 'Inventory', href: inventoryDashboard.url() },
        { title: 'Parts', href: partsIndex.url() },
        { title: 'Part', href: '#' },
    ],
};

import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import { TransactionsFilters } from '@/components/inventory/transactions-filters';
import { TransactionsPagination } from '@/components/inventory/transactions-pagination';
import { TransactionsTable } from '@/components/inventory/transactions-table';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { dashboard as inventoryDashboard } from '@/routes/inventory';
import {
    create as transactionsCreate,
    index as transactionsIndex,
} from '@/routes/inventory/transactions';
import type {
    EnumOption,
    PaginatedTransactions,
    PartFilterOption,
    TransactionListFilters,
} from '@/types/inventory';

export default function TransactionsIndex({
    transactions,
    parts,
    transactionTypes,
    conditions,
    filters,
}: {
    transactions: PaginatedTransactions;
    parts: PartFilterOption[];
    transactionTypes: EnumOption[];
    conditions: EnumOption[];
    filters: TransactionListFilters;
}) {
    return (
        <>
            <Head title="Transactions" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Transactions
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Record and review inventory movements
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" asChild>
                            <Link href={transactionsCreate.url()} prefetch>
                                <Plus className="size-4" aria-hidden />
                                New transaction
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="landing-surface rounded-xl border p-4 shadow-sm shadow-black/5">
                    <TransactionsFilters
                        parts={parts}
                        transactionTypes={transactionTypes}
                        conditions={conditions}
                        filters={filters}
                    />
                </div>

                {transactions.total > 0 &&
                    transactions.from != null &&
                    transactions.to != null && (
                        <p className="text-sm text-muted-foreground">
                            Showing {transactions.from}–{transactions.to} of{' '}
                            {transactions.total}
                        </p>
                    )}

                <div className="landing-surface overflow-hidden rounded-xl border shadow-sm shadow-black/5">
                    <TransactionsTable transactions={transactions.data} />
                </div>

                <TransactionsPagination transactions={transactions} />
            </div>
        </>
    );
}

TransactionsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard.url() },
        { title: 'Inventory', href: inventoryDashboard.url() },
        { title: 'Transactions', href: transactionsIndex.url() },
    ],
};

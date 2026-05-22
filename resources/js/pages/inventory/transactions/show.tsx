import { Head, Link } from '@inertiajs/react';

import { TransactionDetailCard } from '@/components/inventory/transaction-detail-card';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { dashboard as inventoryDashboard } from '@/routes/inventory';
import {
    edit as transactionsEdit,
    index as transactionsIndex,
} from '@/routes/inventory/transactions';
import type { InventoryTransaction } from '@/types/inventory';

export default function TransactionsShow({
    transaction,
}: {
    transaction: InventoryTransaction;
}) {
    const title = transaction.part?.part_name ?? `Transaction #${transaction.transaction_id}`;

    return (
        <>
            <Head title={title} />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-3">
                        <Button variant="outline" size="sm" className="w-fit" asChild>
                            <Link href={transactionsIndex.url()} prefetch>
                                ← Back to transactions
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {title}
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Transaction #{transaction.transaction_id}
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link
                            href={transactionsEdit.url({
                                transaction: transaction.transaction_id,
                            })}
                            prefetch
                        >
                            Edit
                        </Link>
                    </Button>
                </div>

                <TransactionDetailCard transaction={transaction} />
            </div>
        </>
    );
}

TransactionsShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard.url() },
        { title: 'Inventory', href: inventoryDashboard.url() },
        { title: 'Transactions', href: transactionsIndex.url() },
        { title: 'Transaction', href: '#' },
    ],
};

import { Head, Link } from '@inertiajs/react';

import { TransactionForm } from '@/components/inventory/transaction-form';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { dashboard as inventoryDashboard } from '@/routes/inventory';
import {
    index as transactionsIndex,
} from '@/routes/inventory/transactions';
import type {
    EnumOption,
    InventorySupplierOption,
    TransactionPreselected,
} from '@/types/inventory';

export default function TransactionsCreate({
    suppliers,
    transactionTypes,
    conditions,
    preselected,
}: {
    suppliers: InventorySupplierOption[];
    transactionTypes: EnumOption[];
    conditions: EnumOption[];
    preselected: TransactionPreselected;
}) {
    return (
        <>
            <Head title="New Transaction" />

            <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4">
                <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="w-fit" asChild>
                        <Link href={transactionsIndex.url()} prefetch>
                            ← Back to transactions
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        New transaction
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Record a stock movement for a part.
                    </p>
                </div>

                <TransactionForm
                    suppliers={suppliers}
                    transactionTypes={transactionTypes}
                    conditions={conditions}
                    preselected={preselected}
                />
            </div>
        </>
    );
}

TransactionsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard.url() },
        { title: 'Inventory', href: inventoryDashboard.url() },
        { title: 'Transactions', href: transactionsIndex.url() },
        { title: 'New Transaction', href: '#' },
    ],
};

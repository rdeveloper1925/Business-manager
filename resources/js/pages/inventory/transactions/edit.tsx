import { Head, Link } from '@inertiajs/react';

import { AppPageShell } from '@/components/app-page-shell';
import { TransactionEditForm } from '@/components/inventory/transaction-edit-form';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { dashboard as inventoryDashboard } from '@/routes/inventory';
import {
    index as transactionsIndex,
    show as transactionsShow,
} from '@/routes/inventory/transactions';
import type {
    InventorySupplierOption,
    InventoryTransaction,
} from '@/types/inventory';

export default function TransactionsEdit({
    transaction,
    suppliers,
}: {
    transaction: InventoryTransaction;
    suppliers: InventorySupplierOption[];
}) {
    const title =
        transaction.part?.part_name ??
        `Transaction #${transaction.transaction_id}`;

    return (
        <>
            <Head title={`Edit ${title}`} />

            <AppPageShell width="3xl">
                <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="w-fit" asChild>
                        <Link
                            href={transactionsShow.url({
                                transaction: transaction.transaction_id,
                            })}
                            prefetch
                        >
                            ← Back to transaction
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Edit transaction
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Update unit cost, supplier, or notes for transaction #
                        {transaction.transaction_id}.
                    </p>
                </div>

                <TransactionEditForm
                    transaction={transaction}
                    suppliers={suppliers}
                />
            </AppPageShell>
        </>
    );
}

TransactionsEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard.url() },
        { title: 'Inventory', href: inventoryDashboard.url() },
        { title: 'Transactions', href: transactionsIndex.url() },
        { title: 'Transaction', href: '#' },
        { title: 'Edit', href: '#' },
    ],
};

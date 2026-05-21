import { Link } from '@inertiajs/react';

import { TransactionTypeBadge } from '@/components/inventory/transaction-type-badge';
import { getTransactionTypeConfig } from '@/constants/transactionTypeConfig';
import { formatDelta, formatInventoryDate } from '@/lib/inventory-format';
import { cn } from '@/lib/utils';
import { show as transactionShow } from '@/routes/inventory/transactions';
import type { InventoryTransactionSummary } from '@/types/inventory';

export function RecentTransactionsFeed({
    transactions,
}: {
    transactions: InventoryTransactionSummary[];
}) {
    if (transactions.length === 0) {
        return (
            <p className="text-muted-foreground p-6 text-center text-sm">
                No transactions recorded yet.
            </p>
        );
    }

    return (
        <ul className="divide-y">
            {transactions.map((transaction) => {
                const config = getTransactionTypeConfig(
                    transaction.transaction_type,
                );
                const partLabel =
                    transaction.part?.part_name ??
                    `Part #${transaction.part_id}`;

                return (
                    <li key={transaction.transaction_id}>
                        <Link
                            href={transactionShow.url({
                                transaction: transaction.transaction_id,
                            })}
                            className="hover:bg-muted/50 flex flex-col gap-2 px-4 py-3 transition-colors sm:flex-row sm:items-center sm:justify-between"
                            prefetch
                        >
                            <div className="flex min-w-0 flex-col gap-1">
                                <span className="truncate font-medium">
                                    {partLabel}
                                </span>
                                <div className="flex flex-wrap items-center gap-2">
                                    <TransactionTypeBadge
                                        type={transaction.transaction_type}
                                    />
                                    <span
                                        className={cn(
                                            'text-sm font-medium tabular-nums',
                                            config.deltaClassName,
                                        )}
                                    >
                                        {formatDelta(transaction.qty_delta)}
                                    </span>
                                </div>
                            </div>
                            <div className="text-muted-foreground flex shrink-0 flex-col text-sm sm:text-right">
                                <span>{transaction.performer?.name ?? '—'}</span>
                                <time dateTime={transaction.transacted_at}>
                                    {formatInventoryDate(transaction.transacted_at)}
                                </time>
                            </div>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}

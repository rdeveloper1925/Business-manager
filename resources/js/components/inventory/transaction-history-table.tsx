import { Link } from '@inertiajs/react';

import { TransactionTypeBadge } from '@/components/inventory/transaction-type-badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getTransactionTypeConfig } from '@/constants/transactionTypeConfig';
import {
    formatCondition,
    formatDelta,
    formatInventoryDate,
} from '@/lib/inventory-format';
import { cn } from '@/lib/utils';
import { show as transactionShow } from '@/routes/inventory/transactions';
import type { InventoryTransactionSummary } from '@/types/inventory';

export function TransactionHistoryTable({
    transactions,
}: {
    transactions: InventoryTransactionSummary[];
}) {
    if (transactions.length === 0) {
        return (
            <p className="text-muted-foreground p-6 text-center text-sm">
                No transactions for this part yet.
            </p>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Delta</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Performed by</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.map((transaction) => {
                    const config = getTransactionTypeConfig(
                        transaction.transaction_type,
                    );

                    return (
                        <TableRow key={transaction.transaction_id}>
                            <TableCell>
                                <Link
                                    href={transactionShow.url({
                                        transaction: transaction.transaction_id,
                                    })}
                                    className="font-medium hover:underline"
                                    prefetch
                                >
                                    <time dateTime={transaction.transacted_at}>
                                        {formatInventoryDate(transaction.transacted_at)}
                                    </time>
                                </Link>
                            </TableCell>
                            <TableCell>
                                <TransactionTypeBadge
                                    type={transaction.transaction_type}
                                />
                            </TableCell>
                            <TableCell
                                className={cn(
                                    'text-right font-medium tabular-nums',
                                    config.deltaClassName,
                                )}
                            >
                                {formatDelta(transaction.qty_delta)}
                            </TableCell>
                            <TableCell>
                                {formatCondition(transaction.condition)}
                            </TableCell>
                            <TableCell className="text-muted-foreground max-w-[12rem] truncate">
                                {transaction.notes ?? '—'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {transaction.performer?.name ?? '—'}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

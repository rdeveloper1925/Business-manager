import { TransactionRowActions } from '@/components/inventory/transaction-row-actions';
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
import { formatCurrency } from '@/lib/format-currency';
import {
    formatCondition,
    formatDelta,
    formatInventoryDate,
} from '@/lib/inventory-format';
import { cn } from '@/lib/utils';
import type { InventoryTransactionSummary } from '@/types/inventory';

export function TransactionsTable({
    transactions,
}: {
    transactions: InventoryTransactionSummary[];
}) {
    if (transactions.length === 0) {
        return (
            <p className="text-muted-foreground p-8 text-center text-sm">
                No transactions match your filters.
            </p>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Part</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Qty Delta</TableHead>
                    <TableHead className="text-right">Qty After</TableHead>
                    <TableHead className="text-right">Unit Cost</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Performed By</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                                <time dateTime={transaction.transacted_at}>
                                    {formatInventoryDate(transaction.transacted_at)}
                                </time>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">
                                        {transaction.part?.part_name ?? '—'}
                                    </span>
                                    <span className="text-muted-foreground font-mono text-xs">
                                        {transaction.part?.part_number ?? '—'}
                                    </span>
                                </div>
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
                            <TableCell className="text-right tabular-nums">
                                {transaction.qty_after}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {formatCurrency(transaction.unit_cost)}
                            </TableCell>
                            <TableCell>
                                {formatCondition(transaction.condition)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {transaction.performer?.name ?? '—'}
                            </TableCell>
                            <TableCell
                                className="text-muted-foreground max-w-[10rem] truncate"
                                title={transaction.notes ?? undefined}
                            >
                                {transaction.notes ?? '—'}
                            </TableCell>
                            <TableCell>
                                <TransactionRowActions
                                    transaction={transaction}
                                />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

import {
    Calendar,
    FileText,
    Hash,
    Package,
    Tag,
    UserRound,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

import { TransactionTypeBadge } from '@/components/inventory/transaction-type-badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { getTransactionTypeConfig } from '@/constants/transactionTypeConfig';
import { formatCurrency } from '@/lib/format-currency';
import {
    formatCondition,
    formatDelta,
    formatInventoryDateLong,
} from '@/lib/inventory-format';
import { cn } from '@/lib/utils';
import type { InventoryTransaction } from '@/types/inventory';

function display(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    return String(value);
}

function DetailField({
    icon: Icon,
    label,
    children,
    className,
}: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'bg-card/50 rounded-xl border p-4',
                className,
            )}
        >
            <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                <Icon className="size-3.5 shrink-0 opacity-70" aria-hidden />
                {label}
            </div>
            <div className="text-sm leading-relaxed break-words">{children}</div>
        </div>
    );
}

export function TransactionDetailCard({
    transaction,
}: {
    transaction: InventoryTransaction;
}) {
    const config = getTransactionTypeConfig(transaction.transaction_type);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Transaction details</CardTitle>
                <div className="flex items-center gap-2">
                    <TransactionTypeBadge
                        type={transaction.transaction_type}
                        showIcon
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                    <DetailField icon={Calendar} label="Transacted at">
                        <time dateTime={transaction.transacted_at}>
                            {formatInventoryDateLong(transaction.transacted_at)}
                        </time>
                    </DetailField>
                    <DetailField icon={Hash} label="Transaction ID">
                        #{transaction.transaction_id}
                    </DetailField>
                    <DetailField icon={Package} label="Part">
                        <div>
                            <p className="font-medium">
                                {display(transaction.part?.part_name)}
                            </p>
                            <p className="text-muted-foreground font-mono text-xs">
                                {display(transaction.part?.part_number)}
                            </p>
                        </div>
                    </DetailField>
                    <DetailField icon={Tag} label="Qty delta / after">
                        <span
                            className={cn(
                                'font-medium tabular-nums',
                                config.deltaClassName,
                            )}
                        >
                            {formatDelta(transaction.qty_delta)}
                        </span>
                        <span className="text-muted-foreground">
                            {' '}
                            → {transaction.qty_after} on hand
                        </span>
                    </DetailField>
                    <DetailField icon={Tag} label="Unit cost">
                        {formatCurrency(transaction.unit_cost)}
                    </DetailField>
                    <DetailField icon={Tag} label="Condition">
                        {formatCondition(transaction.condition)}
                    </DetailField>
                    <DetailField icon={UserRound} label="Performed by">
                        {display(transaction.performer?.name)}
                    </DetailField>
                    <DetailField icon={Package} label="Supplier">
                        {display(transaction.supplier?.company_name)}
                    </DetailField>
                    <DetailField
                        icon={FileText}
                        label="Notes"
                        className="sm:col-span-2"
                    >
                        {display(transaction.notes)}
                    </DetailField>
                </div>
            </CardContent>
        </Card>
    );
}

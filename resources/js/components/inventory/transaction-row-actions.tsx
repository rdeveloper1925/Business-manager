import { Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { show as transactionsShow } from '@/routes/inventory/transactions';
import type { InventoryTransactionSummary } from '@/types/inventory';

export function TransactionRowActions({
    transaction,
}: {
    transaction: InventoryTransactionSummary;
}) {
    const id = transaction.transaction_id;
    const label =
        transaction.part?.part_name ?? `Transaction #${id}`;

    return (
        <div className="flex items-center justify-end gap-0.5">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`View ${label}`}
                        asChild
                    >
                        <Link
                            href={transactionsShow.url({ transaction: id })}
                            prefetch
                            preserveScroll
                        >
                            <Eye className="size-4" />
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>View</TooltipContent>
            </Tooltip>
        </div>
    );
}

import { Badge } from '@/components/ui/badge';
import { getTransactionTypeConfig } from '@/constants/transactionTypeConfig';
import type { TransactionTypeValue } from '@/types/inventory';

export function TransactionTypeBadge({
    type,
    showIcon = false,
}: {
    type: TransactionTypeValue;
    showIcon?: boolean;
}) {
    const config = getTransactionTypeConfig(type);
    const Icon = config.icon;

    return (
        <Badge variant={config.badgeVariant} className="gap-1">
            {showIcon ? <Icon className="size-3" aria-hidden /> : null}
            {config.label}
        </Badge>
    );
}

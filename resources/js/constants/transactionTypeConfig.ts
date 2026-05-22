import {
    ArrowDownLeft,
    ArrowLeftRight,
    ArrowUpRight,
    ClipboardList,
    PackageX,
    RotateCcw,
    SlidersHorizontal
    
} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';

import type { TransactionTypeValue } from '@/types/inventory';

export type TransactionTypeConfig = {
    label: string;
    icon: LucideIcon;
    badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive';
    deltaClassName: string;
};

export const transactionTypeConfig: Record<
    TransactionTypeValue,
    TransactionTypeConfig
> = {
    RESTOCK: {
        label: 'Restock',
        icon: ArrowDownLeft,
        badgeVariant: 'default',
        deltaClassName: 'text-emerald-600 dark:text-emerald-400',
    },
    SALE: {
        label: 'Sale',
        icon: ArrowUpRight,
        badgeVariant: 'secondary',
        deltaClassName: 'text-red-600 dark:text-red-400',
    },
    DAMAGED: {
        label: 'Damaged',
        icon: PackageX,
        badgeVariant: 'destructive',
        deltaClassName: 'text-red-600 dark:text-red-400',
    },
    ADJUSTMENT: {
        label: 'Adjustment',
        icon: SlidersHorizontal,
        badgeVariant: 'outline',
        deltaClassName: 'text-amber-600 dark:text-amber-400',
    },
    RETURN: {
        label: 'Return',
        icon: RotateCcw,
        badgeVariant: 'default',
        deltaClassName: 'text-emerald-600 dark:text-emerald-400',
    },
    TRANSFER: {
        label: 'Transfer',
        icon: ArrowLeftRight,
        badgeVariant: 'outline',
        deltaClassName: 'text-muted-foreground',
    },
    STOCKTAKE: {
        label: 'Stocktake',
        icon: ClipboardList,
        badgeVariant: 'secondary',
        deltaClassName: 'text-muted-foreground',
    },
};

export function getTransactionTypeConfig(
    type: TransactionTypeValue,
): TransactionTypeConfig {
    return transactionTypeConfig[type];
}

import type { PartSummary, StockStatus, StockSummary } from '@/types/inventory';

export function resolveStockStatus(
    part: Pick<PartSummary, 'reorder_point'> & {
        inventory?: { quantity_on_hand: number } | null;
        stock_summary?: StockSummary;
    },
): StockStatus {
    const onHand =
        part.stock_summary?.quantityOnHand ??
        part.inventory?.quantity_on_hand ??
        0;

    if (onHand <= 0) {
        return 'OUT';
    }

    if (part.stock_summary?.isBelowReorder ?? onHand <= part.reorder_point) {
        return 'LOW';
    }

    return 'OK';
}

export function stockStatusBadgeVariant(
    status: StockStatus,
): 'default' | 'secondary' | 'destructive' {
    if (status === 'OK') {
        return 'default';
    }

    if (status === 'LOW') {
        return 'secondary';
    }

    return 'destructive';
}

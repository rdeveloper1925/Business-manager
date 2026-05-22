import type { TransactionTypeValue } from '@/types/inventory';

export type QtyDeltaSignMode = 'positive' | 'negative' | 'either' | 'stocktake';

export function getQtyDeltaSignMode(
    type: TransactionTypeValue,
): QtyDeltaSignMode {
    switch (type) {
        case 'RESTOCK':
        case 'RETURN':
            return 'positive';
        case 'SALE':
        case 'DAMAGED':
            return 'negative';
        case 'STOCKTAKE':
            return 'stocktake';
        default:
            return 'either';
    }
}

export function normalizeQtyDelta(
    type: TransactionTypeValue,
    input: number,
): number {
    switch (getQtyDeltaSignMode(type)) {
        case 'positive':
            return Math.abs(input);
        case 'negative':
            return -Math.abs(input);
        default:
            return input;
    }
}

export function effectiveQtyDelta(
    type: TransactionTypeValue,
    magnitudeInput: string,
): number {
    const parsed = Number.parseInt(magnitudeInput, 10);

    if (Number.isNaN(parsed)) {
        return 0;
    }

    const mode = getQtyDeltaSignMode(type);

    if (mode === 'stocktake' || mode === 'either') {
        return parsed;
    }

    return normalizeQtyDelta(type, parsed);
}

export function qtyDeltaFieldLabel(type: TransactionTypeValue): string {
    const mode = getQtyDeltaSignMode(type);

    if (mode === 'positive' || mode === 'negative') {
        return 'Quantity';
    }

    return 'Qty delta';
}

export function qtyDeltaFieldHelper(type: TransactionTypeValue): string {
    const mode = getQtyDeltaSignMode(type);

    if (mode === 'positive') {
        return 'Added to stock (stored as a positive delta).';
    }

    if (mode === 'negative') {
        return 'Removed from stock (stored as a negative delta).';
    }

    if (mode === 'stocktake') {
        return 'Use positive or negative values; zero is allowed for stocktake.';
    }

    return 'Positive adds stock; negative removes stock.';
}

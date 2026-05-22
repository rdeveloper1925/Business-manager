export const APP_CURRENCY = 'CAD';

export function formatCurrency(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    const amount = typeof value === 'number' ? value : Number.parseFloat(value);

    if (Number.isNaN(amount)) {
        return '—';
    }

    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: APP_CURRENCY,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

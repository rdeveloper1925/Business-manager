import type { TransactionListFilters } from '@/types/inventory';

export function transactionsIndexQuery(
    filters: TransactionListFilters,
    options: {
        part_id?: number | null;
        transaction_types?: TransactionListFilters['transaction_types'];
        condition?: TransactionListFilters['condition'];
        date_from?: TransactionListFilters['date_from'];
        date_to?: TransactionListFilters['date_to'];
        page?: number;
    } = {},
): Record<string, string | number | string[]> {
    const partId = options.part_id !== undefined ? options.part_id : filters.part_id;
    const transactionTypes =
        options.transaction_types ?? filters.transaction_types;
    const condition =
        options.condition !== undefined ? options.condition : filters.condition;
    const dateFrom =
        options.date_from !== undefined ? options.date_from : filters.date_from;
    const dateTo = options.date_to !== undefined ? options.date_to : filters.date_to;
    const page = options.page;

    const query: Record<string, string | number | string[]> = {};

    if (partId !== null && partId !== undefined) {
        query.part_id = partId;
    }

    if (transactionTypes.length > 0) {
        query.transaction_types = transactionTypes;
    }

    if (condition !== null && condition !== undefined) {
        query.condition = condition;
    }

    if (dateFrom !== null && dateFrom !== undefined) {
        query.date_from = dateFrom;
    }

    if (dateTo !== null && dateTo !== undefined) {
        query.date_to = dateTo;
    }

    if (page !== undefined && page > 1) {
        query.page = page;
    }

    return query;
}

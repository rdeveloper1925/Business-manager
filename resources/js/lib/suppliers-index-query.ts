import type { SupplierListFilters } from '@/types/supplier';

export function suppliersIndexQuery(
    filters: SupplierListFilters,
    options: {
        search?: string;
        sort?: SupplierListFilters['sort'];
        direction?: SupplierListFilters['direction'];
        page?: number;
    } = {},
): Record<string, string | number> {
    const search = (options.search ?? filters.search).trim();
    const sort = options.sort ?? filters.sort;
    const direction = options.direction ?? filters.direction;
    const page = options.page;

    const query: Record<string, string | number> = { sort, direction };

    if (search !== '') {
        query.search = search;
    }

    if (page !== undefined && page > 1) {
        query.page = page;
    }

    return query;
}

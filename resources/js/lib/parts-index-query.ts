import type { PartListFilters } from '@/types/inventory';

export function partsIndexQuery(
    filters: PartListFilters,
    options: {
        search?: string;
        supplier_id?: number | null;
        sort?: PartListFilters['sort'];
        direction?: PartListFilters['direction'];
        page?: number;
    } = {},
): Record<string, string | number> {
    const search = (options.search ?? filters.search).trim();
    const sort = options.sort ?? filters.sort;
    const direction = options.direction ?? filters.direction;
    const supplierId =
        options.supplier_id !== undefined
            ? options.supplier_id
            : filters.supplier_id;
    const page = options.page;

    const query: Record<string, string | number> = { sort, direction };

    if (search !== '') {
        query.search = search;
    }

    if (supplierId !== null && supplierId !== undefined) {
        query.supplier_id = supplierId;
    }

    if (page !== undefined && page > 1) {
        query.page = page;
    }

    return query;
}

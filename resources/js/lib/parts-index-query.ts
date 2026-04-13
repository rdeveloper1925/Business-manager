import type { PartListFilters } from '@/types/parts';

export function partsIndexQuery(
    filters: PartListFilters,
    options: {
        search?: string;
        sort?: PartListFilters['sort'];
        direction?: PartListFilters['direction'];
        page?: number;
        view?: number;
        edit?: number;
    } = {},
): Record<string, string | number> {
    const search = (options.search ?? filters.search).trim();
    const sort = options.sort ?? filters.sort;
    const direction = options.direction ?? filters.direction;
    const page = options.page;
    const view = options.view;
    const edit = options.edit;

    const query: Record<string, string | number> = { sort, direction };

    if (search !== '') {
        query.search = search;
    }

    if (page !== undefined && page > 1) {
        query.page = page;
    }

    if (view !== undefined) {
        query.view = view;
    }

    if (edit !== undefined) {
        query.edit = edit;
    }

    return query;
}

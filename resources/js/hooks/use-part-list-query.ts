import { router } from '@inertiajs/react';
import type { OnChangeFn, SortingState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { partsIndexQuery } from '@/lib/parts-index-query';
import { index as partsIndex } from '@/routes/inventory/parts';
import type { PartListFilters } from '@/types/inventory';

const SORTABLE_IDS: PartListFilters['sort'][] = [
    'part_name',
    'part_number',
    'cost_price',
    'sell_price',
    'quantity_on_hand',
];

type UsePartListQueryArgs = {
    filters: PartListFilters;
};

export function usePartListQuery({ filters }: UsePartListQueryArgs) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const debouncedSearch = useDebouncedValue(searchInput, 300);

    useEffect(() => {
        const trimmed = debouncedSearch.trim();

        if (trimmed === filters.search) {
            return;
        }

        router.get(
            partsIndex.url({
                query: partsIndexQuery(filters, {
                    search: trimmed,
                    page: 1,
                }),
            }),
            {},
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    }, [debouncedSearch, filters]);

    const sorting = useMemo<SortingState>(
        () => [
            {
                id: filters.sort,
                desc: filters.direction === 'desc',
            },
        ],
        [filters.sort, filters.direction],
    );

    const handleSortingChange: OnChangeFn<SortingState> = useCallback(
        (updater) => {
            const nextSorting =
                typeof updater === 'function' ? updater(sorting) : updater;
            const sortColumn = nextSorting[0];

            if (!sortColumn) {
                return;
            }

            const columnId = sortColumn.id as PartListFilters['sort'];

            if (!SORTABLE_IDS.includes(columnId)) {
                return;
            }

            router.get(
                partsIndex.url({
                    query: partsIndexQuery(filters, {
                        search: searchInput.trim(),
                        sort: columnId,
                        direction: sortColumn.desc ? 'desc' : 'asc',
                        page: 1,
                    }),
                }),
                {},
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                },
            );
        },
        [sorting, filters, searchInput],
    );

    const setSupplierFilter = useCallback(
        (supplierId: number | null) => {
            router.get(
                partsIndex.url({
                    query: partsIndexQuery(filters, {
                        search: searchInput.trim(),
                        supplier_id: supplierId,
                        page: 1,
                    }),
                }),
                {},
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                },
            );
        },
        [filters, searchInput],
    );

    return {
        searchInput,
        setSearchInput,
        sorting,
        handleSortingChange,
        setSupplierFilter,
    };
}

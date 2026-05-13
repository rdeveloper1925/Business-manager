import { router } from '@inertiajs/react';
import type { OnChangeFn, SortingState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { suppliersIndexQuery } from '@/lib/suppliers-index-query';
import { index as suppliersIndex } from '@/routes/suppliers';
import type { SupplierListFilters } from '@/types/supplier';

const SORTABLE_IDS: SupplierListFilters['sort'][] = [
    'contact_person_name',
    'company_name',
    'phone',
    'email',
    'category',
];

type UseSupplierListQueryArgs = {
    filters: SupplierListFilters;
};

export function useSupplierListQuery({ filters }: UseSupplierListQueryArgs) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const debouncedSearch = useDebouncedValue(searchInput, 300);

    useEffect(() => {
        const trimmed = debouncedSearch.trim();

        if (trimmed === filters.search) {
            return;
        }

        router.get(
            suppliersIndex.url({
                query: suppliersIndexQuery(filters, {
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

            const columnId = sortColumn.id as SupplierListFilters['sort'];

            if (!SORTABLE_IDS.includes(columnId)) {
                return;
            }

            router.get(
                suppliersIndex.url({
                    query: suppliersIndexQuery(filters, {
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

    return {
        searchInput,
        setSearchInput,
        sorting,
        handleSortingChange,
    };
}

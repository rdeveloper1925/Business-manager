import { router } from '@inertiajs/react';
import type { OnChangeFn, SortingState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { customersIndexQuery } from '@/lib/customers-index-query';
import { index as customersIndex } from '@/routes/customers';
import type {
    Customer,
    CustomerListFilters,
    PaginatedCustomers,
} from '@/types/customer';

type UseCustomerListQueryArgs = {
    customers: PaginatedCustomers;
    filters: CustomerListFilters;
    profileCustomer: Customer | null;
    editCustomer: Customer | null;
};

export function useCustomerListQuery({
    customers,
    filters,
    profileCustomer,
    editCustomer,
}: UseCustomerListQueryArgs) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const debouncedSearch = useDebouncedValue(searchInput, 300);

    useEffect(() => {
        const trimmed = debouncedSearch.trim();

        if (trimmed === filters.search) {
            return;
        }

        router.get(
            customersIndex.url({
                query: customersIndexQuery(filters, {
                    search: trimmed,
                    page: 1,
                    view: profileCustomer?.customer_id,
                    edit: editCustomer?.customer_id,
                }),
            }),
            {},
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    }, [debouncedSearch, filters, profileCustomer, editCustomer]);

    const sorting = useMemo<SortingState>(
        () => [
            {
                id: filters.sort,
                desc: filters.direction === 'desc',
            },
        ],
        [filters.sort, filters.direction],
    );

    const closeProfile = useCallback(() => {
        router.get(
            customersIndex.url({
                query: customersIndexQuery(filters, {
                    search: searchInput.trim(),
                    page:
                        customers.current_page > 1
                            ? customers.current_page
                            : undefined,
                    edit: editCustomer?.customer_id,
                }),
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }, [customers.current_page, editCustomer?.customer_id, filters, searchInput]);

    const navigateToEditCustomer = useCallback(
        (customer: Customer) => {
            router.get(
                customersIndex.url({
                    query: customersIndexQuery(filters, {
                        search: searchInput.trim(),
                        page:
                            customers.current_page > 1
                                ? customers.current_page
                                : undefined,
                        edit: customer.customer_id,
                    }),
                }),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        },
        [filters, searchInput, customers.current_page],
    );

    const openCreateModal = useCallback(
        (onOpen: () => void) => {
            if (editCustomer !== null || profileCustomer !== null) {
                router.get(
                    customersIndex.url({
                        query: customersIndexQuery(filters, {
                            search: searchInput.trim(),
                            page:
                                customers.current_page > 1
                                    ? customers.current_page
                                    : undefined,
                        }),
                    }),
                    {},
                    {
                        preserveState: true,
                        replace: true,
                        preserveScroll: true,
                        onSuccess: onOpen,
                    },
                );

                return;
            }

            onOpen();
        },
        [editCustomer, profileCustomer, filters, searchInput, customers.current_page],
    );

    const handleFormDialogClose = useCallback(() => {
        if (editCustomer === null) {
            return;
        }

        router.get(
            customersIndex.url({
                query: customersIndexQuery(filters, {
                    search: searchInput.trim(),
                    page:
                        customers.current_page > 1
                            ? customers.current_page
                            : undefined,
                    view: profileCustomer?.customer_id,
                }),
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }, [
        editCustomer,
        filters,
        searchInput,
        customers.current_page,
        profileCustomer?.customer_id,
    ]);

    const handleSortingChange: OnChangeFn<SortingState> = useCallback(
        (updater) => {
            const nextSorting =
                typeof updater === 'function' ? updater(sorting) : updater;
            const sortColumn = nextSorting[0];

            if (!sortColumn) {
                return;
            }

            const columnId = sortColumn.id;

            if (
                columnId !== 'full_name' &&
                columnId !== 'phone_number' &&
                columnId !== 'email'
            ) {
                return;
            }

            router.get(
                customersIndex.url({
                    query: customersIndexQuery(filters, {
                        search: searchInput.trim(),
                        sort: columnId,
                        direction: sortColumn.desc ? 'desc' : 'asc',
                        page: 1,
                        view: profileCustomer?.customer_id,
                        edit: editCustomer?.customer_id,
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
        [
            sorting,
            filters,
            searchInput,
            profileCustomer?.customer_id,
            editCustomer?.customer_id,
        ],
    );

    return {
        searchInput,
        setSearchInput,
        sorting,
        closeProfile,
        navigateToEditCustomer,
        openCreateModal,
        handleFormDialogClose,
        handleSortingChange,
    };
}

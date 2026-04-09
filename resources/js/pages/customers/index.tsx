import { Head, router, usePage } from '@inertiajs/react';
import type { OnChangeFn, SortingState } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { CustomerFormDialog } from '@/components/customers/customer-form-dialog';
import { CustomerProfileDialog } from '@/components/customers/customer-profile-dialog';
import { createCustomerColumns } from '@/components/customers/customers-columns';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { customersIndexQuery } from '@/lib/customers-index-query';
import { decodeHtmlEntities } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as customersIndex } from '@/routes/customers';
import type {
    Customer,
    CustomerListFilters,
    PaginatedCustomers,
} from '@/types/customer';

const CUSTOMER_STORE_ERROR_KEYS = [
    'full_name',
    'organization_name',
    'phone_number',
    'email',
    'address',
    'tax_id',
] as const;

export default function CustomersIndex({
    customers,
    filters,
    profileCustomer,
    editCustomer,
}: {
    customers: PaginatedCustomers;
    filters: CustomerListFilters;
    profileCustomer: Customer | null;
    editCustomer: Customer | null;
}) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [createOpen, setCreateOpen] = useState(false);
    const debouncedSearch = useDebouncedValue(searchInput, 300);

    const pageErrors = usePage().props.errors as
        | Record<string, string | string[] | undefined>
        | undefined;
    const storeValidationSignature = pageErrors
        ? CUSTOMER_STORE_ERROR_KEYS.filter((key) => {
              const message = pageErrors[key];

              return message !== undefined && message !== '';
          }).join(',')
        : '';

    useEffect(() => {
        if (storeValidationSignature !== '' && editCustomer === null) {
            // Re-open create dialog when server returns store validation errors (Inertia flash).
            // eslint-disable-next-line react-hooks/set-state-in-effect -- sync dialog to server errors
            setCreateOpen(true);
        }
    }, [storeValidationSignature, editCustomer]);

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

    const closeProfile = () => {
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
    };

    const openCreateModal = () => {
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
                    onSuccess: () => setCreateOpen(true),
                },
            );

            return;
        }

        setCreateOpen(true);
    };

    const handleFormDialogOpenChange = (open: boolean) => {
        if (open) {
            return;
        }

        setCreateOpen(false);

        if (editCustomer !== null) {
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
        }
    };

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

            const sort = columnId;
            const direction = sortColumn.desc ? 'desc' : 'asc';
            router.get(
                customersIndex.url({
                    query: customersIndexQuery(filters, {
                        search: searchInput.trim(),
                        sort,
                        direction,
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

    const columns = useMemo(
        () =>
            createCustomerColumns({
                filters,
                searchInput,
                currentPage: customers.current_page,
                onEditCustomer: navigateToEditCustomer,
            }),
        [filters, searchInput, customers.current_page, navigateToEditCustomer],
    );

    const emptyDatabase = customers.total === 0 && filters.search === '';
    const noSearchResults = customers.total === 0 && filters.search !== '';

    const formModalOpen = createOpen || editCustomer !== null;

    return (
        <>
            <Head title="Customers" />

            <CustomerProfileDialog
                customer={profileCustomer}
                onClose={closeProfile}
                onEditCustomer={navigateToEditCustomer}
            />

            <CustomerFormDialog
                open={formModalOpen}
                onOpenChange={handleFormDialogOpenChange}
                customer={editCustomer}
            />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Customers
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage customer records
                        </p>
                    </div>
                    <Button type="button" onClick={openCreateModal}>
                        Add customer
                    </Button>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <div className="relative max-w-full min-w-[12rem] flex-1 sm:max-w-sm">
                        <Search
                            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden
                        />
                        <Input
                            id="customer-search"
                            type="search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search name, phone, or email…"
                            className="pl-9"
                            autoComplete="off"
                            aria-label="Search customers by name, phone, or email"
                        />
                    </div>
                    {customers.total > 0 &&
                        customers.from != null &&
                        customers.to != null && (
                            <p className="text-sm whitespace-nowrap text-muted-foreground">
                                Showing {customers.from}–{customers.to} of{' '}
                                {customers.total}
                            </p>
                        )}
                </div>

                <div className="landing-surface overflow-hidden rounded-xl border shadow-sm shadow-black/5">
                    {emptyDatabase ? (
                        <div className="flex flex-col items-center gap-4 p-8">
                            <p className="text-center text-sm text-muted-foreground">
                                No customers yet. Create one to get started.
                            </p>
                            <Button type="button" onClick={openCreateModal}>
                                Add customer
                            </Button>
                        </div>
                    ) : noSearchResults ? (
                        <p className="p-8 text-center text-sm text-muted-foreground">
                            No customers match your search.
                        </p>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={customers.data}
                            sorting={sorting}
                            onSortingChange={handleSortingChange}
                            getRowId={(row) => String(row.customer_id)}
                            aria-label="Customers"
                        />
                    )}
                </div>

                {customers.last_page > 1 && (
                    <nav
                        className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
                        aria-label="Pagination"
                    >
                        <div className="flex flex-wrap items-center justify-center gap-1">
                            {customers.links.map((link, i) => {
                                if (link.label === '...') {
                                    return (
                                        <span
                                            key={`ellipsis-${i}`}
                                            className="px-2 text-sm text-muted-foreground"
                                            aria-hidden
                                        >
                                            …
                                        </span>
                                    );
                                }

                                return (
                                    <Button
                                        key={`${link.label}-${i}`}
                                        type="button"
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        disabled={link.url === null}
                                        aria-current={
                                            link.active ? 'page' : undefined
                                        }
                                        onClick={() => {
                                            if (link.url) {
                                                router.get(
                                                    link.url,
                                                    {},
                                                    {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                    },
                                                );
                                            }
                                        }}
                                    >
                                        {decodeHtmlEntities(link.label)}
                                    </Button>
                                );
                            })}
                        </div>
                    </nav>
                )}
            </div>
        </>
    );
}

CustomersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard.url() },
        { title: 'Customers', href: customersIndex.url() },
    ],
};

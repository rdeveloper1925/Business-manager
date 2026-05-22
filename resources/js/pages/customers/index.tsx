import { Deferred, Head, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { CustomerFormDialog } from '@/components/customers/customer-form-dialog';
import { CustomerProfileDialog } from '@/components/customers/customer-profile-dialog';
import { createCustomerColumns } from '@/components/customers/customers-columns';
import { CustomersPagination } from '@/components/customers/customers-pagination';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCustomerListQuery } from '@/hooks/use-customer-list-query';
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
    'country',
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
    const [createOpen, setCreateOpen] = useState(false);
    const {
        searchInput,
        setSearchInput,
        sorting,
        closeProfile,
        navigateToEditCustomer,
        openCreateModal,
        handleFormDialogClose,
        handleSortingChange,
    } = useCustomerListQuery({
        customers,
        filters,
        profileCustomer,
        editCustomer,
    });

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

    const openCreateModalDialog = () => openCreateModal(() => setCreateOpen(true));

    const handleFormDialogOpenChange = (open: boolean) => {
        if (open) {
            return;
        }

        setCreateOpen(false);
        handleFormDialogClose();
    };

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

            <Deferred
                data="profileCustomer"
                fallback={
                    <div className="mx-4 h-16 animate-pulse rounded-lg border bg-muted/40" />
                }
            >
                <CustomerProfileDialog
                    customer={profileCustomer}
                    onClose={closeProfile}
                    onEditCustomer={navigateToEditCustomer}
                />
            </Deferred>

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
                    <Button type="button" onClick={openCreateModalDialog}>
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
                        <div className="flex flex-col items-start gap-4 p-8">
                            <p className="text-sm text-muted-foreground">
                                No customers yet. Create one to get started.
                            </p>
                            <Button
                                type="button"
                                onClick={openCreateModalDialog}
                            >
                                Add customer
                            </Button>
                        </div>
                    ) : noSearchResults ? (
                        <p className="p-8 text-sm text-muted-foreground">
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

                <CustomersPagination customers={customers} />
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

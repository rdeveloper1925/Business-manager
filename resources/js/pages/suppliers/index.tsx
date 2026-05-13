import { Head, Link } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useMemo } from 'react';

import { DataTable } from '@/components/data-table';
import { createSupplierColumns } from '@/components/suppliers/suppliers-columns';
import { SuppliersPagination } from '@/components/suppliers/suppliers-pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSupplierListQuery } from '@/hooks/use-supplier-list-query';
import { dashboard } from '@/routes';
import { create as suppliersCreate, index as suppliersIndex } from '@/routes/suppliers';
import type { PaginatedSuppliers, SupplierListFilters } from '@/types/supplier';

export default function SuppliersIndex({
    suppliers,
    filters,
}: {
    suppliers: PaginatedSuppliers;
    filters: SupplierListFilters;
}) {
    const { searchInput, setSearchInput, sorting, handleSortingChange } =
        useSupplierListQuery({ filters });

    const columns = useMemo(() => createSupplierColumns(), []);

    const emptyDatabase = suppliers.total === 0 && filters.search === '';
    const noSearchResults = suppliers.total === 0 && filters.search !== '';

    return (
        <>
            <Head title="Suppliers" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Suppliers
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage supplier contacts and categories
                        </p>
                    </div>
                    <Button type="button" asChild>
                        <Link href={suppliersCreate.url()} prefetch>
                            Add supplier
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <div className="relative max-w-full min-w-[12rem] flex-1 sm:max-w-sm">
                        <Search
                            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden
                        />
                        <Input
                            id="supplier-search"
                            type="search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search contact, company, phone, email…"
                            className="pl-9"
                            autoComplete="off"
                            aria-label="Search suppliers"
                        />
                    </div>
                    {suppliers.total > 0 &&
                        suppliers.from != null &&
                        suppliers.to != null && (
                            <p className="text-sm whitespace-nowrap text-muted-foreground">
                                Showing {suppliers.from}–{suppliers.to} of{' '}
                                {suppliers.total}
                            </p>
                        )}
                </div>

                <div className="landing-surface overflow-hidden rounded-xl border shadow-sm shadow-black/5">
                    {emptyDatabase ? (
                        <div className="flex flex-col items-center gap-4 p-8">
                            <p className="text-center text-sm text-muted-foreground">
                                No suppliers yet. Create one to get started.
                            </p>
                            <Button type="button" asChild>
                                <Link href={suppliersCreate.url()} prefetch>
                                    Add supplier
                                </Link>
                            </Button>
                        </div>
                    ) : noSearchResults ? (
                        <p className="p-8 text-center text-sm text-muted-foreground">
                            No suppliers match your search.
                        </p>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={suppliers.data}
                            sorting={sorting}
                            onSortingChange={handleSortingChange}
                            getRowId={(row) => row.id}
                            aria-label="Suppliers"
                        />
                    )}
                </div>

                <SuppliersPagination suppliers={suppliers} />
            </div>
        </>
    );
}

SuppliersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard.url() },
        { title: 'Suppliers', href: suppliersIndex.url() },
    ],
};

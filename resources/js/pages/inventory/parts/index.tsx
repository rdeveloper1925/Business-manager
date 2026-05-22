import { Head, Link } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useMemo } from 'react';

import { DataTable } from '@/components/data-table';
import { createPartColumns } from '@/components/inventory/parts-columns';
import { PartsPagination } from '@/components/inventory/parts-pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePartListQuery } from '@/hooks/use-part-list-query';
import { dashboard } from '@/routes';
import { dashboard as inventoryDashboard } from '@/routes/inventory';
import { create as partsCreate, index as partsIndex } from '@/routes/inventory/parts';
import type {
    InventorySupplierOption,
    PaginatedParts,
    PartListFilters,
} from '@/types/inventory';

export default function PartsIndex({
    parts,
    suppliers,
    filters,
}: {
    parts: PaginatedParts;
    suppliers: InventorySupplierOption[];
    filters: PartListFilters;
}) {
    const {
        searchInput,
        setSearchInput,
        sorting,
        handleSortingChange,
        setSupplierFilter,
    } = usePartListQuery({ filters });

    const columns = useMemo(() => createPartColumns(), []);

    const emptyDatabase =
        parts.total === 0 &&
        filters.search === '' &&
        filters.supplier_id === null;
    const noSearchResults = parts.total === 0 && !emptyDatabase;

    const supplierFilterValue =
        filters.supplier_id !== null ? String(filters.supplier_id) : 'all';

    return (
        <>
            <Head title="Parts" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Parts</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage parts, pricing, and stock thresholds
                        </p>
                    </div>
                    <Button type="button" asChild>
                        <Link href={partsCreate.url()} prefetch>
                            Add part
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
                    <div className="relative max-w-full min-w-[12rem] flex-1 sm:max-w-sm">
                        <Search
                            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden
                        />
                        <Input
                            id="part-search"
                            type="search"
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            placeholder="Search part name or number…"
                            className="pl-9"
                            autoComplete="off"
                            aria-label="Search parts"
                        />
                    </div>
                    <div className="grid w-full max-w-xs gap-2">
                        <Label htmlFor="supplier-filter">Supplier</Label>
                        <Select
                            value={supplierFilterValue}
                            onValueChange={(value) => {
                                setSupplierFilter(
                                    value === 'all' ? null : Number.parseInt(value, 10),
                                );
                            }}
                        >
                            <SelectTrigger id="supplier-filter" className="w-full">
                                <SelectValue placeholder="All suppliers" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All suppliers</SelectItem>
                                {suppliers.map((supplier) => (
                                    <SelectItem
                                        key={supplier.id}
                                        value={String(supplier.id)}
                                    >
                                        {supplier.company_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {parts.total > 0 &&
                        parts.from != null &&
                        parts.to != null && (
                            <p className="text-sm whitespace-nowrap text-muted-foreground lg:ml-auto">
                                Showing {parts.from}–{parts.to} of {parts.total}
                            </p>
                        )}
                </div>

                <div className="landing-surface overflow-hidden rounded-xl border shadow-sm shadow-black/5">
                    {emptyDatabase ? (
                        <div className="flex flex-col items-start gap-4 p-8">
                            <p className="text-sm text-muted-foreground">
                                No parts yet. Create one to get started.
                            </p>
                            <Button type="button" asChild>
                                <Link href={partsCreate.url()} prefetch>
                                    Add part
                                </Link>
                            </Button>
                        </div>
                    ) : noSearchResults ? (
                        <p className="p-8 text-sm text-muted-foreground">
                            No parts match your filters.
                        </p>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={parts.data}
                            sorting={sorting}
                            onSortingChange={handleSortingChange}
                            getRowId={(row) => String(row.part_id)}
                            aria-label="Parts"
                        />
                    )}
                </div>

                <PartsPagination parts={parts} />
            </div>
        </>
    );
}

PartsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard.url() },
        { title: 'Inventory', href: inventoryDashboard.url() },
        { title: 'Parts', href: partsIndex.url() },
    ],
};

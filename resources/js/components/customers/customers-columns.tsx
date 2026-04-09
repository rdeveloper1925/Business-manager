import type { ColumnDef } from '@tanstack/react-table';

import { CustomerRowActions } from '@/components/customers/customer-row-actions';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { Customer, CustomerListFilters } from '@/types/customer';

export function createCustomerColumns(context: {
    filters: CustomerListFilters;
    searchInput: string;
    currentPage: number;
    onEditCustomer: (customer: Customer) => void;
}): ColumnDef<Customer>[] {
    const { filters, searchInput, currentPage, onEditCustomer } = context;

    return [
        {
            accessorKey: 'full_name',
            id: 'full_name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Full name" />
            ),
            cell: ({ row }) => (
                <span className="font-medium">{row.getValue('full_name')}</span>
            ),
            enableSorting: true,
            enableHiding: false,
        },
        {
            accessorKey: 'phone_number',
            id: 'phone_number',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Phone" />
            ),
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.getValue('phone_number')}
                </span>
            ),
            enableSorting: true,
            enableHiding: false,
        },
        {
            accessorKey: 'email',
            id: 'email',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Email" />
            ),
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.getValue('email')}
                </span>
            ),
            enableSorting: true,
            enableHiding: false,
        },
        {
            id: 'actions',
            enableSorting: false,
            enableHiding: false,
            header: () => <div className="text-right font-medium">Actions</div>,
            cell: ({ row }) => (
                <CustomerRowActions
                    customer={row.original}
                    filters={filters}
                    searchInput={searchInput}
                    currentPage={currentPage}
                    onEditCustomer={onEditCustomer}
                />
            ),
        },
    ];
}

import type { ColumnDef } from '@tanstack/react-table';

import { SupplierRowActions } from '@/components/suppliers/supplier-row-actions';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { SupplierSummary } from '@/types/supplier';

function categoryBadgeVariant(
    category: SupplierSummary['category'],
): 'default' | 'secondary' | 'outline' {
    if (category === 'OEM') {
        return 'default';
    }

    if (category === 'Aftermarket') {
        return 'secondary';
    }

    return 'outline';
}

export function createSupplierColumns(): ColumnDef<SupplierSummary>[] {

    return [
        {
            accessorKey: 'contact_person_name',
            id: 'contact_person_name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Contact" />
            ),
            cell: ({ row }) => (
                <span className="font-medium">
                    {row.getValue('contact_person_name')}
                </span>
            ),
            enableSorting: true,
            enableHiding: false,
        },
        {
            accessorKey: 'company_name',
            id: 'company_name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Company" />
            ),
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.getValue('company_name')}
                </span>
            ),
            enableSorting: true,
            enableHiding: false,
        },
        {
            accessorKey: 'phone',
            id: 'phone',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Phone" />
            ),
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.getValue('phone')}
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
            accessorKey: 'category',
            id: 'category',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Category" />
            ),
            cell: ({ row }) => {
                const category = row.getValue(
                    'category',
                ) as SupplierSummary['category'];

                return (
                    <Badge variant={categoryBadgeVariant(category)}>
                        {category}
                    </Badge>
                );
            },
            enableSorting: true,
            enableHiding: false,
        },
        {
            id: 'actions',
            enableSorting: false,
            enableHiding: false,
            header: () => <div className="text-right font-medium">Actions</div>,
            cell: ({ row }) => <SupplierRowActions supplier={row.original} />,
        },
    ];
}

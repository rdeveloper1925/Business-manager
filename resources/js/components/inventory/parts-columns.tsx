import type { ColumnDef } from '@tanstack/react-table';

import { PartRowActions } from '@/components/inventory/part-row-actions';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { formatCurrency } from '@/lib/format-currency';
import {
    resolveStockStatus,
    stockStatusBadgeVariant,
} from '@/lib/stock-status';
import type { PartSummary } from '@/types/inventory';

function stockOnHand(part: PartSummary): number {
    return (
        part.stock_summary?.quantityOnHand ??
        part.inventory?.quantity_on_hand ??
        0
    );
}

export function createPartColumns(): ColumnDef<PartSummary>[] {
    return [
        {
            accessorKey: 'part_number',
            id: 'part_number',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Part Number" />
            ),
            cell: ({ row }) => (
                <span className="font-mono text-sm">{row.getValue('part_number')}</span>
            ),
            enableSorting: true,
            enableHiding: false,
        },
        {
            accessorKey: 'part_name',
            id: 'part_name',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Part Name" />
            ),
            cell: ({ row }) => (
                <span className="font-medium">{row.getValue('part_name')}</span>
            ),
            enableSorting: true,
            enableHiding: false,
        },
        {
            id: 'supplier',
            header: () => <span className="font-medium">Supplier</span>,
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.supplier?.company_name ?? '—'}
                </span>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: 'quantity_on_hand',
            accessorFn: (row) => stockOnHand(row),
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Stock on Hand" />
            ),
            cell: ({ row }) => (
                <span className="tabular-nums">{stockOnHand(row.original)}</span>
            ),
            enableSorting: true,
            enableHiding: false,
        },
        {
            accessorKey: 'reorder_point',
            id: 'reorder_point',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Reorder Point" />
            ),
            cell: ({ row }) => (
                <span className="tabular-nums">{row.getValue('reorder_point')}</span>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: 'status',
            header: () => <span className="font-medium">Status</span>,
            cell: ({ row }) => {
                const status = resolveStockStatus(row.original);

                return (
                    <Badge variant={stockStatusBadgeVariant(status)}>
                        {status}
                    </Badge>
                );
            },
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'cost_price',
            id: 'cost_price',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Cost Price" />
            ),
            cell: ({ row }) => (
                <span className="text-muted-foreground tabular-nums">
                    {formatCurrency(row.getValue('cost_price'))}
                </span>
            ),
            enableSorting: true,
            enableHiding: false,
        },
        {
            accessorKey: 'sell_price',
            id: 'sell_price',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Sell Price" />
            ),
            cell: ({ row }) => (
                <span className="text-muted-foreground tabular-nums">
                    {formatCurrency(row.getValue('sell_price'))}
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
            cell: ({ row }) => <PartRowActions part={row.original} />,
        },
    ];
}

import { Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { create as transactionsCreate } from '@/routes/inventory/transactions';
import type { LowStockPart } from '@/types/inventory';

export function LowStockAlertsTable({
    parts,
}: {
    parts: LowStockPart[];
}) {
    if (parts.length === 0) {
        return (
            <p className="text-muted-foreground p-6 text-center text-sm">
                No low-stock alerts right now.
            </p>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Part Name</TableHead>
                    <TableHead>Part Number</TableHead>
                    <TableHead className="text-right">Qty on Hand</TableHead>
                    <TableHead className="text-right">Reorder Point</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {parts.map((part) => {
                    const onHand =
                        part.stock_summary?.quantityOnHand ??
                        part.inventory?.quantity_on_hand ??
                        0;

                    return (
                        <TableRow key={part.part_id}>
                            <TableCell className="font-medium">
                                {part.part_name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {part.part_number}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {onHand}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                                {part.reorder_point}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button type="button" variant="outline" size="sm" asChild>
                                    <Link
                                        href={transactionsCreate.url({
                                            query: {
                                                part_id: part.part_id,
                                                transaction_type: 'RESTOCK',
                                            },
                                        })}
                                        prefetch
                                    >
                                        Record Restock
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

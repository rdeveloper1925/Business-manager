import { Boxes } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    resolveStockStatus,
    stockStatusBadgeVariant,
} from '@/lib/stock-status';
import { InventoryAdjustForm } from '@/components/inventory/inventory-adjust-form';
import type { InventoryRecord, Part, StockSummary } from '@/types/inventory';

export function InventoryStatusCard({
    part,
    inventory,
    summary,
}: {
    part: Pick<Part, 'part_id' | 'reorder_point'>;
    inventory: InventoryRecord | null;
    summary: StockSummary;
}) {
    const status = resolveStockStatus({
        reorder_point: part.reorder_point,
        inventory,
        stock_summary: summary,
    });

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                    <Boxes className="size-5" aria-hidden />
                    Inventory status
                </CardTitle>
                <Badge variant={stockStatusBadgeVariant(status)}>{status}</Badge>
            </CardHeader>
            <CardContent>
                <dl className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <dt className="text-muted-foreground text-xs font-medium uppercase">
                            On hand
                        </dt>
                        <dd className="text-2xl font-semibold tabular-nums">
                            {summary.quantityOnHand}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground text-xs font-medium uppercase">
                            Available
                        </dt>
                        <dd className="text-2xl font-semibold tabular-nums">
                            {summary.available}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground text-xs font-medium uppercase">
                            Reserved
                        </dt>
                        <dd className="text-lg font-medium tabular-nums">
                            {summary.quantityReserved}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground text-xs font-medium uppercase">
                            On order
                        </dt>
                        <dd className="text-lg font-medium tabular-nums">
                            {summary.quantityOnOrder}
                        </dd>
                    </div>
                </dl>
                {inventory !== null ? (
                    <InventoryAdjustForm part={part} inventory={inventory} />
                ) : null}
            </CardContent>
        </Card>
    );
}

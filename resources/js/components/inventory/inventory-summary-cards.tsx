import { AlertTriangle, Boxes, Package, Truck } from 'lucide-react';
import type { ComponentType } from 'react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { SummaryCards } from '@/types/inventory';

type CardConfig = {
    key: keyof SummaryCards;
    title: string;
    icon: ComponentType<{ className?: string }>;
};

const CARD_CONFIG: CardConfig[] = [
    { key: 'totalParts', title: 'Total Parts', icon: Package },
    { key: 'totalSkusInStock', title: 'SKUs in Stock', icon: Boxes },
    { key: 'lowStockAlerts', title: 'Low Stock Alerts', icon: AlertTriangle },
    { key: 'pendingOrders', title: 'Pending Orders', icon: Truck },
];

export function InventorySummaryCards({
    cards,
}: {
    cards: SummaryCards;
}) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {CARD_CONFIG.map(({ key, title, icon: Icon }) => (
                <Card key={key} className="py-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {title}
                        </CardTitle>
                        <Icon
                            className="text-muted-foreground size-4 shrink-0"
                            aria-hidden
                        />
                    </CardHeader>
                    <CardContent className="px-6">
                        <p className="text-2xl font-semibold tabular-nums">
                            {cards[key].toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

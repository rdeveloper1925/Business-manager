import { Building2, Hash, Ruler, Tag } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatCurrency } from '@/lib/format-currency';
import { cn } from '@/lib/utils';
import type { Part } from '@/types/inventory';

function display(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    return String(value);
}

function InfoField({
    icon: Icon,
    label,
    children,
    className,
}: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'bg-card/50 rounded-xl border p-4',
                className,
            )}
        >
            <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                <Icon className="size-3.5 shrink-0 opacity-70" aria-hidden />
                {label}
            </div>
            <div className="text-sm leading-relaxed break-words">{children}</div>
        </div>
    );
}

export function PartInfoCard({ part }: { part: Part }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Part details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                    <InfoField icon={Tag} label="Part name">
                        {display(part.part_name)}
                    </InfoField>
                    <InfoField icon={Hash} label="Part number">
                        {display(part.part_number)}
                    </InfoField>
                    <InfoField icon={Ruler} label="Unit of measure">
                        {display(part.unit_of_measure)}
                    </InfoField>
                    <InfoField icon={Building2} label="Supplier">
                        {display(part.supplier?.company_name)}
                    </InfoField>
                    <InfoField icon={Tag} label="Cost price">
                        {formatCurrency(part.cost_price)}
                    </InfoField>
                    <InfoField icon={Tag} label="Sell price">
                        {formatCurrency(part.sell_price)}
                    </InfoField>
                    <InfoField
                        icon={Tag}
                        label="Description"
                        className="sm:col-span-2"
                    >
                        {display(part.description)}
                    </InfoField>
                    <InfoField icon={Hash} label="Reorder point">
                        {display(part.reorder_point)}
                    </InfoField>
                    <InfoField icon={Hash} label="Min / max stock">
                        {part.min_stock_level} / {part.max_stock_level}
                    </InfoField>
                </div>
            </CardContent>
        </Card>
    );
}

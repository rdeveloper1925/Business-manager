import { Head, Link } from '@inertiajs/react';

import { AppPageShell } from '@/components/app-page-shell';
import { PartForm } from '@/components/inventory/part-form';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { dashboard as inventoryDashboard } from '@/routes/inventory';
import { index as partsIndex, show as partsShow } from '@/routes/inventory/parts';
import type { InventorySupplierOption, Part } from '@/types/inventory';

export default function PartsEdit({
    part,
    suppliers,
}: {
    part: Part;
    suppliers: InventorySupplierOption[];
}) {
    return (
        <>
            <Head title={`Edit ${part.part_name}`} />

            <AppPageShell width="3xl">
                <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="w-fit" asChild>
                        <Link
                            href={partsShow.url({ part: part.part_id })}
                            prefetch
                        >
                            ← Back to part
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Edit part
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Update part details for {part.part_number}.
                    </p>
                </div>

                <PartForm
                    part={part}
                    suppliers={suppliers}
                    showProfitProjection
                />
            </AppPageShell>
        </>
    );
}

PartsEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard.url() },
        { title: 'Inventory', href: inventoryDashboard.url() },
        { title: 'Parts', href: partsIndex.url() },
        { title: 'Edit Part', href: '#' },
    ],
};

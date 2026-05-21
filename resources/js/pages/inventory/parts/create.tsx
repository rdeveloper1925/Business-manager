import { Head, Link } from '@inertiajs/react';

import { PartForm } from '@/components/inventory/part-form';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { dashboard as inventoryDashboard } from '@/routes/inventory';
import { index as partsIndex } from '@/routes/inventory/parts';
import type { InventorySupplierOption } from '@/types/inventory';

export default function PartsCreate({
    part,
    suppliers,
}: {
    part: null;
    suppliers: InventorySupplierOption[];
}) {
    return (
        <>
            <Head title="Add Part" />

            <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4">
                <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="w-fit" asChild>
                        <Link href={partsIndex.url()} prefetch>
                            ← Back to parts
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold tracking-tight">Add part</h1>
                    <p className="text-sm text-muted-foreground">
                        Create a new part and inventory record.
                    </p>
                </div>

                <PartForm part={part} suppliers={suppliers} />
            </div>
        </>
    );
}

PartsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard.url() },
        { title: 'Inventory', href: inventoryDashboard.url() },
        { title: 'Parts', href: partsIndex.url() },
        { title: 'Add Part', href: '#' },
    ],
};

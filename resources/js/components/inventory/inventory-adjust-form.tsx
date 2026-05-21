import { Form } from '@inertiajs/react';

import InventoryController from '@/actions/App/Http/Controllers/Inventory/InventoryController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toDatetimeLocalValue } from '@/lib/datetime-local';
import type { InventoryRecord, Part } from '@/types/inventory';

function pickError(
    errors: Record<string, string | string[] | undefined>,
    key: string,
): string | undefined {
    const value = errors[key];

    if (value === undefined) {
        return undefined;
    }

    return Array.isArray(value) ? value[0] : value;
}

export function InventoryAdjustForm({
    part,
    inventory,
}: {
    part: Pick<Part, 'part_id'>;
    inventory: InventoryRecord;
}) {
    const latestCountValue = inventory.latest_count
        ? toDatetimeLocalValue(new Date(inventory.latest_count))
        : '';

    return (
        <Form
            {...InventoryController.adjust.form()}
            options={{ preserveScroll: true }}
            className="space-y-4 border-t pt-4"
        >
            {({ processing, errors }) => (
                <>
                    <input type="hidden" name="part_id" value={part.part_id} />

                    <p className="text-sm font-medium">Adjust quantities</p>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="quantity_on_hand">On hand</Label>
                            <Input
                                id="quantity_on_hand"
                                name="quantity_on_hand"
                                type="number"
                                min={0}
                                defaultValue={inventory.quantity_on_hand}
                                aria-invalid={pickError(errors, 'quantity_on_hand') !== undefined}
                            />
                            <InputError message={pickError(errors, 'quantity_on_hand')} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="quantity_reserved">Reserved</Label>
                            <Input
                                id="quantity_reserved"
                                name="quantity_reserved"
                                type="number"
                                min={0}
                                defaultValue={inventory.quantity_reserved}
                                aria-invalid={pickError(errors, 'quantity_reserved') !== undefined}
                            />
                            <InputError message={pickError(errors, 'quantity_reserved')} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="quantity_on_order">On order</Label>
                            <Input
                                id="quantity_on_order"
                                name="quantity_on_order"
                                type="number"
                                min={0}
                                defaultValue={inventory.quantity_on_order}
                                aria-invalid={pickError(errors, 'quantity_on_order') !== undefined}
                            />
                            <InputError message={pickError(errors, 'quantity_on_order')} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="latest_count">Latest count</Label>
                            <Input
                                id="latest_count"
                                name="latest_count"
                                type="datetime-local"
                                defaultValue={latestCountValue}
                                aria-invalid={pickError(errors, 'latest_count') !== undefined}
                            />
                            <InputError message={pickError(errors, 'latest_count')} />
                        </div>
                    </div>

                    <Button type="submit" disabled={processing}>
                        Save inventory
                    </Button>
                </>
            )}
        </Form>
    );
}

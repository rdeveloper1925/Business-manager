import { Form, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import PartController from '@/actions/App/Http/Controllers/Inventory/PartController';
import InputError from '@/components/input-error';
import { SearchableSelect } from '@/components/searchable-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { index as partsIndex, show as partsShow } from '@/routes/inventory/parts';
import type { InventorySupplierOption, Part } from '@/types/inventory';

const textareaClassName = cn(
    'border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex min-h-[88px] w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
);

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

export function PartForm({
    part,
    suppliers,
}: {
    part: Part | null;
    suppliers: InventorySupplierOption[];
}) {
    const isEdit = part !== null;
    const idSuffix = isEdit ? part.part_id : 'new';

    const supplierOptions = useMemo(
        () =>
            suppliers.map((supplier) => ({
                value: String(supplier.id),
                label: supplier.company_name,
            })),
        [suppliers],
    );

    const [supplierId, setSupplierId] = useState(
        isEdit && part.supplier_id !== null ? String(part.supplier_id) : '',
    );

    return (
        <div className="landing-surface rounded-xl border p-6 shadow-sm shadow-black/5">
            <Form
                key={idSuffix}
                {...(isEdit
                    ? PartController.update.form.patch(part)
                    : PartController.store.form())}
                options={{ preserveScroll: true }}
                className="space-y-6"
            >
                {({ processing, errors }) => {
                    const fieldError = (key: string) => pickError(errors, key);

                    return (
                        <>
                            <div className="grid gap-2 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor={`part_name_${idSuffix}`}>
                                        Part name
                                    </Label>
                                    <Input
                                        id={`part_name_${idSuffix}`}
                                        name="part_name"
                                        required
                                        defaultValue={
                                            isEdit ? part.part_name : undefined
                                        }
                                        aria-invalid={
                                            fieldError('part_name')
                                                ? true
                                                : undefined
                                        }
                                    />
                                    <InputError message={fieldError('part_name')} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor={`part_number_${idSuffix}`}>
                                        Part number
                                    </Label>
                                    <Input
                                        id={`part_number_${idSuffix}`}
                                        name="part_number"
                                        required
                                        defaultValue={
                                            isEdit ? part.part_number : undefined
                                        }
                                        aria-invalid={
                                            fieldError('part_number')
                                                ? true
                                                : undefined
                                        }
                                    />
                                    <InputError message={fieldError('part_number')} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor={`description_${idSuffix}`}>
                                    Description
                                </Label>
                                <textarea
                                    id={`description_${idSuffix}`}
                                    name="description"
                                    rows={3}
                                    defaultValue={
                                        isEdit ? (part.description ?? '') : undefined
                                    }
                                    className={textareaClassName}
                                    aria-invalid={
                                        fieldError('description') ? true : undefined
                                    }
                                />
                                <InputError message={fieldError('description')} />
                            </div>

                            <div className="grid gap-2 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor={`unit_of_measure_${idSuffix}`}>
                                        Unit of measure
                                    </Label>
                                    <Input
                                        id={`unit_of_measure_${idSuffix}`}
                                        name="unit_of_measure"
                                        required
                                        defaultValue={
                                            isEdit ? part.unit_of_measure : undefined
                                        }
                                        aria-invalid={
                                            fieldError('unit_of_measure')
                                                ? true
                                                : undefined
                                        }
                                    />
                                    <InputError
                                        message={fieldError('unit_of_measure')}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor={`cost_price_${idSuffix}`}>
                                        Cost price
                                    </Label>
                                    <Input
                                        id={`cost_price_${idSuffix}`}
                                        name="cost_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        defaultValue={
                                            isEdit ? part.cost_price : undefined
                                        }
                                        aria-invalid={
                                            fieldError('cost_price') ? true : undefined
                                        }
                                    />
                                    <InputError message={fieldError('cost_price')} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor={`sell_price_${idSuffix}`}>
                                        Sell price
                                    </Label>
                                    <Input
                                        id={`sell_price_${idSuffix}`}
                                        name="sell_price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        defaultValue={
                                            isEdit ? part.sell_price : undefined
                                        }
                                        aria-invalid={
                                            fieldError('sell_price') ? true : undefined
                                        }
                                    />
                                    <InputError message={fieldError('sell_price')} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor={`supplier_${idSuffix}`}>Supplier</Label>
                                <SearchableSelect
                                    id={`supplier_${idSuffix}`}
                                    name="supplier_id"
                                    options={supplierOptions}
                                    value={supplierId}
                                    onValueChange={setSupplierId}
                                    placeholder="Select supplier (optional)"
                                    searchPlaceholder="Search suppliers…"
                                    aria-invalid={
                                        fieldError('supplier_id') ? true : undefined
                                    }
                                />
                                <InputError message={fieldError('supplier_id')} />
                            </div>

                            <div className="grid gap-2 sm:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor={`reorder_point_${idSuffix}`}>
                                        Reorder point
                                    </Label>
                                    <Input
                                        id={`reorder_point_${idSuffix}`}
                                        name="reorder_point"
                                        type="number"
                                        min="0"
                                        defaultValue={
                                            isEdit ? part.reorder_point : 0
                                        }
                                        aria-invalid={
                                            fieldError('reorder_point')
                                                ? true
                                                : undefined
                                        }
                                    />
                                    <InputError message={fieldError('reorder_point')} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor={`min_stock_${idSuffix}`}>
                                        Min stock level
                                    </Label>
                                    <Input
                                        id={`min_stock_${idSuffix}`}
                                        name="min_stock_level"
                                        type="number"
                                        min="0"
                                        defaultValue={
                                            isEdit ? part.min_stock_level : 0
                                        }
                                        aria-invalid={
                                            fieldError('min_stock_level')
                                                ? true
                                                : undefined
                                        }
                                    />
                                    <InputError
                                        message={fieldError('min_stock_level')}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor={`max_stock_${idSuffix}`}>
                                        Max stock level
                                    </Label>
                                    <Input
                                        id={`max_stock_${idSuffix}`}
                                        name="max_stock_level"
                                        type="number"
                                        min="0"
                                        defaultValue={
                                            isEdit ? part.max_stock_level : 0
                                        }
                                        aria-invalid={
                                            fieldError('max_stock_level')
                                                ? true
                                                : undefined
                                        }
                                    />
                                    <InputError
                                        message={fieldError('max_stock_level')}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 border-t pt-4">
                                <Button type="submit" disabled={processing}>
                                    {isEdit ? 'Save changes' : 'Create part'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link
                                        href={
                                            isEdit
                                                ? partsShow.url({ part: part.part_id })
                                                : partsIndex.url()
                                        }
                                        prefetch
                                    >
                                        Cancel
                                    </Link>
                                </Button>
                            </div>
                        </>
                    );
                }}
            </Form>
        </div>
    );
}

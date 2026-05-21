import { Form, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

import InventoryTransactionController from '@/actions/App/Http/Controllers/Inventory/InventoryTransactionController';
import InputError from '@/components/input-error';
import { SearchableSelect } from '@/components/searchable-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { transactionTypeConfig } from '@/constants/transactionTypeConfig';
import { toDatetimeLocalValue } from '@/lib/datetime-local';
import { cn } from '@/lib/utils';
import { search as partsSearch } from '@/routes/inventory/parts';
import { index as transactionsIndex } from '@/routes/inventory/transactions';
import type {
    EnumOption,
    InventorySupplierOption,
    PartOption,
    TransactionPreselected,
    TransactionTypeValue,
} from '@/types/inventory';

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

type TransactionFormProps = {
    suppliers: InventorySupplierOption[];
    transactionTypes: EnumOption[];
    conditions: EnumOption[];
    preselected: TransactionPreselected;
};

export function TransactionForm({
    suppliers,
    transactionTypes,
    conditions,
    preselected,
}: TransactionFormProps) {
    const [parts, setParts] = useState<PartOption[]>([]);
    const [partsLoading, setPartsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        fetch(partsSearch.url({ query: { limit: 50 } }), {
            headers: { Accept: 'application/json' },
        })
            .then((response) => response.json())
            .then((data: PartOption[]) => {
                if (!cancelled) {
                    setParts(data);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setPartsLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);
    const defaultTransactedAt = useMemo(
        () => toDatetimeLocalValue(new Date()),
        [],
    );

    const [partId, setPartId] = useState(
        preselected.part_id !== null ? String(preselected.part_id) : '',
    );
    const [transactionType, setTransactionType] = useState<TransactionTypeValue>(
        preselected.transaction_type ?? 'RESTOCK',
    );
    const [qtyDeltaInput, setQtyDeltaInput] = useState('0');
    const [supplierId, setSupplierId] = useState('');
    const [condition, setCondition] = useState('GOOD');

    const partOptions = useMemo(
        () =>
            parts.map((part) => ({
                value: String(part.part_id),
                label: `${part.part_number} — ${part.part_name}`,
            })),
        [parts],
    );

    const supplierOptions = useMemo(
        () =>
            suppliers.map((supplier) => ({
                value: String(supplier.id),
                label: supplier.company_name,
            })),
        [suppliers],
    );

    const selectedPart = parts.find(
        (part) => String(part.part_id) === partId,
    );
    const currentStock = selectedPart?.quantity_on_hand ?? 0;
    const reorderPoint = selectedPart?.reorder_point ?? 0;
    const qtyDelta = Number.parseInt(qtyDeltaInput, 10) || 0;
    const qtyAfter = currentStock + qtyDelta;

    const showSupplier =
        transactionType === 'RESTOCK' || transactionType === 'RETURN';

    const previewTone =
        qtyAfter < 0
            ? 'border-destructive/50 bg-destructive/5 text-destructive'
            : qtyAfter <= reorderPoint
              ? 'border-amber-500/50 bg-amber-500/5 text-amber-700 dark:text-amber-400'
              : 'border-emerald-500/50 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400';

    return (
        <div className="landing-surface rounded-xl border p-6 shadow-sm shadow-black/5">
            <Form
                {...InventoryTransactionController.store.form()}
                options={{ preserveScroll: true }}
                className="space-y-6"
            >
                {({ processing, errors }) => {
                    const fieldError = (key: string) => pickError(errors, key);

                    return (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="transaction_part">Part</Label>
                                <SearchableSelect
                                    id="transaction_part"
                                    name="part_id"
                                    options={partOptions}
                                    value={partId}
                                    onValueChange={setPartId}
                                    placeholder={
                                        partsLoading
                                            ? 'Loading parts…'
                                            : 'Select a part'
                                    }
                                    searchPlaceholder="Search parts…"
                                    allowClear={false}
                                    disabled={partsLoading}
                                    aria-invalid={
                                        fieldError('part_id') ? true : undefined
                                    }
                                />
                                <InputError message={fieldError('part_id')} />
                                {selectedPart ? (
                                    <p className="text-muted-foreground text-sm">
                                        Current stock on hand:{' '}
                                        <span className="font-medium text-foreground">
                                            {currentStock}
                                        </span>
                                    </p>
                                ) : null}
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="transaction_type">
                                        Transaction type
                                    </Label>
                                    <input
                                        type="hidden"
                                        name="transaction_type"
                                        value={transactionType}
                                    />
                                    <Select
                                        value={transactionType}
                                        onValueChange={(value) =>
                                            setTransactionType(
                                                value as TransactionTypeValue,
                                            )
                                        }
                                    >
                                        <SelectTrigger id="transaction_type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {transactionTypes.map((type) => {
                                                const Icon =
                                                    transactionTypeConfig[
                                                        type.value as TransactionTypeValue
                                                    ].icon;

                                                return (
                                                    <SelectItem
                                                        key={type.value}
                                                        value={type.value}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <Icon
                                                                className="size-4"
                                                                aria-hidden
                                                            />
                                                            {type.label}
                                                        </span>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={fieldError('transaction_type')}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="condition">Condition</Label>
                                    <input
                                        type="hidden"
                                        name="condition"
                                        value={condition}
                                    />
                                    <Select
                                        value={condition}
                                        onValueChange={setCondition}
                                    >
                                        <SelectTrigger id="condition">
                                            <SelectValue placeholder="Select condition" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {conditions.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={fieldError('condition')} />
                                </div>
                            </div>

                            <div className="grid gap-2 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="qty_delta">Qty delta</Label>
                                    <Input
                                        id="qty_delta"
                                        name="qty_delta"
                                        type="number"
                                        required
                                        value={qtyDeltaInput}
                                        onChange={(event) =>
                                            setQtyDeltaInput(event.target.value)
                                        }
                                        aria-invalid={
                                            fieldError('qty_delta') ? true : undefined
                                        }
                                    />
                                    <InputError message={fieldError('qty_delta')} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="unit_cost">Unit cost</Label>
                                    <Input
                                        id="unit_cost"
                                        name="unit_cost"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        aria-invalid={
                                            fieldError('unit_cost') ? true : undefined
                                        }
                                    />
                                    <InputError message={fieldError('unit_cost')} />
                                </div>
                            </div>

                            {showSupplier ? (
                                <div className="grid gap-2">
                                    <Label htmlFor="transaction_supplier">
                                        Supplier
                                    </Label>
                                    <SearchableSelect
                                        id="transaction_supplier"
                                        name="supplier_id"
                                        options={supplierOptions}
                                        value={supplierId}
                                        onValueChange={setSupplierId}
                                        placeholder="Select supplier (optional)"
                                        searchPlaceholder="Search suppliers…"
                                        aria-invalid={
                                            fieldError('supplier_id')
                                                ? true
                                                : undefined
                                        }
                                    />
                                    <InputError message={fieldError('supplier_id')} />
                                </div>
                            ) : null}

                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows={3}
                                    className={textareaClassName}
                                    aria-invalid={fieldError('notes') ? true : undefined}
                                />
                                <InputError message={fieldError('notes')} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="transacted_at">Transacted at</Label>
                                <Input
                                    id="transacted_at"
                                    name="transacted_at"
                                    type="datetime-local"
                                    required
                                    defaultValue={defaultTransactedAt}
                                    aria-invalid={
                                        fieldError('transacted_at') ? true : undefined
                                    }
                                />
                                <InputError message={fieldError('transacted_at')} />
                            </div>

                            <div
                                className={cn(
                                    'rounded-lg border p-4 text-sm',
                                    previewTone,
                                )}
                                aria-live="polite"
                            >
                                Stock will change from{' '}
                                <strong>{currentStock}</strong> →{' '}
                                <strong>{qtyAfter}</strong>
                                {selectedPart ? (
                                    <span className="text-muted-foreground block mt-1">
                                        Reorder point: {reorderPoint}
                                    </span>
                                ) : null}
                            </div>

                            <div className="flex flex-wrap gap-2 border-t pt-4">
                                <Button type="submit" disabled={processing}>
                                    Record transaction
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={transactionsIndex.url()} prefetch>
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

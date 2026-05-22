import { Form, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import InventoryTransactionController from '@/actions/App/Http/Controllers/Inventory/InventoryTransactionController';
import InputError from '@/components/input-error';
import { FormFieldFooter } from '@/components/form-field-footer';
import { TransactionTypeBadge } from '@/components/inventory/transaction-type-badge';
import { SearchableSelect } from '@/components/searchable-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    formatDelta,
    formatInventoryDateLong,
} from '@/lib/inventory-format';
import { cn } from '@/lib/utils';
import {
    show as transactionsShow,
} from '@/routes/inventory/transactions';
import type {
    InventorySupplierOption,
    InventoryTransaction,
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

type TransactionEditFormProps = {
    transaction: InventoryTransaction;
    suppliers: InventorySupplierOption[];
};

export function TransactionEditForm({
    transaction,
    suppliers,
}: TransactionEditFormProps) {
    const supplierOptions = useMemo(
        () =>
            suppliers.map((supplier) => ({
                value: String(supplier.id),
                label: supplier.company_name,
            })),
        [suppliers],
    );

    const [supplierId, setSupplierId] = useState(
        transaction.supplier_id !== null
            ? String(transaction.supplier_id)
            : '',
    );

    const unitCostDefault =
        transaction.unit_cost !== null && transaction.unit_cost !== ''
            ? String(transaction.unit_cost)
            : '';

    return (
        <div className="landing-surface rounded-xl border p-6 shadow-sm shadow-black/5">
            <div className="mb-6 rounded-lg border bg-muted/30 p-4 text-sm">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <TransactionTypeBadge
                        type={transaction.transaction_type}
                        showIcon
                    />
                    <span className="text-muted-foreground">
                        #{transaction.transaction_id}
                    </span>
                </div>
                <dl className="grid gap-2 sm:grid-cols-2">
                    <div>
                        <dt className="text-muted-foreground text-xs uppercase">
                            Part
                        </dt>
                        <dd className="font-medium">
                            {transaction.part?.part_name ?? '—'}
                            <span className="text-muted-foreground block font-mono text-xs">
                                {transaction.part?.part_number ?? '—'}
                            </span>
                        </dd>
                    </div>
                    <div>
                        <dt className="text-muted-foreground text-xs uppercase">
                            Qty delta / after
                        </dt>
                        <dd className="font-medium tabular-nums">
                            {formatDelta(transaction.qty_delta)} →{' '}
                            {transaction.qty_after} on hand
                        </dd>
                    </div>
                    <div className="sm:col-span-2">
                        <dt className="text-muted-foreground text-xs uppercase">
                            Transacted at
                        </dt>
                        <dd>
                            <time dateTime={transaction.transacted_at}>
                                {formatInventoryDateLong(
                                    transaction.transacted_at,
                                )}
                            </time>
                        </dd>
                    </div>
                </dl>
                <p className="text-muted-foreground mt-3 text-xs">
                    Stock quantities cannot be changed here. Updating this
                    transaction will set performed by to your account.
                </p>
            </div>

            <Form
                {...InventoryTransactionController.update.form({
                    transaction: transaction.transaction_id,
                })}
                options={{ preserveScroll: true }}
                className="space-y-6"
            >
                {({ processing, errors }) => {
                    const fieldError = (key: string) => pickError(errors, key);

                    return (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
                                <div className="grid gap-2">
                                    <Label htmlFor="unit_cost">Unit cost</Label>
                                    <Input
                                        id="unit_cost"
                                        name="unit_cost"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        defaultValue={unitCostDefault}
                                        aria-invalid={
                                            fieldError('unit_cost')
                                                ? true
                                                : undefined
                                        }
                                    />
                                    <FormFieldFooter
                                        error={fieldError('unit_cost')}
                                    />
                                </div>
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
                                        allowClear
                                        aria-invalid={
                                            fieldError('supplier_id')
                                                ? true
                                                : undefined
                                        }
                                    />
                                    <FormFieldFooter
                                        error={fieldError('supplier_id')}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows={3}
                                    className={textareaClassName}
                                    defaultValue={transaction.notes ?? ''}
                                    aria-invalid={
                                        fieldError('notes') ? true : undefined
                                    }
                                />
                                <InputError message={fieldError('notes')} />
                            </div>

                            <div className="flex flex-wrap gap-2 border-t pt-4">
                                <Button type="submit" disabled={processing}>
                                    Save changes
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link
                                        href={transactionsShow.url({
                                            transaction:
                                                transaction.transaction_id,
                                        })}
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

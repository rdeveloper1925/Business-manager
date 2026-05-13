import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';

import SupplierController from '@/actions/App/Http/Controllers/SupplierController';
import InputError from '@/components/input-error';
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
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import {
    index as suppliersIndex,
    show as suppliersShow,
} from '@/routes/suppliers';
import type { Supplier, SupplierCategoryValue } from '@/types/supplier';

const textareaClassName = cn(
    'border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex min-h-[88px] w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
);

const CATEGORY_OPTIONS: { value: SupplierCategoryValue; label: string }[] = [
    { value: 'OEM', label: 'OEM' },
    { value: 'Aftermarket', label: 'Aftermarket' },
    { value: 'Other', label: 'Other' },
];

function pickError(
    errors: Record<string, string | string[] | undefined>,
    key: string,
): string | undefined {
    const v = errors[key];

    if (v === undefined) {
        return undefined;
    }

    return Array.isArray(v) ? v[0] : v;
}

export default function SuppliersCreateEdit({
    supplier,
}: {
    supplier: Supplier | null;
}) {
    const isEdit = supplier !== null;
    const idSuffix = isEdit ? supplier.id : 'new';

    const [category, setCategory] = useState<SupplierCategoryValue>(
        isEdit ? supplier.category : 'OEM',
    );

    return (
        <>
            <Head title={isEdit ? 'Edit supplier' : 'New supplier'} />

            <div className="mx-auto flex max-w-xl flex-col gap-6 p-4">
                <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="w-fit" asChild>
                        <Link
                            href={
                                isEdit
                                    ? suppliersShow.url({ supplier: supplier.id })
                                    : suppliersIndex.url()
                            }
                            prefetch
                        >
                            ← Back
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {isEdit ? 'Edit supplier' : 'New supplier'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isEdit
                            ? 'Update supplier details below.'
                            : 'Add a new supplier to your directory.'}
                    </p>
                </div>

                <div className="landing-surface rounded-xl border p-6 shadow-sm shadow-black/5">
                    <Form
                        key={idSuffix}
                        {...(isEdit
                            ? SupplierController.update.form.patch(supplier)
                            : SupplierController.store.form())}
                        options={{ preserveScroll: true }}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => {
                            const e = (key: string) => pickError(errors, key);

                            return (
                                <>
                                    <input type="hidden" name="category" value={category} />

                                    <div className="grid gap-2">
                                        <Label htmlFor={`supplier_contact_${idSuffix}`}>
                                            Contact person
                                        </Label>
                                        <Input
                                            id={`supplier_contact_${idSuffix}`}
                                            name="contact_person_name"
                                            required
                                            defaultValue={
                                                isEdit
                                                    ? supplier.contact_person_name
                                                    : undefined
                                            }
                                            autoComplete="name"
                                            aria-invalid={e('contact_person_name') ? true : undefined}
                                        />
                                        <InputError message={e('contact_person_name')} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor={`supplier_company_${idSuffix}`}>
                                            Company name
                                        </Label>
                                        <Input
                                            id={`supplier_company_${idSuffix}`}
                                            name="company_name"
                                            required
                                            defaultValue={
                                                isEdit ? supplier.company_name : undefined
                                            }
                                            aria-invalid={e('company_name') ? true : undefined}
                                        />
                                        <InputError message={e('company_name')} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor={`supplier_phone_${idSuffix}`}>
                                            Phone
                                        </Label>
                                        <Input
                                            id={`supplier_phone_${idSuffix}`}
                                            name="phone"
                                            type="text"
                                            required
                                            defaultValue={isEdit ? supplier.phone : undefined}
                                            autoComplete="tel"
                                            aria-invalid={e('phone') ? true : undefined}
                                        />
                                        <InputError message={e('phone')} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor={`supplier_email_${idSuffix}`}>
                                            Email
                                        </Label>
                                        <Input
                                            id={`supplier_email_${idSuffix}`}
                                            name="email"
                                            type="email"
                                            required
                                            defaultValue={isEdit ? supplier.email : undefined}
                                            autoComplete="email"
                                            aria-invalid={e('email') ? true : undefined}
                                        />
                                        <InputError message={e('email')} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor={`supplier_address_${idSuffix}`}>
                                            Address
                                        </Label>
                                        <textarea
                                            id={`supplier_address_${idSuffix}`}
                                            name="address"
                                            required
                                            rows={4}
                                            defaultValue={isEdit ? supplier.address : undefined}
                                            className={textareaClassName}
                                            aria-invalid={e('address') ? true : undefined}
                                        />
                                        <InputError message={e('address')} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor={`supplier_category_${idSuffix}`}>
                                            Category
                                        </Label>
                                        <Select
                                            value={category}
                                            onValueChange={(v) =>
                                                setCategory(v as SupplierCategoryValue)
                                            }
                                        >
                                            <SelectTrigger
                                                id={`supplier_category_${idSuffix}`}
                                                className="w-full"
                                                aria-invalid={e('category') ? true : undefined}
                                            >
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CATEGORY_OPTIONS.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={e('category')} />
                                    </div>

                                    <div className="flex flex-wrap gap-2 border-t pt-4">
                                        <Button type="submit" disabled={processing}>
                                            {isEdit ? 'Save changes' : 'Create supplier'}
                                        </Button>
                                        <Button type="button" variant="outline" asChild>
                                            <Link
                                                href={
                                                    isEdit
                                                        ? suppliersShow.url({
                                                              supplier: supplier.id,
                                                          })
                                                        : suppliersIndex.url()
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
            </div>
        </>
    );
}

SuppliersCreateEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard.url() },
        { title: 'Suppliers', href: suppliersIndex.url() },
    ],
};

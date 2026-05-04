import { Form } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PHONE_COUNTRIES } from '@/lib/phone-countries';
import { cn } from '@/lib/utils';
import type { Customer } from '@/types/customer';
import CustomerController from '@/actions/App/Http/Controllers/CustomerController';

const textareaClassName = cn(
    'border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex min-h-[88px] w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
);

const sortedPhoneCountries = [...PHONE_COUNTRIES].sort((a, b) =>
    a.name.localeCompare(b.name),
);

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

function CustomerFormFields({
    isEdit,
    customer,
    idSuffix,
    processing,
    errors,
    onOpenChange,
}: {
    isEdit: boolean;
    customer: Customer | null;
    idSuffix: string;
    processing: boolean;
    errors: Record<string, string | string[] | undefined>;
    onOpenChange: (open: boolean) => void;
}) {
    const resolved = isEdit && customer ? customer : null;
    const initialCountry = resolved?.phone_country_name ?? 'United States';

    const [countryName, setCountryName] = useState(initialCountry);

    const err = (key: string) => pickError(errors, key);

    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor={`customer_full_name_${idSuffix}`}>
                    Full name
                </Label>
                <Input
                    id={`customer_full_name_${idSuffix}`}
                    name="full_name"
                    required
                    defaultValue={
                        isEdit && customer ? customer.full_name : undefined
                    }
                    autoComplete="name"
                />
                <InputError message={err('full_name')} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`customer_organization_name_${idSuffix}`}>
                    Organization (optional)
                </Label>
                <Input
                    id={`customer_organization_name_${idSuffix}`}
                    name="organization_name"
                    defaultValue={
                        isEdit && customer
                            ? (customer.organization_name ?? '')
                            : undefined
                    }
                    autoComplete="organization"
                />
                <InputError message={err('organization_name')} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`customer_phone_country_${idSuffix}`}>
                    Phone country
                </Label>
                <input
                    type="hidden"
                    name="phone_country_name"
                    value={countryName}
                    readOnly
                />
                <Select value={countryName} onValueChange={setCountryName}>
                    <SelectTrigger
                        id={`customer_phone_country_${idSuffix}`}
                        className="w-full max-w-full"
                        aria-invalid={err('phone_country_name') ? true : undefined}
                    >
                        <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                        {sortedPhoneCountries.map((c) => (
                            <SelectItem key={c.name} value={c.name}>
                                <span className="flex items-center gap-2">
                                    <span
                                        aria-hidden
                                        className="font-emoji-flag text-base leading-none"
                                    >
                                        {c.flag}
                                    </span>
                                    <span className="text-muted-foreground font-mono text-xs">
                                        {c.dialCode}
                                    </span>
                                    <span>{c.name}</span>
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={err('phone_country_name')} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`customer_phone_number_${idSuffix}`}>
                    Phone
                </Label>
                <Input
                    id={`customer_phone_number_${idSuffix}`}
                    name="phone_number"
                    type="text"
                    inputMode="text"
                    autoComplete="tel"
                    required
                    defaultValue={
                        isEdit && customer ? customer.phone_number : undefined
                    }
                    aria-invalid={err('phone_number') ? true : undefined}
                />
                <InputError message={err('phone_number')} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`customer_email_${idSuffix}`}>Email</Label>
                <Input
                    id={`customer_email_${idSuffix}`}
                    name="email"
                    type="email"
                    required
                    defaultValue={
                        isEdit && customer ? customer.email : undefined
                    }
                    autoComplete="email"
                />
                <InputError message={err('email')} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`customer_address_${idSuffix}`}>Address</Label>
                <textarea
                    id={`customer_address_${idSuffix}`}
                    name="address"
                    required
                    rows={4}
                    defaultValue={
                        isEdit && customer ? customer.address : undefined
                    }
                    className={textareaClassName}
                />
                <InputError message={err('address')} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`customer_tax_id_${idSuffix}`}>
                    Tax ID (optional)
                </Label>
                <Input
                    id={`customer_tax_id_${idSuffix}`}
                    name="tax_id"
                    defaultValue={
                        isEdit && customer ? (customer.tax_id ?? '') : undefined
                    }
                />
                <InputError message={err('tax_id')} />
            </div>

            <DialogFooter className="gap-2 border-t pt-4 sm:justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {isEdit ? 'Save changes' : 'Create customer'}
                </Button>
            </DialogFooter>
        </>
    );
}

export function CustomerFormDialog({
    open,
    onOpenChange,
    customer,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer: Customer | null;
}) {
    const isEdit = customer !== null;
    const idSuffix = isEdit ? String(customer.customer_id) : 'new';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[min(90vh,40rem)] gap-0 overflow-y-auto sm:max-w-xl">
                <DialogHeader className="pb-4">
                    <DialogTitle>
                        {isEdit ? 'Edit customer' : 'New customer'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update this customer's contact details."
                            : 'Add contact details for a new customer.'}
                    </DialogDescription>
                </DialogHeader>

                <Form
                    key={idSuffix}
                    {...(isEdit
                        ? CustomerController.update.form.patch(customer)
                        : CustomerController.store.form())}
                    options={{ preserveScroll: true }}
                    onSuccess={() => onOpenChange(false)}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <CustomerFormFields
                            isEdit={isEdit}
                            customer={customer}
                            idSuffix={idSuffix}
                            processing={processing}
                            errors={errors}
                            onOpenChange={onOpenChange}
                        />
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

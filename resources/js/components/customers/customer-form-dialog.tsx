import { Form } from '@inertiajs/react';
import CustomerController from '@/actions/App/Http/Controllers/CustomerController';
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
import { cn } from '@/lib/utils';
import type { Customer } from '@/types/customer';

const textareaClassName = cn(
    'border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex min-h-[88px] w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
);

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
                                        isEdit ? customer.full_name : undefined
                                    }
                                    autoComplete="name"
                                />
                                <InputError message={errors.full_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor={`customer_organization_name_${idSuffix}`}
                                >
                                    Organization (optional)
                                </Label>
                                <Input
                                    id={`customer_organization_name_${idSuffix}`}
                                    name="organization_name"
                                    defaultValue={
                                        isEdit
                                            ? (customer.organization_name ?? '')
                                            : undefined
                                    }
                                    autoComplete="organization"
                                />
                                <InputError message={errors.organization_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor={`customer_phone_number_${idSuffix}`}
                                >
                                    Phone
                                </Label>
                                <Input
                                    id={`customer_phone_number_${idSuffix}`}
                                    name="phone_number"
                                    type="tel"
                                    required
                                    defaultValue={
                                        isEdit ? customer.phone_number : undefined
                                    }
                                    autoComplete="tel"
                                />
                                <InputError message={errors.phone_number} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor={`customer_email_${idSuffix}`}>
                                    Email
                                </Label>
                                <Input
                                    id={`customer_email_${idSuffix}`}
                                    name="email"
                                    type="email"
                                    required
                                    defaultValue={isEdit ? customer.email : undefined}
                                    autoComplete="email"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor={`customer_address_${idSuffix}`}>
                                    Address
                                </Label>
                                <textarea
                                    id={`customer_address_${idSuffix}`}
                                    name="address"
                                    required
                                    rows={4}
                                    defaultValue={isEdit ? customer.address : undefined}
                                    className={textareaClassName}
                                />
                                <InputError message={errors.address} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor={`customer_tax_id_${idSuffix}`}>
                                    Tax ID (optional)
                                </Label>
                                <Input
                                    id={`customer_tax_id_${idSuffix}`}
                                    name="tax_id"
                                    defaultValue={
                                        isEdit ? (customer.tax_id ?? '') : undefined
                                    }
                                />
                                <InputError message={errors.tax_id} />
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
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

import {
    Building2,
    Hash,
    Mail,
    MapPin,
    Phone,
    UserRound,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { Customer } from '@/types/customer';

function display(value: string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    return value;
}

function ProfileField({
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
                'bg-card/50 hover:bg-card/80 rounded-xl border p-4 transition-colors',
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

export function CustomerProfileDialog({
    customer,
    onClose,
    onEditCustomer,
}: {
    customer: Customer | null;
    onClose: () => void;
    onEditCustomer: (customer: Customer) => void;
}) {
    const getInitials = useInitials();
    const open = customer !== null;

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    onClose();
                }
            }}
        >
            {customer !== null && (
                <DialogContent
                    key={customer.customer_id}
                    className="max-h-[min(90vh,44rem)] gap-0 overflow-y-auto border-0 p-0 sm:max-w-xl sm:border"
                >
                    <DialogHeader className="sr-only">
                        <DialogTitle>{customer.full_name}</DialogTitle>
                        <DialogDescription>
                            Customer profile and contact details for{' '}
                            {customer.full_name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative overflow-hidden">
                        <div
                            className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-muted/40"
                            aria-hidden
                        />
                        <div className="relative flex flex-col items-center gap-4 px-6 pt-8 pb-6 sm:flex-row sm:items-end sm:gap-6 sm:text-left">
                            <Avatar className="border-background size-24 border-4 shadow-lg sm:size-28">
                                <AvatarFallback className="from-primary/20 to-muted bg-gradient-to-br text-2xl font-semibold sm:text-3xl">
                                    {getInitials(customer.full_name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
                                <div className="flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                                    <h2 className="text-2xl font-semibold tracking-tight">
                                        {customer.full_name}
                                    </h2>
                                    <Badge
                                        variant="secondary"
                                        className="shrink-0 font-mono text-xs"
                                    >
                                        #{customer.customer_id}
                                    </Badge>
                                </div>
                                {customer.organization_name ? (
                                    <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-sm sm:justify-start">
                                        <Building2
                                            className="size-3.5 shrink-0 opacity-70"
                                            aria-hidden
                                        />
                                        {customer.organization_name}
                                    </p>
                                ) : (
                                    <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-sm sm:justify-start">
                                        <UserRound
                                            className="size-3.5 shrink-0 opacity-70"
                                            aria-hidden
                                        />
                                        Individual customer
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-3 p-6 sm:grid-cols-2">
                        <ProfileField icon={Mail} label="Email">
                            {customer.email ? (
                                <a
                                    href={`mailto:${customer.email}`}
                                    className="text-primary font-medium underline-offset-4 hover:underline"
                                >
                                    {customer.email}
                                </a>
                            ) : (
                                display(customer.email)
                            )}
                        </ProfileField>
                        <ProfileField icon={Phone} label="Phone">
                            {customer.phone_number ? (
                                <a
                                    href={`tel:${customer.phone_number.replace(/\s+/g, '')}`}
                                    className="text-primary font-medium underline-offset-4 hover:underline"
                                >
                                    {customer.phone_number}
                                </a>
                            ) : (
                                display(customer.phone_number)
                            )}
                        </ProfileField>
                        <ProfileField icon={Building2} label="Organization">
                            {display(customer.organization_name)}
                        </ProfileField>
                        <ProfileField icon={Hash} label="Tax ID">
                            {display(customer.tax_id)}
                        </ProfileField>
                        <ProfileField
                            icon={MapPin}
                            label="Address"
                            className="sm:col-span-2"
                        >
                            <span className="whitespace-pre-wrap">
                                {display(customer.address)}
                            </span>
                        </ProfileField>
                    </div>

                    <Separator />

                    <DialogFooter className="gap-2 border-t p-4 sm:flex-row sm:justify-end">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Close
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            onClick={() => onEditCustomer(customer)}
                        >
                            Edit customer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            )}
        </Dialog>
    );
}

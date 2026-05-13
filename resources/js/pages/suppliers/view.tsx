import { Head, Link } from '@inertiajs/react';
import {
    Building2,
    Calendar,
    Mail,
    MapPin,
    Phone,
    Tag,
    UserRound,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { edit as suppliersEdit, index as suppliersIndex } from '@/routes/suppliers';
import type { Supplier } from '@/types/supplier';

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

export default function SuppliersView({ supplier }: { supplier: Supplier }) {
    const title = supplier.company_name;

    return (
        <>
            <Head title={title} />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-3">
                        <Button variant="outline" size="sm" className="w-fit" asChild>
                            <Link href={suppliersIndex.url()} prefetch>
                                ← Back to suppliers
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {supplier.company_name}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {supplier.contact_person_name}
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link
                            href={suppliersEdit.url({ supplier: supplier.id })}
                            prefetch
                        >
                            Edit supplier
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <ProfileField icon={UserRound} label="Contact person">
                        {display(supplier.contact_person_name)}
                    </ProfileField>
                    <ProfileField icon={Building2} label="Company">
                        {display(supplier.company_name)}
                    </ProfileField>
                    <ProfileField icon={Phone} label="Phone">
                        {display(supplier.phone)}
                    </ProfileField>
                    <ProfileField icon={Mail} label="Email">
                        {display(supplier.email)}
                    </ProfileField>
                    <ProfileField icon={Tag} label="Category">
                        <Badge variant="secondary">{supplier.category}</Badge>
                    </ProfileField>
                    <ProfileField icon={MapPin} label="Address" className="sm:col-span-2">
                        {display(supplier.address)}
                    </ProfileField>
                    {supplier.created_at ? (
                        <ProfileField icon={Calendar} label="Created">
                            {display(supplier.created_at)}
                        </ProfileField>
                    ) : null}
                    {supplier.updated_at ? (
                        <ProfileField icon={Calendar} label="Updated">
                            {display(supplier.updated_at)}
                        </ProfileField>
                    ) : null}
                </div>
            </div>
        </>
    );
}

SuppliersView.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard.url() },
        { title: 'Suppliers', href: suppliersIndex.url() },
    ],
};

import { router } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { customersIndexQuery } from '@/lib/customers-index-query';
import {
    destroy as customersDestroy,
    index as customersIndex,
} from '@/routes/customers';
import type { Customer, CustomerListFilters } from '@/types/customer';

export function CustomerRowActions({
    customer,
    filters,
    searchInput,
    currentPage,
    onEditCustomer,
}: {
    customer: Customer;
    filters: CustomerListFilters;
    searchInput: string;
    currentPage: number;
    onEditCustomer: (customer: Customer) => void;
}) {
    const id = customer.customer_id;

    return (
        <div className="flex items-center justify-end gap-0.5">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`View ${customer.full_name}`}
                        onClick={() => {
                            router.get(
                                customersIndex.url({
                                    query: customersIndexQuery(filters, {
                                        search: searchInput.trim(),
                                        page:
                                            currentPage > 1
                                                ? currentPage
                                                : undefined,
                                        view: id,
                                    }),
                                }),
                                {},
                                {
                                    preserveState: true,
                                    preserveScroll: true,
                                },
                            );
                        }}
                    >
                        <Eye className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>View</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${customer.full_name}`}
                        onClick={() => onEditCustomer(customer)}
                    >
                        <Pencil className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        aria-label={`Delete ${customer.full_name}`}
                        onClick={() => {
                            if (
                                window.confirm(
                                    'Remove this customer? This cannot be undone.',
                                )
                            ) {
                                router.delete(customersDestroy.url(id));
                            }
                        }}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
            </Tooltip>
        </div>
    );
}

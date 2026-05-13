import { router } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    destroy as suppliersDestroy,
    edit as suppliersEdit,
    show as suppliersShow,
} from '@/routes/suppliers';
import type { SupplierSummary } from '@/types/supplier';

export function SupplierRowActions({ supplier }: { supplier: SupplierSummary }) {
    const id = supplier.id;

    return (
        <div className="flex items-center justify-end gap-0.5">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`View ${supplier.company_name}`}
                        onClick={() => {
                            router.get(
                                suppliersShow.url({ supplier: id }),
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
                        aria-label={`Edit ${supplier.company_name}`}
                        onClick={() => {
                            router.get(
                                suppliersEdit.url({ supplier: id }),
                                {},
                                {
                                    preserveState: true,
                                    preserveScroll: true,
                                },
                            );
                        }}
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
                        aria-label={`Delete ${supplier.company_name}`}
                        onClick={() => {
                            if (
                                window.confirm(
                                    'Are you sure you want to remove this supplier?',
                                )
                            ) {
                                router.delete(suppliersDestroy.url({ supplier: id }), {
                                    preserveScroll: true,
                                });
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

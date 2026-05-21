import { Link, router } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    destroy as partsDestroy,
    edit as partsEdit,
    show as partsShow,
} from '@/routes/inventory/parts';
import type { PartSummary } from '@/types/inventory';

export function PartRowActions({ part }: { part: PartSummary }) {
    const id = part.part_id;

    return (
        <div className="flex items-center justify-end gap-0.5">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`View ${part.part_name}`}
                        asChild
                    >
                        <Link href={partsShow.url({ part: id })} prefetch preserveScroll>
                            <Eye className="size-4" />
                        </Link>
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
                        aria-label={`Edit ${part.part_name}`}
                        asChild
                    >
                        <Link href={partsEdit.url({ part: id })} prefetch preserveScroll>
                            <Pencil className="size-4" />
                        </Link>
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
                        aria-label={`Delete ${part.part_name}`}
                        onClick={() => {
                            if (
                                window.confirm(
                                    'Are you sure you want to remove this part?',
                                )
                            ) {
                                router.delete(partsDestroy.url({ part: id }), {
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

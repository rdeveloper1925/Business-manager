import { Form, Head, router, usePage } from '@inertiajs/react';
import type { ColumnDef, OnChangeFn, SortingState } from '@tanstack/react-table';
import {
    Car,
    Eye,
    Hash,
    Layers,
    Pencil,
    Search,
    Tag,
    Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import PartsController, {
    destroy as partsDestroy,
} from '@/actions/App/Http/Controllers/Inventory/PartsController';
import { DataTable } from '@/components/data-table';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { partsIndexQuery } from '@/lib/parts-index-query';
import { cn, decodeHtmlEntities } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as partsIndex } from '@/routes/inventory/parts';
import type {
    Part,
    PartDesignationValue,
    PartListFilters,
    PaginatedParts,
} from '@/types/parts';

const PART_FORM_ERROR_KEYS = [
    'part_number',
    'part_name',
    'unit_of_measure',
    'description',
    'car_make',
    'car_model',
    'car_year',
    'designation',
    'supplier',
    'alternatives',
    'market_price',
] as const;

const textareaClassName = cn(
    'border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex min-h-[88px] w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
);

function display(value: string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    return value;
}

function designationLabel(value: Part['designation']): string {
    return value === 'oem' ? 'OEM' : 'Aftermarket';
}

function formatMarketPrice(value: string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    const n = Number(value);

    if (Number.isNaN(n)) {
        return value;
    }

    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
    }).format(n);
}

function firstErrorMessage(
    errors: Record<string, string | string[] | undefined>,
): string | undefined {
    for (const v of Object.values(errors)) {
        if (v === undefined || v === '') {
            continue;
        }

        return Array.isArray(v) ? v[0] : v;
    }

    return undefined;
}

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

function DesignationField({
    formKey,
    initial,
    error,
}: {
    formKey: string;
    initial: PartDesignationValue;
    error: string | undefined;
}) {
    const [value, setValue] = useState<PartDesignationValue>(initial);

    return (
        <div className="grid gap-2">
            <Label htmlFor={`designation_${formKey}`}>Designation</Label>
            <input type="hidden" name="designation" value={value} readOnly />
            <Select
                value={value}
                onValueChange={(v) => setValue(v as PartDesignationValue)}
            >
                <SelectTrigger
                    id={`designation_${formKey}`}
                    className="w-full"
                    aria-invalid={error ? true : undefined}
                >
                    <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="oem">OEM</SelectItem>
                    <SelectItem value="aftermarket">Aftermarket</SelectItem>
                </SelectContent>
            </Select>
            <InputError message={error} />
        </div>
    );
}

function PartRowActions({
    part,
    filters,
    searchInput,
    currentPage,
    onEditPart,
    onRequestDelete,
}: {
    part: Part;
    filters: PartListFilters;
    searchInput: string;
    currentPage: number;
    onEditPart: (part: Part) => void;
    onRequestDelete: (part: Part) => void;
}) {
    const id = part.id;

    return (
        <div className="flex items-center justify-end gap-0.5">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`View ${part.part_name}`}
                        onClick={() => {
                            router.get(
                                partsIndex.url({
                                    query: partsIndexQuery(filters, {
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
                        aria-label={`Edit ${part.part_name}`}
                        onClick={() => onEditPart(part)}
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
                        aria-label={`Delete ${part.part_name}`}
                        onClick={() => onRequestDelete(part)}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
            </Tooltip>
        </div>
    );
}

export default function PartsIndexPage({
    parts,
    filters,
    profilePart,
    editPart,
}: {
    parts: PaginatedParts;
    filters: PartListFilters;
    profilePart: Part | null;
    editPart: Part | null;
}) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [createOpen, setCreateOpen] = useState(false);
    const [partToDelete, setPartToDelete] = useState<Part | null>(null);
    const debouncedSearch = useDebouncedValue(searchInput, 300);

    const pageErrors = usePage().props.errors as
        | Record<string, string | string[] | undefined>
        | undefined;

    const storeValidationSignature =
        pageErrors !== undefined
            ? PART_FORM_ERROR_KEYS.filter((key) => {
                  const message = pageErrors[key];

                  return message !== undefined && message !== '';
              }).join(',')
            : '';

    useEffect(() => {
        if (storeValidationSignature !== '' && editPart === null) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- sync dialog to server errors
            setCreateOpen(true);
        }
    }, [storeValidationSignature, editPart]);

    useEffect(() => {
        const trimmed = debouncedSearch.trim();

        if (trimmed === filters.search) {
            return;
        }

        router.get(
            partsIndex.url({
                query: partsIndexQuery(filters, {
                    search: trimmed,
                    page: 1,
                    view: profilePart?.id,
                    edit: editPart?.id,
                }),
            }),
            {},
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    }, [debouncedSearch, filters, profilePart, editPart]);

    const sorting = useMemo<SortingState>(
        () => [
            {
                id: filters.sort,
                desc: filters.direction === 'desc',
            },
        ],
        [filters.sort, filters.direction],
    );

    const closeProfile = () => {
        router.get(
            partsIndex.url({
                query: partsIndexQuery(filters, {
                    search: searchInput.trim(),
                    page:
                        parts.current_page > 1
                            ? parts.current_page
                            : undefined,
                    edit: editPart?.id,
                }),
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const openCreateModal = () => {
        if (editPart !== null || profilePart !== null) {
            router.get(
                partsIndex.url({
                    query: partsIndexQuery(filters, {
                        search: searchInput.trim(),
                        page:
                            parts.current_page > 1
                                ? parts.current_page
                                : undefined,
                    }),
                }),
                {},
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                    onSuccess: () => setCreateOpen(true),
                },
            );

            return;
        }

        setCreateOpen(true);
    };

    const handleFormDialogOpenChange = (open: boolean) => {
        if (open) {
            return;
        }

        setCreateOpen(false);

        if (editPart !== null) {
            router.get(
                partsIndex.url({
                    query: partsIndexQuery(filters, {
                        search: searchInput.trim(),
                        page:
                            parts.current_page > 1
                                ? parts.current_page
                                : undefined,
                        view: profilePart?.id,
                    }),
                }),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }
    };

    const navigateToEditPart = useCallback(
        (part: Part) => {
            router.get(
                partsIndex.url({
                    query: partsIndexQuery(filters, {
                        search: searchInput.trim(),
                        page:
                            parts.current_page > 1
                                ? parts.current_page
                                : undefined,
                        edit: part.id,
                    }),
                }),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        },
        [filters, searchInput, parts.current_page],
    );

    const handleSortingChange: OnChangeFn<SortingState> = useCallback(
        (updater) => {
            const nextSorting =
                typeof updater === 'function' ? updater(sorting) : updater;
            const sortColumn = nextSorting[0];

            if (!sortColumn) {
                return;
            }

            const columnId = sortColumn.id;

            if (
                columnId !== 'part_number' &&
                columnId !== 'part_name' &&
                columnId !== 'market_price' &&
                columnId !== 'created_at'
            ) {
                return;
            }

            const sort = columnId;
            const direction = sortColumn.desc ? 'desc' : 'asc';
            router.get(
                partsIndex.url({
                    query: partsIndexQuery(filters, {
                        search: searchInput.trim(),
                        sort,
                        direction,
                        page: 1,
                        view: profilePart?.id,
                        edit: editPart?.id,
                    }),
                }),
                {},
                {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                },
            );
        },
        [
            sorting,
            filters,
            searchInput,
            profilePart?.id,
            editPart?.id,
        ],
    );

    const handleRequestDelete = useCallback((part: Part) => {
        setPartToDelete(part);
    }, []);

    const columns = useMemo<ColumnDef<Part>[]>(
        () => [
            {
                accessorKey: 'part_number',
                id: 'part_number',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Part #" />
                ),
                cell: ({ row }) => (
                    <span className="font-mono text-sm font-medium">
                        {row.getValue('part_number')}
                    </span>
                ),
                enableSorting: true,
                enableHiding: false,
            },
            {
                accessorKey: 'part_name',
                id: 'part_name',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Name" />
                ),
                cell: ({ row }) => (
                    <span className="font-medium">{row.getValue('part_name')}</span>
                ),
                enableSorting: true,
                enableHiding: false,
            },
            {
                accessorKey: 'designation',
                id: 'designation',
                header: () => <div className="font-medium">Designation</div>,
                cell: ({ row }) => {
                    const d = row.original.designation;

                    return (
                        <Badge variant={d === 'oem' ? 'default' : 'secondary'}>
                            {designationLabel(d)}
                        </Badge>
                    );
                },
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: 'market_price',
                id: 'market_price',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Market price" />
                ),
                cell: ({ row }) => (
                    <span className="text-muted-foreground tabular-nums">
                        {formatMarketPrice(row.original.market_price)}
                    </span>
                ),
                enableSorting: true,
                enableHiding: false,
            },
            {
                accessorKey: 'created_at',
                id: 'created_at',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Added" />
                ),
                cell: ({ row }) => (
                    <span className="text-muted-foreground text-sm">
                        {row.original.created_at
                            ? new Date(
                                  row.original.created_at,
                              ).toLocaleDateString()
                            : '—'}
                    </span>
                ),
                enableSorting: true,
                enableHiding: false,
            },
            {
                id: 'actions',
                enableSorting: false,
                enableHiding: false,
                header: () => <div className="text-right font-medium">Actions</div>,
                cell: ({ row }) => (
                    <PartRowActions
                        part={row.original}
                        filters={filters}
                        searchInput={searchInput}
                        currentPage={parts.current_page}
                        onEditPart={navigateToEditPart}
                        onRequestDelete={handleRequestDelete}
                    />
                ),
            },
        ],
        [
            filters,
            searchInput,
            parts.current_page,
            navigateToEditPart,
            handleRequestDelete,
        ],
    );

    const emptyDatabase = parts.total === 0 && filters.search === '';
    const noSearchResults = parts.total === 0 && filters.search !== '';
    const formModalOpen = createOpen || editPart !== null;
    const isEdit = editPart !== null;
    const formPart = editPart;
    const formKey = isEdit && formPart ? String(formPart.id) : 'new';

    const confirmDelete = () => {
        if (partToDelete === null) {
            return;
        }

        const id = partToDelete.id;
        setPartToDelete(null);

        router.delete(partsDestroy.url(id), {
            preserveScroll: true,
            onError: (errors) => {
                toast.error(
                    firstErrorMessage(errors) ??
                        'Could not remove this part.',
                );
            },
        });
    };

    return (
        <>
            <Head title="Parts" />

            <Dialog
                open={profilePart !== null}
                onOpenChange={(next) => {
                    if (!next) {
                        closeProfile();
                    }
                }}
            >
                {profilePart !== null && (
                    <DialogContent className="max-h-[min(90vh,48rem)] gap-0 overflow-y-auto sm:max-w-3xl">
                        <DialogHeader className="pb-4">
                            <DialogTitle className="flex items-center gap-2">
                                <Layers className="size-5 opacity-70" aria-hidden />
                                {profilePart.part_name}
                            </DialogTitle>
                            <DialogDescription>
                                Part #{profilePart.part_number} — read-only
                                details
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="bg-card/50 rounded-xl border p-4">
                                <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                                    <Hash className="size-3.5" aria-hidden />
                                    Part number
                                </div>
                                <p className="font-mono text-sm">
                                    {profilePart.part_number}
                                </p>
                            </div>
                            <div className="bg-card/50 rounded-xl border p-4">
                                <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                                    <Tag className="size-3.5" aria-hidden />
                                    Designation
                                </div>
                                <Badge
                                    variant={
                                        profilePart.designation === 'oem'
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {designationLabel(profilePart.designation)}
                                </Badge>
                            </div>
                            <div className="bg-card/50 rounded-xl border p-4">
                                <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                                    Unit of measure
                                </div>
                                <p className="text-sm">
                                    {display(profilePart.unit_of_measure)}
                                </p>
                            </div>
                            <div className="bg-card/50 rounded-xl border p-4">
                                <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                                    Market price
                                </div>
                                <p className="text-sm tabular-nums">
                                    {formatMarketPrice(profilePart.market_price)}
                                </p>
                            </div>
                            <div className="bg-card/50 sm:col-span-2 rounded-xl border p-4">
                                <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                                    Description
                                </div>
                                <p className="text-sm leading-relaxed wrap-break-word">
                                    {display(profilePart.description)}
                                </p>
                            </div>
                            <div className="bg-card/50 rounded-xl border p-4">
                                <div className="text-muted-foreground mb-1 flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                                    <Car className="size-3.5" aria-hidden />
                                    Vehicle
                                </div>
                                <p className="text-sm">
                                    {[
                                        profilePart.car_year,
                                        profilePart.car_make,
                                        profilePart.car_model,
                                    ]
                                        .filter(Boolean)
                                        .join(' ') || '—'}
                                </p>
                            </div>
                            <div className="bg-card/50 rounded-xl border p-4">
                                <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                                    Supplier
                                </div>
                                <p className="text-sm">
                                    {display(profilePart.supplier)}
                                </p>
                            </div>
                            <div className="bg-card/50 sm:col-span-2 rounded-xl border p-4">
                                <div className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                                    Alternatives
                                </div>
                                <p className="font-mono text-sm wrap-break-word">
                                    {display(profilePart.alternatives)}
                                </p>
                            </div>
                        </div>
                        <DialogFooter className="gap-2 border-t pt-4 sm:justify-end">
                            <Button type="button" variant="outline" onClick={closeProfile}>
                                Close
                            </Button>
                            <Button
                                type="button"
                                onClick={() => navigateToEditPart(profilePart)}
                            >
                                Edit part
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>

            <Dialog open={formModalOpen} onOpenChange={handleFormDialogOpenChange}>
                <DialogContent className="max-h-[min(92vh,52rem)] gap-0 overflow-y-auto sm:max-w-3xl">
                    <DialogHeader className="pb-4">
                        <DialogTitle>
                            {isEdit ? 'Edit part' : 'New part'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEdit
                                ? 'Update part details and save changes.'
                                : 'Add a new part to your inventory catalog.'}
                        </DialogDescription>
                    </DialogHeader>
                    <Form
                        key={formKey}
                        {...(isEdit && formPart
                            ? PartsController.update.form.patch(formPart)
                            : PartsController.store.form())}
                        options={{ preserveScroll: true }}
                        onSuccess={() => handleFormDialogOpenChange(false)}
                        onError={(errors) => {
                            toast.error(
                                firstErrorMessage(errors) ??
                                    'Please fix the errors and try again.',
                            );
                        }}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor={`part_number_${formKey}`}>
                                            Part number
                                        </Label>
                                        <Input
                                            id={`part_number_${formKey}`}
                                            name="part_number"
                                            required
                                            defaultValue={
                                                formPart?.part_number ?? ''
                                            }
                                            autoComplete="off"
                                            className="font-mono"
                                        />
                                        <InputError
                                            message={pickError(
                                                errors,
                                                'part_number',
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor={`part_name_${formKey}`}>
                                            Part name
                                        </Label>
                                        <Input
                                            id={`part_name_${formKey}`}
                                            name="part_name"
                                            required
                                            defaultValue={
                                                formPart?.part_name ?? ''
                                            }
                                            autoComplete="off"
                                        />
                                        <InputError
                                            message={pickError(
                                                errors,
                                                'part_name',
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor={`unit_of_measure_${formKey}`}
                                        >
                                            Unit of measure
                                        </Label>
                                        <Input
                                            id={`unit_of_measure_${formKey}`}
                                            name="unit_of_measure"
                                            required
                                            placeholder="ea, box, pair…"
                                            defaultValue={
                                                formPart?.unit_of_measure ?? ''
                                            }
                                        />
                                        <InputError
                                            message={pickError(
                                                errors,
                                                'unit_of_measure',
                                            )}
                                        />
                                    </div>
                                    <DesignationField
                                        key={`designation-${formKey}`}
                                        formKey={formKey}
                                        initial={
                                            formPart?.designation ?? 'oem'
                                        }
                                        error={pickError(errors, 'designation')}
                                    />
                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label
                                            htmlFor={`description_${formKey}`}
                                        >
                                            Description
                                        </Label>
                                        <textarea
                                            id={`description_${formKey}`}
                                            name="description"
                                            rows={3}
                                            defaultValue={
                                                formPart?.description ?? ''
                                            }
                                            className={textareaClassName}
                                        />
                                        <InputError
                                            message={pickError(
                                                errors,
                                                'description',
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor={`car_make_${formKey}`}>
                                            Car make
                                        </Label>
                                        <Input
                                            id={`car_make_${formKey}`}
                                            name="car_make"
                                            defaultValue={
                                                formPart?.car_make ?? ''
                                            }
                                        />
                                        <InputError
                                            message={pickError(errors, 'car_make')}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor={`car_model_${formKey}`}>
                                            Car model
                                        </Label>
                                        <Input
                                            id={`car_model_${formKey}`}
                                            name="car_model"
                                            defaultValue={
                                                formPart?.car_model ?? ''
                                            }
                                        />
                                        <InputError
                                            message={pickError(
                                                errors,
                                                'car_model',
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor={`car_year_${formKey}`}>
                                            Car year
                                        </Label>
                                        <Input
                                            id={`car_year_${formKey}`}
                                            name="car_year"
                                            type="number"
                                            min={1900}
                                            max={2100}
                                            placeholder="e.g. 2019"
                                            defaultValue={
                                                formPart?.car_year ?? ''
                                            }
                                        />
                                        <InputError
                                            message={pickError(
                                                errors,
                                                'car_year',
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor={`supplier_${formKey}`}>
                                            Supplier
                                        </Label>
                                        <Input
                                            id={`supplier_${formKey}`}
                                            name="supplier"
                                            defaultValue={
                                                formPart?.supplier ?? ''
                                            }
                                        />
                                        <InputError
                                            message={pickError(
                                                errors,
                                                'supplier',
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label
                                            htmlFor={`alternatives_${formKey}`}
                                        >
                                            Alternatives (comma-separated)
                                        </Label>
                                        <Input
                                            id={`alternatives_${formKey}`}
                                            name="alternatives"
                                            placeholder="ALT-1, ALT-2"
                                            defaultValue={
                                                formPart?.alternatives ?? ''
                                            }
                                        />
                                        <InputError
                                            message={pickError(
                                                errors,
                                                'alternatives',
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-2 sm:col-span-2">
                                        <Label
                                            htmlFor={`market_price_${formKey}`}
                                        >
                                            Market price (USD)
                                        </Label>
                                        <Input
                                            id={`market_price_${formKey}`}
                                            name="market_price"
                                            type="number"
                                            inputMode="decimal"
                                            step="0.01"
                                            min={0}
                                            placeholder="0.00"
                                            defaultValue={
                                                formPart?.market_price ?? ''
                                            }
                                        />
                                        <InputError
                                            message={pickError(
                                                errors,
                                                'market_price',
                                            )}
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="gap-2 border-t pt-4 sm:justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            handleFormDialogOpenChange(false)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {isEdit ? 'Save changes' : 'Create part'}
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={partToDelete !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPartToDelete(null);
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Remove part?</DialogTitle>
                        <DialogDescription>
                            {partToDelete !== null
                                ? `This will remove “${partToDelete.part_name}” (${partToDelete.part_number}). You can restore it later only if your administrator enables restore workflows.`
                                : null}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPartToDelete(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDelete}
                        >
                            Remove part
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Parts
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Catalog of parts and interchange data
                        </p>
                    </div>
                    <Button type="button" onClick={openCreateModal}>
                        Add part
                    </Button>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <div className="relative max-w-full min-w-48 flex-1 sm:max-w-sm">
                        <Search
                            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden
                        />
                        <Input
                            id="part-search"
                            type="search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search part #, name, vehicle, supplier…"
                            className="pl-9"
                            autoComplete="off"
                            aria-label="Search parts"
                        />
                    </div>
                    {parts.total > 0 &&
                        parts.from != null &&
                        parts.to != null && (
                            <p className="text-sm whitespace-nowrap text-muted-foreground">
                                Showing {parts.from}–{parts.to} of {parts.total}
                            </p>
                        )}
                </div>

                <div className="landing-surface overflow-hidden rounded-xl border shadow-sm shadow-black/5">
                    {emptyDatabase ? (
                        <div className="flex flex-col items-center gap-4 p-8">
                            <p className="text-center text-sm text-muted-foreground">
                                No parts yet. Create one to get started.
                            </p>
                            <Button type="button" onClick={openCreateModal}>
                                Add part
                            </Button>
                        </div>
                    ) : noSearchResults ? (
                        <p className="p-8 text-center text-sm text-muted-foreground">
                            No parts match your search.
                        </p>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={parts.data}
                            sorting={sorting}
                            onSortingChange={handleSortingChange}
                            getRowId={(row) => String(row.id)}
                            aria-label="Parts"
                        />
                    )}
                </div>

                {parts.last_page > 1 && (
                    <nav
                        className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
                        aria-label="Pagination"
                    >
                        <div className="flex flex-wrap items-center justify-center gap-1">
                            {parts.links.map((link, i) => {
                                if (link.label === '...') {
                                    return (
                                        <span
                                            key={`ellipsis-${i}`}
                                            className="px-2 text-sm text-muted-foreground"
                                            aria-hidden
                                        >
                                            …
                                        </span>
                                    );
                                }

                                return (
                                    <Button
                                        key={`${link.label}-${i}`}
                                        type="button"
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        disabled={link.url === null}
                                        aria-current={
                                            link.active ? 'page' : undefined
                                        }
                                        onClick={() => {
                                            if (link.url) {
                                                router.get(
                                                    link.url,
                                                    {},
                                                    {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                    },
                                                );
                                            }
                                        }}
                                    >
                                        {decodeHtmlEntities(link.label)}
                                    </Button>
                                );
                            })}
                        </div>
                    </nav>
                )}
            </div>
        </>
    );
}

PartsIndexPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard.url() },
        { title: 'Parts', href: partsIndex.url() },
    ],
};

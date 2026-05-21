import { router } from '@inertiajs/react';
import { ChevronDown, Filter } from 'lucide-react';
import { useState } from 'react';

import { SearchableSelect } from '@/components/searchable-select';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { transactionsIndexQuery } from '@/lib/transactions-index-query';
import { index as transactionsIndex } from '@/routes/inventory/transactions';
import type {
    EnumOption,
    PartFilterOption,
    TransactionListFilters,
    TransactionTypeValue,
} from '@/types/inventory';

type TransactionsFiltersProps = {
    parts: PartFilterOption[];
    transactionTypes: EnumOption[];
    conditions: EnumOption[];
    filters: TransactionListFilters;
};

export function TransactionsFilters({
    parts,
    transactionTypes,
    conditions,
    filters,
}: TransactionsFiltersProps) {
    const [partId, setPartId] = useState(
        filters.part_id !== null ? String(filters.part_id) : '',
    );
    const [selectedTypes, setSelectedTypes] = useState<TransactionTypeValue[]>(
        filters.transaction_types,
    );
    const [condition, setCondition] = useState(filters.condition ?? 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const partOptions = parts.map((part) => ({
        value: String(part.part_id),
        label: `${part.part_number} — ${part.part_name}`,
    }));

    const applyFilters = () => {
        router.get(
            transactionsIndex.url({
                query: transactionsIndexQuery(filters, {
                    part_id: partId === '' ? null : Number.parseInt(partId, 10),
                    transaction_types: selectedTypes,
                    condition: condition === 'all' ? null : (condition as TransactionListFilters['condition']),
                    date_from: dateFrom === '' ? null : dateFrom,
                    date_to: dateTo === '' ? null : dateTo,
                    page: 1,
                }),
            }),
            {},
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    const clearFilters = () => {
        setPartId('');
        setSelectedTypes([]);
        setCondition('all');
        setDateFrom('');
        setDateTo('');

        router.get(transactionsIndex.url(), {}, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const toggleType = (value: TransactionTypeValue, checked: boolean) => {
        setSelectedTypes((current) => {
            if (checked) {
                return current.includes(value) ? current : [...current, value];
            }

            return current.filter((type) => type !== value);
        });
    };

    const typeFilterLabel =
        selectedTypes.length === 0
            ? 'All types'
            : `${selectedTypes.length} selected`;

    return (
        <div className="flex flex-col gap-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="grid gap-2">
                    <Label htmlFor="filter-part">Part</Label>
                    <SearchableSelect
                        id="filter-part"
                        options={partOptions}
                        value={partId}
                        onValueChange={setPartId}
                        placeholder="All parts"
                        searchPlaceholder="Search parts…"
                        clearLabel="All parts"
                    />
                </div>
                <div className="grid gap-2">
                    <Label id="filter-type-label">Transaction type</Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-between font-normal"
                                aria-labelledby="filter-type-label"
                            >
                                {typeFilterLabel}
                                <ChevronDown className="size-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="start">
                            {transactionTypes.map((type) => (
                                <DropdownMenuCheckboxItem
                                    key={type.value}
                                    checked={selectedTypes.includes(
                                        type.value as TransactionTypeValue,
                                    )}
                                    onCheckedChange={(checked) =>
                                        toggleType(
                                            type.value as TransactionTypeValue,
                                            checked === true,
                                        )
                                    }
                                >
                                    {type.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="filter-condition">Condition</Label>
                    <Select value={condition} onValueChange={setCondition}>
                        <SelectTrigger id="filter-condition" className="w-full">
                            <SelectValue placeholder="All conditions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All conditions</SelectItem>
                            {conditions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="filter-date-from">Date from</Label>
                    <Input
                        id="filter-date-from"
                        type="date"
                        value={dateFrom}
                        onChange={(event) => setDateFrom(event.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="filter-date-to">Date to</Label>
                    <Input
                        id="filter-date-to"
                        type="date"
                        value={dateTo}
                        onChange={(event) => setDateTo(event.target.value)}
                    />
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={applyFilters}>
                    <Filter className="size-4" aria-hidden />
                    Apply filters
                </Button>
                <Button type="button" variant="outline" onClick={clearFilters}>
                    Clear
                </Button>
            </div>
        </div>
    );
}

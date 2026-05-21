import { Check, ChevronsUpDown } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type SearchableSelectOption = {
    value: string;
    label: string;
};

type SearchableSelectProps = {
    id?: string;
    name?: string;
    options: SearchableSelectOption[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyLabel?: string;
    allowClear?: boolean;
    clearLabel?: string;
    disabled?: boolean;
    'aria-invalid'?: boolean;
    className?: string;
};

export function SearchableSelect({
    id,
    name,
    options,
    value,
    onValueChange,
    placeholder = 'Select…',
    searchPlaceholder = 'Search…',
    emptyLabel = 'No matches.',
    allowClear = true,
    clearLabel = 'None',
    disabled = false,
    'aria-invalid': ariaInvalid,
    className,
}: SearchableSelectProps) {
    const listboxId = useId();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selected = options.find((option) => option.value === value);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (term === '') {
            return options;
        }

        return options.filter((option) =>
            option.label.toLowerCase().includes(term),
        );
    }, [options, search]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
        };
    }, [open]);

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            {name ? <input type="hidden" name={name} value={value} /> : null}
            <Button
                type="button"
                id={id}
                variant="outline"
                role="combobox"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-invalid={ariaInvalid}
                disabled={disabled}
                className="w-full justify-between font-normal"
                onClick={() => {
                    setOpen((current) => !current);
                    if (!open) {
                        setSearch('');
                    }
                }}
            >
                <span className={cn(!selected && 'text-muted-foreground')}>
                    {selected?.label ?? placeholder}
                </span>
                <ChevronsUpDown className="size-4 shrink-0 opacity-50" aria-hidden />
            </Button>
            {open ? (
                <div className="bg-popover text-popover-foreground absolute z-50 mt-1 w-full rounded-md border p-2 shadow-md">
                    <Input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={searchPlaceholder}
                        autoComplete="off"
                        aria-label={searchPlaceholder}
                        className="mb-2 h-8"
                    />
                    <ul
                        id={listboxId}
                        role="listbox"
                        className="max-h-48 overflow-y-auto"
                    >
                        {allowClear ? (
                            <li role="option" aria-selected={value === ''}>
                                <button
                                    type="button"
                                    className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                                    onClick={() => {
                                        onValueChange('');
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'size-4 shrink-0',
                                            value === '' ? 'opacity-100' : 'opacity-0',
                                        )}
                                        aria-hidden
                                    />
                                    {clearLabel}
                                </button>
                            </li>
                        ) : null}
                        {filtered.length === 0 ? (
                            <li className="text-muted-foreground px-2 py-2 text-sm">
                                {emptyLabel}
                            </li>
                        ) : (
                            filtered.map((option) => (
                                <li
                                    key={option.value}
                                    role="option"
                                    aria-selected={option.value === value}
                                >
                                    <button
                                        type="button"
                                        className="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm"
                                        onClick={() => {
                                            onValueChange(option.value);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                'size-4 shrink-0',
                                                option.value === value
                                                    ? 'opacity-100'
                                                    : 'opacity-0',
                                            )}
                                            aria-hidden
                                        />
                                        {option.label}
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            ) : null}
        </div>
    );
}

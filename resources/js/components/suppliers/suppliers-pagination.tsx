import { router } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { decodeHtmlEntities } from '@/lib/utils';
import type { PaginatedSuppliers } from '@/types/supplier';

export function SuppliersPagination({
    suppliers,
}: {
    suppliers: PaginatedSuppliers;
}) {
    if (suppliers.last_page <= 1) {
        return null;
    }

    return (
        <nav
            className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            aria-label="Pagination"
        >
            <div className="flex flex-wrap items-center justify-center gap-1">
                {suppliers.links.map((link, index) => {
                    if (link.label === '...') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-2 text-sm text-muted-foreground"
                                aria-hidden
                            >
                                …
                            </span>
                        );
                    }

                    return (
                        <Button
                            key={`${link.label}-${index}`}
                            type="button"
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            disabled={link.url === null}
                            aria-current={link.active ? 'page' : undefined}
                            onClick={() => {
                                if (!link.url) {
                                    return;
                                }

                                router.get(
                                    link.url,
                                    {},
                                    {
                                        preserveState: true,
                                        preserveScroll: true,
                                    },
                                );
                            }}
                        >
                            {decodeHtmlEntities(link.label)}
                        </Button>
                    );
                })}
            </div>
        </nav>
    );
}

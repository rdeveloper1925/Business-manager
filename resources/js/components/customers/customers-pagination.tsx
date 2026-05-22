import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { decodeHtmlEntities } from '@/lib/utils';
import type { PaginatedCustomers } from '@/types/customer';

export function CustomersPagination({
    customers,
}: {
    customers: PaginatedCustomers;
}) {
    if (customers.last_page <= 1) {
        return null;
    }

    return (
        <nav
            className="flex flex-col items-start gap-3 sm:flex-row sm:justify-start"
            aria-label="Pagination"
        >
            <div className="flex flex-wrap items-center justify-start gap-1">
                {customers.links.map((link, index) => {
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

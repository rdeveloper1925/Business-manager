import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
    customersPage,
    customersTemplate,
    customersUpload,
    status as statusRoute,
} from '@/actions/App/Http/Controllers/DataLoaderController';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getEcho } from '@/echo';
import { xsrfToken } from '@/lib/csrf';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

type ImportStatusResponse = {
    import_id?: string;
    status: 'pending' | 'processing' | 'success' | 'failed';
    progress: number;
    processed: number;
    total: number;
    rows_loaded: number;
    message: string | null;
};

const PROGRESS_EVENT = '.data-import.progress';

function parseErrorMessage(data: Record<string, unknown>): string {
    if (typeof data.message === 'string' && data.message !== '') {
        return data.message;
    }

    const errors = data.errors;

    if (errors && typeof errors === 'object' && errors !== null) {
        const first = Object.values(errors as Record<string, string[]>)[0];

        if (Array.isArray(first) && typeof first[0] === 'string') {
            return first[0];
        }
    }

    return 'Something went wrong.';
}

const CUSTOMER_IMPORT_SESSION_KEY = 'bm_customer_data_import_id';

function persistActiveImportId(id: string): void {
    try {
        sessionStorage.setItem(CUSTOMER_IMPORT_SESSION_KEY, id);
    } catch {
        /* quota / private mode */
    }
}

function readActiveImportId(): string | null {
    try {
        const v = sessionStorage.getItem(CUSTOMER_IMPORT_SESSION_KEY);

        return v !== null && v !== '' ? v : null;
    } catch {
        return null;
    }
}

function clearActiveImportId(): void {
    try {
        sessionStorage.removeItem(CUSTOMER_IMPORT_SESSION_KEY);
    } catch {
        /* ignore */
    }
}

function applyTerminalToasts(
    data: ImportStatusResponse,
    options?: { suppressToast?: boolean },
): void {
    const showToast = !options?.suppressToast;

    if (data.status === 'success') {
        clearActiveImportId();

        if (showToast) {
            toast.success(
                `Import finished. ${data.rows_loaded} row(s) loaded.`,
            );
        }
    } else if (data.status === 'failed') {
        clearActiveImportId();

        if (showToast) {
            toast.error(data.message ?? 'Import failed.');
        }
    }
}

export default function CustomerDataLoad() {
    const [importId, setImportId] = useState<string | null>(null);
    const [importStatus, setImportStatus] = useState<ImportStatusResponse | null>(
        null,
    );
    const [uploading, setUploading] = useState(false);
    const terminalToastShownRef = useRef(false);
    const skipTerminalToastOnFirstHydrateRef = useRef(false);

    const hydrateStatus = useCallback(
        async (
            id: string,
            options?: { skipTerminalToastIfComplete?: boolean },
        ): Promise<boolean> => {
            const res = await fetch(statusRoute.url(id), {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (res.status === 403 || res.status === 404) {
                clearActiveImportId();
                setImportId(null);
                setImportStatus(null);

                return false;
            }

            if (!res.ok) {
                return true;
            }

            const data = (await res.json()) as ImportStatusResponse;
            setImportStatus(data);

            if (data.status === 'success' || data.status === 'failed') {
                const suppress =
                    Boolean(options?.skipTerminalToastIfComplete) &&
                    !terminalToastShownRef.current;
                terminalToastShownRef.current = true;
                applyTerminalToasts(data, { suppressToast: suppress });

                return false;
            }

            return true;
        },
        [],
    );

    useEffect(() => {
        const stored = readActiveImportId();

        if (stored === null) {
            return;
        }

        skipTerminalToastOnFirstHydrateRef.current = true;
        setImportId(stored);
    }, []);

    useEffect(() => {
        if (importId === null) {
            return;
        }

        let cancelled = false;
        let pollTimer: ReturnType<typeof setInterval> | null = null;
        const skipFirstTerminalToast = skipTerminalToastOnFirstHydrateRef.current;
        skipTerminalToastOnFirstHydrateRef.current = false;

        const runHydrate = (options?: { skipTerminalToastIfComplete?: boolean }) => {
            void hydrateStatus(importId, options).then((shouldContinue) => {
                if (!shouldContinue && pollTimer !== null) {
                    clearInterval(pollTimer);
                    pollTimer = null;
                }
            });
        };

        runHydrate({
            skipTerminalToastIfComplete: skipFirstTerminalToast,
        });

        // Fallback polling keeps the progress bar live if websocket auth/connection fails.
        pollTimer = setInterval(() => {
            if (cancelled) {
                return;
            }

            runHydrate();
        }, 3000);

        const echo = getEcho();
        const channelName = `data-import.${importId}`;

        if (echo === null) {
            return () => {
                cancelled = true;
                if (pollTimer !== null) {
                    clearInterval(pollTimer);
                    pollTimer = null;
                }
            };
        }

        const channel = echo.private(channelName);

        channel.listen(PROGRESS_EVENT, (payload: ImportStatusResponse) => {
            if (
                typeof payload.import_id === 'string' &&
                payload.import_id !== importId
            ) {
                return;
            }

            setImportStatus(payload);

            if (payload.status === 'success' || payload.status === 'failed') {
                if (!terminalToastShownRef.current) {
                    terminalToastShownRef.current = true;
                    applyTerminalToasts(payload);
                } else {
                    clearActiveImportId();
                }
            }
        });

        return () => {
            cancelled = true;
            channel.stopListening(PROGRESS_EVENT);
            echo.leave(channelName);
            if (pollTimer !== null) {
                clearInterval(pollTimer);
                pollTimer = null;
            }
        };
    }, [importId, hydrateStatus]);

    const onSubmitFile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const input = form.elements.namedItem('csv') as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) {
            toast.error('Choose a CSV file.');

            return;
        }

        setUploading(true);
        setImportStatus(null);
        setImportId(null);
        clearActiveImportId();
        terminalToastShownRef.current = false;
        skipTerminalToastOnFirstHydrateRef.current = false;

        const body = new FormData();
        body.append('file', file);

        try {
            const res = await fetch(customersUpload.url(), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken(),
                },
                credentials: 'same-origin',
                body,
            });

            const data = (await res.json().catch(() => ({}))) as Record<
                string,
                unknown
            >;

            if (!res.ok) {
                toast.error(parseErrorMessage(data));
                input.value = '';

                return;
            }

            const id = data.import_id;

            if (typeof id !== 'string') {
                toast.error('Invalid response from server.');

                return;
            }

            persistActiveImportId(id);
            setImportId(id);
            toast.info('Import started.');
            input.value = '';
        } catch {
            toast.error('Upload failed. Check your connection and try again.');
        } finally {
            setUploading(false);
        }
    };

    const progress =
        importStatus?.status === 'success'
            ? 100
            : Math.min(100, Math.max(0, importStatus?.progress ?? 0));

    return (
        <>
            <Head title="Customer data load" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Customer data load
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Download the template, fill in your rows, then upload a
                        CSV that matches the template headers exactly.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Template</CardTitle>
                        <CardDescription>
                            The first row must match these columns: full_name,
                            organization_name, phone_country_name, phone_number,
                            email, address, tax_id.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" asChild>
                            <a href={customersTemplate.url()} download>
                                Download CSV template
                            </a>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upload</CardTitle>
                        <CardDescription>
                            Import runs in the background. Progress updates
                            below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="flex flex-col gap-4" onSubmit={onSubmitFile}>
                            <div className="grid gap-2">
                                <Label htmlFor="csv">CSV file</Label>
                                <Input
                                    id="csv"
                                    name="csv"
                                    type="file"
                                    accept=".csv,text/csv,text/plain"
                                    disabled={uploading}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={uploading}>
                                {uploading ? 'Uploading…' : 'Upload and import'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {(importId !== null || importStatus !== null) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Progress</CardTitle>
                            {importId !== null && (
                                <CardDescription>
                                    Import ID: {importId}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div
                                className="bg-muted h-2 w-full overflow-hidden rounded-full"
                                role="progressbar"
                                aria-valuenow={progress}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            >
                                <div
                                    className="bg-primary h-full transition-[width] duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            {importStatus && (
                                <p className="text-muted-foreground text-sm">
                                    Status:{' '}
                                    <span className="text-foreground font-medium">
                                        {importStatus.status}
                                    </span>
                                    {importStatus.total > 0 && (
                                        <>
                                            {' '}
                                            — {importStatus.processed} /{' '}
                                            {importStatus.total} rows
                                        </>
                                    )}
                                </p>
                            )}
                            {importStatus?.status === 'success' && (
                                <p className="text-sm text-green-700 dark:text-green-400">
                                    Successfully loaded {importStatus.rows_loaded}{' '}
                                    row(s).
                                </p>
                            )}
                            {importStatus?.status === 'failed' && (
                                <p
                                    className={cn(
                                        'rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive',
                                    )}
                                >
                                    {importStatus.message ?? 'Import failed.'}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

CustomerDataLoad.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard.url() },
        {
            title: 'Customer data load',
            href: customersPage.url(),
        },
    ],
};

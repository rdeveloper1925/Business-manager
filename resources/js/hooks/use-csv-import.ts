import { useForm } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { customersUpload, status as statusRoute } from '@/actions/App/Http/Controllers/DataLoaderController';
import { getEcho } from '@/echo';

export type ImportStatusResponse = {
    import_id?: string;
    status: 'pending' | 'processing' | 'success' | 'failed';
    progress: number;
    processed: number;
    total: number;
    rows_loaded: number;
    message: string | null;
};

const PROGRESS_EVENT = '.data-import.progress';
const CUSTOMER_IMPORT_SESSION_KEY = 'bm_customer_data_import_id';

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

function persistActiveImportId(id: string): void {
    try {
        sessionStorage.setItem(CUSTOMER_IMPORT_SESSION_KEY, id);
    } catch {
        /* quota / private mode */
    }
}

function readActiveImportId(): string | null {
    try {
        const value = sessionStorage.getItem(CUSTOMER_IMPORT_SESSION_KEY);

        return value !== null && value !== '' ? value : null;
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
            toast.success(`Import finished. ${data.rows_loaded} row(s) loaded.`);
        }
    } else if (data.status === 'failed') {
        clearActiveImportId();

        if (showToast) {
            toast.error(data.message ?? 'Import failed.');
        }
    }
}

export function useCsvImport() {
    const [importId, setImportId] = useState<string | null>(() =>
        readActiveImportId(),
    );
    const [importStatus, setImportStatus] = useState<ImportStatusResponse | null>(
        null,
    );
    const terminalToastShownRef = useRef(false);
    const skipTerminalToastOnFirstHydrateRef = useRef(importId !== null);
    const { setData, post, processing } = useForm<{ file: File | null }>({
        file: null,
    });

    const hydrateStatus = useCallback(
        async (
            id: string,
            options?: { skipTerminalToastIfComplete?: boolean },
        ): Promise<boolean> => {
            const response = await fetch(statusRoute.url(id), {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (response.status === 403 || response.status === 404) {
                clearActiveImportId();
                setImportId(null);
                setImportStatus(null);

                return false;
            }

            if (!response.ok) {
                return true;
            }

            const data = (await response.json()) as ImportStatusResponse;
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

    const submitFile = useCallback(
        (file: File, onDone: () => void) => {
            setImportStatus(null);
            setImportId(null);
            clearActiveImportId();
            terminalToastShownRef.current = false;
            skipTerminalToastOnFirstHydrateRef.current = false;
            setData('file', file);

            post(customersUpload.url(), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: ({ props }) => {
                    const importIdValue = props.import_id;

                    if (typeof importIdValue !== 'string') {
                        toast.error('Invalid response from server.');
                        onDone();

                        return;
                    }

                    persistActiveImportId(importIdValue);
                    setImportId(importIdValue);
                    toast.info('Import started.');
                    onDone();
                },
                onError: (errors) => {
                    const message =
                        typeof errors.file === 'string'
                            ? errors.file
                            : parseErrorMessage(errors as Record<string, unknown>);
                    toast.error(message);
                    onDone();
                },
                onFinish: () => {
                    setData('file', null);
                },
            });
        },
        [post, setData],
    );

    return {
        importId,
        importStatus,
        submitFile,
        uploading: processing,
    };
}

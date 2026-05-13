import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { status as statusRoute } from '@/actions/App/Http/Controllers/DataLoaderController';
import { getEcho } from '@/echo';
import { xsrfToken } from '@/lib/csrf';

export type ImportStatusResponse = {
    import_id?: string;
    status: 'pending' | 'processing' | 'success' | 'failed';
    progress: number;
    processed: number;
    total: number;
    rows_loaded: number;
    message: string | null;
};

export type UseCsvImportOptions = {
    uploadUrl: string;
    sessionStorageKey: string;
};

const PROGRESS_EVENT = '.data-import.progress';

function parseErrorMessage(data: Record<string, unknown>): string {
    if (typeof data.message === 'string' && data.message !== '') {
        return data.message;
    }

    const errors = data.errors;

    if (errors && typeof errors === 'object' && errors !== null) {
        const first = Object.values(errors as Record<string, string[] | string>)[0];

        if (Array.isArray(first) && typeof first[0] === 'string') {
            return first[0];
        }

        if (typeof first === 'string') {
            return first;
        }
    }

    return 'Something went wrong.';
}

export function useCsvImport({
    uploadUrl,
    sessionStorageKey,
}: UseCsvImportOptions) {
    const [importId, setImportId] = useState<string | null>(() => {
        try {
            const value = sessionStorage.getItem(sessionStorageKey);

            return value !== null && value !== '' ? value : null;
        } catch {
            return null;
        }
    });
    const [importStatus, setImportStatus] = useState<ImportStatusResponse | null>(
        null,
    );
    const terminalToastShownRef = useRef(false);
    const skipTerminalToastOnFirstHydrateRef = useRef(importId !== null);
    const [uploading, setUploading] = useState(false);

    const clearStorage = useCallback(() => {
        try {
            sessionStorage.removeItem(sessionStorageKey);
        } catch {
            /* ignore */
        }
    }, [sessionStorageKey]);

    const persistId = useCallback(
        (id: string) => {
            try {
                sessionStorage.setItem(sessionStorageKey, id);
            } catch {
                /* quota / private mode */
            }
        },
        [sessionStorageKey],
    );

    const applyTerminalToasts = useCallback(
        (data: ImportStatusResponse, options?: { suppressToast?: boolean }): void => {
            const showToast = !options?.suppressToast;

            if (data.status === 'success') {
                clearStorage();

                if (showToast) {
                    toast.success(`Import finished. ${data.rows_loaded} row(s) loaded.`);
                }
            } else if (data.status === 'failed') {
                clearStorage();

                if (showToast) {
                    toast.error(data.message ?? 'Import failed.');
                }
            }
        },
        [clearStorage],
    );

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
                clearStorage();
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
        [applyTerminalToasts, clearStorage],
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
                    clearStorage();
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
    }, [importId, hydrateStatus, applyTerminalToasts, clearStorage]);

    const submitFile = useCallback(
        (file: File, onDone: () => void) => {
            setImportStatus(null);
            setImportId(null);
            clearStorage();
            terminalToastShownRef.current = false;
            skipTerminalToastOnFirstHydrateRef.current = false;

            const body = new FormData();
            body.append('file', file);

            setUploading(true);

            void (async (): Promise<void> => {
                try {
                    const response = await fetch(uploadUrl, {
                        method: 'POST',
                        body,
                        credentials: 'same-origin',
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                            'X-XSRF-TOKEN': xsrfToken(),
                        },
                    });

                    let payload: Record<string, unknown> = {};

                    try {
                        payload = (await response.json()) as Record<string, unknown>;
                    } catch {
                        payload = {};
                    }

                    if (response.ok) {
                        const importIdValue = payload.import_id;

                        if (typeof importIdValue !== 'string') {
                            toast.error('Invalid response from server.');
                            onDone();

                            return;
                        }

                        persistId(importIdValue);
                        setImportId(importIdValue);
                        toast.info('Import started.');
                        onDone();

                        return;
                    }

                    if (response.status === 422) {
                        toast.error(parseErrorMessage(payload));
                        onDone();

                        return;
                    }

                    toast.error(parseErrorMessage(payload));
                    onDone();
                } catch {
                    toast.error('Network error.');
                    onDone();
                } finally {
                    setUploading(false);
                }
            })();
        },
        [uploadUrl, clearStorage, persistId],
    );

    return {
        importId,
        importStatus,
        submitFile,
        uploading,
    };
}

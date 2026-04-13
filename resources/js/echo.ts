import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

import { xsrfToken } from '@/lib/csrf';

type RuntimeReverbConfig = {
    appKey?: string;
    host?: string;
    port?: number;
    scheme?: 'http' | 'https';
    debug?: boolean;
};

declare global {
    interface Window {
        Pusher: typeof Pusher;
        __BM_RUNTIME_CONFIG__?: {
            reverb?: RuntimeReverbConfig;
        };
    }
}

function isBrowser(): boolean {
    return typeof window !== 'undefined';
}

function runtimeConfig(): RuntimeReverbConfig {
    if (!isBrowser()) {
        return {};
    }

    return window.__BM_RUNTIME_CONFIG__?.reverb ?? {};
}

function resolveConfig() {
    const runtime = runtimeConfig();
    const key = runtime.appKey ?? import.meta.env.VITE_REVERB_APP_KEY;
    const host = runtime.host ?? import.meta.env.VITE_REVERB_HOST;
    const scheme = runtime.scheme ?? import.meta.env.VITE_REVERB_SCHEME ?? 'http';
    const resolvedPort =
        runtime.port ??
        (() => {
            const envPort = import.meta.env.VITE_REVERB_PORT;
            if (envPort === undefined || envPort === '') {
                return scheme === 'https' ? 443 : 80;
            }

            return Number.parseInt(String(envPort), 10);
        })();

    return {
        key,
        host,
        scheme,
        port: resolvedPort,
        debug: runtime.debug ?? import.meta.env.VITE_REVERB_DEBUG === 'true',
    };
}

const echoInstance: Echo<'reverb'> | null = (() => {
    if (!isBrowser()) {
        return null;
    }

    window.Pusher = Pusher;
    const config = resolveConfig();

    if (
        typeof config.key !== 'string' ||
        config.key === '' ||
        typeof config.host !== 'string' ||
        config.host === '' ||
        !Number.isFinite(config.port)
    ) {
        return null;
    }

    const echo = new Echo({
        broadcaster: 'reverb',
        key: config.key,
        wsHost: config.host,
        wsPort: config.port,
        wssPort: config.port,
        forceTLS: config.scheme === 'https',
        enabledTransports: ['ws', 'wss'],
        auth: {
            headers: {
                'X-XSRF-TOKEN': xsrfToken(),
            },
        },
    });

    if (config.debug) {
        Pusher.logToConsole = true;
        console.debug('[Reverb] Echo initialized', {
            host: config.host,
            port: config.port,
            scheme: config.scheme,
            keyPrefix: config.key.slice(0, 6),
        });
    }

    return echo;
})();

export function getEcho(): Echo<'reverb'> | null {
    return echoInstance;
}

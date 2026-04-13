import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

import { xsrfToken } from '@/lib/csrf';

declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

window.Pusher = Pusher;

const key = import.meta.env.VITE_REVERB_APP_KEY;
const host = import.meta.env.VITE_REVERB_HOST;
const port = import.meta.env.VITE_REVERB_PORT;
const scheme = import.meta.env.VITE_REVERB_SCHEME ?? 'http';

function parsePort(): number {
    if (port === undefined || port === '') {
        return scheme === 'https' ? 443 : 80;
    }

    return Number.parseInt(String(port), 10);
}

const echoInstance: Echo<'reverb'> | null =
    typeof key === 'string' &&
    key !== '' &&
    typeof host === 'string' &&
    host !== ''
        ? new Echo({
              broadcaster: 'reverb',
              key,
              wsHost: host,
              wsPort: parsePort(),
              wssPort: parsePort(),
              forceTLS: scheme === 'https',
              enabledTransports: ['ws', 'wss'],
              auth: {
                  headers: {
                      'X-XSRF-TOKEN': xsrfToken(),
                  },
              },
          })
        : null;

export function getEcho(): Echo<'reverb'> | null {
    return echoInstance;
}

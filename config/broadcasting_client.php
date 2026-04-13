<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Browser / Echo (Reverb) runtime
    |--------------------------------------------------------------------------
    |
    | Values exposed to the SPA for Laravel Echo. Read via config() only
    | (e.g. in Blade), not env(), so config caching works in production.
    | VITE_* entries match .env keys used at Vite build time; server-side
    | fallbacks use REVERB_* when VITE_* are unset.
    |
    */

    'reverb' => [
        'app_key' => (string) (env('VITE_REVERB_APP_KEY') ?: env('REVERB_APP_KEY', '')),
        'host' => (string) (env('VITE_REVERB_HOST') ?: env('REVERB_HOST', '')),
        'port' => (int) (env('VITE_REVERB_PORT') ?: env('REVERB_PORT', 0)),
        'scheme' => (string) (env('VITE_REVERB_SCHEME') ?: env('REVERB_SCHEME', 'http')),
        'debug' => (bool) env('VITE_REVERB_DEBUG', false),
    ],

];

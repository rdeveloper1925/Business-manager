<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Trusted Proxies
    |--------------------------------------------------------------------------
    |
    | Comma-separated IPs, "*", or "**". Used by TrustProxies middleware when
    | TrustProxies::at() is not set. Keeps proxy trust compatible with
    | php artisan config:cache (read via config(), not env() in bootstrap).
    |
    */

    'proxies' => env('TRUSTED_PROXIES', '*'),

];

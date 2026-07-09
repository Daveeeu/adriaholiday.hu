<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | The admin and portfolio SPAs are served from the same origin as this
    | API in production (reverse-proxied under /api and /api/admin), so
    | CORS is only actually exercised in local development, where the
    | Vite dev servers and this API run on different ports. Origins are
    | explicit (never a wildcard) so that supports_credentials can safely
    | stay enabled for callers that do rely on cookies (e.g. the public
    | site's analytics session cookie).
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter(array_map(
        'trim',
        explode(',', env('CORS_ALLOWED_ORIGINS', implode(',', [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
            'http://localhost:8000',
            'http://127.0.0.1:8000',
        ]))),
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];

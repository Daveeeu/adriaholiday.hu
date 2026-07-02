<?php

return [
    'enabled' => env('ANALYTICS_ENABLED', true),
    'debug' => env('ANALYTICS_DEBUG', false),
    'queue' => env('ANALYTICS_QUEUE', 'analytics'),
    'session_cookie' => env('ANALYTICS_SESSION_COOKIE', 'ah_session_id'),
    'session_lifetime_minutes' => (int) env('ANALYTICS_SESSION_LIFETIME', 30),

    'meta' => [
        'pixel_id' => env('META_PIXEL_ID'),
        'capi_enabled' => env('META_CAPI_ENABLED', false),
        'access_token' => env('META_CAPI_ACCESS_TOKEN'),
        'test_event_code' => env('META_CAPI_TEST_EVENT_CODE'),
        'api_version' => env('META_CAPI_API_VERSION', 'v20.0'),
        'endpoint_timeout_seconds' => (int) env('META_CAPI_TIMEOUT', 5),
    ],
];

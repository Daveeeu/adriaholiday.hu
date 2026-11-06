<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'simplepay' => [
        'environment' => env('SIMPLEPAY_ENVIRONMENT', 'test'),
        // Every SimplePay merchant account is bound to one currency.
        'merchants' => [
            'HUF' => ['id' => env('SIMPLEPAY_HUF_MERCHANT'), 'secret' => env('SIMPLEPAY_HUF_SECRET_KEY')],
            'EUR' => ['id' => env('SIMPLEPAY_EUR_MERCHANT'), 'secret' => env('SIMPLEPAY_EUR_SECRET_KEY')],
        ],
        // Where SimplePay sends the customer back; defaults to APP_URL/fizetes/eredmeny.
        'redirect_url' => env('SIMPLEPAY_REDIRECT_URL'),
        'timeout' => env('SIMPLEPAY_TIMEOUT', 15),
    ],

    // Newsletter subscribers are mirrored into these Mailchimp audiences.
    // Leave MAILCHIMP_API_KEY or either audience empty to disable the sync.
    'mailchimp' => [
        'api_key' => env('MAILCHIMP_API_KEY'),
        'audience_id' => env('MAILCHIMP_AUDIENCE_ID'),
        'travel_club_audience_id' => env('MAILCHIMP_TRAVEL_CLUB_AUDIENCE_ID'),
        // true: Mailchimp emails a confirmation link and the member stays "pending" until clicked.
        'double_opt_in' => (bool) env('MAILCHIMP_DOUBLE_OPT_IN', false),
        'timeout' => (int) env('MAILCHIMP_TIMEOUT', 10),
    ],

    // Place search for the tours' route map stops (OpenStreetMap; at most one request per second, with an identifying user agent).
    'nominatim' => [
        'base_url' => env('NOMINATIM_BASE_URL', 'https://nominatim.openstreetmap.org'),
        'user_agent' => env('NOMINATIM_USER_AGENT', 'AdriaHoliday/1.0 (https://adriaholiday.hu)'),
        'timeout' => (int) env('NOMINATIM_TIMEOUT', 8),
    ],

    'legacy_adria' => [
        'base_url' => env('LEGACY_ADRIA_BASE_URL', 'https://adriaholiday.hu'),
        // Where legacy URLs are downloaded from when adriaholiday.hu no longer reaches the legacy server (App\Support\Legacy\LegacyFetchUrl).
        'fetch_origin' => env('LEGACY_ADRIA_FETCH_ORIGIN'),
        'user_agent' => env('LEGACY_ADRIA_USER_AGENT', 'AdriaHolidayLegacyImporter/1.0 (+https://adriaholiday.hu)'),
        'request_delay_ms' => env('LEGACY_ADRIA_DELAY_MS', 500),
        'timeout' => env('LEGACY_ADRIA_TIMEOUT', 15),
    ],

];

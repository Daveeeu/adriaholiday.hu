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

    'barion' => [
        'environment' => env('BARION_ENVIRONMENT', 'test'),
        'pos_key' => env('BARION_POS_KEY'),
        'payee' => env('BARION_PAYEE_EMAIL'),
        // Where Barion sends the customer back; defaults to APP_URL/fizetes/eredmeny.
        'redirect_url' => env('BARION_REDIRECT_URL'),
        'timeout' => env('BARION_TIMEOUT', 15),
    ],

    // Newsletter subscribers are mirrored into this Mailchimp audience.
    // Leave MAILCHIMP_API_KEY or MAILCHIMP_AUDIENCE_ID empty to disable the sync.
    'mailchimp' => [
        'api_key' => env('MAILCHIMP_API_KEY'),
        'audience_id' => env('MAILCHIMP_AUDIENCE_ID'),
        // true: Mailchimp emails a confirmation link and the member stays "pending" until clicked.
        'double_opt_in' => (bool) env('MAILCHIMP_DOUBLE_OPT_IN', false),
        'timeout' => (int) env('MAILCHIMP_TIMEOUT', 10),
    ],

    'legacy_adria' => [
        'base_url' => env('LEGACY_ADRIA_BASE_URL', 'https://adriaholiday.hu'),
        'user_agent' => env('LEGACY_ADRIA_USER_AGENT', 'AdriaHolidayLegacyImporter/1.0 (+https://adriaholiday.hu)'),
        'request_delay_ms' => env('LEGACY_ADRIA_DELAY_MS', 500),
        'timeout' => env('LEGACY_ADRIA_TIMEOUT', 15),
    ],

];

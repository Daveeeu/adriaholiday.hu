<?php

/*
| The AI travel sales assistant demo: a Hungarian voice consultant on the
| public site (/ai-utazasi-tanacsado) that talks to the visitor through the
| OpenAI Realtime API and answers from the tour catalog through read-only
| tools (see App\Services\SalesAssistant).
|
| The browser never sees the OpenAI API key: the backend mints a short-lived
| client secret per conversation and executes every tool call itself.
*/

return [

    /*
    | Off by default: while false, every assistant endpoint answers 404.
    */
    'enabled' => (bool) env('SALES_ASSISTANT_ENABLED', false),

    /*
    | When set, a conversation can only be started with this code, so the
    | demo can be shown without opening it to every visitor.
    */
    'access_code' => env('SALES_ASSISTANT_ACCESS_CODE'),

    /*
    | How long one conversation may last, in seconds. The OpenAI client
    | secret and the assistant session both expire after it.
    */
    'session_ttl_seconds' => (int) env('SALES_ASSISTANT_SESSION_TTL', 600),

    /*
    | Tool calls one conversation may make, a guard against runaway loops.
    */
    'max_tool_calls_per_session' => (int) env('SALES_ASSISTANT_MAX_TOOL_CALLS', 40),

    /*
    | Conversations the whole site may start a day (the OpenAI cost cap).
    */
    'daily_session_limit' => (int) env('SALES_ASSISTANT_DAILY_SESSION_LIMIT', 100),

    /*
    | Conversations one IP address may start an hour.
    */
    'sessions_per_ip_per_hour' => (int) env('SALES_ASSISTANT_SESSIONS_PER_IP_PER_HOUR', 6),

    /*
    | A price or departure not edited for this many days is reported to the
    | model as possibly outdated, so it tells the visitor to have it confirmed.
    */
    'stale_after_days' => (int) env('SALES_ASSISTANT_STALE_AFTER_DAYS', 30),

    /*
    | Trips one search returns: the assistant presents at most this many.
    */
    'max_search_results' => 3,

    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
        'base_url' => env('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
        'model' => env('SALES_ASSISTANT_MODEL', 'gpt-realtime-2.1'),
        'voice' => env('SALES_ASSISTANT_VOICE', 'marin'),
        'transcription_model' => env('SALES_ASSISTANT_TRANSCRIPTION_MODEL', 'gpt-4o-transcribe'),
        'timeout' => (int) env('SALES_ASSISTANT_OPENAI_TIMEOUT', 15),
    ],

];

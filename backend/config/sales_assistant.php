<?php

/*
| The AI travel sales assistant demo: a Hungarian voice consultant on the
| public site (/ai-utazasi-tanacsado), running on Retell AI. The visitor
| talks to a Retell agent in the browser (web call, no phone number); the
| agent answers from the tour catalog through read-only custom functions
| that Retell calls on this backend (see App\Services\SalesAssistant).
|
| The browser never sees the Retell API key: the backend creates each web
| call and verifies the signature of every function call.
*/

return [

    /*
    | Off by default: while false, every assistant endpoint answers 404.
    */
    'enabled' => (bool) env('SALES_ASSISTANT_ENABLED', false),

    /*
    | The browser demo page and its endpoints. Off while it is prepared: the
    | Retell agent's functions work without it (Retell's dashboard can test
    | the agent), so they only need `enabled`.
    */
    'demo_page_enabled' => (bool) env('SALES_ASSISTANT_DEMO_PAGE_ENABLED', false),

    /*
    | When set, a conversation can only be started with this code, so the
    | demo can be shown without opening it to every visitor.
    */
    'access_code' => env('SALES_ASSISTANT_ACCESS_CODE'),

    /*
    | How long the browser may follow one conversation, in seconds. Match the
    | agent's own max_call_duration_ms (see sales-assistant:retell-config).
    */
    'session_ttl_seconds' => (int) env('SALES_ASSISTANT_SESSION_TTL', 600),

    /*
    | Function calls one conversation may make, a guard against runaway loops.
    */
    'max_tool_calls_per_session' => (int) env('SALES_ASSISTANT_MAX_TOOL_CALLS', 40),

    /*
    | Conversations the whole site may start a day (the Retell cost cap).
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

    'retell' => [
        // Signs Retell's function calls too, so the backend can verify them.
        'api_key' => env('RETELL_API_KEY'),
        'agent_id' => env('RETELL_AGENT_ID'),
        'base_url' => env('RETELL_BASE_URL', 'https://api.retellai.com'),
        'timeout' => (int) env('RETELL_TIMEOUT', 10),
        // How old a signed function call may be, in seconds (Retell's SDK default).
        'signature_tolerance_seconds' => 300,
        // Used by sales-assistant:retell-config for the agent it prints.
        'llm_model' => env('RETELL_LLM_MODEL', 'gpt-4.1'),
        'voice_id' => env('RETELL_VOICE_ID'),
    ],

];

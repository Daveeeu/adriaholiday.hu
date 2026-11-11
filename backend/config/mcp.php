<?php

/*
|--------------------------------------------------------------------------
| MCP server
|--------------------------------------------------------------------------
|
| The read-only MCP server (routes/ai.php) that lets the office ask Claude,
| ChatGPT or Gemini about tours, bookings, customers and the admin itself. See
| docs/mcp-server.md.
|
*/

return [

    /*
    | The origins an AI client may register as its OAuth redirect URI
    | (dynamic client registration). Only the assistants the office uses:
    | Claude, ChatGPT, the Gemini app (googleusercontent.com) and Gemini
    | Enterprise (vertexaisearch.cloud.google.com).
    */
    'redirect_domains' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('MCP_REDIRECT_DOMAINS', 'https://claude.ai,https://claude.com,https://chatgpt.com,https://chat.openai.com,https://oauth-redirect.googleusercontent.com,https://vertexaisearch.cloud.google.com')),
    ))),

    /*
    | Private-use URI schemes of native desktop clients (RFC 8252). None: the
    | office connects through the web apps.
    */
    'custom_schemes' => [],

    /*
    | The OAuth issuer advertised in the discovery metadata; null is url('/').
    */
    'authorization_server' => null,

    'tool_search' => [
        'max_tool_calls' => 10,
        'max_output_bytes' => 65_536,
    ],

    /*
    | The server connects to no external MCP servers.
    */
    'clients' => [],

    /*
    | Lifetimes of the OAuth tokens the AI clients receive. A client renews
    | its access token with the refresh token; once that expires too, the
    | staff member signs in again.
    */
    'access_token_ttl_minutes' => (int) env('MCP_ACCESS_TOKEN_TTL_MINUTES', 60),

    'refresh_token_ttl_days' => (int) env('MCP_REFRESH_TOKEN_TTL_DAYS', 30),

    /*
    | Tool calls one staff member may make per minute.
    */
    'requests_per_minute' => (int) env('MCP_REQUESTS_PER_MINUTE', 120),

    /*
    | Where the admin user guide's screenshots are read from: the admin build
    | copies adria-admin/public/guide-images there.
    */
    'guide_images_path' => env('MCP_GUIDE_IMAGES_PATH', public_path('admin/guide-images')),

];

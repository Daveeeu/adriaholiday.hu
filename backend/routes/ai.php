<?php

use App\Mcp\Servers\AdriaHolidayServer;
use Illuminate\Support\Facades\Route;
use Laravel\Mcp\Facades\Mcp;

// OAuth discovery and dynamic client registration for Claude, ChatGPT and Gemini;
// Passport issues the tokens after the staff member signs in (/mcp/login).
// Registration is open to anyone, so it is rate limited.
Route::middleware('throttle:mcp-oauth')->group(fn () => Mcp::oauthRoutes());

// The office's read-only MCP server (docs/mcp-server.md).
Mcp::web('/mcp', AdriaHolidayServer::class)
    ->middleware(['auth:api', 'mcp.authorize', 'throttle:mcp']);

<?php

namespace App\Http\Controllers\Mcp;

use App\Http\Controllers\Controller;
use App\Http\Middleware\AuthorizeMcpRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\ActivityLog\AuthActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

/**
 * The sign-in page of the OAuth flow that connects Claude, ChatGPT or Gemini to the
 * MCP server. The admin itself signs in with Sanctum tokens, so the OAuth
 * consent screen needs this session sign-in of its own; afterwards the
 * staff member returns to the consent screen they came from.
 */
class McpLoginController extends Controller
{
    public function show(): View|RedirectResponse
    {
        if (Auth::guard('web')->check()) {
            return redirect()->intended('/admin');
        }

        return view('mcp.login');
    }

    public function store(LoginRequest $request, AuthActivityLogger $authLog): RedirectResponse
    {
        $validated = $request->validated();
        $user = $request->userCandidate();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            $authLog->loginFailed($validated['email'], $user, AuthActivityLogger::REASON_INVALID_CREDENTIALS, $request);

            throw ValidationException::withMessages(['email' => 'Hibás e-mail cím vagy jelszó.']);
        }

        if (! $user->is_active) {
            $authLog->loginFailed($validated['email'], $user, AuthActivityLogger::REASON_INACTIVE, $request);

            throw ValidationException::withMessages(['email' => 'Ez a fiók le van tiltva.']);
        }

        if (! $user->checkPermissionTo(AuthorizeMcpRequest::PERMISSION)) {
            $authLog->loginFailed($validated['email'], $user, AuthActivityLogger::REASON_NO_MCP_ACCESS, $request);

            throw ValidationException::withMessages([
                'email' => 'Ehhez a fiókhoz nincs „AI asszisztens” jogosultság. Kérd a rendszergazdát, hogy adja meg.',
            ]);
        }

        Auth::guard('web')->login($user);
        $request->session()->regenerate();
        $authLog->loginSucceeded($user, $request);

        return redirect()->intended('/admin');
    }
}

<?php

namespace App\Services\ActivityLog;

use App\Models\User;
use App\Support\ActivityLog\ActivityEvents;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Records admin sign-ins, failed sign-in attempts and sign-outs in the
 * activity log, with the client's IP address and browser. The account is
 * the subject; it is also the causer once the credentials were accepted.
 */
class AuthActivityLogger
{
    public const REASON_INVALID_CREDENTIALS = 'invalid_credentials';

    public const REASON_INACTIVE = 'inactive';

    /** Signed in to connect an AI assistant without the mcp.access permission. */
    public const REASON_NO_MCP_ACCESS = 'no_mcp_access';

    public function loginSucceeded(User $user, Request $request): void
    {
        $user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ])->saveQuietly();

        $this->log(ActivityEvents::LOGIN, 'Sikeres belépés', $request, $user, $user);
    }

    public function loginFailed(string $email, ?User $user, string $reason, Request $request): void
    {
        $this->log(ActivityEvents::LOGIN_FAILED, 'Sikertelen belépés', $request, null, $user, [
            'email' => Str::limit($email, 255, ''),
            'reason' => $reason,
        ]);
    }

    public function loggedOut(User $user, Request $request): void
    {
        $this->log(ActivityEvents::LOGOUT, 'Kijelentkezés', $request, $user, $user);
    }

    /**
     * @param  array<string, string>  $properties
     */
    private function log(string $event, string $description, Request $request, ?User $causer, ?User $subject, array $properties = []): void
    {
        $logger = activity(ActivityEvents::AUTH_LOG_NAME)
            ->event($event)
            ->withProperties([
                'ip' => $request->ip(),
                'user_agent' => Str::limit((string) $request->userAgent(), 500, ''),
                ...$properties,
            ]);

        if ($causer !== null) {
            $logger->causedBy($causer);
        } else {
            $logger->causedByAnonymous();
        }

        if ($subject !== null) {
            $logger->performedOn($subject);
        }

        $logger->log($description);
    }
}

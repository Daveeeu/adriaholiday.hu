<?php

namespace App\Support\ActivityLog;

/**
 * The activity_log.event values: the model events Spatie records plus the
 * admin sign-in events written by AuthActivityLogger.
 */
final class ActivityEvents
{
    public const CREATED = 'created';

    public const UPDATED = 'updated';

    public const DELETED = 'deleted';

    public const RESTORED = 'restored';

    public const LOGIN = 'login';

    public const LOGIN_FAILED = 'login_failed';

    public const LOGOUT = 'logout';

    public const AUTH_LOG_NAME = 'auth';

    /**
     * @return array<int, string>
     */
    public static function all(): array
    {
        return [
            self::CREATED,
            self::UPDATED,
            self::DELETED,
            self::RESTORED,
            self::LOGIN,
            self::LOGIN_FAILED,
            self::LOGOUT,
        ];
    }
}

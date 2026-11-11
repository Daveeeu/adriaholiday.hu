<?php

namespace App\Support\ActivityLog;

/**
 * The activity_log.event values: the model events Spatie records, the admin
 * sign-in events written by AuthActivityLogger and the questions AI
 * assistants asked through the MCP server (McpActivityLogger).
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

    public const AI_QUERY = 'ai_query';

    public const AUTH_LOG_NAME = 'auth';

    public const MCP_LOG_NAME = 'mcp';

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
            self::AI_QUERY,
        ];
    }
}

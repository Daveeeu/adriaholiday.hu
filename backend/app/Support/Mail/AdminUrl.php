<?php

namespace App\Support\Mail;

/**
 * Links from the office's notification emails into the admin panel.
 */
final class AdminUrl
{
    public static function to(string $path): string
    {
        return rtrim((string) config('app.admin_url', config('app.url')), '/').$path;
    }
}

<?php

namespace App\Support\Mail;

/**
 * Inline styles of the emails we send (see the components in
 * resources/views/components/email): email clients ignore stylesheets, so
 * every element carries its own.
 */
final class EmailStyle
{
    public const FONT = "font-family:'Segoe UI',Helvetica,Arial,sans-serif;";

    public const TEXT = self::FONT.'margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;';

    public const GREETING = self::FONT.'margin:0 0 8px;color:#0f172a;font-size:16px;';

    public const HEADING = self::FONT.'margin:0 0 12px;color:#0f172a;font-size:17px;font-weight:700;';

    public const LABEL = self::FONT.'padding:6px 12px 6px 0;color:#64748b;font-size:14px;vertical-align:top;width:42%;';

    public const VALUE = self::FONT.'padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;vertical-align:top;';

    public const CARD = 'background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;';

    public const LINK = 'color:#0891b2;font-weight:600;text-decoration:none;';

    public const MUTED = self::FONT.'margin:0;color:#64748b;font-size:13px;line-height:1.6;';
}

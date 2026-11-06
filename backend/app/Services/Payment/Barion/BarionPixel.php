<?php

namespace App\Services\Payment\Barion;

use App\Models\SiteSetting;
use App\Support\Booking\BookingPaymentSettings;
use App\Support\PublicContentCache;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Log;

/**
 * The Base Barion Pixel (fraud prevention) snippet Barion requires on every
 * page of an approved shop. bp.js reads window.barion_pixel_id when the page
 * fires its load event, so the snippet has to be in the HTML the server
 * sends rather than injected later by the SPA.
 */
class BarionPixel
{
    private const ID_PATTERN = '/^BP-[A-Za-z0-9]{10}-[A-Za-z0-9]{2}$/';

    /**
     * The configured pixel id, or null when none (or an invalid one) is set.
     */
    public function id(): ?string
    {
        // The pixel must never take the public site down with it: without a
        // readable setting the page is served without the pixel.
        try {
            $id = PublicContentCache::remember(
                PublicContentCache::SITE_SETTINGS,
                'barion-pixel-id',
                900,
                fn (): string => trim((string) SiteSetting::valuesOf(BookingPaymentSettings::GROUP, ['barion_pixel_id'])->get('barion_pixel_id')),
            );
        } catch (QueryException $exception) {
            Log::warning('Barion pixel id could not be read.', ['error' => $exception->getMessage()]);

            return null;
        }

        return preg_match(self::ID_PATTERN, $id) === 1 ? $id : null;
    }

    /**
     * Barion's official Base Pixel snippet, or null when no pixel id is set.
     * The id is safe to embed: it matched the strict BP-… pattern.
     */
    public function snippet(): ?string
    {
        $id = $this->id();

        if ($id === null) {
            return null;
        }

        return <<<HTML
<script>
window["bp"] = window["bp"] || function () { (window["bp"].q = window["bp"].q || []).push(arguments); };
window["bp"].l = 1 * new Date();
(function () {
var scriptElement = document.createElement("script");
var firstScript = document.getElementsByTagName("script")[0];
scriptElement.async = true;
scriptElement.src = "https://pixel.barion.com/bp.js";
firstScript.parentNode.insertBefore(scriptElement, firstScript);
})();
window["barion_pixel_id"] = "{$id}";
bp("init", "addBarionPixelId", window["barion_pixel_id"]);
</script>
<noscript><img height="1" width="1" style="display:none" alt="Barion Pixel" src="https://pixel.barion.com/a.gif?ba_pixel_id='{$id}'&ev=contentView&noscript=1"></noscript>
HTML;
    }
}

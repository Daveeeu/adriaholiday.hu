<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A legacy record a legacy import (catalog, apartments or the full admin export) handled: the local
 * record it became and its original JSON word for word, so nothing of the legacy data is lost.
 */
class LegacyImportRecord extends Model
{
    public const OFFER = 'offer';

    public const APARTMENT = 'apartment';

    public const CUSTOMER = 'customer';

    public const CONTACT_MESSAGE = 'contact_message';

    public const COUPON = 'coupon';

    public const TOUR_INQUIRY = 'tour_inquiry';

    public const APARTMENT_BOOKING = 'apartment_booking';

    public const BUS = 'bus';

    public const HOMEPAGE_OFFER = 'homepage_offer';

    public const TOUR_REGION_GROUP = 'tour_region_group';

    public const TOUR_SEASONAL_GROUP = 'tour_seasonal_group';

    public const PARTNER_FINANCE = 'partner_finance';

    public const PARTNER_BONUS_PLACE = 'partner_bonus_place';

    public const PAGE = 'page';

    public const TEXT_BLOCK = 'text_block';

    public const IMPORTED = 'imported';

    public const FAILED = 'failed';

    protected $fillable = [
        'entity',
        'legacy_id',
        'local_type',
        'local_id',
        'legacy_import_run_id',
        'payload_sha256',
        'raw_payload',
        'status',
        'messages',
    ];

    protected $casts = [
        'legacy_id' => 'integer',
        'local_id' => 'integer',
        'messages' => 'array',
    ];

    public function run(): BelongsTo
    {
        return $this->belongsTo(LegacyImportRun::class, 'legacy_import_run_id');
    }

    /**
     * @return array<string, mixed>
     */
    /**
     * The canonical JSON a legacy record is kept as.
     *
     * @param  array<string, mixed>  $payload
     */
    public static function encodePayload(array $payload): string
    {
        return json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    }

    /**
     * The hash that tells whether a legacy record changed since its import.
     *
     * @param  array<string, mixed>  $payload
     */
    public static function hashPayload(array $payload): string
    {
        return hash('sha256', self::encodePayload($payload));
    }

    public function payload(): array
    {
        return json_decode($this->raw_payload, true, flags: JSON_THROW_ON_ERROR);
    }
}

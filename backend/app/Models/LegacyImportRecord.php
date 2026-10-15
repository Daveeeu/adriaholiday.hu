<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A legacy record the catalog import handled: the local record it became and
 * its original JSON word for word, so nothing of the legacy data is lost.
 */
class LegacyImportRecord extends Model
{
    public const OFFER = 'offer';

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
    public function payload(): array
    {
        return json_decode($this->raw_payload, true, flags: JSON_THROW_ON_ERROR);
    }
}

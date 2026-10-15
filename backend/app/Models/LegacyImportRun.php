<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * One run of the legacy catalog import (see adria:catalog:import).
 */
class LegacyImportRun extends Model
{
    public const RUNNING = 'running';

    public const COMPLETED = 'completed';

    public const COMPLETED_WITH_ERRORS = 'completed_with_errors';

    public const FAILED = 'failed';

    protected $fillable = [
        'source_file',
        'source_sha256',
        'dry_run',
        'status',
        'summary',
        'started_at',
        'finished_at',
    ];

    protected $casts = [
        'dry_run' => 'boolean',
        'summary' => 'array',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
    ];

    public function records(): HasMany
    {
        return $this->hasMany(LegacyImportRecord::class);
    }
}

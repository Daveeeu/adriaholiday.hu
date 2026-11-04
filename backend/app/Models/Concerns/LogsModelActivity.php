<?php

namespace App\Models\Concerns;

use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

trait LogsModelActivity
{
    use LogsActivity;

    /**
     * Logs every changed column except the ones hidden from serialization
     * (passwords, tokens) and the timestamp bump that accompanies every save.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logExcept([...$this->getHidden(), 'updated_at'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}

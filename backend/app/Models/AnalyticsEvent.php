<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnalyticsEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'session_id',
        'visitor_id',
        'user_id',
        'event_name',
        'entity_type',
        'entity_id',
        'entity_slug',
        'page_url',
        'page_path',
        'referrer',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'metadata',
        'fbp',
        'fbc',
        'ip_hash',
        'user_agent',
        'consent_analytics',
        'consent_marketing',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'consent_analytics' => 'boolean',
            'consent_marketing' => 'boolean',
        ];
    }
}

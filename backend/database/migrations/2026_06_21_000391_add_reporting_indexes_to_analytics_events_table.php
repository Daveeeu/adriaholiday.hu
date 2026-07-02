<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('analytics_events', function (Blueprint $table): void {
            $table->index(['event_name', 'entity_slug', 'created_at'], 'analytics_event_slug_created_idx');
            $table->index(['entity_type', 'event_name', 'created_at'], 'analytics_entity_event_created_idx');
            $table->index(['utm_campaign', 'created_at'], 'analytics_utm_campaign_created_idx');
        });
    }

    public function down(): void
    {
        Schema::table('analytics_events', function (Blueprint $table): void {
            $table->dropIndex('analytics_event_slug_created_idx');
            $table->dropIndex('analytics_entity_event_created_idx');
            $table->dropIndex('analytics_utm_campaign_created_idx');
        });
    }
};

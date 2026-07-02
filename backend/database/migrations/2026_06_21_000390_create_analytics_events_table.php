<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_events', function (Blueprint $table): void {
            $table->id();
            $table->uuid('event_id')->unique();
            $table->string('session_id', 64)->index();
            $table->string('visitor_id', 64)->index();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event_name', 64)->index();
            $table->string('entity_type', 64)->nullable()->index();
            $table->string('entity_id', 64)->nullable()->index();
            $table->string('entity_slug')->nullable()->index();
            $table->text('page_url');
            $table->string('page_path', 2048)->index();
            $table->text('referrer')->nullable();
            $table->string('utm_source')->nullable()->index();
            $table->string('utm_medium')->nullable()->index();
            $table->string('utm_campaign')->nullable()->index();
            $table->string('utm_content')->nullable();
            $table->string('utm_term')->nullable();
            $table->json('metadata')->nullable();
            $table->string('fbp')->nullable()->index();
            $table->string('fbc')->nullable()->index();
            $table->string('ip_hash', 64)->nullable()->index();
            $table->text('user_agent')->nullable();
            $table->boolean('consent_analytics')->default(false)->index();
            $table->boolean('consent_marketing')->default(false)->index();
            $table->timestamps();

            $table->index(['event_name', 'created_at']);
            $table->index(['entity_type', 'entity_id', 'created_at']);
            $table->index(['utm_source', 'utm_medium', 'utm_campaign']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
    }
};

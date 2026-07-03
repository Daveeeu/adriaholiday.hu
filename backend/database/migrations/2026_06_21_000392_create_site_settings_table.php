<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table): void {
            $table->id();
            $table->string('group');
            $table->string('key');
            $table->longText('value')->nullable();
            $table->string('type', 32)->default('string');
            $table->boolean('is_public')->default(false);
            $table->timestamps();

            $table->unique(['group', 'key']);
            $table->index(['is_public', 'group']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};

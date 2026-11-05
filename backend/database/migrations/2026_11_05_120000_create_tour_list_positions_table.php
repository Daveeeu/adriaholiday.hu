<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The office's own order of the tours on one public list (a homepage tile's
 * category page or a country), independent of the global tour order.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tour_list_positions', function (Blueprint $table): void {
            $table->id();
            $table->string('list_type', 20);
            $table->string('list_key', 100);
            $table->foreignId('tour_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('position');
            $table->timestamps();

            $table->unique(['list_type', 'list_key', 'tour_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tour_list_positions');
    }
};

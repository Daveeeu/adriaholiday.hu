<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Priced supplements ("felárak") offered on a tour date, e.g. dinner,
 * single room or checked baggage. They belong to the date because prices
 * and availability differ between departures of the same tour.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tour_date_extras', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tour_date_id')->constrained('tour_dates')->cascadeOnDelete();
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->string('price_unit', 32)->default('per_person');
            $table->boolean('mandatory')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['tour_date_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tour_date_extras');
    }
};

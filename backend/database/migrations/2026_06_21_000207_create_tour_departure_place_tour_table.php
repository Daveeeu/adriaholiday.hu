<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tour_departure_place_tour', function (Blueprint $table) {
            $table->foreignId('tour_id')->constrained('tours')->cascadeOnDelete();
            $table->foreignId('tour_departure_place_id')->constrained('tour_departure_places')->cascadeOnDelete();
            $table->unique(['tour_id', 'tour_departure_place_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tour_departure_place_tour');
    }
};

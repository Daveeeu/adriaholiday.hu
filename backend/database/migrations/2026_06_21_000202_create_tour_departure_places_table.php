<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tour_departure_places', function (Blueprint $table) {
            $table->id();
            $table->boolean('active')->default(true)->index();
            $table->string('name')->index();
            $table->string('city')->nullable()->index();
            $table->decimal('fee', 10, 2)->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tour_departure_places');
    }
};

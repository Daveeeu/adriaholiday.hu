<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tour_program_days', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tour_id')->constrained('tours')->cascadeOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->unsignedInteger('day_number')->default(1);
            $table->string('title');
            $table->longText('description')->nullable();
            $table->string('image')->nullable();
            $table->string('icon', 50)->nullable();
            $table->string('experience_type')->nullable();
            $table->json('badges')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index(['tour_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tour_program_days');
    }
};

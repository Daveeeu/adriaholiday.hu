<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tour_reference_options', function (Blueprint $table): void {
            $table->id();
            $table->string('type', 100)->index();
            $table->string('code', 255);
            $table->string('name', 255);
            $table->boolean('active')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['type', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tour_reference_options');
    }
};

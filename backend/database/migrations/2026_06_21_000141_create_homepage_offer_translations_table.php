<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('homepage_offer_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('homepage_offer_id')->constrained('homepage_offers')->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('name');
            $table->string('seo_name')->index();
            $table->string('short_description')->nullable();
            $table->timestamps();

            $table->unique(['homepage_offer_id', 'locale']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('homepage_offer_translations');
    }
};

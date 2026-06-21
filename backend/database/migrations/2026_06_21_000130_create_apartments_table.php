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
        Schema::create('apartments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('region_id')->constrained()->cascadeOnDelete();
            $table->foreignId('location_id')->constrained()->cascadeOnDelete();
            $table->foreignId('gallery_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->string('name')->index();
            $table->string('slug')->unique();
            $table->string('code')->nullable()->unique();
            $table->string('seo_name')->nullable()->index();
            $table->boolean('seo_auto_generate')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->boolean('featured')->default(false)->index();
            $table->boolean('is_accommodation')->default(false)->index();
            $table->unsignedTinyInteger('stars')->default(0);
            $table->unsignedSmallInteger('bedrooms')->default(0);
            $table->unsignedSmallInteger('bathrooms')->default(0);
            $table->unsignedSmallInteger('max_guests')->default(0);
            $table->decimal('size_m2', 10, 2)->default(0);
            $table->text('address');
            $table->text('map_address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('coordinates')->nullable();
            $table->longText('short_description');
            $table->longText('description')->nullable();
            $table->longText('additional_information')->nullable();
            $table->longText('apartment_type_content')->nullable();
            $table->longText('apartment_type_description')->nullable();
            $table->longText('apartment_type_text_description')->nullable();
            $table->longText('apartment_type_text_description_2')->nullable();
            $table->longText('all_inclusive_description')->nullable();
            $table->string('price_header')->nullable();
            $table->string('price_inner_header')->nullable();
            $table->json('pricing_matrix')->nullable();
            $table->json('price_seasons')->nullable();
            $table->json('amenities')->nullable();
            $table->json('services')->nullable();
            $table->string('status')->default('draft')->index();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apartments');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tours', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->boolean('active')->default(true)->index();
            $table->boolean('featured')->default(false)->index();
            $table->boolean('recommended')->default(false)->index();
            $table->boolean('partner_offer')->default(false)->index();
            $table->boolean('image_offer')->default(false)->index();
            $table->boolean('xml_enabled')->default(false)->index();
            $table->boolean('slider_image_enabled')->default(false)->index();
            $table->boolean('slider_text_enabled')->default(false)->index();

            $table->string('name')->index();
            $table->string('seo_name')->nullable()->unique();
            $table->boolean('seo_auto_generate')->default(false)->index();

            $table->string('action1')->nullable();
            $table->string('action2')->nullable();

            $table->text('list_description')->nullable();
            $table->text('short_description')->nullable();

            $table->string('program_pdf_path')->nullable();
            $table->string('program_pdf_file')->nullable();
            $table->string('slider_image')->nullable();
            $table->longText('program_before')->nullable();
            $table->longText('program')->nullable();
            $table->longText('inclusions')->nullable();
            $table->longText('payment_program')->nullable();
            $table->longText('prices')->nullable();
            $table->longText('discounts')->nullable();
            $table->longText('notes')->nullable();

            $table->foreignId('region_id')->nullable()->constrained('regions')->nullOnDelete();
            $table->string('group_id')->nullable()->index();
            $table->string('seasonal_group_id')->nullable()->index();
            $table->string('fit_id')->nullable()->index();
            $table->string('program_type_id')->nullable()->index();
            $table->string('travel_mode_id')->nullable()->index();
            $table->string('difficulty_id')->nullable()->index();
            $table->json('country_ids')->nullable();
            $table->json('tag_ids')->nullable();
            $table->json('category_ids')->nullable();

            $table->decimal('price', 10, 2)->nullable();
            $table->string('displayed_price')->nullable();
            $table->text('slider_text')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tours');
    }
};

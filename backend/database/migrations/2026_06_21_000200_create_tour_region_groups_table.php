<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tour_region_groups', function (Blueprint $table) {
            $table->id();
            $table->boolean('active')->default(true)->index();
            $table->boolean('featured_on_homepage')->default(false)->index();
            $table->string('type')->index();
            $table->string('name')->index();
            $table->string('seo_name')->nullable()->unique();
            $table->boolean('seo_auto_generate')->default(false)->index();
            $table->foreignId('gallery_id')->nullable()->constrained('galleries')->nullOnDelete();
            $table->text('description')->nullable();
            $table->text('list_below_text')->nullable();
            $table->string('travel_conditions_link')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tour_region_groups');
    }
};

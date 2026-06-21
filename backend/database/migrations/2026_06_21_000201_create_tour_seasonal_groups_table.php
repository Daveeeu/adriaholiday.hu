<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tour_seasonal_groups', function (Blueprint $table) {
            $table->id();
            $table->boolean('active')->default(true)->index();
            $table->string('menu_type')->index();
            $table->string('name')->index();
            $table->string('seo_name')->nullable()->unique();
            $table->boolean('seo_auto_generate')->default(false)->index();
            $table->text('box_text')->nullable();
            $table->boolean('has_offers')->default(false)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tour_seasonal_groups');
    }
};

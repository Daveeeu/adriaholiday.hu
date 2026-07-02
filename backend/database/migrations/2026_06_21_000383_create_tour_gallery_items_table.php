<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->string('gallery_title')->nullable()->after('notes');
            $table->string('gallery_subtitle')->nullable()->after('gallery_title');
        });

        Schema::create('tour_gallery_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tour_id')->constrained('tours')->cascadeOnDelete();
            $table->foreignId('media_id')->constrained('media')->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->string('alt')->nullable();
            $table->string('caption')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index(['tour_id', 'active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tour_gallery_items');

        Schema::table('tours', function (Blueprint $table): void {
            $table->dropColumn(['gallery_title', 'gallery_subtitle']);
        });
    }
};

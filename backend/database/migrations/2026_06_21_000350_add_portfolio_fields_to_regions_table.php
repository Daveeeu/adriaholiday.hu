<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('regions', function (Blueprint $table): void {
            $table->boolean('portfolio_featured')->default(false)->after('sort_order');
            $table->unsignedInteger('portfolio_sort_order')->default(0)->after('portfolio_featured');
            $table->string('portfolio_image_url')->nullable()->after('portfolio_sort_order');
            $table->text('portfolio_short_description')->nullable()->after('portfolio_image_url');
        });
    }

    public function down(): void
    {
        Schema::table('regions', function (Blueprint $table): void {
            $table->dropColumn([
                'portfolio_featured',
                'portfolio_sort_order',
                'portfolio_image_url',
                'portfolio_short_description',
            ]);
        });
    }
};

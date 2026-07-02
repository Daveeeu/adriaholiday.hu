<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blog_articles', function (Blueprint $table): void {
            $table->boolean('portfolio_featured')->default(false)->after('show_on_homepage');
            $table->unsignedInteger('portfolio_sort_order')->default(0)->after('portfolio_featured');
        });
    }

    public function down(): void
    {
        Schema::table('blog_articles', function (Blueprint $table): void {
            $table->dropColumn(['portfolio_featured', 'portfolio_sort_order']);
        });
    }
};

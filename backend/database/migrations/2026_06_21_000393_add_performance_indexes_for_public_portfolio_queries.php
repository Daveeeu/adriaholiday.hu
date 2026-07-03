<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('portfolio_filter_chips', function (Blueprint $table): void {
            $table->index(
                ['active', 'scope_type', 'scope_value', 'sort_order'],
                'portfolio_filter_chips_scope_lookup_index'
            );
        });

        Schema::table('blog_article_translations', function (Blueprint $table): void {
            $table->index(
                ['locale', 'seo_name'],
                'blog_article_translations_locale_seo_name_index'
            );
        });
    }

    public function down(): void
    {
        Schema::table('portfolio_filter_chips', function (Blueprint $table): void {
            $table->dropIndex('portfolio_filter_chips_scope_lookup_index');
        });

        Schema::table('blog_article_translations', function (Blueprint $table): void {
            $table->dropIndex('blog_article_translations_locale_seo_name_index');
        });
    }
};

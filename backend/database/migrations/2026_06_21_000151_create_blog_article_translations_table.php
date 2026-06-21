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
        Schema::create('blog_article_translations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blog_article_id')->constrained('blog_articles')->cascadeOnDelete();
            $table->string('locale', 2);
            $table->string('title');
            $table->string('seo_name')->index();
            $table->boolean('seo_auto_generate')->default(true);
            $table->longText('excerpt')->nullable();
            $table->longText('content');
            $table->timestamps();

            $table->unique(['blog_article_id', 'locale']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blog_article_translations');
    }
};

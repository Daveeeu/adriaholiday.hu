<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portfolio_filter_chips', function (Blueprint $table): void {
            $table->id();
            $table->string('scope_type', 50)->default('global')->index();
            $table->string('scope_value')->nullable()->index();
            $table->string('label');
            $table->string('slug')->unique();
            $table->string('icon', 100)->nullable();
            $table->string('filter_type', 50)->index();
            $table->string('filter_value')->nullable();
            $table->json('filter_config')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('active')->default(true)->index();
            $table->boolean('hide_when_zero')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_filter_chips');
    }
};

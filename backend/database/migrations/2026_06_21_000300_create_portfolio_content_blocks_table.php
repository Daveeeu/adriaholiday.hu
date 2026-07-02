<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portfolio_content_blocks', function (Blueprint $table): void {
            $table->id();
            $table->string('key')->unique();
            $table->string('page');
            $table->string('section')->nullable();
            $table->string('label');
            $table->string('type');
            $table->string('locale')->default('hu');
            $table->longText('value')->nullable();
            $table->json('value_json')->nullable();
            $table->longText('draft_value')->nullable();
            $table->json('draft_value_json')->nullable();
            $table->boolean('is_published')->default(true);
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_content_blocks');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('tour_partner_offers');
        Schema::dropIfExists('partner_finance_records');
        Schema::dropIfExists('partner_banners');
    }

    public function down(): void
    {
        Schema::create('tour_partner_offers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->index();
            $table->string('partner_name')->nullable()->index();
            $table->string('partner_email')->nullable()->index();
            $table->date('inquiry_date')->nullable()->index();
            $table->string('status')->default('new')->index();
            $table->text('note')->nullable();
            $table->boolean('active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('partner_finance_records', function (Blueprint $table): void {
            $table->id();
            $table->string('partner_name')->index();
            $table->date('date')->nullable()->index();
            $table->decimal('amount', 10, 2);
            $table->string('type')->index();
            $table->string('status')->index();
            $table->decimal('balance', 10, 2)->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('created_at');
        });

        Schema::create('partner_banners', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->index();
            $table->string('url')->nullable();
            $table->string('image')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->text('embed_code')->nullable();
            $table->string('status')->default('draft')->index();
            $table->timestamps();
            $table->softDeletes();
            $table->index('created_at');
        });
    }
};

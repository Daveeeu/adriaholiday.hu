<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
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
    }

    public function down(): void
    {
        Schema::dropIfExists('tour_partner_offers');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_form_template_fields', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('booking_form_template_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_form_field_id')->constrained()->cascadeOnDelete();
            $table->string('visibility')->default('optional');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['booking_form_template_id', 'booking_form_field_id'], 'booking_form_template_fields_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_form_template_fields');
    }
};

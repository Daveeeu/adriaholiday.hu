<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->foreignId('booking_form_template_id')
                ->nullable()
                ->after('difficulty_id')
                ->constrained('booking_form_templates')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('booking_form_template_id');
        });
    }
};

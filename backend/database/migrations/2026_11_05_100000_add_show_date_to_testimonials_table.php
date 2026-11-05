<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Letters show their date on the public site only when the office turns it
 * on; existing letters start hidden too.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('testimonials', function (Blueprint $table): void {
            $table->boolean('show_date')->default(false)->after('published_at');
        });
    }

    public function down(): void
    {
        Schema::table('testimonials', function (Blueprint $table): void {
            $table->dropColumn('show_date');
        });
    }
};

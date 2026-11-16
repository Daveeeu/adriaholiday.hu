<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Who made an uploaded image and on what terms the site may use it, so the
 * office can show for every photo that it is cleared for use.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table): void {
            $table->string('author')->nullable()->after('title');
            $table->string('copyright')->nullable()->after('author');
            $table->string('origin')->nullable()->after('copyright');
            $table->text('license')->nullable()->after('origin');
        });
    }

    public function down(): void
    {
        Schema::table('media', function (Blueprint $table): void {
            $table->dropColumn(['author', 'copyright', 'origin', 'license']);
        });
    }
};

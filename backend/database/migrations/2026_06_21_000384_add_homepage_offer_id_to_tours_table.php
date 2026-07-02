<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->foreignId('homepage_offer_id')
                ->nullable()
                ->after('region_id')
                ->constrained('homepage_offers')
                ->nullOnDelete()
                ->index();
        });
    }

    public function down(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('homepage_offer_id');
        });
    }
};

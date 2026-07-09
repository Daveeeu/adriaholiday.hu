<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->foreignId('tour_date_id')
                ->nullable()
                ->after('tour_id')
                ->constrained('tour_dates')
                ->nullOnDelete();
            $table->text('admin_note')->nullable()->after('notes');
            $table->boolean('seats_reserved')->default(false)->after('admin_note');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('tour_date_id');
            $table->dropColumn(['admin_note', 'seats_reserved']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A departure's seats are its capacity minus the passengers of its live
 * bookings, worked out when asked instead of a free-seat counter that each
 * booking decremented (and the office's own bookings and passenger changes
 * did not). The capacity is set per date only; the tour-level seat fields go.
 *
 * Each date that tracked free seats gets the capacity that leaves exactly the
 * same seats free as before: its free seats plus the passengers already
 * booked. Dates that tracked none stay without a limit.
 */
return new class extends Migration
{
    /** Passengers a live booking holds, as Booking::SEATS_HELD counts them, summed. */
    private const SEATS_HELD = 'COALESCE(SUM(CASE WHEN passenger_count IS NULL OR passenger_count = 0 THEN 1 ELSE passenger_count END), 0)';

    public function up(): void
    {
        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->unsignedInteger('capacity')->nullable()->after('price_box_min_participants');
        });

        DB::table('tour_dates')
            ->whereNotNull('price_box_available_seats')
            ->orderBy('id')
            ->each(function (object $date): void {
                DB::table('tour_dates')->where('id', $date->id)->update([
                    'capacity' => (int) $date->price_box_available_seats + $this->seatsHeld((int) $date->id),
                ]);
            });

        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->dropColumn(['price_box_max_participants', 'price_box_available_seats', 'price_box_capacity']);
        });

        Schema::table('tours', function (Blueprint $table): void {
            $table->dropColumn(['price_box_max_participants', 'price_box_available_seats', 'price_box_capacity']);
        });

        Schema::table('bookings', function (Blueprint $table): void {
            $table->dropColumn('seats_reserved');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->boolean('seats_reserved')->default(false);
        });

        Schema::table('tours', function (Blueprint $table): void {
            $table->unsignedInteger('price_box_max_participants')->nullable()->after('price_box_min_participants');
            $table->unsignedInteger('price_box_available_seats')->nullable()->after('price_box_max_participants');
            $table->unsignedInteger('price_box_capacity')->nullable()->after('price_box_available_seats');
        });

        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->unsignedInteger('price_box_max_participants')->nullable()->after('price_box_min_participants');
            $table->unsignedInteger('price_box_available_seats')->nullable()->after('price_box_max_participants');
            $table->unsignedInteger('price_box_capacity')->nullable()->after('price_box_available_seats');
        });

        DB::table('tour_dates')
            ->whereNotNull('capacity')
            ->orderBy('id')
            ->each(function (object $date): void {
                DB::table('tour_dates')->where('id', $date->id)->update([
                    'price_box_capacity' => $date->capacity,
                    'price_box_available_seats' => max(0, (int) $date->capacity - $this->seatsHeld((int) $date->id)),
                ]);
            });

        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->dropColumn('capacity');
        });
    }

    private function seatsHeld(int $tourDateId): int
    {
        return (int) DB::table('bookings')
            ->where('tour_date_id', $tourDateId)
            ->where('booking_type', 'tour_booking')
            ->where('cancelled', false)
            ->whereNotIn('status', ['cancelled', 'expired'])
            ->whereNull('deleted_at')
            ->value(DB::raw(self::SEATS_HELD));
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Replaces the extras' "mandatory" flag with a charge rule, which can also
 * express supplements charged only to solo travellers (single room), and
 * adds choices the customer picks from when the extra is charged (e.g.
 * "alone in the room" / "find me a roommate").
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tour_date_extras', function (Blueprint $table): void {
            $table->string('charge_rule', 32)->default('optional')->after('price_unit');
            $table->json('choices')->nullable()->after('charge_rule');
        });

        DB::table('tour_date_extras')->where('mandatory', true)->update(['charge_rule' => 'mandatory']);

        Schema::table('tour_date_extras', function (Blueprint $table): void {
            $table->dropColumn('mandatory');
        });
    }

    public function down(): void
    {
        Schema::table('tour_date_extras', function (Blueprint $table): void {
            $table->boolean('mandatory')->default(false)->after('price_unit');
        });

        DB::table('tour_date_extras')->where('charge_rule', 'mandatory')->update(['mandatory' => true]);

        Schema::table('tour_date_extras', function (Blueprint $table): void {
            $table->dropColumn(['charge_rule', 'choices']);
        });
    }
};

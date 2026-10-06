<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Options of a select/radio field can be listed but not selectable yet (shown as
 * "Fejlesztés alatt"). The payment method field offers the online card payment and
 * lists the bank payment as such until it is built.
 */
return new class extends Migration
{
    private const CARD_PAYMENT = 'Online bankkártyás fizetés (Barion)';

    private const BANK_PAYMENT = 'Banki befizetés / átutalás';

    public function up(): void
    {
        Schema::table('booking_form_fields', function (Blueprint $table): void {
            $table->json('disabled_options')->nullable()->after('options');
        });

        DB::table('booking_form_fields')->where('key', 'extra_payment_method')->update([
            'options' => json_encode([self::CARD_PAYMENT, self::BANK_PAYMENT], JSON_UNESCAPED_UNICODE),
            'disabled_options' => json_encode([self::BANK_PAYMENT], JSON_UNESCAPED_UNICODE),
        ]);
    }

    public function down(): void
    {
        DB::table('booking_form_fields')->where('key', 'extra_payment_method')->update([
            'options' => json_encode(['Banki befizetés', 'Átutalás'], JSON_UNESCAPED_UNICODE),
        ]);

        Schema::table('booking_form_fields', function (Blueprint $table): void {
            $table->dropColumn('disabled_options');
        });
    }
};

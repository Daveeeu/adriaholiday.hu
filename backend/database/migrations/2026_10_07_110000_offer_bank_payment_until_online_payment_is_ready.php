<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The booking form offers the bank payment, and lists the online card payment
 * (Barion) as not available until it goes live.
 */
return new class extends Migration
{
    private const CARD_PAYMENT = 'Online bankkártyás fizetés (Barion)';

    private const BANK_PAYMENT = 'Banki befizetés / átutalás';

    public function up(): void
    {
        $this->disable(self::CARD_PAYMENT);
    }

    public function down(): void
    {
        $this->disable(self::BANK_PAYMENT);
    }

    private function disable(string $option): void
    {
        DB::table('booking_form_fields')->where('key', 'extra_payment_method')->update([
            'disabled_options' => json_encode([$option], JSON_UNESCAPED_UNICODE),
        ]);
    }
};

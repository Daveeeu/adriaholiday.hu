<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One row per online payment attempt of a booking. A booking may have
 * several attempts (a failed or abandoned one can be retried), the booking's
 * paid_amount is the sum of the succeeded ones.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->string('provider')->index();
            $table->uuid('payment_request_id')->unique();
            $table->string('provider_payment_id')->nullable()->unique();
            $table->string('status')->index();
            $table->string('provider_status')->nullable();
            $table->string('kind');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_payments');
    }
};

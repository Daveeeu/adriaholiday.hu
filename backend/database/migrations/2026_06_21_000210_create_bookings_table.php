<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table): void {
            $table->id();
            $table->string('booking_type')->index();
            $table->string('status')->index();
            $table->string('payment_status')->nullable()->index();

            $table->foreignId('region_id')->nullable()->constrained('regions')->nullOnDelete()->index();
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete()->index();
            $table->unsignedBigInteger('offer_id')->nullable()->index();
            $table->unsignedBigInteger('offer_date_id')->nullable()->index();
            $table->foreignId('apartment_id')->nullable()->constrained('apartments')->nullOnDelete()->index();
            $table->foreignId('tour_id')->nullable()->constrained('tours')->nullOnDelete()->index();

            $table->string('customer_name')->nullable()->index();
            $table->string('email')->nullable()->index();
            $table->string('phone')->nullable();
            $table->string('country')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();

            $table->unsignedInteger('adults')->default(0);
            $table->unsignedInteger('children')->default(0);
            $table->unsignedInteger('passenger_count')->nullable();

            $table->date('check_in')->nullable();
            $table->date('check_out')->nullable();
            $table->date('departure_date')->nullable();
            $table->date('arrival')->nullable();
            $table->date('departure')->nullable();
            $table->dateTime('appointment_time')->nullable();
            $table->dateTime('application_date')->nullable();
            $table->dateTime('booking_date')->nullable();

            $table->string('property_name_snapshot')->nullable();
            $table->string('offer_name_snapshot')->nullable();
            $table->string('apartment_name_snapshot')->nullable();
            $table->string('partner_name_snapshot')->nullable();
            $table->string('offer_code')->nullable();

            $table->decimal('total_amount', 10, 2)->nullable();
            $table->decimal('paid_amount', 10, 2)->nullable();
            $table->string('currency')->default('EUR');

            $table->boolean('credited')->default(false)->index();
            $table->boolean('cancelled')->default(false)->index();
            $table->text('notes')->nullable();
            $table->text('message')->nullable();
            $table->json('payload')->nullable();

            $table->timestamps();
            $table->softDeletes();
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};

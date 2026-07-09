<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->string('mailable');
            $table->string('to');
            $table->string('subject');
            $table->string('status')->default('sent')->index();
            $table->text('error')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_logs');
    }
};

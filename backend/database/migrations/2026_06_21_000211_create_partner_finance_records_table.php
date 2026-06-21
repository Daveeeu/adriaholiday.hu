<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_finance_records', function (Blueprint $table): void {
            $table->id();
            $table->string('partner_name')->index();
            $table->date('date')->nullable()->index();
            $table->decimal('amount', 10, 2);
            $table->string('type')->index();
            $table->string('status')->index();
            $table->decimal('balance', 10, 2)->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partner_finance_records');
    }
};

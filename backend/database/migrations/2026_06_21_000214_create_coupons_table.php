<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table): void {
            $table->id();
            $table->boolean('active')->default(true)->index();
            $table->string('name')->nullable()->index();
            $table->string('email')->nullable()->index();
            $table->string('code')->unique();
            $table->decimal('value', 10, 2)->nullable();
            $table->date('expires_at')->nullable()->index();
            $table->boolean('used')->default(false)->index();
            $table->timestamps();
            $table->softDeletes();
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};

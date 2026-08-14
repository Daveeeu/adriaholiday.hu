<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coupons', function (Blueprint $table): void {
            $table->date('starts_at')->nullable()->after('active')->index();
            $table->text('usage_conditions')->nullable()->after('value');
            $table->unsignedInteger('max_uses')->nullable()->after('used');
            $table->unsignedInteger('used_count')->default(0)->after('max_uses');
        });
    }

    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table): void {
            $table->dropColumn(['starts_at', 'usage_conditions', 'max_uses', 'used_count']);
        });
    }
};

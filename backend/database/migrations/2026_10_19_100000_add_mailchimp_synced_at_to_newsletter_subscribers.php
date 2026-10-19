<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('newsletter_subscribers', function (Blueprint $table): void {
            $table->timestamp('mailchimp_synced_at')->nullable()->index()->after('coupon_id');
        });
    }

    public function down(): void
    {
        Schema::table('newsletter_subscribers', function (Blueprint $table): void {
            $table->dropIndex(['mailchimp_synced_at']);
            $table->dropColumn('mailchimp_synced_at');
        });
    }
};

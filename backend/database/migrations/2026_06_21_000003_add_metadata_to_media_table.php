<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('media', function (Blueprint $table): void {
            $table->string('category')->nullable()->index()->after('file_name');
            $table->string('source_context')->nullable()->index()->after('category');
            $table->unsignedBigInteger('source_id')->nullable()->index()->after('source_context');
            $table->string('alt')->nullable()->after('source_id');
            $table->string('title')->nullable()->after('alt');
        });

        DB::table('media')
            ->whereNull('category')
            ->update(['category' => 'general']);
    }

    public function down(): void
    {
        Schema::table('media', function (Blueprint $table): void {
            $table->dropIndex(['category']);
            $table->dropIndex(['source_context']);
            $table->dropIndex(['source_id']);
            $table->dropColumn(['category', 'source_context', 'source_id', 'alt', 'title']);
        });
    }
};

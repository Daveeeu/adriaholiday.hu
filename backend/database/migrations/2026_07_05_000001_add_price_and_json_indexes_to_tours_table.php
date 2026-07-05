<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->index('price', 'tours_price_index');
        });

        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE tours ADD INDEX tours_category_ids_index ((CAST(category_ids AS UNSIGNED ARRAY)))');
            DB::statement('ALTER TABLE tours ADD INDEX tours_tag_ids_index ((CAST(tag_ids AS UNSIGNED ARRAY)))');
            DB::statement('ALTER TABLE tours ADD INDEX tours_country_ids_index ((CAST(country_ids AS UNSIGNED ARRAY)))');
        }
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE tours DROP INDEX tours_category_ids_index');
            DB::statement('ALTER TABLE tours DROP INDEX tours_tag_ids_index');
            DB::statement('ALTER TABLE tours DROP INDEX tours_country_ids_index');
        }

        Schema::table('tours', function (Blueprint $table): void {
            $table->dropIndex('tours_price_index');
        });
    }
};

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

        if ($this->supportsMysqlArrayIndexes()) {
            DB::statement('ALTER TABLE tours ADD INDEX tours_category_ids_index ((CAST(category_ids AS UNSIGNED ARRAY)))');
            DB::statement('ALTER TABLE tours ADD INDEX tours_tag_ids_index ((CAST(tag_ids AS UNSIGNED ARRAY)))');
            DB::statement('ALTER TABLE tours ADD INDEX tours_country_ids_index ((CAST(country_ids AS UNSIGNED ARRAY)))');
        }
    }

    public function down(): void
    {
        if ($this->supportsMysqlArrayIndexes()) {
            DB::statement('ALTER TABLE tours DROP INDEX tours_category_ids_index');
            DB::statement('ALTER TABLE tours DROP INDEX tours_tag_ids_index');
            DB::statement('ALTER TABLE tours DROP INDEX tours_country_ids_index');
        }

        Schema::table('tours', function (Blueprint $table): void {
            $table->dropIndex('tours_price_index');
        });
    }

    /**
     * `CAST(... AS UNSIGNED ARRAY)` multi-valued indexes are MySQL
     * 8.0.17+-only syntax. Laravel's `getDriverName()` returns "mysql" for
     * both real MySQL *and* MariaDB (they share the same PDO driver), so
     * that check alone does not tell them apart — and MariaDB does not
     * support this syntax at all, which would fail the migration with a
     * SQL syntax error and crash the app container's `migrate --force`
     * startup step on a MariaDB-backed deployment. Inspect the actual
     * server version string (MariaDB's contains "MariaDB") to only apply
     * this on genuine MySQL 8+.
     */
    private function supportsMysqlArrayIndexes(): bool
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            return false;
        }

        $version = (string) (DB::selectOne('select version() as version')->version ?? '');

        if (str_contains(strtolower($version), 'mariadb')) {
            return false;
        }

        return version_compare(preg_replace('/^(\d+\.\d+\.\d+).*/', '$1', $version), '8.0.17', '>=');
    }
};

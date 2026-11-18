<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * The legacy site's tour region groups, seasonal offer groups and partner
 * offer worklist, removed from the admin on 2026-11-18. Nothing linked to
 * them any more: the tours lost their group references on 2026-11-17 and the
 * public site never read them. Their permissions, activity log entries
 * (whose subject class no longer exists) and legacy import records go too.
 */
return new class extends Migration
{
    /** Table => [activity log subject class, permission prefix, legacy import entity]. */
    private const MODULES = [
        'tour_region_groups' => ['App\\Models\\TourRegionGroup', 'tour-region-groups', 'tour_region_group'],
        'tour_seasonal_groups' => ['App\\Models\\TourSeasonalGroup', 'tour-seasonal-groups', 'tour_seasonal_group'],
        'tour_partner_offers' => ['App\\Models\\TourPartnerOffer', 'tour-partner-offers', null],
    ];

    private const ABILITIES = ['viewAny', 'view', 'create', 'update', 'delete', 'status'];

    public function up(): void
    {
        foreach (self::MODULES as $table => [$subjectClass, $permissionPrefix, $legacyEntity]) {
            DB::table('activity_log')->where('subject_type', $subjectClass)->delete();

            if ($legacyEntity !== null) {
                DB::table('legacy_import_records')->where('entity', $legacyEntity)->delete();
            }

            Permission::query()->whereIn('name', $this->permissions($permissionPrefix))->delete();

            Schema::dropIfExists($table);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /** The empty tables and their permissions; the deleted rows are in the backup taken before deploying. */
    public function down(): void
    {
        Schema::create('tour_region_groups', function (Blueprint $table): void {
            $table->id();
            $table->boolean('active')->default(true)->index();
            $table->boolean('featured_on_homepage')->default(false)->index();
            $table->string('type')->index();
            $table->string('name')->index();
            $table->string('seo_name')->nullable()->unique();
            $table->boolean('seo_auto_generate')->default(false)->index();
            $table->foreignId('gallery_id')->nullable()->constrained('galleries')->nullOnDelete();
            $table->text('description')->nullable();
            $table->text('list_below_text')->nullable();
            $table->string('travel_conditions_link')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('tour_seasonal_groups', function (Blueprint $table): void {
            $table->id();
            $table->boolean('active')->default(true)->index();
            $table->string('menu_type')->index();
            $table->string('name')->index();
            $table->string('seo_name')->nullable()->unique();
            $table->boolean('seo_auto_generate')->default(false)->index();
            $table->text('box_text')->nullable();
            $table->boolean('has_offers')->default(false)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('tour_partner_offers', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->index();
            $table->string('partner_name')->nullable()->index();
            $table->string('partner_email')->nullable()->index();
            $table->date('inquiry_date')->nullable()->index();
            $table->string('status')->default('new')->index();
            $table->text('note')->nullable();
            $table->boolean('active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        $permissions = collect(self::MODULES)
            ->flatMap(fn (array $module): array => $this->permissions($module[1]))
            ->each(fn (string $permission) => Permission::findOrCreate($permission, 'web'))
            ->all();

        Role::query()->whereIn('name', ['Super Admin', 'Admin'])->get()
            ->each(fn (Role $role) => $role->givePermissionTo($permissions));

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    /** @return array<int, string> */
    private function permissions(string $prefix): array
    {
        return array_map(fn (string $ability): string => "{$prefix}.{$ability}", self::ABILITIES);
    }
};

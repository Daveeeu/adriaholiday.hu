<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * The reference data a production install needs before its content is
 * imported: roles and the first admin, booking forms, site settings and page
 * content, regions and their locations, apartment types, tour groups and the
 * taxonomy tours are filed under. Every seeder it runs updates in place, so it
 * can run on every deploy. Demo content (DatabaseSeeder) never runs here.
 */
class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            BookingFormFieldSeeder::class,
            BookingFormTemplateSeeder::class,
            SiteSettingsSeeder::class,
            PortfolioContentBlockSeeder::class,
            RegionSeeder::class,
            LocationSeeder::class,
            ApartmentTypeSeeder::class,
            TourRegionGroupSeeder::class,
            TourSeasonalGroupSeeder::class,
            TourReferenceOptionSeeder::class,
            BlogCategorySeeder::class,
            BlogTagSeeder::class,
            PortfolioFilterChipSeeder::class,
        ]);
    }
}

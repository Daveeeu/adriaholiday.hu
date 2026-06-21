<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            RegionSeeder::class,
            LocationSeeder::class,
            GallerySeeder::class,
            ApartmentSeeder::class,
            TourRegionGroupSeeder::class,
            TourSeasonalGroupSeeder::class,
            TourDeparturePlaceSeeder::class,
            TourPartnerOfferSeeder::class,
            TourSeeder::class,
            HomepageOfferSeeder::class,
            BlogCategorySeeder::class,
            BlogTagSeeder::class,
            BlogArticleSeeder::class,
            BusSeeder::class,
            BookingSeeder::class,
            PartnerFinanceRecordSeeder::class,
            PartnerBannerSeeder::class,
            ContactMessageSeeder::class,
            CouponSeeder::class,
        ]);
    }
}

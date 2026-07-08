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
            BookingFormFieldSeeder::class,
            BookingFormTemplateSeeder::class,
            SiteSettingsSeeder::class,
            PortfolioContentBlockSeeder::class,
            RegionSeeder::class,
            LocationSeeder::class,
            GallerySeeder::class,
            ApartmentSeeder::class,
            TourRegionGroupSeeder::class,
            TourSeasonalGroupSeeder::class,
            TourDeparturePlaceSeeder::class,
            TourReferenceOptionSeeder::class,
            TourPartnerOfferSeeder::class,
            TourSeeder::class,
            HomepageOfferSeeder::class,
            BlogCategorySeeder::class,
            BlogTagSeeder::class,
            AlbaniaMacedoniaTourSeeder::class,
            MontenegroAlbaniaTourSeeder::class,
            BruggeLondonParizsTourSeeder::class,
            MontenegroMediterraneanTourSeeder::class,
            PortfolioFilterChipSeeder::class,
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

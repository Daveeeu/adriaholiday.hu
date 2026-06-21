<?php

namespace App\Providers;

use App\Models\Apartment;
use App\Models\Booking;
use App\Models\BlogArticle;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Bus;
use App\Models\ContactMessage;
use App\Models\Gallery;
use App\Models\Coupon;
use App\Models\HomepageOffer;
use App\Models\Location;
use App\Models\PartnerBanner;
use App\Models\PartnerFinanceRecord;
use App\Models\Region;
use App\Models\Tour;
use App\Models\TourDeparturePlace;
use App\Models\TourPartnerOffer;
use App\Models\TourRegionGroup;
use App\Models\TourSeasonalGroup;
use App\Policies\ApartmentPolicy;
use App\Policies\BookingPolicy;
use App\Policies\BlogArticlePolicy;
use App\Policies\BlogCategoryPolicy;
use App\Policies\BlogTagPolicy;
use App\Policies\BusPolicy;
use App\Policies\ContactMessagePolicy;
use App\Policies\GalleryPolicy;
use App\Policies\CouponPolicy;
use App\Policies\HomepageOfferPolicy;
use App\Policies\LocationPolicy;
use App\Policies\PartnerBannerPolicy;
use App\Policies\PartnerFinanceRecordPolicy;
use App\Policies\RegionPolicy;
use App\Policies\TourDeparturePlacePolicy;
use App\Policies\TourPartnerOfferPolicy;
use App\Policies\TourPolicy;
use App\Policies\TourRegionGroupPolicy;
use App\Policies\TourSeasonalGroupPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Region::class, RegionPolicy::class);
        Gate::policy(Location::class, LocationPolicy::class);
        Gate::policy(Gallery::class, GalleryPolicy::class);
        Gate::policy(Apartment::class, ApartmentPolicy::class);
        Gate::policy(Booking::class, BookingPolicy::class);
        Gate::policy(HomepageOffer::class, HomepageOfferPolicy::class);
        Gate::policy(BlogArticle::class, BlogArticlePolicy::class);
        Gate::policy(BlogCategory::class, BlogCategoryPolicy::class);
        Gate::policy(BlogTag::class, BlogTagPolicy::class);
        Gate::policy(Bus::class, BusPolicy::class);
        Gate::policy(PartnerFinanceRecord::class, PartnerFinanceRecordPolicy::class);
        Gate::policy(PartnerBanner::class, PartnerBannerPolicy::class);
        Gate::policy(ContactMessage::class, ContactMessagePolicy::class);
        Gate::policy(Coupon::class, CouponPolicy::class);
        Gate::policy(Tour::class, TourPolicy::class);
        Gate::policy(TourRegionGroup::class, TourRegionGroupPolicy::class);
        Gate::policy(TourSeasonalGroup::class, TourSeasonalGroupPolicy::class);
        Gate::policy(TourDeparturePlace::class, TourDeparturePlacePolicy::class);
        Gate::policy(TourPartnerOffer::class, TourPartnerOfferPolicy::class);
    }
}

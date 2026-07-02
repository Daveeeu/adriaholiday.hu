<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\ApartmentController;
use App\Http\Controllers\Admin\BookingController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\BlogArticleController;
use App\Http\Controllers\Admin\BlogCategoryController;
use App\Http\Controllers\Admin\BlogTagController;
use App\Http\Controllers\Admin\ContactMessageController;
use App\Http\Controllers\Admin\BusController;
use App\Http\Controllers\Admin\CouponController;
use App\Http\Controllers\Admin\GalleryController;
use App\Http\Controllers\Admin\EmailCsvExportController;
use App\Http\Controllers\Admin\HomepageOfferController;
use App\Http\Controllers\Admin\LocationController;
use App\Http\Controllers\Admin\PartnerBannerController;
use App\Http\Controllers\Admin\PartnerFinanceRecordController;
use App\Http\Controllers\Admin\SelectOptionController;
use App\Http\Controllers\Admin\RegionController;
use App\Http\Controllers\Admin\TourController;
use App\Http\Controllers\Admin\TourDeparturePlaceController;
use App\Http\Controllers\Admin\TourReferenceOptionController;
use App\Http\Controllers\Admin\TourPartnerOfferController;
use App\Http\Controllers\Admin\TourRegionGroupController;
use App\Http\Controllers\Admin\TourSeasonalGroupController;
use App\Http\Controllers\AnalyticsEventController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\PortfolioFilterChipController as AdminPortfolioFilterChipController;
use App\Http\Controllers\Admin\PortfolioContentController as AdminPortfolioContentController;
use App\Http\Controllers\PortfolioBlogController;
use App\Http\Controllers\PortfolioFilterChipController;
use App\Http\Controllers\PortfolioOfferController;
use App\Http\Controllers\PortfolioContentController;
use App\Http\Controllers\PortfolioFeaturedTourController;
use App\Http\Controllers\PortfolioHomepageOfferController;
use App\Http\Controllers\PortfolioRegionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('portfolio/content', [PortfolioContentController::class, 'index']);
Route::get('portfolio/regions', [PortfolioRegionController::class, 'index']);
Route::get('portfolio/blog', [PortfolioBlogController::class, 'index']);
Route::get('portfolio/blog/{slug}', [PortfolioBlogController::class, 'show']);
Route::get('portfolio/homepage-offers', [PortfolioHomepageOfferController::class, 'index']);
Route::get('portfolio/featured-tours', [PortfolioFeaturedTourController::class, 'index']);
Route::get('portfolio/offers', [PortfolioOfferController::class, 'index']);
Route::get('portfolio/categories/{slug}/filters', [PortfolioFilterChipController::class, 'categoryFilters']);
Route::get('portfolio/categories/{slug}/offers', [PortfolioOfferController::class, 'categoryOffers']);
Route::get('portfolio/regions/{slug}/offers', [PortfolioOfferController::class, 'regionOffers']);
Route::get('portfolio/offers/{slug}', [PortfolioOfferController::class, 'show']);
Route::post('analytics/events', AnalyticsEventController::class);

Route::prefix('auth')->group(function (): void {
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

Route::prefix('admin')
    ->middleware(['auth:sanctum'])
    ->group(function (): void {
        Route::get('portfolio/content', [AdminPortfolioContentController::class, 'index']);
        Route::patch('portfolio/content/{key}', [AdminPortfolioContentController::class, 'update']);
        Route::post('portfolio/content/{key}/media', [AdminPortfolioContentController::class, 'uploadMedia']);
        Route::delete('portfolio/content/{key}/media', [AdminPortfolioContentController::class, 'deleteMedia']);
        Route::post('portfolio/content/{key}/publish', [AdminPortfolioContentController::class, 'publish']);
        Route::post('portfolio/content/publish-all', [AdminPortfolioContentController::class, 'publishAll']);

        Route::apiResource('regions', RegionController::class);
        Route::get('media', [MediaController::class, 'index']);
        Route::post('media', [MediaController::class, 'store']);
        Route::post('media/upload', [MediaController::class, 'store']);
        Route::get('media/{media}', [MediaController::class, 'show']);
        Route::patch('media/{media}', [MediaController::class, 'update']);
        Route::delete('media/{media}', [MediaController::class, 'destroy']);
        Route::apiResource('locations', LocationController::class);
        Route::apiResource('galleries', GalleryController::class);
        Route::apiResource('apartments', ApartmentController::class);
        Route::patch('apartments/{apartment}/status', [ApartmentController::class, 'status']);
        Route::apiResource('homepage-offers', HomepageOfferController::class);
        Route::apiResource('portfolio-filter-chips', AdminPortfolioFilterChipController::class);
        Route::get('dashboard/summary', [DashboardController::class, 'summary']);
        Route::get('analytics/summary', [AnalyticsController::class, 'summary']);
        Route::get('analytics/top-offers', [AnalyticsController::class, 'topOffers']);
        Route::get('analytics/top-categories', [AnalyticsController::class, 'topCategories']);
        Route::get('analytics/events', [AnalyticsController::class, 'events']);
        Route::get('analytics/utm', [AnalyticsController::class, 'utm']);
        Route::get('analytics/funnel', [AnalyticsController::class, 'funnel']);
        Route::get('offers', function (Request $request) {
            $perPage = (int) $request->query('perPage', $request->query('per_page', 25));
            $page = (int) $request->query('page', 1);

            return response()->json([
                'items' => [],
                'totalCount' => 0,
                'page' => $page > 0 ? $page : 1,
                'perPage' => $perPage > 0 ? $perPage : 25,
            ]);
        });
        Route::apiResource('blog/articles', BlogArticleController::class)->parameters([
            'articles' => 'blogArticle',
        ]);
        Route::apiResource('blog/categories', BlogCategoryController::class)->parameters([
            'categories' => 'blogCategory',
        ]);
        Route::apiResource('blog/tags', BlogTagController::class)->parameters([
            'tags' => 'blogTag',
        ]);
        Route::apiResource('buses', BusController::class);

        Route::prefix('select-options')->group(function (): void {
            Route::get('regions', [SelectOptionController::class, 'regions']);
            Route::get('groups', [SelectOptionController::class, 'groups']);
            Route::get('offer-groups', [SelectOptionController::class, 'offerGroups']);
            Route::get('homepage-offers', [SelectOptionController::class, 'homepageOffers']);
            Route::get('locations', [SelectOptionController::class, 'locations']);
            Route::get('galleries', [SelectOptionController::class, 'galleries']);
            Route::get('departure-places', [SelectOptionController::class, 'departurePlaces']);
            Route::get('countries', [SelectOptionController::class, 'countries']);
            Route::get('fits', [SelectOptionController::class, 'fits']);
            Route::get('program-types', [SelectOptionController::class, 'programTypes']);
            Route::get('travel-modes', [SelectOptionController::class, 'travelModes']);
            Route::get('difficulties', [SelectOptionController::class, 'difficulties']);
            Route::get('blog-categories', [SelectOptionController::class, 'blogCategories']);
            Route::get('blog-tags', [SelectOptionController::class, 'blogTags']);
        });

        Route::post('countries', [TourReferenceOptionController::class, 'storeCountry']);
        Route::post('fits', [TourReferenceOptionController::class, 'storeFit']);
        Route::post('program-types', [TourReferenceOptionController::class, 'storeProgramType']);
        Route::post('travel-modes', [TourReferenceOptionController::class, 'storeTravelMode']);
        Route::post('difficulties', [TourReferenceOptionController::class, 'storeDifficulty']);

        Route::apiResource('tours', TourController::class);
        Route::patch('tours/{tour}/status', [TourController::class, 'status']);
        Route::post('tours/{tour}/duplicate', [TourController::class, 'duplicate']);
        Route::patch('tours/reorder', [TourController::class, 'reorder']);
        Route::post('tours/{tour}/move', [TourController::class, 'move']);

        Route::apiResource('tour-region-groups', TourRegionGroupController::class)->parameters([
            'tour-region-groups' => 'tourRegionGroup',
        ]);
        Route::patch('tour-region-groups/{tourRegionGroup}/status', [TourRegionGroupController::class, 'status']);

        Route::apiResource('tour-seasonal-groups', TourSeasonalGroupController::class)->parameters([
            'tour-seasonal-groups' => 'tourSeasonalGroup',
        ]);
        Route::patch('tour-seasonal-groups/{tourSeasonalGroup}/status', [TourSeasonalGroupController::class, 'status']);

        Route::apiResource('tour-departure-places', TourDeparturePlaceController::class)->parameters([
            'tour-departure-places' => 'tourDeparturePlace',
        ]);
        Route::patch('tour-departure-places/{tourDeparturePlace}/status', [TourDeparturePlaceController::class, 'status']);

        Route::apiResource('tour-partner-offers', TourPartnerOfferController::class)->parameters([
            'tour-partner-offers' => 'tourPartnerOffer',
        ]);
        Route::patch('tour-partner-offers/{tourPartnerOffer}/status', [TourPartnerOfferController::class, 'status']);

        Route::apiResource('bookings', BookingController::class)->whereNumber('booking');
        Route::patch('bookings/{booking}/status', [BookingController::class, 'status'])->whereNumber('booking');
        Route::get('bookings/tour-bookings', [BookingController::class, 'index'])->defaults('booking_type', 'tour_booking');
        Route::get('bookings/tour-bookings/{booking}', [BookingController::class, 'show'])->defaults('booking_type', 'tour_booking')->whereNumber('booking');
        Route::post('bookings/tour-bookings', [BookingController::class, 'store'])->defaults('booking_type', 'tour_booking');
        Route::patch('bookings/tour-bookings/{booking}', [BookingController::class, 'update'])->defaults('booking_type', 'tour_booking')->whereNumber('booking');
        Route::delete('bookings/tour-bookings/{booking}', [BookingController::class, 'destroy'])->defaults('booking_type', 'tour_booking')->whereNumber('booking');

        Route::get('bookings/tour-inquiries', [BookingController::class, 'index'])->defaults('booking_type', 'tour_inquiry');
        Route::get('bookings/tour-inquiries/{booking}', [BookingController::class, 'show'])->defaults('booking_type', 'tour_inquiry')->whereNumber('booking');
        Route::post('bookings/tour-inquiries', [BookingController::class, 'store'])->defaults('booking_type', 'tour_inquiry');
        Route::patch('bookings/tour-inquiries/{booking}', [BookingController::class, 'update'])->defaults('booking_type', 'tour_inquiry')->whereNumber('booking');
        Route::delete('bookings/tour-inquiries/{booking}', [BookingController::class, 'destroy'])->defaults('booking_type', 'tour_inquiry')->whereNumber('booking');

        Route::get('bookings/apartment-bookings', [BookingController::class, 'index'])->defaults('booking_type', 'apartment_booking');
        Route::get('bookings/apartment-bookings/{booking}', [BookingController::class, 'show'])->defaults('booking_type', 'apartment_booking')->whereNumber('booking');
        Route::post('bookings/apartment-bookings', [BookingController::class, 'store'])->defaults('booking_type', 'apartment_booking');
        Route::patch('bookings/apartment-bookings/{booking}', [BookingController::class, 'update'])->defaults('booking_type', 'apartment_booking')->whereNumber('booking');
        Route::delete('bookings/apartment-bookings/{booking}', [BookingController::class, 'destroy'])->defaults('booking_type', 'apartment_booking')->whereNumber('booking');

        Route::apiResource('bookings/partner-finances', PartnerFinanceRecordController::class)->parameters([
            'partner-finances' => 'partnerFinanceRecord',
        ])->whereNumber('partnerFinanceRecord');
        Route::apiResource('bookings/banners', PartnerBannerController::class)->parameters([
            'banners' => 'partnerBanner',
        ])->whereNumber('partnerBanner');
        Route::apiResource('bookings/messages', ContactMessageController::class)->parameters([
            'messages' => 'contactMessage',
        ])->whereNumber('contactMessage');
        Route::patch('bookings/messages/{contactMessage}/status', [ContactMessageController::class, 'status'])->whereNumber('contactMessage');
        Route::apiResource('bookings/coupons', CouponController::class)->whereNumber('coupon');
        Route::patch('bookings/coupons/{coupon}/status', [CouponController::class, 'status'])->whereNumber('coupon');
        Route::get('bookings/email-csv-export', [EmailCsvExportController::class, 'index']);
    });

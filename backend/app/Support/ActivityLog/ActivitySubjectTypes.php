<?php

namespace App\Support\ActivityLog;

use App\Models\AdminMediaItem;
use App\Models\Apartment;
use App\Models\ApartmentType;
use App\Models\BlogArticle;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Booking;
use App\Models\BookingFormField;
use App\Models\BookingFormTemplate;
use App\Models\Bus;
use App\Models\ContactMessage;
use App\Models\Coupon;
use App\Models\Customer;
use App\Models\Gallery;
use App\Models\HomepageOffer;
use App\Models\Location;
use App\Models\Page;
use App\Models\PartnerBanner;
use App\Models\PartnerFinanceRecord;
use App\Models\PortfolioContentBlock;
use App\Models\PortfolioFilterChip;
use App\Models\Promotion;
use App\Models\Region;
use App\Models\SeoRedirect;
use App\Models\SiteSetting;
use App\Models\Testimonial;
use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDeparturePlace;
use App\Models\TourPartnerBonus;
use App\Models\TourPartnerOffer;
use App\Models\TourReferenceOption;
use App\Models\TourRegionGroup;
use App\Models\TourSeasonalGroup;
use App\Models\User;
use Spatie\Permission\Models\Role;

/**
 * The record types the admin activity log can be filtered by: a stable key
 * for the API, the model class stored in activity_log.subject_type and the
 * Hungarian label shown in the admin.
 */
final class ActivitySubjectTypes
{
    /**
     * @var array<string, array{class: class-string, label: string}>
     */
    private const TYPES = [
        'tour' => ['class' => Tour::class, 'label' => 'Körutazás'],
        'tour_date' => ['class' => TourDate::class, 'label' => 'Körutazás időpont'],
        'tour_region_group' => ['class' => TourRegionGroup::class, 'label' => 'Régiócsoport'],
        'tour_seasonal_group' => ['class' => TourSeasonalGroup::class, 'label' => 'Szezonális csoport'],
        'tour_departure_place' => ['class' => TourDeparturePlace::class, 'label' => 'Felszállási hely'],
        'tour_partner_offer' => ['class' => TourPartnerOffer::class, 'label' => 'Partner ajánlat'],
        'tour_partner_bonus' => ['class' => TourPartnerBonus::class, 'label' => 'Partner bónusz'],
        'tour_reference_option' => ['class' => TourReferenceOption::class, 'label' => 'Körutazás törzsadat'],
        'booking' => ['class' => Booking::class, 'label' => 'Foglalás'],
        'booking_form_template' => ['class' => BookingFormTemplate::class, 'label' => 'Foglalási űrlap sablon'],
        'booking_form_field' => ['class' => BookingFormField::class, 'label' => 'Foglalási űrlap mező'],
        'contact_message' => ['class' => ContactMessage::class, 'label' => 'Üzenet'],
        'customer' => ['class' => Customer::class, 'label' => 'Ügyfél'],
        'coupon' => ['class' => Coupon::class, 'label' => 'Kupon'],
        'promotion' => ['class' => Promotion::class, 'label' => 'Akció'],
        'partner_finance_record' => ['class' => PartnerFinanceRecord::class, 'label' => 'Partner elszámolás'],
        'partner_banner' => ['class' => PartnerBanner::class, 'label' => 'Partner banner'],
        'apartment' => ['class' => Apartment::class, 'label' => 'Apartman'],
        'apartment_type' => ['class' => ApartmentType::class, 'label' => 'Apartman típus'],
        'region' => ['class' => Region::class, 'label' => 'Régió'],
        'location' => ['class' => Location::class, 'label' => 'Helyszín'],
        'gallery' => ['class' => Gallery::class, 'label' => 'Galéria'],
        'media' => ['class' => AdminMediaItem::class, 'label' => 'Média'],
        'bus' => ['class' => Bus::class, 'label' => 'Busz'],
        'page' => ['class' => Page::class, 'label' => 'Oldal'],
        'seo_redirect' => ['class' => SeoRedirect::class, 'label' => 'Átirányítás'],
        'homepage_offer' => ['class' => HomepageOffer::class, 'label' => 'Főoldali ajánlat'],
        'portfolio_content_block' => ['class' => PortfolioContentBlock::class, 'label' => 'Weboldal tartalom'],
        'portfolio_filter_chip' => ['class' => PortfolioFilterChip::class, 'label' => 'Szűrő gomb'],
        'testimonial' => ['class' => Testimonial::class, 'label' => 'Rólunk írták'],
        'blog_article' => ['class' => BlogArticle::class, 'label' => 'Blog cikk'],
        'blog_category' => ['class' => BlogCategory::class, 'label' => 'Blog kategória'],
        'blog_tag' => ['class' => BlogTag::class, 'label' => 'Blog címke'],
        'site_setting' => ['class' => SiteSetting::class, 'label' => 'Beállítás'],
        'user' => ['class' => User::class, 'label' => 'Felhasználó'],
        'role' => ['class' => Role::class, 'label' => 'Szerepkör'],
    ];

    /**
     * @return array<int, array{key: string, label: string}>
     */
    public static function options(): array
    {
        return collect(self::TYPES)
            ->map(fn (array $type, string $key): array => ['key' => $key, 'label' => $type['label']])
            ->sortBy('label')
            ->values()
            ->all();
    }

    /**
     * @return array<int, string>
     */
    public static function keys(): array
    {
        return array_keys(self::TYPES);
    }

    public static function classFor(string $key): ?string
    {
        return self::TYPES[$key]['class'] ?? null;
    }

    public static function keyFor(?string $class): ?string
    {
        return collect(self::TYPES)->search(fn (array $type): bool => $type['class'] === $class) ?: null;
    }

    public static function labelFor(?string $class): ?string
    {
        if ($class === null) {
            return null;
        }

        $key = self::keyFor($class);

        return $key !== null ? self::TYPES[$key]['label'] : class_basename($class);
    }
}

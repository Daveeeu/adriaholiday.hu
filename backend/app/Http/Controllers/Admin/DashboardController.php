<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Apartment;
use App\Models\BlogArticle;
use App\Models\Booking;
use App\Models\Bus;
use App\Models\ContactMessage;
use App\Models\Coupon;
use App\Models\HomepageOffer;
use App\Models\Tour;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Spatie\Activitylog\Models\Activity;

class DashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:dashboard.view');
    }

    public function summary(): JsonResponse
    {
        $counts = [
            'apartments' => Apartment::query()->count(),
            'tours' => Tour::query()->count(),
            'bookings' => Booking::query()->count(),
            'messages' => ContactMessage::query()->count(),
            'coupons' => Coupon::query()->count(),
            'homepageOffers' => HomepageOffer::query()->count(),
            'blogArticles' => BlogArticle::query()->count(),
            'buses' => Bus::query()->count(),
            'activeBookings' => Booking::query()
                ->whereIn('booking_type', ['tour_booking', 'apartment_booking'])
                ->where('cancelled', false)
                ->count(),
            'newInquiries' => Booking::query()
                ->where('booking_type', 'tour_inquiry')
                ->where('status', 'new')
                ->count(),
            'monthlyRevenue' => (float) Booking::query()
                ->whereIn('booking_type', ['tour_booking', 'apartment_booking'])
                ->where('cancelled', false)
                ->whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->sum('total_amount'),
        ];

        return response()->json([
            'counts' => $counts,
            'monthlyRevenue' => $this->buildMonthlyRevenueSeries(),
            'recentActivity' => $this->buildRecentActivity(),
        ]);
    }

    /**
     * @return array<int, array{month: string, revenue: float}>
     */
    private function buildMonthlyRevenueSeries(): array
    {
        $period = CarbonPeriod::create(now()->subMonths(11)->startOfMonth(), '1 month', now()->startOfMonth());
        $revenueByMonth = [];

        foreach ($period as $month) {
            $revenueByMonth[$month->format('Y-m')] = 0.0;
        }

        Booking::query()
            ->whereIn('booking_type', ['tour_booking', 'apartment_booking'])
            ->where('cancelled', false)
            ->get(['created_at', 'total_amount'])
            ->groupBy(fn (Booking $booking): string => Carbon::parse($booking->created_at ?? now())->format('Y-m'))
            ->each(function (Collection $bookings, string $monthKey) use (&$revenueByMonth): void {
                $revenueByMonth[$monthKey] = (float) $bookings->sum(
                    fn (Booking $booking) => (float) $booking->total_amount,
                );
            });

        return collect($revenueByMonth)
            ->map(function (float $revenue, string $monthKey): array {
                return [
                    'month' => Carbon::createFromFormat('Y-m', $monthKey)->format('M'),
                    'revenue' => $revenue,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{
     *   id: string,
     *   title: string,
     *   description: string,
     *   timestamp: string,
     *   targetUrl: string,
     *   kind: string
     * }>
     */
    private function buildRecentActivity(): array
    {
        return Activity::query()
            ->whereIn('subject_type', [
                Booking::class,
                ContactMessage::class,
                Coupon::class,
                Tour::class,
                Apartment::class,
                BlogArticle::class,
                HomepageOffer::class,
                Bus::class,
            ])
            ->with('subject')
            ->latest()
            ->limit(8)
            ->get()
            ->map(function (Activity $activity): array {
                $subject = $activity->subject;
                $subjectType = class_basename((string) $activity->subject_type);

                return [
                    'id' => (string) $activity->id,
                    'title' => $this->resolveActivityTitle($activity, $subjectType),
                    'description' => $this->resolveActivityDescription($activity, $subject),
                    'timestamp' => $activity->created_at?->toISOString() ?? now()->toISOString(),
                    'targetUrl' => $this->resolveTargetUrl($activity, $subjectType),
                    'kind' => $this->resolveActivityKind($activity, $subjectType),
                ];
            })
            ->all();
    }

    private function resolveActivityTitle(Activity $activity, string $subjectType): string
    {
        return match ($subjectType) {
            'Booking' => $this->resolveBookingActivityTitle($activity),
            'ContactMessage' => match ($activity->event) {
                'created' => 'Új üzenet érkezett',
                'updated' => 'Üzenet frissítve',
                'deleted' => 'Üzenet törölve',
                default => 'Üzenet módosítva',
            },
            'Coupon' => match ($activity->event) {
                'created' => 'Kupon létrehozva',
                'updated' => 'Kupon frissítve',
                'deleted' => 'Kupon törölve',
                default => 'Kupon módosítva',
            },
            'Tour' => match ($activity->event) {
                'created' => 'Körutazás létrehozva',
                'updated' => 'Körutazás módosítva',
                'deleted' => 'Körutazás törölve',
                default => 'Körutazás frissítve',
            },
            'Apartment' => match ($activity->event) {
                'created' => 'Apartman létrehozva',
                'updated' => 'Apartman frissítve',
                'deleted' => 'Apartman törölve',
                default => 'Apartman módosítva',
            },
            'BlogArticle' => match ($activity->event) {
                'created' => 'Blog cikk létrehozva',
                'updated' => 'Blog cikk módosítva',
                'deleted' => 'Blog cikk törölve',
                default => 'Blog cikk frissítve',
            },
            'HomepageOffer' => match ($activity->event) {
                'created' => 'Főoldali ajánlat létrehozva',
                'updated' => 'Főoldali ajánlat frissítve',
                'deleted' => 'Főoldali ajánlat törölve',
                default => 'Főoldali ajánlat módosítva',
            },
            'Bus' => match ($activity->event) {
                'created' => 'Busz létrehozva',
                'updated' => 'Busz módosítva',
                'deleted' => 'Busz törölve',
                default => 'Busz frissítve',
            },
            default => match ($activity->event) {
                'created' => 'Rendszeraktivitás létrehozva',
                'updated' => 'Rendszeraktivitás frissítve',
                'deleted' => 'Rendszeraktivitás törölve',
                default => 'Rendszeraktivitás',
            },
        };
    }

    private function resolveBookingActivityTitle(Activity $activity): string
    {
        $booking = $activity->subject;
        $bookingType = $booking?->booking_type;

        return match ($bookingType) {
            'tour_booking' => match ($activity->event) {
                'created' => 'Új körutazás foglalás érkezett',
                'updated' => 'Körutazás foglalás módosítva',
                'deleted' => 'Körutazás foglalás törölve',
                default => 'Körutazás foglalás',
            },
            'tour_inquiry' => match ($activity->event) {
                'created' => 'Új körutazás ajánlatkérés érkezett',
                'updated' => 'Körutazás ajánlatkérés frissítve',
                'deleted' => 'Körutazás ajánlatkérés törölve',
                default => 'Körutazás ajánlatkérés',
            },
            'apartment_booking' => match ($activity->event) {
                'created' => 'Új apartman foglalás érkezett',
                'updated' => 'Apartman foglalás módosítva',
                'deleted' => 'Apartman foglalás törölve',
                default => 'Apartman foglalás',
            },
            default => 'Foglalás',
        };
    }

    private function resolveActivityDescription(Activity $activity, mixed $subject): string
    {
        if ($subject instanceof Booking) {
            return trim(sprintf(
                '%s • %s',
                $subject->customer_name ?? $subject->partner_name_snapshot ?? 'Ismeretlen ügyfél',
                $subject->offer_name_snapshot ?? $subject->apartment_name_snapshot ?? $subject->property_name_snapshot ?? 'Ismeretlen elem',
            ));
        }

        return trim((string) (
            $subject?->name
            ?? $subject?->title
            ?? $subject?->code
            ?? $subject?->email
            ?? $subject?->message
            ?? 'Részletek nem érhetők el'
        ));
    }

    private function resolveTargetUrl(Activity $activity, string $subjectType): string
    {
        return match ($subjectType) {
            'Booking' => match ($activity->subject?->booking_type) {
                'tour_booking' => '/admin/bookings/tour-bookings',
                'tour_inquiry' => '/admin/bookings/tour-inquiries',
                'apartment_booking' => '/admin/bookings/apartment-bookings',
                default => '/admin/bookings',
            },
            'ContactMessage' => '/admin/bookings/messages',
            'Coupon' => '/admin/bookings/coupons',
            'Tour' => '/admin/tours',
            'Apartment' => '/admin/apartments',
            'BlogArticle' => '/admin/blog',
            'HomepageOffer' => '/admin/homepage-offers',
            'Bus' => '/admin/buses',
            default => '/admin',
        };
    }

    private function resolveActivityKind(Activity $activity, string $subjectType): string
    {
        return match ($subjectType) {
            'Booking' => 'booking',
            'ContactMessage' => 'message',
            'Coupon' => 'coupon',
            'Tour' => 'tour',
            'Apartment' => 'apartment',
            'BlogArticle' => 'blog',
            'HomepageOffer' => 'offer',
            'Bus' => 'bus',
            default => 'system',
        };
    }
}

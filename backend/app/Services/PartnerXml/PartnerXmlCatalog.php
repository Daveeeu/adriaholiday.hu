<?php

namespace App\Services\PartnerXml;

use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDateExtra;
use App\Models\TourDeparturePlace;
use App\Support\Booking\BookingInsuranceSettings;
use App\Support\Legacy\LegacyBookingOptionRules;
use App\Support\PartnerXml\PartnerXmlSettings;
use App\Support\Tour\TourDateStatus;
use App\Support\Tour\TourExtraChargeRule;
use App\Support\Tour\TourExtraCurrency;
use App\Support\Tour\TourExtraPriceUnit;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * The tours the partner feeds offer, in the shape the feeds share: the
 * active tours marked for the XML, each with its dates marked for it that
 * have not departed and can be booked, and every date's price items as the
 * legacy feeds listed them (base price, resort fee, departure place fees,
 * extras). Partners know legacy tours and dates by their legacy id; the new
 * site's own ones get an id that never clashes with one.
 *
 * @phpstan-type PriceItem array{kind: string, name: string, price: float, currency: string, unit: string, per_booking: bool, mandatory: bool}
 * @phpstan-type FeedDate array{id: int, start: string, end: string, days: int, nights: int, board: string, accommodation: string, transport: string, price: float, sale_price: float|null, label: string, currency: string, price_items: list<PriceItem>, cesys_accommodation: string, cesys_room: string}
 * @phpstan-type FeedTour array{id: int, title: string, settings: array<string, mixed>, country_id: string, country_name: string, place: string, program: string, optional_programs: string, tickets: string, description: string, catering: string, accommodation: string, photos: list<array{url: string, primary: bool}>, dates: list<FeedDate>}
 */
final class PartnerXmlCatalog
{
    public const BASE = 'base';

    public const RESORT_FEE = 'resort_fee';

    public const DEPARTURE_PLACE = 'departure_place';

    public const EXTRA = 'extra';

    /**
     * @return list<FeedTour>
     */
    public function tours(): array
    {
        return Tour::query()
            ->where('active', true)
            ->where('xml_enabled', true)
            ->with([
                'region',
                'media',
                'galleryItems.media',
                'departurePlaces',
                'dates' => fn ($dates) => $dates
                    ->where('xml_enabled', true)
                    ->where('status', TourDateStatus::AVAILABLE)
                    ->whereDate('start_date', '>=', today())
                    ->whereNotNull('end_date')
                    ->orderBy('start_date')
                    ->with('extras'),
            ])
            ->get()
            ->map(fn (Tour $tour): array => $this->tour($tour))
            ->sortBy('id')
            ->values()
            ->all();
    }

    /**
     * @return FeedTour
     */
    private function tour(Tour $tour): array
    {
        $settings = PartnerXmlSettings::normalize($tour->partner_xml);
        $countryName = $settings['country_name'] ?? $tour->region?->name ?? '';
        $mainImageId = $tour->mainImage()?->id;
        $places = $tour->departurePlaces->where('active', true)->values();

        return [
            'id' => $this->id($tour->legacy_id, $tour->id),
            'title' => (string) $tour->name,
            'settings' => $settings,
            'country_id' => (string) ($settings['country_id'] ?? PartnerXmlSettings::legacyRegionId($countryName) ?? ''),
            'country_name' => $countryName,
            // The legacy feeds list the towns of the tour comma separated, without spaces.
            'place' => (string) Str::of(strip_tags((string) $tour->short_description))->replace([' ', "\u{a0}"], '')->replace(['-', '–'], ','),
            'program' => (string) $tour->program,
            'optional_programs' => (string) $tour->optional_programs,
            'tickets' => (string) $tour->tickets,
            'description' => (string) $tour->list_description,
            'catering' => trim((string) $tour->catering),
            'accommodation' => trim((string) $tour->accommodation),
            'photos' => $tour->galleryItems
                ->filter(fn ($item): bool => $item->active && $item->media !== null)
                ->sortBy('sort_order')
                ->map(fn ($item): array => ['url' => $item->media->getUrl(), 'primary' => $item->media->id === $mainImageId])
                ->values()
                ->all(),
            'dates' => $tour->dates->map(fn (TourDate $date): array => $this->date($tour, $date, $places))->values()->all(),
        ];
    }

    /**
     * @param  Collection<int, TourDeparturePlace>  $places
     * @return FeedDate
     */
    private function date(Tour $tour, TourDate $date, Collection $places): array
    {
        $currency = $this->currencyLabel($tour->price_box_currency ?: TourExtraCurrency::HUF);
        $nights = (int) $date->start_date->diffInDays($date->end_date);
        $price = (float) ($date->price_box_price ?? $date->price ?? 0);
        // A discounted date sells at its price; the feeds list the original as the list price.
        $listPrice = $date->price_box_original_price !== null && (float) $date->price_box_original_price > $price ? (float) $date->price_box_original_price : $price;
        $extras = $date->extras;
        $cesys = is_array($date->partner_xml) ? $date->partner_xml : [];

        $items = [
            ['kind' => self::BASE, 'name' => 'Alapár', 'price' => $listPrice, 'currency' => $currency, 'unit' => 'fő', 'per_booking' => false, 'mandatory' => true],
            ...$extras->filter(fn (TourDateExtra $extra): bool => LegacyBookingOptionRules::isResortFee($extra->name))->map(fn (TourDateExtra $extra): array => [
                'kind' => self::RESORT_FEE,
                'name' => $extra->currency === TourExtraCurrency::EUR ? 'Üdülőhelyi illeték helyszínen fizetendő euro/fő' : 'Üdülőhelyi illeték Ft/fő',
                'price' => (float) $extra->price,
                'currency' => $this->currencyLabel($extra->currency),
                'unit' => 'fő',
                'per_booking' => false,
                'mandatory' => true,
            ])->values()->all(),
            ...$date->offeredDeparturePlaces($places)->map(fn (TourDeparturePlace $place): array => [
                'kind' => self::DEPARTURE_PLACE,
                'name' => 'Felszállási díj-'.$place->name,
                'price' => (float) ($place->pivot->fee ?? 0),
                'currency' => $currency,
                'unit' => 'fő',
                'per_booking' => false,
                'mandatory' => false,
            ])->values()->all(),
            ...$extras->reject(fn (TourDateExtra $extra): bool => LegacyBookingOptionRules::isResortFee($extra->name))->map(fn (TourDateExtra $extra): array => [
                'kind' => self::EXTRA,
                // Two spaces after "Felár", as the legacy feeds have it.
                'name' => 'Felár  - '.$extra->name,
                'price' => (float) $extra->price,
                'currency' => $this->currencyLabel($extra->currency),
                'unit' => $this->currencyLabel($extra->currency).($extra->price_unit === TourExtraPriceUnit::PER_BOOKING ? '' : '/fő'),
                'per_booking' => $extra->price_unit === TourExtraPriceUnit::PER_BOOKING,
                'mandatory' => $extra->charge_rule === TourExtraChargeRule::MANDATORY,
            ])->values()->all(),
        ];

        return [
            'id' => $this->id($date->legacy_id, $date->id),
            'start' => $date->start_date->toDateString(),
            'end' => $date->end_date->toDateString(),
            'days' => $nights + 1,
            'nights' => $nights,
            'board' => trim((string) ($date->catering ?? $tour->catering)),
            'accommodation' => trim((string) ($date->accommodation ?? $tour->accommodation)),
            'transport' => match ($tour->travel_mode_id) {
                'plane' => 'Repülővel',
                'bus' => 'Autóbusszal',
                default => '',
            },
            'price' => $listPrice,
            'sale_price' => $listPrice > $price ? $price : null,
            'label' => trim((string) $date->price_box_label),
            'currency' => $currency,
            'price_items' => $items,
            'cesys_accommodation' => (string) ($cesys['cesys_accommodation'] ?? ''),
            'cesys_room' => (string) ($cesys['cesys_room'] ?? ''),
        ];
    }

    /**
     * The travel insurance's fee per person and day, and the cancellation
     * insurance's percentage (the feeds' "storno").
     *
     * @return array{daily_fee: float, cancellation_percent: float}
     */
    public function insurance(): array
    {
        $settings = BookingInsuranceSettings::load();

        return ['daily_fee' => $settings->travelInsuranceDailyFee, 'cancellation_percent' => $settings->cancellationInsurancePercent];
    }

    private function id(?int $legacyId, int $id): int
    {
        return $legacyId ?? (int) config('partner_xml.id_offset') + $id;
    }

    private function currencyLabel(?string $currency): string
    {
        return $currency === TourExtraCurrency::EUR ? 'EUR' : 'Ft';
    }
}

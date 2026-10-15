<?php

namespace App\Services\Legacy;

use App\Models\Tour;
use App\Services\Tour\TourContentSyncService;
use App\Support\PublicContentCache;
use App\Support\Tour\TourExtraChargeRule;
use Illuminate\Support\Facades\DB;

/**
 * Updates an existing tour from its legacy admin export (see
 * LegacyAdminOfferReader): the texts as the legacy admin stores them, with
 * the program as one block instead of guessed days; the dates with their
 * prices, labels, seats, extras and departure places; coupon acceptance,
 * travel mode, meals and accommodation. Region, countries, categories,
 * gallery and keywords are left as they are. Writes go through
 * TourContentSyncService, like admin edits.
 */
class LegacyAdminOfferImporter
{
    public function __construct(
        private readonly LegacyAdminOfferReader $reader,
        private readonly TourContentSyncService $tourContentSync,
        private readonly LegacyReferenceResolver $references,
    ) {}

    /**
     * @param  array<string, mixed>  $offer  one tour of the export
     */
    public function import(array $offer): LegacyImportOutcome
    {
        $data = $this->reader->read($offer);
        $tour = Tour::query()->where('seo_name', $data['seo_name'])->first();

        if ($tour === null || $data['seo_name'] === '') {
            return LegacyImportOutcome::Skipped;
        }

        $places = collect($data['dates'])->flatMap(fn (array $date): array => $date['departure_places']);
        $placeIds = $this->references->departurePlaceIds($places->pluck('name')->unique()->values()->all());
        $placeFees = $places->unique('name')->mapWithKeys(fn (array $place): array => [$placeIds[$place['name']] => $place['fee']])->all();
        $travelMode = $data['travel_mode'] !== null ? $this->references->travelMode($data['travel_mode']) : $tour->travel_mode_id;
        $prices = array_filter(array_column($data['dates'], 'price'));
        $singleRoomChoices = $this->references->singleRoomChoices();

        DB::transaction(function () use ($tour, $data, $placeIds, $placeFees, $travelMode, $prices, $singleRoomChoices): void {
            $tour->fill([
                'name' => $data['name'] ?: $tour->name,
                'subtitle' => $data['subtitle'],
                'short_description' => $data['short_description'],
                'program_before' => null,
                'program' => $data['program'],
                'tickets' => $data['tickets'],
                'optional_programs' => $data['optional_programs'],
                'teaser' => $data['teaser'],
                'prices' => $data['prices'],
                'notes' => null,
                'discounts' => null,
                'couponable' => $data['couponable'],
                'travel_mode_id' => $travelMode,
                'catering' => $data['catering'],
                'catering_info' => $data['catering_info'],
                'accommodation' => $data['accommodation'],
                'accommodation_info' => $data['accommodation_info'],
                ...($prices !== [] ? ['price' => min($prices), 'displayed_price' => number_format(min($prices), 0, ',', '.').' Ft'] : []),
            ])->save();

            $this->tourContentSync->syncDates($tour, array_map(fn (array $date): array => [
                'start_date' => $date['start_date'],
                'end_date' => $date['end_date'],
                'price' => $date['price'],
                'price_box_price' => $date['price'],
                'price_box_original_price' => $date['original_price'],
                'price_box_discount_badge' => $date['discount_badge'],
                'price_box_label' => $date['label'],
                'price_box_available_seats' => $date['available_seats'],
                'status' => $date['status'],
                'departure_place_ids' => $this->dateDeparturePlaceIds($date['departure_places'], $placeIds),
                'extras' => array_map(fn (array $extra): array => [
                    ...$extra,
                    'choices' => $extra['charge_rule'] === TourExtraChargeRule::SOLO_TRAVELLER ? $singleRoomChoices : [],
                ], $date['extras']),
            ], $data['dates']), keepDeparted: true);

            // The program is one block now: the guessed days and the price
            // items read out of its text would repeat it.
            $this->tourContentSync->syncProgramDays($tour, []);
            $this->tourContentSync->syncPriceItems($tour, []);
            $this->tourContentSync->syncDeparturePlaces($tour, array_values($placeIds), $placeFees);
        });

        PublicContentCache::bump(PublicContentCache::OFFERS, PublicContentCache::SITEMAP);

        return LegacyImportOutcome::Updated;
    }

    /**
     * The places a date offers, or null when it offers every place of the tour.
     *
     * @param  array<int, array{name: string, fee: float}>  $places
     * @param  array<string, int>  $tourPlaceIds  keyed by place name
     * @return array<int, int>|null
     */
    private function dateDeparturePlaceIds(array $places, array $tourPlaceIds): ?array
    {
        $ids = collect($places)->map(fn (array $place): ?int => $tourPlaceIds[$place['name']] ?? null)->filter()->unique()->values()->all();

        return $ids === [] || count($ids) === count($tourPlaceIds) ? null : $ids;
    }
}

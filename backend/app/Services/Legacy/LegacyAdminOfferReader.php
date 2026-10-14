<?php

namespace App\Services\Legacy;

use App\Support\RichTextSanitizer;
use App\Support\Tour\TourDateStatus;
use App\Support\Tour\TourExtraChargeRule;
use App\Support\Tour\TourExtraPriceUnit;
use Illuminate\Support\Str;

/**
 * Pure mapping of one tour exported from the legacy admin (its edit form,
 * dates and date extras, read as the admin stores them) to the new site's
 * fields. The program stays one rich text block, word for word as the
 * legacy page shows it; nothing is inferred from page layout.
 *
 * Export shape: {form: {name: value, …, __checked: {name: label}}, dates:
 * [{id, summary, fields: {…}, extras: [{id, line: "Név | ár | Ft/fő | típus |"}]}]},
 * where a select is {value, text}.
 *
 * @phpstan-type AdminExtra array{name: string, price: float, price_unit: string, charge_rule: string}
 * @phpstan-type AdminDate array{start_date: string, end_date: string, status: string, price: float|null, original_price: float|null, label: string|null, discount_badge: string|null, available_seats: int|null, extras: array<int, AdminExtra>, departure_places: array<int, array{name: string, fee: float}>}
 */
final class LegacyAdminOfferReader
{
    private const TRAVEL_MODES = ['Autóbusszal' => 'bus', 'Repülővel' => 'plane', 'Vonattal' => 'train'];

    /** Dates the legacy site lists: active ones and full ones ("megtelt"). */
    private const LISTED_STATUSES = ['active' => TourDateStatus::AVAILABLE, 'full' => TourDateStatus::SOLD_OUT];

    /**
     * @param  array<string, mixed>  $offer
     * @return array{seo_name: string, name: string, subtitle: ?string, short_description: ?string, program: ?string, tickets: ?string, optional_programs: ?string, teaser: ?string, prices: ?string, couponable: bool, travel_mode: ?string, catering: ?string, catering_info: ?string, accommodation: ?string, accommodation_info: ?string, dates: array<int, AdminDate>}
     */
    public function read(array $offer): array
    {
        $form = $offer['form'] ?? [];
        $dates = collect($offer['dates'] ?? [])
            ->map(fn (array $date): ?array => $this->date($date))
            ->filter()
            ->sortBy('start_date')
            ->values();
        $first = collect($offer['dates'] ?? [])
            ->filter(fn (array $date): bool => isset(self::LISTED_STATUSES[$this->select($date['fields'] ?? [], 'status')]))
            ->sortBy(fn (array $date): string => (string) ($date['fields']['date_date_from'] ?? ''))
            ->first()['fields'] ?? [];

        return [
            'seo_name' => trim((string) ($form['seo_name'] ?? '')),
            'name' => trim((string) ($form['name'] ?? '')),
            'subtitle' => $this->text(trim(($form['name_sub_1'] ?? '').' '.($form['name_sub_2'] ?? ''))),
            'short_description' => $this->text($form['cities_affected'] ?? null),
            'program' => $this->html($form['program'] ?? null),
            'tickets' => $this->html($form['tickets'] ?? null),
            'optional_programs' => $this->html($form['facultative'] ?? null),
            'teaser' => $this->html($form['favorable_text'] ?? null),
            'prices' => $this->html($form['price_text'] ?? null),
            'couponable' => (string) ($form['coupon_enabled'] ?? '1') === '1',
            'travel_mode' => self::TRAVEL_MODES[$this->selectText($first, 'travel')] ?? null,
            'catering' => $this->text($first['provision'] ?? null),
            'catering_info' => $this->info($first['provision_info'] ?? null, $first['provision'] ?? null),
            'accommodation' => $this->text($first['accommodation'] ?? null),
            'accommodation_info' => $this->info($first['accommodation_info'] ?? null, $first['accommodation'] ?? null),
            'dates' => $dates->all(),
        ];
    }

    /**
     * @param  array<string, mixed>  $date
     * @return AdminDate|null
     */
    private function date(array $date): ?array
    {
        $fields = $date['fields'] ?? [];
        $status = self::LISTED_STATUSES[$this->select($fields, 'status')] ?? null;
        $start = trim((string) ($fields['date_date_from'] ?? ''));

        if ($status === null || $start === '') {
            return null;
        }

        $price = $this->number($fields['price'] ?? null);
        $salePrice = $this->number($fields['sale_price'] ?? null);
        $onSale = $salePrice !== null && $salePrice > 0 && $price !== null && $salePrice < $price;
        $monitored = $this->select($fields, 'space_number_monitoring') === '1';
        $seats = $monitored ? max(0, (int) ($fields['space_number'] ?? 0)) : null;
        $lastMinute = $this->number($fields['last_minute'] ?? null);

        return [
            'start_date' => $start,
            'end_date' => trim((string) ($fields['date_date_to'] ?? '')) ?: $start,
            // A full date, or a watched one without free seats, takes no booking.
            'status' => $seats === 0 ? TourDateStatus::SOLD_OUT : $status,
            'price' => $onSale ? $salePrice : $price,
            'original_price' => $onSale ? $price : null,
            'label' => $this->text($fields['comment'] ?? null),
            'discount_badge' => $lastMinute !== null && $lastMinute > 0 ? '-'.rtrim(rtrim(number_format($lastMinute, 2, ',', ''), '0'), ',').'%' : null,
            'available_seats' => $seats,
            'extras' => [...$this->extras($date['extras'] ?? []), ...$this->resortFee($fields)],
            'departure_places' => $this->departurePlaces($fields['__checked'] ?? []),
        ];
    }

    /**
     * "Vacsora | 38900 | Ft/fő | Választható |": a per-person or per-booking
     * extra the customer may choose, the single room supplement ("Egyágyas"),
     * or one always charged ("Előre kiválasztott", e.g. the flight ticket).
     *
     * @param  array<int, array{line?: string}>  $extras
     * @return array<int, AdminExtra>
     */
    private function extras(array $extras): array
    {
        $result = [];

        foreach ($extras as $extra) {
            $parts = array_map('trim', explode('|', (string) ($extra['line'] ?? '')));
            [$name, $price, $unit, $type] = array_pad($parts, 4, '');

            if ($name === '' || $this->number($price) === null) {
                continue;
            }

            $result[] = [
                'name' => $name,
                'price' => $this->number($price),
                'price_unit' => $unit === 'Ft' ? TourExtraPriceUnit::PER_BOOKING : TourExtraPriceUnit::PER_PERSON,
                'charge_rule' => match (true) {
                    $type === 'Egyágyas' => TourExtraChargeRule::SOLO_TRAVELLER,
                    Str::startsWith($type, 'Előre kiválasztott') => TourExtraChargeRule::MANDATORY,
                    default => TourExtraChargeRule::OPTIONAL,
                },
            ];
        }

        return $result;
    }

    /**
     * The resort fee in forints is charged per person with the booking.
     *
     * @param  array<string, mixed>  $fields
     * @return array<int, AdminExtra>
     */
    private function resortFee(array $fields): array
    {
        $fee = $this->number($fields['resort_fee'] ?? null);

        return $fee !== null && $fee > 0 ? [[
            'name' => LegacyBookingOptionsParser::RESORT_FEE_NAME,
            'price' => $fee,
            'price_unit' => TourExtraPriceUnit::PER_PERSON,
            'charge_rule' => TourExtraChargeRule::MANDATORY,
        ]] : [];
    }

    /**
     * The ticked "felszallas[…]" boxes, labelled "Miskolc, Centrum Áruház mögötti parkoló(+0 Ft/fő)".
     *
     * @param  array<string, string>  $checked
     * @return array<int, array{name: string, fee: float}>
     */
    private function departurePlaces(array $checked): array
    {
        $places = [];

        foreach ($checked as $field => $label) {
            if (! str_starts_with($field, 'felszallas[')) {
                continue;
            }

            preg_match('/^(.*?)\s*\(\+\s*([\d\s.]+)\s*Ft\/fő\)\s*$/u', trim($label), $match);
            $name = trim($match[1] ?? $label);

            if ($name !== '') {
                $places[] = ['name' => $name, 'fee' => (float) preg_replace('/\D/', '', $match[2] ?? '0')];
            }
        }

        return $places;
    }

    /**
     * @param  array<string, mixed>  $fields
     */
    private function select(array $fields, string $name): ?string
    {
        $value = $fields[$name] ?? null;

        return is_array($value) ? (string) ($value['value'] ?? '') : null;
    }

    /**
     * @param  array<string, mixed>  $fields
     */
    private function selectText(array $fields, string $name): string
    {
        $value = $fields[$name] ?? null;

        return is_array($value) ? trim((string) ($value['text'] ?? '')) : '';
    }

    private function html(mixed $value): ?string
    {
        $html = RichTextSanitizer::sanitize(is_string($value) ? $value : null);

        return $html !== null && trim(strip_tags($html)) !== '' ? $html : null;
    }

    private function text(mixed $value): ?string
    {
        $text = trim((string) preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags((string) $value), ENT_QUOTES | ENT_HTML5, 'UTF-8')));

        return $text !== '' ? $text : null;
    }

    /**
     * A popover note as plain text, one line per paragraph; none when it only repeats the label.
     */
    private function info(mixed $html, mixed $label): ?string
    {
        $withBreaks = (string) preg_replace('/<\/p>|<br\s*\/?>/i', "\n", (string) $html);
        $lines = array_values(array_filter(array_map(fn (string $line): ?string => $this->text($line), explode("\n", $withBreaks))));
        $info = implode("\n", $lines);

        return $info === '' || mb_strtolower($info) === mb_strtolower((string) $this->text($label)) ? null : $info;
    }

    private function number(mixed $value): ?float
    {
        $digits = preg_replace('/[^\d.,]/', '', (string) $value);

        return $digits !== '' && $digits !== null ? (float) str_replace(',', '.', $digits) : null;
    }
}

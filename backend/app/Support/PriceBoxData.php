<?php

namespace App\Support;

use App\Models\Tour;
use App\Models\TourDate;

class PriceBoxData
{
    public static function fromTour(Tour $tour): ?array
    {
        return self::build([
            'price' => $tour->price_box_price ?? $tour->price,
            'displayedPrice' => $tour->price_box_displayed_price ?? $tour->displayed_price,
            'currency' => $tour->price_box_currency,
            'priceSuffix' => $tour->price_box_price_suffix,
            'discountBadge' => $tour->price_box_discount_badge,
            'discountText' => $tour->price_box_discount_text,
            'urgencyText' => $tour->price_box_urgency_text,
            'ratingText' => $tour->price_box_rating_text,
            'minParticipants' => $tour->price_box_min_participants,
            'maxParticipants' => $tour->price_box_max_participants,
            'availableSeats' => $tour->price_box_available_seats,
            'capacity' => $tour->price_box_capacity,
            'ctaPrimaryLabel' => $tour->price_box_cta_primary_label,
            'ctaSecondaryLabel' => $tour->price_box_cta_secondary_label,
        ]);
    }

    public static function fromDate(TourDate $date): ?array
    {
        return self::build([
            'price' => $date->price_box_price ?? $date->price,
            'displayedPrice' => $date->price_box_displayed_price,
            'discountBadge' => $date->price_box_discount_badge,
            'minParticipants' => $date->price_box_min_participants,
            'maxParticipants' => $date->price_box_max_participants,
            'availableSeats' => $date->price_box_available_seats,
            'capacity' => $date->price_box_capacity,
        ]);
    }

    public static function merge(?array $base, ?array $override): ?array
    {
        $merged = array_merge($base ?? [], $override ?? []);

        return self::hasAnyValue($merged) ? $merged : null;
    }

    private static function build(array $data): ?array
    {
        $price = isset($data['price']) && $data['price'] !== '' ? (float) $data['price'] : null;
        $displayedPrice = self::normalizeString($data['displayedPrice'] ?? null);
        $currency = self::normalizeString($data['currency'] ?? null);

        foreach ([
            'priceSuffix',
            'discountBadge',
            'discountText',
            'urgencyText',
            'ratingText',
            'ctaPrimaryLabel',
            'ctaSecondaryLabel',
        ] as $field) {
            $data[$field] = self::normalizeString($data[$field] ?? null);
        }

        foreach ([
            'minParticipants',
            'maxParticipants',
            'availableSeats',
            'capacity',
        ] as $field) {
            $data[$field] = self::normalizeInt($data[$field] ?? null);
        }

        if ($displayedPrice === null && $price !== null) {
            $displayedPrice = self::displayedPrice(
                $price,
                null,
                $currency,
                $data['priceSuffix'] ?? null,
            );
        }

        if ($currency === null && ($price !== null || $displayedPrice !== null)) {
            $currency = 'HUF';
        }

        $data['price'] = $price;
        $data['displayedPrice'] = $displayedPrice;
        $data['currency'] = $currency;

        if (! self::hasAnyValue($data)) {
            return null;
        }

        return $data;
    }

    private static function displayedPrice(
        ?float $price,
        ?string $displayedPrice,
        ?string $currency,
        ?string $priceSuffix,
    ): ?string {
        $displayedPrice = self::normalizeString($displayedPrice);

        if ($displayedPrice !== null) {
            return $displayedPrice;
        }

        if ($price === null) {
            return null;
        }

        $currency = strtoupper(trim((string) ($currency ?: 'HUF')));
        $currencyLabel = match ($currency) {
            'HUF', 'FT' => 'Ft',
            'EUR' => 'EUR',
            'USD' => 'USD',
            default => $currency,
        };

        $formatted = number_format($price, 0, ',', ' ');
        $suffix = self::normalizeString($priceSuffix);

        return $suffix !== null
            ? "{$formatted} {$currencyLabel} {$suffix}"
            : "{$formatted} {$currencyLabel}";
    }

    private static function normalizeString(mixed $value): ?string
    {
        $trimmed = trim((string) $value);

        return $trimmed !== '' ? $trimmed : null;
    }

    private static function normalizeInt(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (! is_numeric($value)) {
            return null;
        }

        return (int) $value;
    }

    private static function hasAnyValue(array $data): bool
    {
        foreach ($data as $value) {
            if ($value === null) {
                continue;
            }

            if (is_string($value) && trim($value) === '') {
                continue;
            }

            return true;
        }

        return false;
    }
}

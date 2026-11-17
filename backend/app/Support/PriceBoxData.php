<?php

namespace App\Support;

use App\Models\Tour;
use App\Models\TourDate;

class PriceBoxData
{
    /**
     * The tour's price box. Without the suffix, its price reads "276.900 Ft"
     * instead of "276.900 Ft / fő", for an offer card that says "-tól/fő" itself.
     */
    public static function fromTour(Tour $tour, bool $withSuffix = true): ?array
    {
        return self::build([
            'price' => $tour->price_box_price ?? $tour->price,
            'displayedPrice' => $tour->price_box_displayed_price ?? $tour->displayed_price,
            'currency' => $tour->price_box_currency,
            'priceSuffix' => $withSuffix ? $tour->price_box_price_suffix : null,
            'discountBadge' => $tour->price_box_discount_badge,
            'discountText' => $tour->price_box_discount_text,
            'urgencyText' => $tour->price_box_urgency_text,
            'ratingText' => $tour->price_box_rating_text,
        ]);
    }

    public static function fromDate(TourDate $date): ?array
    {
        return self::build([
            'price' => $date->price_box_price ?? $date->price,
            'originalPrice' => $date->price_box_original_price,
            'displayedPrice' => $date->price_box_displayed_price,
            'discountBadge' => $date->price_box_discount_badge,
            'label' => $date->price_box_label,
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
        $currency = self::normalizeString($data['currency'] ?? null);
        $displayedPrice = self::isForint($currency)
            ? HufPrice::normalizeLabel($data['displayedPrice'] ?? null)
            : self::normalizeString($data['displayedPrice'] ?? null);

        foreach ([
            'priceSuffix',
            'label',
            'discountBadge',
            'discountText',
            'urgencyText',
            'ratingText',
        ] as $field) {
            $data[$field] = self::normalizeString($data[$field] ?? null);
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

        // The pre-promotion price, struck through next to the price; only
        // meaningful above it.
        $originalPrice = is_numeric($data['originalPrice'] ?? null) ? (float) $data['originalPrice'] : null;
        $data['originalPrice'] = $originalPrice !== null && $price !== null && $originalPrice > $price ? $originalPrice : null;
        $data['originalDisplayedPrice'] = $data['originalPrice'] !== null
            ? self::displayedPrice($data['originalPrice'], null, $currency, $data['priceSuffix'] ?? null)
            : null;

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

        $formatted = HufPrice::amount($price);
        $suffix = self::normalizeString($priceSuffix);

        return $suffix !== null
            ? "{$formatted} {$currencyLabel} {$suffix}"
            : "{$formatted} {$currencyLabel}";
    }

    private static function isForint(?string $currency): bool
    {
        return $currency === null || in_array(strtoupper($currency), ['HUF', 'FT'], true);
    }

    private static function normalizeString(mixed $value): ?string
    {
        $trimmed = trim((string) $value);

        return $trimmed !== '' ? $trimmed : null;
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

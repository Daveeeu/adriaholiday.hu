<?php

namespace App\Support;

use App\Models\Tour;
use App\Models\TourDate;

class PriceBoxData
{
    /**
     * The tour's price box. Its displayed price is always written from the
     * price: "276.900 Ft / fő", or without the suffix "276.900 Ft", for an
     * offer card that says "-tól/fő" itself.
     */
    public static function fromTour(Tour $tour, bool $withSuffix = true): ?array
    {
        return self::build([
            'price' => $tour->price_box_price ?? $tour->price,
            'currency' => $tour->price_box_currency,
            'priceSuffix' => $withSuffix ? $tour->price_box_price_suffix : null,
            'discountBadge' => $tour->price_box_discount_badge,
            'discountText' => $tour->price_box_discount_text,
        ]);
    }

    public static function fromDate(TourDate $date): ?array
    {
        return self::build([
            'price' => $date->price_box_price ?? $date->price,
            'originalPrice' => $date->price_box_original_price,
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

        foreach ([
            'priceSuffix',
            'label',
            'discountBadge',
            'discountText',
        ] as $field) {
            $data[$field] = self::normalizeString($data[$field] ?? null);
        }

        if ($currency === null && $price !== null) {
            $currency = 'HUF';
        }

        $data['price'] = $price;
        $data['displayedPrice'] = $price !== null ? self::displayedPrice($price, $currency, $data['priceSuffix'] ?? null) : null;
        $data['currency'] = $currency;

        // The pre-promotion price, struck through next to the price; only
        // meaningful above it.
        $originalPrice = is_numeric($data['originalPrice'] ?? null) ? (float) $data['originalPrice'] : null;
        $data['originalPrice'] = $originalPrice !== null && $price !== null && $originalPrice > $price ? $originalPrice : null;
        $data['originalDisplayedPrice'] = $data['originalPrice'] !== null
            ? self::displayedPrice($data['originalPrice'], $currency, $data['priceSuffix'] ?? null)
            : null;

        if (! self::hasAnyValue($data)) {
            return null;
        }

        return $data;
    }

    private static function displayedPrice(float $price, ?string $currency, ?string $priceSuffix): string
    {
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

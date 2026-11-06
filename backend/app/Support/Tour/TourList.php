<?php

namespace App\Support\Tour;

/**
 * A public tour list the office orders on its own: the category page a
 * homepage tile leads to (keyed by the category id), a country (keyed by its
 * code) or the homepage's featured offers (the only list of its type).
 */
final readonly class TourList
{
    public const CATEGORY = 'category';

    public const COUNTRY = 'country';

    public const FEATURED = 'featured';

    private const FEATURED_KEY = 'home';

    private function __construct(
        public string $type,
        public string $key,
    ) {}

    public static function category(int|string $categoryId): self
    {
        return new self(self::CATEGORY, (string) $categoryId);
    }

    public static function country(string $code): self
    {
        return new self(self::COUNTRY, $code);
    }

    public static function featured(): self
    {
        return new self(self::FEATURED, self::FEATURED_KEY);
    }

    public static function make(string $type, string $key): self
    {
        return match ($type) {
            self::CATEGORY => self::category($key),
            self::FEATURED => self::featured(),
            default => self::country($key),
        };
    }

    /**
     * @return array<int, string>
     */
    public static function types(): array
    {
        return [self::CATEGORY, self::COUNTRY, self::FEATURED];
    }
}

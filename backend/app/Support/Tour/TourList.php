<?php

namespace App\Support\Tour;

/**
 * A public tour list the office orders on its own: the category page a
 * homepage tile leads to (keyed by the category id) or a country (keyed by
 * its code).
 */
final readonly class TourList
{
    public const CATEGORY = 'category';

    public const COUNTRY = 'country';

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

    public static function make(string $type, string $key): self
    {
        return $type === self::CATEGORY ? self::category($key) : self::country($key);
    }

    /**
     * @return array<int, string>
     */
    public static function types(): array
    {
        return [self::CATEGORY, self::COUNTRY];
    }
}

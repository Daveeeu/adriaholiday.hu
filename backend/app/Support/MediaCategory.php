<?php

namespace App\Support;

enum MediaCategory: string
{
    case GENERAL = 'general';
    case BLOG = 'blog';
    case TOURS = 'tours';
    case APARTMENTS = 'apartments';
    case HOMEPAGE_OFFERS = 'homepage_offers';
    case PORTFOLIO = 'portfolio';
    case GALLERIES = 'galleries';
    case BUSES = 'buses';

    public function label(): string
    {
        return match ($this) {
            self::GENERAL => 'Általános',
            self::BLOG => 'Blog',
            self::TOURS => 'Utazások',
            self::APARTMENTS => 'Apartmanok',
            self::HOMEPAGE_OFFERS => 'Főoldali ajánlatok',
            self::PORTFOLIO => 'Portfólió',
            self::GALLERIES => 'Galériák',
            self::BUSES => 'Buszok',
        };
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $case): string => $case->value, self::cases());
    }

    /**
     * @return array<int, array{value:string,label:string}>
     */
    public static function options(): array
    {
        return array_map(
            static fn (self $case): array => [
                'value' => $case->value,
                'label' => $case->label(),
            ],
            self::cases(),
        );
    }

    public static function labelFor(?string $value): string
    {
        return self::tryFrom($value ?? '')?->label() ?? self::GENERAL->label();
    }

    public static function normalized(?string $value): string
    {
        return self::tryFrom($value ?? '')?->value ?? self::GENERAL->value;
    }
}

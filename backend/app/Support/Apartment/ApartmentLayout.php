<?php

namespace App\Support\Apartment;

/**
 * The layout of an apartment type, read from the letter its name starts
 * with ("B-5" is a one-bedroom apartment for up to 5), as the legacy site's
 * apartment search offered it.
 */
final class ApartmentLayout
{
    /** @var array<string, string> letter => label */
    private const LAYOUTS = [
        'A' => '1 szobás stúdió (A)',
        'B' => '1 szoba és nappali (B)',
        'C' => '2 szoba és nappali (C)',
        'D' => '3 szoba és nappali (D)',
        'E' => '4 szoba és nappali (E)',
    ];

    /**
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (string $letter, string $label): array => ['value' => $letter, 'label' => $label],
            array_keys(self::LAYOUTS),
            self::LAYOUTS,
        );
    }

    /**
     * @return list<string>
     */
    public static function letters(): array
    {
        return array_keys(self::LAYOUTS);
    }

    /**
     * The layout letters of apartment type names ("B-5", "C1-6" => B, C).
     *
     * @param  list<string>  $categories
     * @return list<string>
     */
    public static function ofCategories(array $categories): array
    {
        $letters = [];

        foreach ($categories as $category) {
            $letter = strtoupper(substr(ltrim($category), 0, 1));

            if (isset(self::LAYOUTS[$letter]) && preg_match('/^[A-E]\d*\s*-/i', ltrim($category))) {
                $letters[$letter] = true;
            }
        }

        return array_keys($letters);
    }
}

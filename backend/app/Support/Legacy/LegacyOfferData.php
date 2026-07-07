<?php

namespace App\Support\Legacy;

/**
 * Structured result of parsing a single legacy adriaholiday.hu offer page.
 * Immutable by design: the parser is pure (HTML in, data out) and this DTO
 * is the contract between LegacyAdriaOfferParser and LegacyTourImporter.
 *
 * @phpstan-type LegacyOfferDate array{start_date: ?string, end_date: ?string, price: ?float, transport_code: ?string, catering: ?string, accommodation: ?string}
 * @phpstan-type LegacyOfferProgramDay array{day_number: int, title: string, description: string}
 * @phpstan-type LegacyOfferPriceItem array{type: string, text: string}
 */
final class LegacyOfferData
{
    /**
     * @param  array<int, string>  $galleryImageUrls
     * @param  array<int, array{start_date: ?string, end_date: ?string, price: ?float, transport_code: ?string, catering: ?string, accommodation: ?string}>  $dates
     * @param  array<int, array{day_number: int, title: string, description: string}>  $programDays
     * @param  array<int, array{type: string, text: string}>  $priceItems
     * @param  array<int, string>  $tags
     * @param  array<int, string>  $categories
     * @param  array<int, string>  $countrySlugs
     * @param  array<int, string>  $departurePlaceNames
     */
    public function __construct(
        public readonly string $sourceUrl,
        public readonly string $seoName,
        public readonly string $name,
        public readonly ?string $shortDescription,
        public readonly array $galleryImageUrls,
        public readonly array $dates,
        public readonly array $programDays,
        public readonly array $priceItems,
        public readonly array $tags,
        public readonly array $categories,
        public readonly array $countrySlugs,
        public readonly ?string $travelModeCode,
        public readonly ?string $catering,
        public readonly ?string $accommodation,
        public readonly array $departurePlaceNames,
        public readonly ?string $notesHtml,
        public readonly ?string $discountsHtml,
        public readonly ?float $price,
    ) {}
}

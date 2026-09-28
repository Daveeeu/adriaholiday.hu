<?php

namespace App\Services\Legacy;

use App\Support\Tour\TourExtraChargeRule;
use App\Support\Tour\TourExtraPriceUnit;
use DOMDocument;
use DOMElement;
use DOMXPath;

/**
 * Pure parser for the legacy site's per-date booking data:
 *
 * - `roundtrip/get_datas` returns the departure place <option>s and the
 *   extras ("felárak") block as HTML fragments inside JSON;
 * - `roundtrip/get_roundtrip_price` (quoted for one passenger) returns the
 *   resort fee (in forints, or in euros payable on site) and the Last
 *   Minute discount percentage.
 *
 * An extra rendered checked + readonly is mandatory. The single room
 * supplement (`data-name="single_bad"`) is the exception: the legacy page
 * charges it automatically to solo travellers only and lets them choose
 * between staying alone and being matched with a roommate. A price shown
 * in "Ft/fő" is charged per passenger, a bare "Ft" once per booking.
 *
 * @phpstan-type LegacyExtra array{name: string, price: float, price_unit: string, charge_rule: string, choices: array<int, string>}
 * @phpstan-type LegacyBookingOptions array{departurePlaces: array<int, array{name: string, price: float|null}>, extras: array<int, LegacyExtra>, lastMinutePercent: float|null, onSiteFees: array<int, string>}
 */
class LegacyBookingOptionsParser
{
    public const RESORT_FEE_NAME = 'Üdülőhelyi illeték';

    /**
     * @param  array<string, mixed>  $options  decoded get_datas JSON
     * @param  array<string, mixed>  $quote  decoded get_roundtrip_price JSON for one passenger
     * @return LegacyBookingOptions
     */
    public function parse(array $options, array $quote = []): array
    {
        $extras = $this->extras((string) ($options['extra_prices_items'] ?? ''));
        $resortFee = (float) ($quote['resort_fee_value_person'] ?? 0);

        if ($resortFee > 0) {
            $extras[] = [
                'name' => self::RESORT_FEE_NAME,
                'price' => $resortFee,
                'price_unit' => TourExtraPriceUnit::PER_PERSON,
                'charge_rule' => TourExtraChargeRule::MANDATORY,
                'choices' => [],
            ];
        }

        $resortFeeEur = (float) ($quote['resort_fee_eur_value_person'] ?? 0);
        $lastMinutePercent = (float) ($quote['last_minute_value_text'] ?? 0);

        return [
            'departurePlaces' => $this->departurePlaces((string) ($options['felszallas_items'] ?? '')),
            'extras' => $extras,
            'lastMinutePercent' => $lastMinutePercent > 0 ? $lastMinutePercent : null,
            'onSiteFees' => $resortFeeEur > 0
                ? [sprintf('%s: %s EUR/fő, helyszínen fizetendő', self::RESORT_FEE_NAME, rtrim(rtrim(number_format($resortFeeEur, 2, ',', ''), '0'), ','))]
                : [],
        ];
    }

    /**
     * @return array<int, array{name: string, price: float|null}>
     */
    private function departurePlaces(string $html): array
    {
        $places = [];

        foreach ($this->xpath($html)->query('//option[@value!=""]') as $option) {
            $text = $this->normalizeWhitespace($option->textContent);
            $price = null;

            if (preg_match('/^([\d.]+)\s*Ft\/fő\s*(.*)$/u', $text, $match)) {
                $price = (float) str_replace('.', '', $match[1]);
                $text = trim($match[2]);
            }

            if ($text !== '') {
                $places[] = ['name' => $text, 'price' => $price];
            }
        }

        return $places;
    }

    /**
     * @return array<int, LegacyExtra>
     */
    private function extras(string $html): array
    {
        $xpath = $this->xpath($html);
        $extras = [];

        foreach ($xpath->query('//input[contains(concat(" ", normalize-space(@class), " "), " extra_price_changer ")]') as $input) {
            if (! $input instanceof DOMElement) {
                continue;
            }

            $row = $xpath->query('ancestor::div[contains(concat(" ", normalize-space(@class), " "), " row ")][1]', $input)->item(0);
            $label = $input->parentNode instanceof DOMElement ? $this->normalizeWhitespace($input->parentNode->textContent) : '';
            $priceText = $row !== null
                ? $this->normalizeWhitespace((string) $xpath->query('.//p[not(contains(@class,"extra_price_formated"))]', $row)->item(0)?->textContent)
                : '';

            if ($label === '' || ! preg_match('/([\d.]+)\s*Ft(\/fő)?/u', $priceText, $match)) {
                continue;
            }

            $isSingleRoom = $input->getAttribute('data-name') === 'single_bad';
            $isLocked = $input->hasAttribute('checked') && $input->hasAttribute('readonly');

            $extras[] = [
                'name' => $this->capitalize($label),
                'price' => (float) str_replace('.', '', $match[1]),
                'price_unit' => ($match[2] ?? '') !== '' ? TourExtraPriceUnit::PER_PERSON : TourExtraPriceUnit::PER_BOOKING,
                'charge_rule' => match (true) {
                    $isSingleRoom => TourExtraChargeRule::SOLO_TRAVELLER,
                    $isLocked => TourExtraChargeRule::MANDATORY,
                    default => TourExtraChargeRule::OPTIONAL,
                },
                'choices' => $isSingleRoom ? $this->singleRoomChoices($xpath) : [],
            ];
        }

        return $extras;
    }

    /**
     * The "alone in the room" / "find me a roommate" options rendered below
     * the single room supplement; the roommate option's explanation (the
     * supplement is refunded when a roommate is found) is kept in its label.
     *
     * @return array<int, string>
     */
    private function singleRoomChoices(DOMXPath $xpath): array
    {
        $choices = [];

        foreach ($xpath->query('//input[@name="single_bad_alone_in_the_room" or @name="single_bad_like_a_roommate"]') as $input) {
            $lines = [];

            foreach ($input->parentNode?->childNodes ?? [] as $node) {
                $text = $this->normalizeWhitespace($node->textContent);

                if ($text !== '') {
                    $lines[] = $text;
                }
            }

            if ($lines !== []) {
                $choices[] = implode(' – ', [$lines[0], ...array_map(fn (string $line): string => mb_strtolower(mb_substr($line, 0, 1)).mb_substr($line, 1), array_slice($lines, 1))]);
            }
        }

        return $choices;
    }

    private function xpath(string $html): DOMXPath
    {
        $document = new DOMDocument;
        $previous = libxml_use_internal_errors(true);
        $document->loadHTML('<?xml encoding="UTF-8"><div>'.$html.'</div>');
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        return new DOMXPath($document);
    }

    private function capitalize(string $text): string
    {
        return mb_strtoupper(mb_substr($text, 0, 1)).mb_substr($text, 1);
    }

    private function normalizeWhitespace(string $text): string
    {
        return trim((string) preg_replace('/\s+/u', ' ', $text));
    }
}

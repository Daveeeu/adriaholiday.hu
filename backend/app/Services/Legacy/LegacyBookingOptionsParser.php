<?php

namespace App\Services\Legacy;

use App\Support\Tour\TourExtraPriceUnit;
use DOMDocument;
use DOMElement;
use DOMXPath;

/**
 * Pure parser for the legacy site's per-date booking options
 * (`roundtrip/get_datas?offer_date_id=…`), which returns the departure place
 * <option>s and the extras ("felárak") block as HTML fragments inside JSON.
 *
 * An extra rendered checked + readonly is mandatory, except the single room
 * supplement (`data-name="single_bad"`): the legacy page only pre-ticks that
 * one for solo travellers, so it stays optional. A price shown in "Ft/fő" is
 * charged per passenger, a bare "Ft" once per booking.
 */
class LegacyBookingOptionsParser
{
    /**
     * @param  array<string, mixed>  $response  decoded get_datas JSON
     * @return array{departurePlaces: array<int, array{name: string, price: float|null}>, extras: array<int, array{name: string, price: float, price_unit: string, mandatory: bool}>}
     */
    public function parse(array $response): array
    {
        return [
            'departurePlaces' => $this->departurePlaces((string) ($response['felszallas_items'] ?? '')),
            'extras' => $this->extras((string) ($response['extra_prices_items'] ?? '')),
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
     * @return array<int, array{name: string, price: float, price_unit: string, mandatory: bool}>
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
                'mandatory' => $isLocked && ! $isSingleRoom,
            ];
        }

        return $extras;
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

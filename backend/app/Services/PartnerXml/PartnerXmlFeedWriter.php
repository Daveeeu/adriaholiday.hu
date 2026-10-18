<?php

namespace App\Services\PartnerXml;

use App\Support\PartnerXml\PartnerXmlSettings;
use XMLWriter;

/**
 * Writes a partner feed the way the legacy site wrote it, element for
 * element, so the partners' importers keep reading it:
 *
 * - Travelgate, Travelmax, Cesys: <tours>, each date's prices listed for
 *   every party of 1–6 adults and 0–3 children (Cesys: two adults only),
 *   item by item, with the amount for the whole party;
 * - General: <traveloffers>, one price per person and date.
 *
 * @phpstan-import-type FeedTour from PartnerXmlCatalog
 * @phpstan-import-type FeedDate from PartnerXmlCatalog
 */
final class PartnerXmlFeedWriter
{
    private const MAX_ADULTS = 6;

    private const MAX_CHILDREN = 3;

    private const CHILD_MAX_AGE = 12;

    /** The legacy general feed's fixed insurance note. */
    private const INSURANCE_NOTE = "<p><strong>+ a biztosítás díja!</strong><br />\n430/fő/nap<br />\n&nbsp;</p>\n";

    /** @var array{daily_fee: float, cancellation_percent: float} */
    private array $insurance;

    /**
     * @param  list<FeedTour>  $tours
     * @param  array{daily_fee: float, cancellation_percent: float}  $insurance
     */
    public function write(PartnerXmlFeed $feed, array $tours, array $insurance): string
    {
        $this->insurance = $insurance;
        $xml = new XMLWriter;
        $xml->openMemory();
        $xml->setIndent(true);
        $xml->setIndentString(' ');
        $xml->startDocument('1.0', 'UTF-8');

        if ($feed === PartnerXmlFeed::General) {
            $xml->startElement('traveloffers');
            foreach ($tours as $tour) {
                $this->travelOffer($xml, $tour);
            }
        } else {
            $xml->startElement('tours');
            foreach ($tours as $tour) {
                $this->tour($xml, $feed, $tour);
            }
        }

        $xml->endElement();
        $xml->endDocument();

        return $xml->outputMemory();
    }

    /**
     * @param  FeedTour  $tour
     */
    private function tour(XMLWriter $xml, PartnerXmlFeed $feed, array $tour): void
    {
        $types = $tour['settings']['travel_types'];

        $xml->startElement('tour');
        $xml->writeElement('tour_id', (string) $tour['id']);
        $xml->writeElement('tour_title', $tour['title']);

        [$categoryId, $categoryName] = match ($feed) {
            PartnerXmlFeed::Travelmax => [
                implode(';', $types['travelmax']),
                implode(';', array_map(fn (int $type): string => PartnerXmlSettings::travelTypeLabel('travelmax', $type), $types['travelmax'])),
            ],
            PartnerXmlFeed::Cesys => ['', PartnerXmlSettings::travelTypeLabel('cesys', $types['cesys'])],
            default => ['', PartnerXmlSettings::travelTypeLabel('travelgate', $types['travelgate'])],
        };
        $this->emptyElement($xml, 'tour_category', ['id' => $categoryId, 'name' => $categoryName]);
        $this->element($xml, 'hotelname', '', ['id' => '']);
        $this->element($xml, 'country', $tour['country_name'], ['id' => $tour['country_id']]);
        $this->element($xml, 'locality', '', ['id' => '']);
        $xml->writeElement('place', $tour['place']);

        if ($feed !== PartnerXmlFeed::Cesys) {
            $this->element($xml, 'accommodation', '', ['id' => '']);
        }

        $xml->startElement('description');
        foreach ($this->paragraphs($feed, $tour) as $name => $html) {
            $xml->startElement('paragraph');
            $xml->writeAttribute('id', '');
            $xml->writeAttribute('name', $name);
            $this->writeCdata($xml, $html);
            $xml->endElement();
        }
        $xml->endElement();

        $xml->writeElement('category', '');

        $xml->startElement('photos');
        foreach ($tour['photos'] as $photo) {
            $this->element($xml, 'photo', $photo['url'], ['type' => $photo['primary'] ? 'primary' : 'normal']);
        }
        $xml->endElement();

        foreach ($tour['dates'] as $date) {
            $this->travel($xml, $feed, $tour, $date);
        }

        $xml->endElement();
    }

    /**
     * @param  FeedTour  $tour
     * @param  FeedDate  $date
     */
    private function travel(XMLWriter $xml, PartnerXmlFeed $feed, array $tour, array $date): void
    {
        $xml->startElement('travel');
        $this->attributes($xml, [
            'id' => (string) $tour['id'],
            'start' => $date['start'],
            'end' => $date['end'],
            'day' => (string) $date['days'],
            'night' => (string) $date['nights'],
            'board_id' => '',
            'board_name' => $date['board'],
            ...($feed === PartnerXmlFeed::Cesys ? ['accommodation' => $date['cesys_accommodation']] : []),
        ]);

        $xml->startElement('hotelandroomgroup');
        $this->attributes($xml, ['name' => '', 'roomgroup_id' => '', 'status' => '1']);
        $xml->startElement('flight');
        $this->attributes($xml, ['type' => $date['transport'], 'id' => '', 'checkin' => '', 'start' => '', 'end' => '', 'from' => '', 'from_code' => '', 'to' => '', 'to_code' => '', 'status' => '']);

        $items = $this->feedPriceItems($feed, $date);

        if ($feed === PartnerXmlFeed::Cesys) {
            $this->roomType($xml, $date, $items, $date['cesys_room'] !== '' ? $date['cesys_room'] : 'Szállás nélkül', 2, 0);
        } else {
            for ($adults = 1; $adults <= self::MAX_ADULTS; $adults++) {
                for ($children = 0; $children <= self::MAX_CHILDREN; $children++) {
                    $this->roomType($xml, $date, $items, $date['accommodation'], $adults, $children);
                }
            }
        }

        $xml->endElement();
        $xml->endElement();
        $xml->endElement();
    }

    /**
     * The price items a feed lists for a date: the date's own, with the
     * Travelgate feed's resort fee optional, and Travelmax's travel insurance
     * (per person and day) right after the base price and resort fees.
     *
     * @param  FeedDate  $date
     * @return list<array{name: string, mandatory: bool, per_booking: bool, per_day: bool, currency: string, unit: string, price: float, storno: float|null}>
     */
    private function feedPriceItems(PartnerXmlFeed $feed, array $date): array
    {
        $items = [];

        foreach ($date['price_items'] as $item) {
            if ($item['kind'] === PartnerXmlCatalog::BASE && $date['sale_price'] !== null && $feed !== PartnerXmlFeed::Travelgate) {
                // A discounted date: Travelmax lists the sale price after the list price, Cesys instead of it.
                if ($feed === PartnerXmlFeed::Travelmax) {
                    $items[] = $this->item($item, $item['name'], true, $item['price']);
                }

                $items[] = $this->item($item, 'Akciós ár', $feed === PartnerXmlFeed::Cesys, $date['sale_price']);

                continue;
            }

            $items[] = [
                'name' => $item['name'],
                'mandatory' => $item['kind'] === PartnerXmlCatalog::RESORT_FEE ? $feed !== PartnerXmlFeed::Travelgate : $item['mandatory'],
                'per_booking' => $item['per_booking'],
                'per_day' => false,
                'currency' => $item['currency'],
                'unit' => $item['unit'],
                'price' => $item['price'],
                'storno' => null,
            ];
        }

        if ($feed === PartnerXmlFeed::Travelmax) {
            $leading = count(array_filter($date['price_items'], fn (array $item): bool => in_array($item['kind'], [PartnerXmlCatalog::BASE, PartnerXmlCatalog::RESORT_FEE], true)))
                + ($date['sale_price'] !== null ? 1 : 0);

            array_splice($items, $leading, 0, [[
                'name' => 'Utasbiztosítás',
                'mandatory' => false,
                'per_booking' => false,
                'per_day' => true,
                'currency' => 'Ft',
                'unit' => 'fő/nap',
                'price' => $this->insurance['daily_fee'],
                'storno' => 0.0,
            ]]);
        }

        return $items;
    }

    /**
     * @param  array<string, mixed>  $item  a catalog price item
     * @return array{name: string, mandatory: bool, per_booking: bool, per_day: bool, currency: string, unit: string, price: float, storno: float|null}
     */
    private function item(array $item, string $name, bool $mandatory, float $price): array
    {
        return [
            'name' => $name,
            'mandatory' => $mandatory,
            'per_booking' => $item['per_booking'],
            'per_day' => false,
            'currency' => $item['currency'],
            'unit' => $item['unit'],
            'price' => $price,
            'storno' => null,
        ];
    }

    /**
     * One party's prices for a date, each for the whole party.
     *
     * @param  FeedDate  $date
     * @param  list<array{name: string, mandatory: bool, per_booking: bool, per_day: bool, currency: string, unit: string, price: float, storno: float|null}>  $items
     */
    private function roomType(XMLWriter $xml, array $date, array $items, string $name, int $adults, int $children): void
    {
        $persons = $adults + $children;

        $xml->startElement('roomtype');
        $this->attributes($xml, [
            'name' => $name,
            'standard' => '',
            'id' => '',
            'adult' => (string) $adults,
            'child1' => (string) $children,
            'child1from' => '0',
            'child1to' => (string) self::CHILD_MAX_AGE,
            'child2' => '', 'child2from' => '', 'child2to' => '',
            'child3' => '', 'child3from' => '', 'child3to' => '',
        ]);

        foreach ($items as $item) {
            $amount = match (true) {
                $item['per_booking'] => 1,
                $item['per_day'] => $persons * $date['days'],
                default => $persons,
            };

            $this->price($xml, $item['name'], $item['mandatory'], $amount, $item['currency'], $item['unit'], $item['price'], $item['storno']);
        }

        $xml->endElement();
    }

    private function price(XMLWriter $xml, string $name, bool $mandatory, int $amount, string $currency, string $unit, float $price, ?float $storno = null): void
    {
        $value = $this->number($price);

        $xml->startElement('price');
        $this->attributes($xml, [
            'typeid' => '',
            'name' => $name,
            'mandatory' => $mandatory ? '1' : '0',
            'standard' => '',
            'amount' => (string) $amount,
            'currency' => $currency,
            'agefrom' => '0',
            'ageto' => '100',
            'unit' => $unit,
            // The cancellation insurance's percentage of the forint prices.
            'storno' => $this->number($storno ?? ($currency === 'Ft' ? $this->insurance['cancellation_percent'] : 0.0)),
            'price_type' => '',
            'catalogueprice' => $value,
        ]);
        $xml->text($value);
        $xml->endElement();
    }

    /**
     * @param  FeedTour  $tour
     */
    private function travelOffer(XMLWriter $xml, array $tour): void
    {
        $settings = $tour['settings'];
        $type = $settings['travel_types']['general'];
        [$boardId, $boardName] = $this->board($tour['catering']);

        $xml->startElement('traveloffer');
        $xml->writeElement('id', (string) $tour['id']);
        $this->cdata($xml, 'travel_name', $tour['title']);

        $xml->startElement('destination');
        $this->cdata($xml, 'country', $tour['country_name'], ['id' => $tour['country_id']]);
        $this->cdata($xml, 'city', (string) ($settings['city'] ?? ''));
        $xml->endElement();

        $this->cdata($xml, 'accommodation', (string) ($settings['accommodation_name'] ?? ''), ['stars' => $this->stars($tour['accommodation']), 'type' => '']);
        $this->cdata($xml, 'travel_type', PartnerXmlSettings::travelTypeLabel('general', $type), ['id' => (string) ($type ?? 0)]);
        $this->cdata($xml, 'traffic', '');
        $this->cdata($xml, 'board', $boardName, ['id' => $boardId]);

        $xml->startElement('gallery');
        foreach ($tour['photos'] as $photo) {
            $xml->writeElement('file', $photo['url']);
        }
        $xml->endElement();

        $xml->startElement('descriptions');
        foreach ($this->paragraphs(PartnerXmlFeed::General, $tour) as $name => $html) {
            $this->cdata($xml, 'description', $html, ['name' => $name]);
        }
        $xml->endElement();

        $xml->startElement('prices');
        $xml->writeElement('insurance', self::INSURANCE_NOTE);
        $xml->writeElement('insurance_value', (string) ($settings['insurance_value'] ?? 0));
        foreach ($tour['dates'] as $date) {
            $xml->startElement('datas');
            $xml->writeAttribute('id', (string) $date['id']);
            $xml->writeElement('fromdate', $date['start']);
            $xml->writeElement('todate', $date['end']);
            $xml->writeElement('price', $this->number($date['price']));
            $xml->writeElement('sale_price', $date['sale_price'] !== null ? $this->number($date['sale_price']) : '0');
            $xml->writeElement('currency', $date['currency']);
            $xml->writeElement('price_type', $date['currency'].'/fő');
            $xml->writeElement('description', $date['label']);
            $xml->endElement();
        }
        $xml->endElement();

        $xml->endElement();
    }

    /**
     * The description blocks each feed lists, in its order.
     *
     * @param  FeedTour  $tour
     * @return array<string, string>
     */
    private function paragraphs(PartnerXmlFeed $feed, array $tour): array
    {
        $paragraphs = [
            'A program' => $tour['program'],
            'fakultatív program' => $tour['optional_programs'],
            'belépők' => $tour['tickets'],
            'leírás' => $tour['description'],
        ];

        return match ($feed) {
            PartnerXmlFeed::Travelmax => [...$paragraphs, 'szállás leírás' => (string) ($tour['settings']['accommodation_description_travelmax'] ?? '')],
            PartnerXmlFeed::General => [...$paragraphs, 'elhelyezés' => ''],
            default => $paragraphs,
        };
    }

    /**
     * The general feed's board, read from the tour's meals.
     *
     * @return array{0: string, 1: string}
     */
    private function board(string $catering): array
    {
        $catering = mb_strtolower($catering);

        return match (true) {
            $catering === '' => ['', ''],
            str_contains($catering, 'teljes') => ['4', 'Teljes panzió'],
            str_contains($catering, 'félpanzió') => ['3', 'Félpanzió'],
            str_contains($catering, 'önellátás') => ['1', 'Önellátás'],
            str_contains($catering, 'reggeli') => ['2', 'Reggeli'],
            default => ['0', ''],
        };
    }

    /**
     * Stars of an accommodation written "Hotel***" ("" when it gives none).
     */
    private function stars(string $accommodation): string
    {
        $stars = min(5, substr_count($accommodation, '*'));

        return $stars > 0 ? (string) $stars : '';
    }

    private function number(float $value): string
    {
        return rtrim(rtrim(number_format($value, 2, '.', ''), '0'), '.');
    }

    /**
     * @param  array<string, string>  $attributes
     */
    private function element(XMLWriter $xml, string $name, string $text, array $attributes): void
    {
        $xml->startElement($name);
        $this->attributes($xml, $attributes);
        $xml->text($text);
        $xml->endElement();
    }

    /**
     * @param  array<string, string>  $attributes
     */
    private function emptyElement(XMLWriter $xml, string $name, array $attributes): void
    {
        $xml->startElement($name);
        $this->attributes($xml, $attributes);
        $xml->endElement();
    }

    /**
     * @param  array<string, string>  $attributes
     */
    private function cdata(XMLWriter $xml, string $name, string $text, array $attributes = []): void
    {
        $xml->startElement($name);
        $this->attributes($xml, $attributes);
        $this->writeCdata($xml, $text);
        $xml->endElement();
    }

    /**
     * A CDATA section; a "]]>" in the text is split across two sections.
     */
    private function writeCdata(XMLWriter $xml, string $text): void
    {
        $xml->writeCdata(str_replace(']]>', ']]]]><![CDATA[>', $text));
    }

    /**
     * @param  array<string, string>  $attributes
     */
    private function attributes(XMLWriter $xml, array $attributes): void
    {
        foreach ($attributes as $name => $value) {
            $xml->writeAttribute($name, $value);
        }
    }
}

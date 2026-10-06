<?php

use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Repairs tours imported from the legacy adriaholiday.hu site before the importer
 * discovered every tour group and split single-line program days:
 *  - the offers of the legacy "ADVENTI barangolások" group get that category too;
 *  - program days whose whole text ended up in the title (or whose title is empty,
 *    which the admin cannot save) get "N. nap" as title and that text as description.
 */
return new class extends Migration
{
    private const ADVENT_CATEGORY_CODE = 'adventi-barangolasok';

    private const ADVENT_CATEGORY_NAME = 'Adventi barangolások';

    private const PROGRAM_DAY_TITLE_MAX_LENGTH = 255;

    /**
     * Seo names of the offers listed in the legacy advent group (October 2026).
     */
    private const LEGACY_ADVENT_SEO_NAMES = [
        'advent-a-becsi-alpokban',
        'advent-a-julia-alpokban-szloveniaban-',
        'advent-krakkoban-es-zakopaneban-2-nap',
        'advent-pragaban-2-nap-1-ej-',
        'advent-zakopaneban-1-nap',
        'advent-zakopaneban-2-nap-',
        'adventi-ekszerdoboz-cesky-krumlov-es-pozsony-fenyeivel',
        'brno-adventi-fenyei-es-schloss-hof-',
        'hallstatt-es-salzburg-az-adventi-fenyekben',
        'hallstatt-es-salzburg-unnepi-fenyekben-',
        'reneszansz-advent-toszkanaban-',
        'zagrab-europa-legszebb-karacsonyi-vasara-2-nap1-ej',
    ];

    public function up(): void
    {
        $this->assignAdventCategory();
        $this->repairProgramDayTitles();

        PublicContentCache::bump(PublicContentCache::OFFERS, PublicContentCache::PORTFOLIO_FILTERS);
    }

    public function down(): void
    {
        // Data repair only: the previous, broken state is not worth restoring.
    }

    private function assignAdventCategory(): void
    {
        $tours = DB::table('tours')
            ->whereIn('seo_name', self::LEGACY_ADVENT_SEO_NAMES)
            ->get(['id', 'category_ids']);

        if ($tours->isEmpty()) {
            return;
        }

        $exists = DB::table('tour_reference_options')
            ->where('type', 'category')
            ->where('code', self::ADVENT_CATEGORY_CODE)
            ->exists();

        if (! $exists) {
            DB::table('tour_reference_options')->insert([
                'type' => 'category',
                'code' => self::ADVENT_CATEGORY_CODE,
                'name' => self::ADVENT_CATEGORY_NAME,
                'active' => true,
                'sort_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        foreach ($tours as $tour) {
            $categories = json_decode((string) $tour->category_ids, true) ?: [];

            if (in_array(self::ADVENT_CATEGORY_CODE, $categories, true)) {
                continue;
            }

            DB::table('tours')->where('id', $tour->id)->update([
                'category_ids' => json_encode([...$categories, self::ADVENT_CATEGORY_CODE]),
            ]);
        }
    }

    private function repairProgramDayTitles(): void
    {
        DB::table('tour_program_days')
            ->orderBy('id')
            ->get(['id', 'day_number', 'title', 'description'])
            ->filter(fn (object $day): bool => trim((string) $day->title) === ''
                || mb_strlen((string) $day->title) > self::PROGRAM_DAY_TITLE_MAX_LENGTH)
            ->each(function (object $day): void {
                $description = trim((string) $day->description);
                $text = trim((string) $day->title);

                DB::table('tour_program_days')->where('id', $day->id)->update([
                    'title' => "{$day->day_number}. nap",
                    'description' => trim($text.($description !== '' ? ' '.$description : '')),
                ]);
            });
    }
};

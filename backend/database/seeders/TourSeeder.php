<?php

namespace Database\Seeders;

use App\Models\Region;
use App\Models\Tour;
use App\Models\TourDeparturePlace;
use App\Models\TourRegionGroup;
use App\Models\TourSeasonalGroup;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class TourSeeder extends Seeder
{
    public function run(): void
    {
        $regions = Region::query()->orderBy('id')->get()->values();
        $regionGroups = TourRegionGroup::query()->orderBy('id')->get()->values();
        $seasonalGroups = TourSeasonalGroup::query()->orderBy('id')->get()->values();
        $departurePlaces = TourDeparturePlace::query()->orderBy('id')->get()->values();

        $tourTitles = [
            'Bibione családi körutazás',
            'Lignano tengerparti pihenés',
            'Caorle nyári ajánlat',
            'Jesolo hétvégi kikapcsolódás',
            'Sarti tengerparti utazás',
            'Nei Pori családi nyaralás',
            'Paralia kényelmes apartman csomag',
            'Hanioti mediterrán pihenés',
            'Budva városi és tengerparti élmény',
            'Petrovac nyugodt üdülés',
            'Ulcinj hosszú strandos ajánlat',
            'Bar tengerparti kikapcsolódás',
            'Rovinj romantikus utazás',
            'Poreč kényelmes szállás',
            'Crikvenica családi hét',
            'Makarska Riviera ajánlat',
            'Napospart all inclusive út',
            'Aranyhomok tengerparti csomag',
            'Neszebár kulturális és strandos hét',
            'Szozopol mediterrán utazás',
        ];

        foreach (range(1, 50) as $i) {
            $region = $regions[($i - 1) % $regions->count()];
            $group = $regionGroups[($i - 1) % $regionGroups->count()];
            $seasonalGroup = $seasonalGroups[($i - 1) % $seasonalGroups->count()];
            $title = $tourTitles[($i - 1) % count($tourTitles)];
            $slug = Str::slug($title).'-'.$i;

            $tour = Tour::query()->updateOrCreate(
                ['seo_name' => $slug],
                [
                    'sort_order' => $i,
                    'active' => true,
                    'featured' => $i <= 10,
                    'recommended' => $i % 3 === 0,
                    'partner_offer' => $i % 4 === 0,
                    'image_offer' => $i % 2 === 0,
                    'xml_enabled' => $i % 5 !== 0,
                    'slider_image_enabled' => $i % 2 === 0,
                    'slider_text_enabled' => $i % 3 === 0,
                    'name' => $title,
                    'seo_auto_generate' => true,
                    'action1' => 'Kedvezményes ajánlat',
                    'action2' => 'Ingyenes lemondás',
                    'list_description' => "{$title} rövid összefoglaló.",
                    'short_description' => "{$title} bemutatása.",
                    'program_pdf_path' => null,
                    'program_pdf_file' => Str::slug($title).'.pdf',
                    'slider_image' => null,
                    'program_before' => "{$title} indulás előtti tudnivalók.",
                    'program' => "{$title} részletes program.",
                    'inclusions' => "{$title} tartalmazza a szállást és az alap ellátást.",
                    'payment_program' => 'Előleg és végszámla fizetése.',
                    'prices' => 'Árak szezon szerint.',
                    'discounts' => 'Korai foglalási kedvezmény.',
                    'notes' => 'Kiemelt admin demo adat.',
                    'region_id' => $region->id,
                    'group_id' => $group->seo_name,
                    'seasonal_group_id' => $seasonalGroup->seo_name,
                    'fit_id' => 'fit-'.(($i % 4) + 1),
                    'program_type_id' => 'program-type-'.(($i % 4) + 1),
                    'travel_mode_id' => 'travel-mode-'.(($i % 4) + 1),
                    'difficulty_id' => 'difficulty-'.(($i % 4) + 1),
                    'country_ids' => ['hu', 'hr'],
                    'tag_ids' => ['family', 'sea'],
                    'category_ids' => ['classic'],
                    'price' => 100 + ($i * 10),
                    'displayed_price' => (100 + ($i * 10)).' EUR',
                    'slider_text' => "{$title} kiemelt ajánlat.",
                ],
            );

            $dateCount = 2 + ($i % 3);
            $tour->dates()->withTrashed()->get()->each->forceDelete();
            for ($d = 1; $d <= $dateCount; $d++) {
                $start = now()->addMonths($d)->addDays($i);
                $tour->dates()->create([
                    'start_date' => $start->toDateString(),
                    'end_date' => $start->copy()->addDays(6 + $d)->toDateString(),
                    'price' => 100 + ($i * 10) + ($d * 25),
                    'status' => $d === 1 ? 'planned' : 'available',
                ]);
            }

            $bonusCount = 1 + ($i % 3);
            $tour->partnerBonuses()->withTrashed()->get()->each->forceDelete();
            for ($b = 1; $b <= $bonusCount; $b++) {
                $tour->partnerBonuses()->create([
                    'sort_order' => $b,
                    'label' => 'Bónusz '. $b,
                    'value' => 'Érték '. $b,
                ]);
            }

            $placeIds = Arr::wrap($departurePlaces->random(min(4, max(1, $departurePlaces->count())))->pluck('id')->all());
            $tour->departurePlaces()->sync($placeIds);
        }
    }
}

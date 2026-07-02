<?php

namespace Database\Seeders;

use App\Models\BlogTag;
use App\Models\BlogTagTranslation;
use App\Models\PortfolioFilterChip;
use App\Models\TourReferenceOption;
use Illuminate\Database\Seeder;
use RuntimeException;

class PortfolioFilterChipSeeder extends Seeder
{
    public function run(): void
    {
        $this->ensureTravelModeExists('bus');
        $this->ensureTravelModeExists('plane');

        $this->ensureThemeTag('Tengerpart');
        $this->ensureThemeTag('Városnézés');
        $this->ensureThemeTag('Természet');
        $this->ensureThemeTag('Meleg úti célok');

        $chips = [
            [
                'label' => 'Buszos utak',
                'slug' => 'buszos-utak',
                'icon' => 'bus',
                'scope_type' => 'global',
                'scope_value' => null,
                'filter_type' => 'travel_mode',
                'filter_value' => 'bus',
                'filter_config' => null,
                'sort_order' => 10,
                'active' => true,
                'hide_when_zero' => true,
            ],
            [
                'label' => 'Repülős utak',
                'slug' => 'repulos-utak',
                'icon' => 'plane',
                'scope_type' => 'global',
                'scope_value' => null,
                'filter_type' => 'travel_mode',
                'filter_value' => 'plane',
                'filter_config' => null,
                'sort_order' => 20,
                'active' => true,
                'hide_when_zero' => true,
            ],
            [
                'label' => 'Tengerpart',
                'slug' => 'tengerpart',
                'icon' => 'waves',
                'scope_type' => 'global',
                'scope_value' => null,
                'filter_type' => 'theme',
                'filter_value' => 'tengerpart',
                'filter_config' => null,
                'sort_order' => 30,
                'active' => true,
                'hide_when_zero' => true,
            ],
            [
                'label' => 'Városnézés',
                'slug' => 'varosnezes',
                'icon' => 'building',
                'scope_type' => 'global',
                'scope_value' => null,
                'filter_type' => 'theme',
                'filter_value' => 'varosnezes',
                'filter_config' => null,
                'sort_order' => 40,
                'active' => true,
                'hide_when_zero' => true,
            ],
            [
                'label' => 'Természet',
                'slug' => 'termeszet',
                'icon' => 'tree',
                'scope_type' => 'global',
                'scope_value' => null,
                'filter_type' => 'theme',
                'filter_value' => 'termeszet',
                'filter_config' => null,
                'sort_order' => 50,
                'active' => true,
                'hide_when_zero' => true,
            ],
            [
                'label' => 'Meleg úti célok',
                'slug' => 'meleg-uti-celok',
                'icon' => 'sun',
                'scope_type' => 'global',
                'scope_value' => null,
                'filter_type' => 'theme',
                'filter_value' => 'meleg-uti-celok',
                'filter_config' => null,
                'sort_order' => 60,
                'active' => true,
                'hide_when_zero' => true,
            ],
            [
                'label' => 'Kedvező ár',
                'slug' => 'kedvezo-ar',
                'icon' => 'tag',
                'scope_type' => 'global',
                'scope_value' => null,
                'filter_type' => 'price',
                'filter_value' => null,
                'filter_config' => ['max' => 200000],
                'sort_order' => 70,
                'active' => true,
                'hide_when_zero' => true,
            ],
        ];

        foreach ($chips as $chip) {
            PortfolioFilterChip::query()->updateOrCreate(
                ['slug' => $chip['slug']],
                $chip,
            );
        }
    }

    private function ensureThemeTag(string $name): string
    {
        $existing = BlogTagTranslation::query()
            ->where('locale', 'hu')
            ->where('name', $name)
            ->first();

        if ($existing) {
            return (string) $existing->blog_tag_id;
        }

        $tag = BlogTag::query()->create([
            'active' => true,
            'sort_order' => ((int) BlogTag::query()->max('sort_order')) + 1,
        ]);

        foreach (['hu', 'en', 'de'] as $locale) {
            BlogTagTranslation::query()->updateOrCreate(
                ['blog_tag_id' => $tag->id, 'locale' => $locale],
                ['name' => $locale === 'hu' ? $name : $name.' '.strtoupper($locale)],
            );
        }

        return (string) $tag->id;
    }

    private function ensureTravelModeExists(string $code): void
    {
        $exists = TourReferenceOption::query()
            ->where('type', 'travel-mode')
            ->where('code', $code)
            ->exists();

        if (! $exists) {
            throw new RuntimeException("Hiányzik a travel mode referencia opció: {$code}");
        }
    }
}

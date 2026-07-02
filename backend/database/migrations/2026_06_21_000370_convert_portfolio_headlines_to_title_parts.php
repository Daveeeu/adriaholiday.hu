<?php

use App\Models\PortfolioContentBlock;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    private function headingValue(array $parts): array
    {
        return [
            'titleParts' => array_map(
                fn (array $part) => [
                    'text' => $part['text'],
                    'variant' => $part['variant'] ?? 'default',
                ],
                $parts,
            ),
        ];
    }

    private function legacyHeadingValue(array $parts): string
    {
        return trim(implode(' ', array_map(
            static fn (array $part) => $part['text'],
            $parts,
        )));
    }

    private function upsertHeading(string $key, string $label, array $parts, ?PortfolioContentBlock $source = null): void
    {
        PortfolioContentBlock::query()->updateOrCreate(
            ['key' => $key],
            [
                'page' => $source?->page ?? 'home',
                'section' => $source?->section ?? explode('.', $key)[1] ?? 'home',
                'label' => $label,
                'type' => 'json',
                'locale' => $source?->locale ?? 'hu',
                'value' => null,
                'value_json' => $this->headingValue($parts),
                'draft_value' => null,
                'draft_value_json' => $this->headingValue($parts),
                'is_published' => $source?->is_published ?? true,
                'updated_by' => $source?->updated_by,
            ],
        );
    }

    private function moveHeading(string $fromKey, string $toKey, string $label, array $parts): void
    {
        $source = PortfolioContentBlock::query()->where('key', $fromKey)->first();

        $this->upsertHeading($toKey, $label, $parts, $source);

        if ($source) {
            $source->delete();
        }
    }

    public function up(): void
    {
        $mappings = [
            ['from' => 'home.hero.title', 'to' => 'home.hero.titleParts', 'label' => 'Hero főcím', 'parts' => [
                ['text' => 'Buszos utak,'],
                ['text' => 'amikre'],
                ['text' => 'emlékezni fogsz', 'variant' => 'gradient'],
            ]],
            ['from' => 'home.categories.title', 'to' => 'home.categories.titleParts', 'label' => 'Kategória cím', 'parts' => [
                ['text' => 'Fedezd fel'],
                ['text' => 'kedvenc úti célod', 'variant' => 'gradient'],
            ]],
            ['from' => 'home.story.title', 'to' => 'home.story.titleParts', 'label' => 'Story cím', 'parts' => [
                ['text' => 'Közös naplementék.'],
                ['text' => 'Új élmények.', 'variant' => 'gradient'],
                ['text' => 'Emlékek egy életre.'],
            ]],
            ['from' => 'home.experience.title', 'to' => 'home.experience.titleParts', 'label' => 'Experience cím', 'parts' => [
                ['text' => 'Élményeket adunk,'],
                ['text' => 'amikre évek múlva is', 'variant' => 'gradient'],
                ['text' => 'emlékezni fogsz'],
            ]],
            ['from' => 'home.experience.overlay.title', 'to' => 'home.experience.overlay.titleParts', 'label' => 'Experience overlay cím', 'parts' => [
                ['text' => 'Smaragdzöld víz'],
                ['text' => 'és mediterrán szigetek', 'variant' => 'gradient'],
            ]],
            ['from' => 'home.whyChooseUs.title', 'to' => 'home.whyChooseUs.titleParts', 'label' => 'Why choose us cím', 'parts' => [
                ['text' => 'Miért utazz'],
                ['text' => 'velünk?', 'variant' => 'gradient'],
            ]],
            ['from' => 'home.blog.title', 'to' => 'home.blog.titleParts', 'label' => 'Blog cím', 'parts' => [
                ['text' => 'Utazó'],
                ['text' => 'Blog', 'variant' => 'gradient'],
            ]],
            ['from' => 'home.blog.tip.title', 'to' => 'home.blog.tip.titleParts', 'label' => 'Blog tipp cím', 'parts' => [
                ['text' => 'Utazás előtt'],
                ['text' => '5 perc inspiráció is elég.', 'variant' => 'gradient'],
            ]],
            ['from' => 'home.howItWorks.title', 'to' => 'home.howItWorks.titleParts', 'label' => 'How it works cím', 'parts' => [
                ['text' => 'Hogyan'],
                ['text' => 'zajlik?', 'variant' => 'gradient'],
            ]],
            ['from' => 'home.faq.title', 'to' => 'home.faq.titleParts', 'label' => 'FAQ cím', 'parts' => [
                ['text' => 'Gyakran ismételt'],
                ['text' => 'kérdések', 'variant' => 'gradient'],
            ]],
            ['from' => 'home.faq.helpTitle', 'to' => 'home.faq.helpTitleParts', 'label' => 'FAQ segítő cím', 'parts' => [
                ['text' => 'Kérdésed van'],
                ['text' => 'az utazás előtt?', 'variant' => 'gradient'],
            ]],
            ['from' => 'home.newsletter.title', 'to' => 'home.newsletter.titleParts', 'label' => 'Newsletter cím', 'parts' => [
                ['text' => 'Ne maradj le'],
                ['text' => 'a következő élményről!', 'variant' => 'gradient'],
            ]],
        ];

        foreach ($mappings as $mapping) {
            $this->moveHeading($mapping['from'], $mapping['to'], $mapping['label'], $mapping['parts']);
        }

        $this->upsertHeading('home.trust.titleParts', 'Trust címsor', [
            ['text' => 'Mit mondanak'],
            ['text' => 'utasaink?', 'variant' => 'gradient'],
        ]);

        $this->upsertHeading('home.footer.titleParts', 'Footer cím', [
            ['text' => 'Adria', 'variant' => 'gradient'],
            ['text' => 'Holiday'],
        ]);
    }

    public function down(): void
    {
        $mappings = [
            ['from' => 'home.hero.titleParts', 'to' => 'home.hero.title', 'label' => 'Hero főcím'],
            ['from' => 'home.categories.titleParts', 'to' => 'home.categories.title', 'label' => 'Kategória cím'],
            ['from' => 'home.story.titleParts', 'to' => 'home.story.title', 'label' => 'Story cím'],
            ['from' => 'home.experience.titleParts', 'to' => 'home.experience.title', 'label' => 'Experience cím'],
            ['from' => 'home.experience.overlay.titleParts', 'to' => 'home.experience.overlay.title', 'label' => 'Experience overlay cím'],
            ['from' => 'home.whyChooseUs.titleParts', 'to' => 'home.whyChooseUs.title', 'label' => 'Why choose us cím'],
            ['from' => 'home.blog.titleParts', 'to' => 'home.blog.title', 'label' => 'Blog cím'],
            ['from' => 'home.blog.tip.titleParts', 'to' => 'home.blog.tip.title', 'label' => 'Blog tipp cím'],
            ['from' => 'home.howItWorks.titleParts', 'to' => 'home.howItWorks.title', 'label' => 'How it works cím'],
            ['from' => 'home.faq.titleParts', 'to' => 'home.faq.title', 'label' => 'FAQ cím'],
            ['from' => 'home.faq.helpTitleParts', 'to' => 'home.faq.helpTitle', 'label' => 'FAQ segítő cím'],
            ['from' => 'home.newsletter.titleParts', 'to' => 'home.newsletter.title', 'label' => 'Newsletter cím'],
        ];

        foreach ($mappings as $mapping) {
            $source = PortfolioContentBlock::query()->where('key', $mapping['from'])->first();
            $parts = [];

            if ($source) {
                $rawParts = $source->value_json['titleParts'] ?? $source->draft_value_json['titleParts'] ?? [];
                if (is_array($rawParts)) {
                    $parts = $rawParts;
                }
            }

            PortfolioContentBlock::query()->updateOrCreate(
                ['key' => $mapping['to']],
                [
                    'page' => $source?->page ?? 'home',
                    'section' => $source?->section ?? explode('.', $mapping['to'])[1] ?? 'home',
                    'label' => $mapping['label'],
                    'type' => 'text',
                    'locale' => $source?->locale ?? 'hu',
                    'value' => $this->legacyHeadingValue($parts),
                    'value_json' => null,
                    'draft_value' => null,
                    'draft_value_json' => null,
                    'is_published' => $source?->is_published ?? true,
                    'updated_by' => $source?->updated_by,
                ],
            );

            if ($source) {
                $source->delete();
            }
        }

        PortfolioContentBlock::query()->where('key', 'home.trust.titleParts')->delete();
        PortfolioContentBlock::query()->where('key', 'home.footer.titleParts')->delete();
    }
};

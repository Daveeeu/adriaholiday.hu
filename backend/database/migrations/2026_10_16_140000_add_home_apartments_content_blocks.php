<?php

use App\Models\PortfolioContentBlock;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;

/**
 * The texts of the home page's apartment section, editable like the other
 * home page sections. Existing blocks (edited in the admin) are left alone.
 */
return new class extends Migration
{
    /**
     * @return list<array<string, mixed>>
     */
    private function blocks(): array
    {
        return [
            ['key' => 'home.apartments.eyebrow', 'label' => 'Apartmanok előtag', 'type' => 'text', 'value' => 'APARTMANOK', 'value_json' => null],
            ['key' => 'home.apartments.titleParts', 'label' => 'Apartmanok cím', 'type' => 'json', 'value' => null, 'value_json' => ['titleParts' => [
                ['text' => 'Saját apartman', 'variant' => 'default'],
                ['text' => 'a tengerparton', 'variant' => 'gradient'],
            ]]],
            ['key' => 'home.apartments.description', 'label' => 'Apartmanok leírás', 'type' => 'textarea', 'value' => 'Apartmanok, villák és rezidenciák a tengerpart közelében, családoknak és baráti társaságoknak. Válaszd ki a kedvencedet, a foglalásodat kollégáink visszaigazolják.', 'value_json' => null],
        ];
    }

    public function up(): void
    {
        foreach ($this->blocks() as $block) {
            PortfolioContentBlock::query()->firstOrCreate(
                ['key' => $block['key']],
                [
                    'page' => 'home',
                    'section' => 'apartments',
                    'label' => $block['label'],
                    'type' => $block['type'],
                    'locale' => 'hu',
                    'value' => $block['value'],
                    'value_json' => $block['value_json'],
                    'is_published' => true,
                ],
            );
        }

        PublicContentCache::bump(PublicContentCache::HOMEPAGE_CONTENT);
    }

    public function down(): void
    {
        PortfolioContentBlock::query()
            ->whereIn('key', array_column($this->blocks(), 'key'))
            ->get()
            ->each(static fn (PortfolioContentBlock $block) => $block->forceDelete());
    }
};

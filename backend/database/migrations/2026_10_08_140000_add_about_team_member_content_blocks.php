<?php

use App\Models\PortfolioContentBlock;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    private const PAGE = 'about';

    private const MEMBERS = [
        'Szakálos Zsanett',
        'Tóth-Mátyás Bettina',
        'Csele Aliz Kamilla',
        'Sziman Zita',
        'Lengyel Edit',
        'Kovács Eszter',
    ];

    /**
     * The team list and one portrait field per member, matching the About page's six slots.
     */
    private function blocks(): array
    {
        $blocks = [[
            'key' => 'about.team.members',
            'label' => 'Csapattagok',
            'type' => 'json',
            'value_json' => array_map(static fn (string $name) => ['name' => $name, 'role' => ''], self::MEMBERS),
        ]];

        foreach (self::MEMBERS as $index => $name) {
            $position = $index + 1;
            $blocks[] = [
                'key' => "about.team.member.{$position}.image",
                'label' => "{$position}. csapattag fotója",
                'type' => 'image',
                'value_json' => ['alt' => $name, 'title' => $name],
            ];
        }

        return $blocks;
    }

    public function up(): void
    {
        foreach ($this->blocks() as $block) {
            PortfolioContentBlock::query()->firstOrCreate(
                ['key' => $block['key']],
                [
                    'page' => self::PAGE,
                    'section' => 'team',
                    'label' => $block['label'],
                    'type' => $block['type'],
                    'locale' => 'hu',
                    'value_json' => $block['value_json'],
                    'is_published' => true,
                ],
            );
        }
    }

    public function down(): void
    {
        PortfolioContentBlock::query()
            ->whereIn('key', array_column($this->blocks(), 'key'))
            ->get()
            ->each(static fn (PortfolioContentBlock $block) => $block->forceDelete());
    }
};

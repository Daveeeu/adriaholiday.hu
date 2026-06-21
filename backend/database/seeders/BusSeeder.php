<?php

namespace Database\Seeders;

use App\Models\Bus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BusSeeder extends Seeder
{
    public function run(): void
    {
        $buses = [
            'Setra S 515 HD',
            'Mercedes Tourismo 16 RHD',
            'Neoplan Cityliner',
            'Scania Irizar i6',
            'MAN Lion\'s Coach',
            'Volvo 9700',
            'VDL Futura',
            'Solaris InterUrbino',
            'Iveco Evadys',
            'Irizar i8',
        ];

        foreach ($buses as $index => $name) {
            $bus = Bus::query()->updateOrCreate(
                ['vehicle_code' => 'BUS-'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT)],
                [
                    'active' => true,
                    'sort_order' => $index + 1,
                ],
            );

            foreach (['hu', 'en', 'de'] as $locale) {
                $bus->translations()->updateOrCreate(
                    ['locale' => $locale],
                    [
                        'name' => $locale === 'hu' ? $name : $name.' '.strtoupper($locale),
                        'seo_name' => Str::slug($name).($locale === 'hu' ? '' : '-'.$locale),
                        'seo_auto_generate' => true,
                    ],
                );
            }
        }
    }
}

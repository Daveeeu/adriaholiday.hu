<?php

namespace Database\Seeders;

use App\Models\TourPartnerOffer;
use Illuminate\Database\Seeder;

class TourPartnerOfferSeeder extends Seeder
{
    public function run(): void
    {
        $offers = [
            'Bibione családi ajánlat',
            'Sarti tengerparti hét',
            'Budva hosszú hétvége',
            'Napospart all inclusive partner ajánlat',
            'Rovinj romantikus csomag',
            'Nei Pori nyári ajánlat',
            'Caorle hétvégi pihenés',
            'Lignano kényelmes utazás',
            'Makarska Riviera partner csomag',
            'Paralia családi ajánlat',
            'Petrovac nyugodt üdülés',
            'Jesolo nyári partner csomag',
            'Neszebár kulturális út',
            'Ulcinj strandos ajánlat',
            'Hanioti mediterrán csomag',
            'Crikvenica riviéra ajánlat',
            'Poreč apartmanpartner csomag',
            'Bar tengerparti hétvége',
            'Aranyhomok nyaralási csomag',
            'Szozopol családi út',
        ];
        $partners = [
            'Adria Travel',
            'Mediterrán Utak',
            'Sunline Holidays',
            'Blue Coast Partner',
            'Sea & Sun Travel',
            'Family Sea Tours',
            'Riviéra Utazás',
            'Tengerpart Plusz',
        ];

        foreach ($offers as $index => $offerName) {
            TourPartnerOffer::query()->updateOrCreate(
                ['name' => $offerName],
                [
                    'partner_name' => $partners[$index % count($partners)],
                    'partner_email' => 'partner'.($index + 1).'@example.com',
                    'inquiry_date' => now()->subDays($index + 1)->toDateString(),
                    'status' => 'new',
                    'note' => $offerName.' megjegyzés.',
                    'active' => true,
                ],
            );
        }
    }
}

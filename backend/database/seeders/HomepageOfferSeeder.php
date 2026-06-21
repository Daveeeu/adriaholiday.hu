<?php

namespace Database\Seeders;

use App\Models\HomepageOffer;
use Database\Seeders\Concerns\CreatesPlaceholderMedia;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class HomepageOfferSeeder extends Seeder
{
    use CreatesPlaceholderMedia;

    public function run(): void
    {
        $offers = [
            'Bibione családi csomag',
            'Lignano tengerparti ajánlat',
            'Caorle nyári pihenés',
            'Jesolo hétvégi kikapcsolódás',
            'Sarti családi nyaralás',
            'Nei Pori all inclusive ajánlat',
            'Paralia kényelmes apartman csomag',
            'Hanioti mediterrán pihenés',
            'Budva városi és tengerparti élmény',
            'Petrovac nyugodt üdülés',
            'Ulcinj hosszú strandos ajánlat',
            'Bar tengerparti kikapcsolódás',
            'Rovinj romantikus utazás',
            'Poreč családi apartman',
            'Crikvenica nyári hét',
            'Makarska Riviera ajánlat',
            'Napospart all inclusive út',
            'Aranyhomok tengerparti csomag',
            'Neszebár kulturális és strandos hét',
            'Szozopol mediterrán utazás',
        ];

        foreach ($offers as $i => $name) {
            $offer = HomepageOffer::query()->updateOrCreate(
                ['sort_order' => $i + 1],
                [
                    'active' => true,
                    'image_title' => $name,
                    'link' => '/utazasok/'.Str::slug($name),
                ],
            );

            $offer->clearMediaCollection('image');
            $this->attachPlaceholderMedia($offer, 'image', $name);

            $offer->translations()->updateOrCreate(
                ['locale' => 'hu'],
                [
                    'name' => $name,
                    'seo_name' => Str::slug($name),
                    'short_description' => "{$name} rövid bemutatása.",
                ],
            );
            $offer->translations()->updateOrCreate(
                ['locale' => 'en'],
                [
                    'name' => Str::headline(Str::slug($name, ' ')).' EN',
                    'seo_name' => Str::slug($name).'-en',
                    'short_description' => "Short description for {$name}.",
                ],
            );
            $offer->translations()->updateOrCreate(
                ['locale' => 'de'],
                [
                    'name' => Str::headline(Str::slug($name, ' ')).' DE',
                    'seo_name' => Str::slug($name).'-de',
                    'short_description' => "Kurzbeschreibung für {$name}.",
                ],
            );
        }
    }
}

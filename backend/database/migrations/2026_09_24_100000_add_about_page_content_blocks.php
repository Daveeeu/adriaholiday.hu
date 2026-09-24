<?php

use App\Models\PortfolioContentBlock;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    private const PAGE = 'about';

    private function heading(array ...$parts): array
    {
        return [
            'titleParts' => array_map(
                static fn (array $part) => ['text' => $part[0], 'variant' => $part[1] ?? 'default'],
                $parts,
            ),
        ];
    }

    private function blocks(): array
    {
        return [
            ['key' => 'about.hero.eyebrow', 'label' => 'Rólunk előtag', 'type' => 'text', 'value' => 'RÓLUNK'],
            ['key' => 'about.hero.titleParts', 'label' => 'Rólunk főcím', 'type' => 'json', 'value_json' => $this->heading(
                ['2003 óta utazunk'],
                ['együtt veletek', 'gradient'],
            )],
            ['key' => 'about.hero.lead', 'label' => 'Rólunk bevezető', 'type' => 'textarea', 'value' => 'Az Adria Holiday 2003-ban indult európai kulturális körutazásokkal. Azóta kínálatunk egzotikus úti célokkal is bővült, és szeretnénk még több utazóhoz eljutni, aki igényes, mégis megfizethető utazásra vágyik.'],
            ['key' => 'about.hero.stats', 'label' => 'Rólunk számok', 'type' => 'json', 'value_json' => [
                ['value' => '2003', 'label' => 'óta szervezünk utakat'],
                ['value' => '10 000+', 'label' => 'elégedett utas'],
                ['value' => '2–3 év', 'label' => 'buszaink átlagos kora'],
            ]],
            ['key' => 'about.difference.eyebrow', 'label' => 'Miben mások előtag', 'type' => 'text', 'value' => 'MIBEN VAGYUNK MÁSOK?'],
            ['key' => 'about.difference.titleParts', 'label' => 'Miben mások cím', 'type' => 'json', 'value_json' => $this->heading(
                ['Az átlagosnál többet,'],
                ['alacsony áron', 'gradient'],
            )],
            ['key' => 'about.difference.description', 'label' => 'Miben mások leírás', 'type' => 'textarea', 'value' => 'Célunk, hogy az átlagosnál többet nyújtsunk, miközben tartjuk kedvező árainkat. Ehhez három dologra figyelünk különösen.'],
            ['key' => 'about.difference.pillars', 'label' => 'Miben mások pillérek', 'type' => 'json', 'value_json' => [
                ['icon' => 'hotel', 'title' => 'Gondosan kiválasztott szállások', 'description' => 'Minden szálláshelyet alaposan megvizsgálunk, mielőtt utasaink elé kerül.'],
                ['icon' => 'users', 'title' => 'Felkészült idegenvezetők', 'description' => 'Idegenvezetőinknél a szakmai felkészültség mellett a legfontosabb az emberi hozzáállás.'],
                ['icon' => 'bus', 'title' => 'Újszerű, kényelmes autóbuszok', 'description' => 'Buszaink átlagos kora mindössze 2–3 év, így már az út is az élmény része.'],
            ]],
            ['key' => 'about.story.highlights', 'label' => 'Történetünk kiemelések', 'type' => 'json', 'value_json' => [
                ['icon' => 'beach', 'title' => 'Bibione a kezdetek óta', 'description' => 'Visszatérő utasaink legnagyobb örömére Bibione az első évtől kezdve minden évben szerepel a kínálatunkban.'],
                ['icon' => 'heart', 'title' => 'Kiemelt odafigyelés', 'description' => 'Utasaink a gondos odafigyeléssel összeállított szolgáltatásaink minősége miatt választanak minket újra és újra.'],
                ['icon' => 'compass', 'title' => 'Hűek maradtunk önmagunkhoz', 'description' => 'Legfontosabb mérföldkövünk, hogy két évtized után is megőriztük eredeti elképzelésünket: igényes utazás, elérhető áron.'],
            ]],
            ['key' => 'about.team.eyebrow', 'label' => 'Csapat előtag', 'type' => 'text', 'value' => 'A CSAPATUNK'],
            ['key' => 'about.team.titleParts', 'label' => 'Csapat cím', 'type' => 'json', 'value_json' => $this->heading(
                ['Akik az utazásaidat'],
                ['megszervezik', 'gradient'],
            )],
            ['key' => 'about.team.description', 'label' => 'Csapat leírás', 'type' => 'textarea', 'value' => 'Hét ember, egy közös cél: hogy az első érdeklődéstől a hazaérkezésig gondtalanul utazz.'],
            ['key' => 'about.team.image', 'label' => 'Csapatfotó', 'type' => 'image', 'value_json' => ['alt' => 'Az Adria Holiday csapata', 'title' => 'Az Adria Holiday csapata']],
            ['key' => 'about.office.image', 'label' => 'Irodafotó', 'type' => 'image', 'value_json' => ['alt' => 'Az Adria Holiday irodája', 'title' => 'Az Adria Holiday irodája']],
            ['key' => 'about.values.titleParts', 'label' => 'Értékek cím', 'type' => 'json', 'value_json' => $this->heading(
                ['Amit velünk'],
                ['kapsz', 'gradient'],
            )],
            ['key' => 'about.values.items', 'label' => 'Értékek', 'type' => 'json', 'value_json' => [
                ['icon' => 'shieldCheck', 'title' => 'Biztonság', 'description' => 'Gondos szervezés az indulástól a hazaérkezésig.'],
                ['icon' => 'award', 'title' => 'Megbízhatóság', 'description' => 'Több mint két évtized tapasztalata és visszatérő utasok ezrei.'],
                ['icon' => 'sparkles', 'title' => 'Élményvágy', 'description' => 'Utak, amelyekre évek múlva is szívesen emlékszel.'],
            ]],
            ['key' => 'about.cta.label', 'label' => 'Rólunk gomb szöveg', 'type' => 'text', 'value' => 'Fedezd fel utazásainkat'],
            ['key' => 'about.cta.url', 'label' => 'Rólunk gomb link', 'type' => 'url', 'value' => '/utazasok'],
        ];
    }

    public function up(): void
    {
        foreach ($this->blocks() as $block) {
            PortfolioContentBlock::query()->firstOrCreate(
                ['key' => $block['key']],
                [
                    'page' => self::PAGE,
                    'section' => explode('.', $block['key'])[1],
                    'label' => $block['label'],
                    'type' => $block['type'],
                    'locale' => 'hu',
                    'value' => $block['value'] ?? null,
                    'value_json' => $block['value_json'] ?? null,
                    'is_published' => true,
                ],
            );
        }
    }

    public function down(): void
    {
        PortfolioContentBlock::query()
            ->where('page', self::PAGE)
            ->get()
            ->each(static fn (PortfolioContentBlock $block) => $block->forceDelete());
    }
};

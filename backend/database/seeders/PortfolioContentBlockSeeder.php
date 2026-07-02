<?php

namespace Database\Seeders;

use App\Models\PortfolioContentBlock;
use App\Support\MediaCategory;
use Database\Seeders\Concerns\CreatesPlaceholderMedia;
use Database\Seeders\Concerns\SeedsMediaFromUrl;
use Illuminate\Database\Seeder;

class PortfolioContentBlockSeeder extends Seeder
{
    use CreatesPlaceholderMedia;
    use SeedsMediaFromUrl;

    private function headingPart(string $text, string $variant = 'default'): array
    {
        return [
            'text' => $text,
            'variant' => $variant,
        ];
    }

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

    private function headingBlock(string $key, string $label, array $parts): array
    {
        return [
            'key' => $key,
            'label' => $label,
            'type' => 'json',
            'value_json' => $this->headingValue($parts),
        ];
    }

    public function run(): void
    {
        $blocks = [
            ['key' => 'home.hero.accent', 'label' => 'Hero alcím', 'type' => 'text', 'value' => 'Az élmény vár rád'],
            $this->headingBlock('home.hero.titleParts', 'Hero főcím', [
                $this->headingPart('Buszos utak,'),
                $this->headingPart('amikre'),
                $this->headingPart('emlékezni fogsz', 'gradient'),
            ]),
            ['key' => 'home.hero.subtitle', 'label' => 'Hero alcím leírás', 'type' => 'textarea', 'value' => 'Tengerparti utak, városlátogatások és körutazások tapasztalt szervezéssel, kényelmes buszokkal.'],
            ['key' => 'home.hero.image', 'label' => 'Hero háttérkép', 'type' => 'image', 'value_json' => ['alt' => 'Adriatic Coast', 'title' => 'Adriatic Coast']],
            ['key' => 'home.hero.video', 'label' => 'Hero videó', 'type' => 'video', 'value' => null, 'value_json' => null],
            ['key' => 'home.brand.logo', 'label' => 'Márkalogó', 'type' => 'image', 'value_json' => ['alt' => 'Adria Holiday', 'title' => 'Adria Holiday']],
            ['key' => 'home.hero.cta.primary.label', 'label' => 'Hero első gomb szöveg', 'type' => 'text', 'value' => 'Utazások keresése'],
            ['key' => 'home.hero.cta.primary.url', 'label' => 'Hero első gomb link', 'type' => 'url', 'value' => '/utazasok'],
            ['key' => 'home.hero.cta.secondary.label', 'label' => 'Hero második gomb szöveg', 'type' => 'text', 'value' => 'Last Minute ajánlatok'],
            ['key' => 'home.hero.cta.secondary.url', 'label' => 'Hero második gomb link', 'type' => 'url', 'value' => '/utazasok'],
            ['key' => 'home.hero.stats', 'label' => 'Hero statisztikák', 'type' => 'json', 'value_json' => [
                ['value' => '10 000+', 'label' => 'elégedett utas'],
                ['value' => '15+', 'label' => 'év tapasztalat'],
                ['value' => '4.9/5', 'label' => 'értékelés'],
                ['value' => '100%', 'label' => 'kényelmes utazás'],
            ]],
            ['key' => 'home.hero.badges', 'label' => 'Hero jelvények', 'type' => 'json', 'value_json' => [
                ['icon' => 'shield', 'text' => 'Biztonságos foglalás'],
                ['icon' => 'star', 'text' => 'Kiváló minősítés'],
            ]],
            $this->headingBlock('home.categories.titleParts', 'Kategória cím', [
                $this->headingPart('Fedezd fel'),
                $this->headingPart('kedvenc úti célod', 'gradient'),
            ]),
            ['key' => 'home.categories.subtitle', 'label' => 'Kategória leírás', 'type' => 'textarea', 'value' => 'Valós Adria Holiday kategóriák, aktuális utazási kínálattal.'],
            $this->headingBlock('home.story.titleParts', 'Story cím', [
                $this->headingPart('Közös naplementék.'),
                $this->headingPart('Új élmények.', 'gradient'),
                $this->headingPart('Emlékek egy életre.'),
            ]),
            ['key' => 'home.story.description', 'label' => 'Story leírás', 'type' => 'textarea', 'value' => 'Nem csak úti célokat mutatunk meg. Élményeket adunk, amelyek évekkel később is veled maradnak.'],
            ['key' => 'home.story.cta.label', 'label' => 'Story gomb szöveg', 'type' => 'text', 'value' => 'Fedezd fel az utakat'],
            ['key' => 'home.story.cta.url', 'label' => 'Story gomb link', 'type' => 'url', 'value' => '/utazasok'],
            ['key' => 'home.story.quote', 'label' => 'Story idézet', 'type' => 'text', 'value' => '15 éve teremtünk felejthetetlen pillanatokat'],
            ['key' => 'home.experience.eyebrow', 'label' => 'Experience előtag', 'type' => 'text', 'value' => 'MIÉRT AZ ADRIA HOLIDAY'],
            $this->headingBlock('home.experience.titleParts', 'Experience cím', [
                $this->headingPart('Élményeket adunk,'),
                $this->headingPart('amikre évek múlva is', 'gradient'),
                $this->headingPart('emlékezni fogsz'),
            ]),
            $this->headingBlock('home.experience.overlay.titleParts', 'Experience overlay cím', [
                $this->headingPart('Smaragdzöld víz'),
                $this->headingPart('és mediterrán szigetek', 'gradient'),
            ]),
            ['key' => 'home.experience.description.one', 'label' => 'Experience szöveg 1', 'type' => 'textarea', 'value' => 'Naplementék az Adrián, mediterrán városok hangulata, autentikus élmények és gondtalan utazások.'],
            ['key' => 'home.experience.description.two', 'label' => 'Experience szöveg 2', 'type' => 'textarea', 'value' => 'Minden út gondosan megtervezett, minden részlet átgondolt — te csak élvezd a pillanatot. Családok, párok, barátok — mindenkinek megtaláljuk a tökéletes utat.'],
            ['key' => 'home.experience.stats', 'label' => 'Experience statisztikák', 'type' => 'json', 'value_json' => [
                ['value' => '10K+', 'label' => 'Elégedett utas'],
                ['value' => '15', 'label' => 'Év tapasztalat'],
                ['value' => '4.9', 'label' => 'Értékelés'],
            ]],
            ['key' => 'home.experience.image', 'label' => 'Experience kép', 'type' => 'image', 'value_json' => ['alt' => 'Tengerpart az Adrián', 'title' => 'Tengerpart az Adrián']],
            ['key' => 'home.experience.quote.image', 'label' => 'Experience idézet kép', 'type' => 'image', 'value_json' => ['alt' => 'B. Istvánné', 'title' => 'B. Istvánné']],
            ['key' => 'home.experience.cta.label', 'label' => 'Experience gomb szöveg', 'type' => 'text', 'value' => 'Ismerj meg minket'],
            ['key' => 'home.experience.cta.url', 'label' => 'Experience gomb link', 'type' => 'url', 'value' => '/rolunk'],
            ['key' => 'home.whyChooseUs.eyebrow', 'label' => 'Why choose us előtag', 'type' => 'text', 'value' => 'MIÉRT AZ ADRIA HOLIDAY'],
            $this->headingBlock('home.whyChooseUs.titleParts', 'Why choose us cím', [
                $this->headingPart('Miért utazz'),
                $this->headingPart('velünk?', 'gradient'),
            ]),
            ['key' => 'home.whyChooseUs.description', 'label' => 'Why choose us leírás', 'type' => 'textarea', 'value' => 'Kényelmes buszok, gondos szervezés és olyan élmények, amelyekre évekkel később is emlékezni fogsz.'],
            ['key' => 'home.whyChooseUs.features', 'label' => 'Why choose us jellemzők', 'type' => 'json', 'value_json' => [
                ['title' => 'Saját szervezésű utak', 'description' => 'Minden utazást gondosan megtervezünk.', 'icon' => 'award'],
                ['title' => 'Kényelmes buszok', 'description' => 'Modern, klimatizált járművek, kényelmes utazás.', 'icon' => 'bus'],
                ['title' => 'Magyar idegenvezetők', 'description' => 'Tapasztalt kísérők segítenek az út során.', 'icon' => 'users'],
                ['title' => 'Több felszállási pont', 'description' => 'Budapestről és vidékről is indulunk.', 'icon' => 'mapPin'],
                ['title' => 'Garantált indulások', 'description' => 'Biztonságos, kiszámítható utazások.', 'icon' => 'shield'],
                ['title' => '15 év tapasztalat', 'description' => 'Megbízható háttér és szakértelem.', 'icon' => 'calendar'],
            ]],
            ['key' => 'home.whyChooseUs.values', 'label' => 'Why choose us értékek', 'type' => 'json', 'value_json' => [
                ['title' => 'Utazás szívvel-lélekkel', 'text' => 'Mert mi magunk is szeretünk utazni', 'icon' => 'heart'],
                ['title' => 'Több mint egy utazás', 'text' => 'Élmények, barátságok, emlékek', 'icon' => 'star'],
                ['title' => 'Közösség és gondoskodás', 'text' => 'Velünk nem vagy egyedül', 'icon' => 'users'],
                ['title' => 'A pillanatok, amik megmaradnak', 'text' => 'Ezért utazunk', 'icon' => 'camera'],
            ]],
            ['key' => 'home.blog.eyebrow', 'label' => 'Blog előtag', 'type' => 'text', 'value' => 'ÚTI INSPIRÁCIÓK'],
            $this->headingBlock('home.blog.titleParts', 'Blog cím', [
                $this->headingPart('Utazó'),
                $this->headingPart('Blog', 'gradient'),
            ]),
            ['key' => 'home.blog.description', 'label' => 'Blog leírás', 'type' => 'textarea', 'value' => 'Inspirációk, tippek és élmények a világ minden tájáról — röviden, hasznosan, utazásra hangolva.'],
            $this->headingBlock('home.blog.tip.titleParts', 'Blog tipp cím', [
                $this->headingPart('Utazás előtt'),
                $this->headingPart('5 perc inspiráció is elég.', 'gradient'),
            ]),
            ['key' => 'home.blog.tip.description', 'label' => 'Blog tipp leírás', 'type' => 'textarea', 'value' => 'Cikkek, amik segítenek választani, csomagolni és még jobban megélni az utazást.'],
            ['key' => 'home.blog.articles', 'label' => 'Blog cikkek', 'type' => 'json', 'value_json' => [
                ['title' => 'Horvátország 10 legszebb strandja', 'excerpt' => 'Kristálytiszta víz, rejtett öblök és mediterrán hangulat — fedezd fel Horvátország legszebb tengerpartjait.', 'image' => 'https://adriaholiday.hu/framework/img.php?p=files/brela.jpeg&op=;1200x900;', 'category' => 'Tengerpartok', 'date' => '2026. január 25', 'readingTime' => '5 perc', 'featured' => true],
                ['title' => 'Karneváli maszkok Velencében', 'excerpt' => 'A velencei karnevál története, legendás maszkjai és a város különleges hangulata.', 'image' => 'https://adriaholiday.hu/framework/img.php?p=files/carnival_venice_italy031-2.jpg&op=;800x720;', 'category' => 'Városnézés', 'date' => '2026. január 19', 'readingTime' => '4 perc'],
                ['title' => 'Érdekes szobrok a nagyvilágban', 'excerpt' => 'Különleges és ikonikus szobrok, amelyek mellett utazás közben egyszer mindenképp érdemes megállni.', 'image' => 'https://adriaholiday.hu/framework/img.php?p=files/28279603_1824636157580731_3729580786296626111_n.jpg&op=;800x720;', 'category' => 'Világ érdekességei', 'date' => '2026. április 12', 'readingTime' => '6 perc'],
                ['title' => 'Miért ismert világszerte a kubai szivar?', 'excerpt' => 'Hagyomány, kézművesség és kubai kultúra — ezért vált legendává a kubai szivar.', 'image' => 'https://adriaholiday.hu/framework/img.php?p=files/shutterstock_301377860%20%28002%29.jpg&op=;800x720;', 'category' => 'Gasztronómia', 'date' => '2026. november 25', 'readingTime' => '5 perc'],
            ]],
            ['key' => 'home.howItWorks.eyebrow', 'label' => 'How it works előtag', 'type' => 'text', 'value' => 'EGYSZERŰ FOLYAMAT'],
            $this->headingBlock('home.howItWorks.titleParts', 'How it works cím', [
                $this->headingPart('Hogyan'),
                $this->headingPart('zajlik?', 'gradient'),
            ]),
            ['key' => 'home.howItWorks.subtitle', 'label' => 'How it works alcím', 'type' => 'text', 'value' => '3 egyszerű lépés a következő élményedig'],
            ['key' => 'home.howItWorks.description', 'label' => 'How it works leírás', 'type' => 'textarea', 'value' => 'Gyors foglalás, gondos szervezés és felejthetetlen utazások.'],
            ['key' => 'home.howItWorks.steps', 'label' => 'How it works lépések', 'type' => 'json', 'value_json' => [
                ['number' => '01', 'eyebrow' => 'Felfedezés', 'title' => 'Válassz utat', 'description' => 'Böngéssz gondosan összeállított utazásaink között, és találd meg a hozzád illő úti célt.', 'icon' => 'compass'],
                ['number' => '02', 'eyebrow' => 'Foglalás', 'title' => 'Foglalj online', 'description' => 'Foglalj gyorsan, átláthatóan és biztonságosan néhány kattintással.', 'icon' => 'calendar'],
                ['number' => '03', 'eyebrow' => 'Utazás', 'title' => 'Indulj velünk', 'description' => 'Dőlj hátra, mi intézzük a részleteket — neked csak az élmény marad.', 'icon' => 'bus'],
            ]],
            ['key' => 'home.howItWorks.cta.label', 'label' => 'How it works gomb szöveg', 'type' => 'text', 'value' => 'Kezdjük el'],
            ['key' => 'home.howItWorks.cta.url', 'label' => 'How it works gomb link', 'type' => 'url', 'value' => '/utazasok'],
            $this->headingBlock('home.trust.titleParts', 'Trust címsor', [
                $this->headingPart('Mit mondanak'),
                $this->headingPart('utasaink?', 'gradient'),
            ]),
            ['key' => 'home.trust.stats', 'label' => 'Trust statisztikák', 'type' => 'json', 'value_json' => [
                ['value' => 10000, 'suffix' => '+', 'label' => 'Elégedett utas', 'description' => 'Akik már velünk utaztak Európa legszebb helyeire.', 'icon' => 'users'],
                ['value' => 15, 'suffix' => ' év', 'label' => 'Tapasztalat', 'description' => 'Több mint egy évtizede szervezünk utazásokat.', 'icon' => 'award'],
                ['value' => 100, 'suffix' => '+', 'label' => 'Utazás évente', 'description' => 'Folyamatos indulások egész évben.', 'icon' => 'mapPin'],
                ['value' => 4.9, 'suffix' => '/5', 'label' => 'Értékelés', 'description' => 'Valódi utasvélemények alapján kiemelkedő élmény.', 'icon' => 'star'],
            ]],
            ['key' => 'home.trust.reviews', 'label' => 'Trust vélemények', 'type' => 'json', 'value_json' => [
                ['name' => 'B. Angéla', 'location' => 'Ausztria körutazás', 'rating' => 5, 'text' => 'Őszinte köszönetemet fejezem ki az ausztriai 4 napos utazásunk megszervezéséért. Minden részlet gördülékenyen volt megszervezve, az idegenvezető fantasztikus volt, a sofőrök pedig végig biztonságos és kényelmes utazást biztosítottak.'],
                ['name' => 'B. Istvánné', 'location' => 'Bosznia körutazás', 'rating' => 5, 'text' => 'Felejthetetlen csodás napokat töltöttünk el az Önök jóvoltából. A programok, a szállások és az étkezések is kiválóak voltak. Az idegenvezető rendkívül felkészült és segítőkész volt.'],
                ['name' => 'Annamária', 'location' => 'London repülős út', 'rating' => 5, 'text' => 'Szuperül éreztük magunkat, gyönyörű időt kaptunk és az idegenvezetőnk egy főnyeremény volt. Kedves, türelmes és figyelmes embert ismertünk meg benne. Biztosan nem ez volt az utolsó közös utunk.'],
                ['name' => 'H. Katalin', 'location' => 'Cseh kastélyok', 'rating' => 5, 'text' => 'Rendkívül jól éreztem magam. Az utazás teljesen zökkenőmentes volt, a sofőrök segítőkészek voltak, az idegenvezető pedig óriási tudással és kedvességgel vezette végig az utat.'],
            ]],
            ['key' => 'home.trust.review.1.image', 'label' => 'Trust vélemény 1 kép', 'type' => 'image', 'value_json' => ['alt' => 'B. Angéla', 'title' => 'B. Angéla']],
            ['key' => 'home.trust.review.2.image', 'label' => 'Trust vélemény 2 kép', 'type' => 'image', 'value_json' => ['alt' => 'B. Istvánné', 'title' => 'B. Istvánné']],
            ['key' => 'home.trust.review.3.image', 'label' => 'Trust vélemény 3 kép', 'type' => 'image', 'value_json' => ['alt' => 'Annamária', 'title' => 'Annamária']],
            ['key' => 'home.trust.review.4.image', 'label' => 'Trust vélemény 4 kép', 'type' => 'image', 'value_json' => ['alt' => 'H. Katalin', 'title' => 'H. Katalin']],
            ['key' => 'home.faq.eyebrow', 'label' => 'FAQ előtag', 'type' => 'text', 'value' => 'FAQ'],
            $this->headingBlock('home.faq.titleParts', 'FAQ cím', [
                $this->headingPart('Gyakran ismételt'),
                $this->headingPart('kérdések', 'gradient'),
            ]),
            ['key' => 'home.faq.description', 'label' => 'FAQ leírás', 'type' => 'textarea', 'value' => 'Minden, amit tudni kell az Adria Holiday utazásairól.'],
            $this->headingBlock('home.faq.helpTitleParts', 'FAQ segítő cím', [
                $this->headingPart('Kérdésed van'),
                $this->headingPart('az utazás előtt?', 'gradient'),
            ]),
            ['key' => 'home.faq.helpDescription', 'label' => 'FAQ segítő leírás', 'type' => 'textarea', 'value' => 'Összegyűjtöttük a legfontosabb tudnivalókat, hogy magabiztosan foglalhass.'],
            ['key' => 'home.faq.helpItems', 'label' => 'FAQ segítő pontok', 'type' => 'json', 'value_json' => [
                ['text' => 'Biztonságos foglalás', 'icon' => 'shieldCheck'],
                ['text' => 'Gyors ügyintézés', 'icon' => 'messageCircle'],
                ['text' => 'Segítőkész ügyfélszolgálat', 'icon' => 'sparkles'],
            ]],
            ['key' => 'home.faq.button.label', 'label' => 'FAQ gomb szöveg', 'type' => 'text', 'value' => 'Írj nekünk'],
            ['key' => 'home.faq.button.url', 'label' => 'FAQ gomb link', 'type' => 'url', 'value' => '/kapcsolat'],
            ['key' => 'home.faq.items', 'label' => 'FAQ kérdések', 'type' => 'json', 'value_json' => [
                ['question' => 'Mikor kell fizetnem az utazás árát?', 'answer' => 'A foglaláskor 30% előleget kell fizetni, a fennmaradó összeget pedig legkésőbb 30 nappal az indulás előtt.'],
                ['question' => 'Mi van, ha le kell mondanom az utazást?', 'answer' => 'A lemondási feltételek az indulás előtti időponttól függenek. Javasoljuk utasbiztosítás megkötését.'],
                ['question' => 'Milyen típusú buszokkal utazunk?', 'answer' => 'Modern, kényelmes, légkondicionált buszokkal utazunk, amelyek hosszabb utakra is alkalmasak.'],
                ['question' => 'Van lehetőség egyéni programokra?', 'answer' => 'Igen, több utazásunkon van szabadprogram, amit saját elképzelés szerint lehet eltölteni.'],
                ['question' => 'Milyen étkezés van az utazás során?', 'answer' => 'Az ellátás utazásonként változik, általában reggeli, félpanzió vagy teljes ellátás érhető el.'],
                ['question' => 'Szükséges-e útiokmány a horvát tengerpartra?', 'answer' => 'Magyar állampolgárok személyi igazolvánnyal vagy útlevéllel utazhatnak Horvátországba.'],
            ]],
            ['key' => 'home.newsletter.eyebrow', 'label' => 'Newsletter előtag', 'type' => 'text', 'value' => 'HÍRLEVÉL'],
            $this->headingBlock('home.newsletter.titleParts', 'Newsletter cím', [
                $this->headingPart('Ne maradj le'),
                $this->headingPart('a következő élményről!', 'gradient'),
            ]),
            ['key' => 'home.newsletter.description', 'label' => 'Newsletter leírás', 'type' => 'textarea', 'value' => 'Last minute ajánlatok, exkluzív kedvezmények és új utazási inspirációk — elsőként a postaládádban.'],
            ['key' => 'home.newsletter.placeholder', 'label' => 'Newsletter mező placeholder', 'type' => 'text', 'value' => 'Add meg az email címed'],
            ['key' => 'home.newsletter.button.label', 'label' => 'Newsletter gomb szöveg', 'type' => 'text', 'value' => 'Feliratkozás'],
            ['key' => 'home.newsletter.disclaimer', 'label' => 'Newsletter disclaimer', 'type' => 'textarea', 'value' => 'Az email címed biztonságban van. Nincs spam, csak hasznos utazási inspiráció.'],
            ['key' => 'home.newsletter.benefits', 'label' => 'Newsletter előnyök', 'type' => 'json', 'value_json' => [
                ['title' => 'Last Minute utak', 'description' => 'A legjobb ajánlatokat elsőként küldjük.', 'icon' => 'gift'],
                ['title' => 'Exkluzív kedvezmények', 'description' => 'Csak feliratkozóknak elérhető akciók.', 'icon' => 'zap'],
                ['title' => 'Új úti célok', 'description' => 'Friss inspirációk Európa legszebb helyeiről.', 'icon' => 'globe'],
            ]],
            $this->headingBlock('home.footer.titleParts', 'Footer cím', [
                $this->headingPart('Adria', 'gradient'),
                $this->headingPart('Holiday'),
            ]),
            ['key' => 'home.footer.description', 'label' => 'Footer leírás', 'type' => 'textarea', 'value' => 'Prémium buszos utazások Európa legszebb úti céljaihoz. 15 év tapasztalat, 10,000+ elégedett utas, és számtalan felejthetetlen élmény.'],
            ['key' => 'home.footer.phone', 'label' => 'Footer telefonszám', 'type' => 'text', 'value' => '+36 1 234 5678'],
            ['key' => 'home.footer.email', 'label' => 'Footer e-mail', 'type' => 'text', 'value' => 'info@adriaholiday.hu'],
            ['key' => 'home.footer.address', 'label' => 'Footer cím', 'type' => 'text', 'value' => "1051 Budapest\nPélda utca 12."],
            ['key' => 'home.footer.copyright', 'label' => 'Footer copyright', 'type' => 'text', 'value' => '© 2026 Adria Holiday. Minden jog fenntartva.'],
        ];

        foreach ($blocks as $block) {
            $portfolioContentBlock = PortfolioContentBlock::query()->updateOrCreate(
                ['key' => $block['key']],
                [
                    'page' => 'home',
                    'section' => explode('.', $block['key'])[1] ?? 'home',
                    'label' => $block['label'],
                    'type' => $block['type'],
                    'locale' => 'hu',
                    'value' => $block['value'] ?? null,
                    'value_json' => $block['value_json'] ?? null,
                    'draft_value' => null,
                    'draft_value_json' => null,
                    'is_published' => true,
                ],
            );
        }

        $this->seedPortfolioMedia();
    }

    private function seedPortfolioMedia(): void
    {
        $mediaMap = [
            'home.hero.image' => [
                'url' => 'https://images.unsplash.com/photo-1764956607632-0aeeaae38e1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920&q=90',
                'name' => 'Adriatic Coast',
                'fileName' => 'adriatic-coast.jpg',
            ],
            'home.brand.logo' => [
                'path' => base_path('../public/adrialogo_fehernarancs.png'),
                'name' => 'Adria Holiday',
                'fileName' => 'adrialogo_fehernarancs.png',
            ],
            'home.experience.image' => [
                'url' => 'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200&q=90',
                'name' => 'Tengerpart az Adrián',
                'fileName' => 'adriatic-coast-experience.jpg',
            ],
            'home.experience.quote.image' => [
                'url' => 'https://i.pravatar.cc/150?img=47',
                'name' => 'B. Istvánné',
                'fileName' => 'b-istvanne.jpg',
            ],
            'home.story.image' => [
                'url' => 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=2200&q=90',
                'name' => 'Travel memories',
                'fileName' => 'travel-memories.jpg',
            ],
            'home.trust.review.1.image' => [
                'url' => 'https://i.pravatar.cc/150?img=32',
                'name' => 'B. Angéla',
                'fileName' => 'b-angela.jpg',
            ],
            'home.trust.review.2.image' => [
                'url' => 'https://i.pravatar.cc/150?img=47',
                'name' => 'B. Istvánné',
                'fileName' => 'b-istvanne.jpg',
            ],
            'home.trust.review.3.image' => [
                'url' => 'https://i.pravatar.cc/150?img=12',
                'name' => 'Annamária',
                'fileName' => 'annamaria.jpg',
            ],
            'home.trust.review.4.image' => [
                'url' => 'https://i.pravatar.cc/150?img=24',
                'name' => 'H. Katalin',
                'fileName' => 'h-katalin.jpg',
            ],
        ];

        foreach ($mediaMap as $key => $data) {
            $block = PortfolioContentBlock::query()->where('key', $key)->first();

            if (! $block) {
                continue;
            }

            $publishedCollection = $block->publishedMediaCollectionName();
            $draftCollection = $block->draftMediaCollectionName();

            if ($publishedCollection !== null) {
                $block->clearMediaCollection($publishedCollection);
            }

            if ($draftCollection !== null) {
                $block->clearMediaCollection($draftCollection);
            }

            if ($publishedCollection !== null) {
                $metadata = [
                    'category' => MediaCategory::PORTFOLIO->value,
                    'source_context' => 'portfolio_content',
                    'source_id' => $block->id,
                    'alt' => $data['alt'] ?? $data['name'],
                    'title' => $data['title'] ?? $data['name'],
                ];

                if (isset($data['path']) && is_string($data['path']) && file_exists($data['path'])) {
                    $media = $block
                        ->addMedia($data['path'])
                        ->usingName($data['name'])
                        ->usingFileName($data['fileName'])
                        ->toMediaCollection($publishedCollection);

                    $this->applyMediaMetadata($media, $metadata, $data['name']);
                    continue;
                }

                if (isset($data['url'])) {
                    $this->attachMediaFromUrl(
                        $block,
                        $publishedCollection,
                        $data['url'],
                        $data['fileName'],
                        $data['name'],
                        $metadata,
                    );
                    continue;
                }

                $this->attachPlaceholderMedia($block, $publishedCollection, $data['name'], $metadata);
            }
        }
    }
}

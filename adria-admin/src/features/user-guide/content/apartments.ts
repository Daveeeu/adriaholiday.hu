import { Building2 } from 'lucide-react';

import type { GuideChapter } from '../lib/user-guide.types';

import {
  ADMIN_ONLY,
  SEARCH_RESULTS,
  field,
  fields,
  img,
  list,
  p,
  warning,
} from './blocks';

const APARTMENT_PAGE =
  'Az apartman saját oldalán (adriaholiday.hu/apartman/<SEO név>)';
const ACCESS =
  'Apartmanok megtekintése (a módosításhoz szerkesztési jog is kell)';

export const apartmentsChapter: GuideChapter = {
  id: 'apartments',
  title: 'Apartmanok',
  description:
    'Apartmanok felvitele és szerkesztése, árazási szezonok, valamint az apartmanokhoz tartozó típusok, helyek és régiók.',
  icon: Building2,
  topics: [
    {
      id: 'apartment-list',
      title: 'Apartmanok listája',
      summary:
        'Az „Összes apartman” menüpont minden apartmant mutat; alatta az aktív apartman típusok (pl. Olasz apartmanok) saját, szűrt listát kapnak.',
      path: '/apartments',
      menu: 'Apartmanok › Összes apartman',
      access: ACCESS,
      blocks: [
        img(
          'apartments-list',
          'Az apartmanok listája',
          'Az apartmanok listája: kereső, „Új apartman” gomb, a táblázat fejlécében szűrők (típus, szállás, aktív, kiemelt), soronként a műveletgombok.',
        ),
        fields('Lista', [
          field('Kereső', 'Név, kód, cím vagy SEO név alapján keres.'),
          field(
            'Oszlopszűrők',
            'A táblázat fejléce alatti mezőkkel típusra, aktív, kiemelt és szállás állapotra szűrhetsz.',
          ),
          field(
            'Műveletgombok',
            'Szem: megtekintés, ceruza: szerkesztés, bekapcsoló: aktiválás/deaktiválás, kuka: törlés.',
          ),
          field(
            'Típus szerinti menüpontok',
            'A menüben minden aktív apartman típus (Apartmanok › Típusok) külön menüpontot kap, ahol csak az adott típus apartmanjai látszanak.',
          ),
        ]),
      ],
    },
    {
      id: 'apartment-editor',
      title: 'Apartman szerkesztése',
      summary:
        'Az apartman szerkesztő oldalsó panelen nyílik meg, és több blokkból áll: típus, állapot, kapacitás, SEO, elhelyezkedés, képek, szövegek, szolgáltatások és árak.',
      path: '/apartments',
      menu: 'Apartmanok › Összes apartman › ceruza ikon',
      access: 'Apartmanok szerkesztése',
      blocks: [
        img(
          'apartment-form',
          'Apartman szerkesztő – típus és állapot',
          'A szerkesztő teteje: az apartman típusa, az állapot és alapjelölések, az árak fejlécei és a típus leírása.',
        ),
        fields('Apartman típusa, állapot és alapjelölések', [
          field(
            'Apartman típusa *',
            'Kötelező. Meghatározza, melyik országkategóriába (pl. Olasz, Horvát, Montenegrói apartmanok) kerül az apartman.',
            'Az admin menüjében és a weboldal apartmanlistáinak csoportosításában.',
          ),
          field(
            'Aktív',
            'Igen: megjelenik a weboldalon. Nem: rejtett, de megmarad.',
            'A helyek apartmanlistáin és az apartman saját oldalán.',
          ),
          field(
            'Kiemelt',
            'A kiemelt apartmanok kerülnek elsőként a főoldal apartman blokkjába.',
            'A főoldal kiemelt apartmanjai között.',
          ),
          field(
            'Szállás',
            'A régi rendszerből átvett jelölő: szálláshely-típusú ajánlat. A listában szűrni lehet rá.',
            ADMIN_ONLY,
          ),
          field(
            'Csillagok száma',
            'Kategória csillagban.',
            `${APARTMENT_PAGE} és a kártyákon.`,
          ),
          field(
            'Árak fejléce / Árak belső fejléce',
            'Az ártáblázat fölötti címsor, illetve a táblázat fejlécének szövege (pl. „Kategória / ágyszám”).',
            `${APARTMENT_PAGE}, az ártáblázatnál.`,
          ),
          field(
            'Típus szerkesztése',
            'A típus leírása vagy marketing szöveg.',
            APARTMENT_PAGE,
          ),
          field(
            'All-inclusive szerkesztése',
            'All-inclusive ellátással kapcsolatos megjegyzések.',
            APARTMENT_PAGE,
          ),
        ]),
        img(
          'apartment-form-1',
          'Kapacitás, méret és SEO blokk',
          'A kapacitás és távolságok, valamint a SEO blokk (név, kód, SEO név, slug) mezői.',
        ),
        fields('Kapacitás, méret és távolságok', [
          field(
            'Hálószobák / Fürdőszobák / Max. vendégek / Terület (m²)',
            'Az apartman alapadatai számmal.',
            `${APARTMENT_PAGE}, az adatok között.`,
          ),
          field(
            'Távolság a központtól / tengerparttól (m)',
            'Méterben. Üresen hagyva nem jelenik meg.',
            `${APARTMENT_PAGE} és a listakártyán.`,
          ),
        ]),
        fields('SEO blokk', [
          field(
            'Név',
            'Az apartman neve (pl. „Villa Adriatica”).',
            `${APARTMENT_PAGE}, a listakártyákon és a foglalási e-mailben.`,
          ),
          field(
            'Kód',
            'Belső ajánlati kód (pl. APT-001).',
            'Az apartman foglalásoknál „Ajánlati kód”-ként.',
          ),
          field(
            'SEO név + Automatikus generálás / Generálás',
            'Az apartman webcíme (adriaholiday.hu/apartman/<SEO név>).',
            'A böngésző címsorában.',
          ),
          field('Slug', 'Technikai azonosító.', ADMIN_ONLY),
          field(
            'Oldal címe (title)',
            'A keresőkben megjelenő cím. Üresen az apartman neve.',
            SEARCH_RESULTS,
          ),
          field(
            'Meta leírás',
            'A keresőtalálat leírása. Üresen az ismertető eleje.',
            SEARCH_RESULTS,
          ),
          field(
            'Robots',
            'Pl. „noindex, follow”, ha az oldal ne kerüljön a Google-be. Üresen indexelhető.',
            'Csak a keresőrobotok látják.',
          ),
        ]),
        img(
          'apartment-form-2',
          'Elhelyezkedés blokk',
          'Az elhelyezkedés blokk: régió, hely, cím, térkép cím és koordináták.',
        ),
        fields('Elhelyezkedés', [
          field(
            'Régió',
            'Az apartman régiója (Apartmanok › Régiók).',
            'A régióoldalakon (adriaholiday.hu/regiok/…).',
          ),
          field(
            'Hely',
            'A település / üdülőhely (Apartmanok › Helyek).',
            'A hely apartmanoldalán (adriaholiday.hu/apartmanok/<terület>/<hely>).',
          ),
          field('Cím', 'Az apartman postai címe.', APARTMENT_PAGE),
          field(
            'Térkép cím',
            'A térképen kereshető cím, ha eltér a postai címtől.',
            `${APARTMENT_PAGE}, a térképnél.`,
          ),
          field(
            'Koordináták (Szélesség / Hosszúság)',
            'Pontos hely tizedes fokban (pl. 45.6421, 13.0812). Google Térképen jobb kattintással kimásolható.',
            `${APARTMENT_PAGE}, a térkép jelölője.`,
          ),
        ]),
        img(
          'apartment-form-3',
          'Képek és ismertetők',
          'A képek és az ismertető szövegek blokkja.',
        ),
        fields('Képek és szövegek', [
          field(
            'Képek',
            'Az apartman képei. Az első kép a borítókép; a sorrend húzással módosítható.',
            'A borítókép a listakártyán, a többi az apartman oldalának galériájában.',
          ),
          field(
            'Rövid ismertető',
            'Rövid összefoglaló szöveg.',
            'A listakártyákon és az apartman oldalának tetején.',
          ),
          field(
            'Ismertető',
            'Az apartman részletes bemutatása.',
            APARTMENT_PAGE,
          ),
          field(
            'Kiegészítő információk',
            'További tudnivalók (pl. parkolás, háziállat).',
            APARTMENT_PAGE,
          ),
        ]),
        img(
          'apartment-form-5',
          'Szolgáltatások',
          'A szolgáltatások csoportosított, többszörös kiválasztású listája.',
        ),
        fields('Szolgáltatások és tartalmi blokkok', [
          field(
            'Szolgáltatások',
            'Jelöld be az apartman felszereltségét (pl. klíma, Wi-Fi, parkoló).',
            `${APARTMENT_PAGE}, ikonos felszereltség listában.`,
          ),
          field(
            'Apartman típus tartalom / All inclusive tartalom',
            'Típusspecifikus extra leírások.',
            APARTMENT_PAGE,
          ),
          field(
            'Montenegró extra blokkok',
            'A montenegrói apartmanokhoz tartozó extra leírások.',
            APARTMENT_PAGE,
          ),
        ]),
        img(
          'apartment-form-6',
          'Árazási szezonok',
          'Az árazási szezonok táblázata.',
        ),
        fields('Árazási szezonok', [
          field(
            'Kezdő dátum / Vég dátum',
            'A szezon időszaka.',
            `${APARTMENT_PAGE}, az ártáblázatban.`,
          ),
          field(
            'Kategória / Ágyszám',
            'Pl. „Kategória 1”, „4 ágy”.',
            `${APARTMENT_PAGE}, az ártáblázat soraiban.`,
          ),
          field(
            'Ár',
            'Az adott időszak és kategória ára.',
            `${APARTMENT_PAGE}, az ártáblázatban.`,
          ),
        ]),
        p(
          'Új szezont az „Új szezon” gombbal veszel fel. A sorok tetszőleges számban megadhatók.',
        ),
      ],
    },
    {
      id: 'apartment-types',
      title: 'Apartman típusok',
      summary:
        'Az apartmanok országkategóriái (pl. Olasz apartmanok, Horvát apartmanok).',
      path: '/apartments/types',
      menu: 'Apartmanok › Típusok',
      access: ACCESS,
      blocks: [
        img(
          'apartment-types',
          'Apartman típusok',
          'Az apartman típusok listája sorrenddel és állapottal.',
        ),
        img(
          'apartment-type-form',
          'Apartman típus szerkesztése',
          'Egy típus szerkesztése: név, slug, sorrend és állapot.',
        ),
        fields('Mezők', [
          field(
            'Név',
            'A típus neve (pl. „Olasz apartmanok”).',
            'Az admin menüjében és az apartman szerkesztő típusválasztójában.',
          ),
          field(
            'Slug + Generálás',
            'A típus azonosítója (pl. „italian”); az admin címében használt.',
            ADMIN_ONLY,
          ),
          field(
            'Sorrend',
            'A menüben elfoglalt hely; kisebb szám előrébb.',
            'Az admin menüjében.',
          ),
          field(
            'Állapot',
            'Aktív típus kap menüpontot és választható; inaktív nem.',
            ADMIN_ONLY,
          ),
        ]),
      ],
    },
    {
      id: 'locations',
      title: 'Helyek',
      summary:
        'Az apartmanok helyei (pl. Bibione, Lignano). Amelyik helynek van területe, annak saját apartmanoldala is van a weboldalon.',
      path: '/apartments/places',
      menu: 'Apartmanok › Helyek',
      access: ACCESS,
      blocks: [
        img(
          'locations',
          'Helyek listája',
          'A helyek listája régióval, az apartmanoldal címével és állapottal.',
        ),
        img(
          'location-form',
          'Hely szerkesztése',
          'Egy hely szerkesztése: név, URL-részek, bevezető, helyismertető és SEO.',
        ),
        fields('Mezők', [
          field(
            'Név',
            'A hely neve (pl. „Bibione”).',
            'A hely apartmanoldalának címében és az apartmanok adatainál.',
          ),
          field(
            'Aktív',
            'Az apartmanoldal akkor jelenik meg, ha a hely aktív és van aktív apartmanja.',
            'adriaholiday.hu/apartmanok/<terület>/<hely>',
          ),
          field(
            'Terület az URL-ben / Terület neve',
            'A hely tágabb területe (pl. „veneto” / „Veneto”). A webcím első része lesz.',
            'A hely apartmanoldalának webcímében és morzsamenüjében.',
          ),
          field(
            'URL név',
            'A hely webcímben használt neve (pl. „bibione”).',
            'A hely apartmanoldalának webcímében.',
          ),
          field(
            'Bevezető',
            'Rövid szöveg a hely apartmanjairól.',
            'A hely apartmanoldalán, az apartmanlista fölött.',
          ),
          field(
            'Helyismertető',
            'Hosszabb bemutató a helyről. A fejezetcímek horgonyai (pl. #strand_bibione) megmaradnak, ezekre lehet linkelni.',
            'A hely apartmanoldalán, az apartmanlista alatt.',
          ),
          field(
            'Információk az apartmanokhoz',
            'A hely minden apartmanjára érvényes tudnivalók (díjak, foglalási és fizetési feltételek).',
            'A hely minden apartmanjának saját oldalán.',
          ),
          field(
            'Oldal címe (title)',
            'Üresen: „{hely} apartmanok”.',
            SEARCH_RESULTS,
          ),
          field('Meta leírás', 'Üresen a bevezető eleje.', SEARCH_RESULTS),
          field(
            'Robots',
            'Pl. „noindex, follow”, ha az oldal ne kerüljön a keresőkbe.',
            'Csak a keresőrobotok látják.',
          ),
        ]),
        warning(
          'Az URL részek módosítása megváltoztatja a hely apartmanoldalának címét; régi cím esetén vegyél fel átirányítást.',
        ),
      ],
    },
    {
      id: 'regions',
      title: 'Régiók',
      summary:
        'A weboldal felső szintű régiói (pl. Albánia, Horvátország). Az apartmanok ezekhez tartoznak, és a kiemelt régiók a főoldalon kártyaként jelennek meg.',
      path: '/apartments/regions',
      menu: 'Apartmanok › Régiók',
      access: ACCESS,
      blocks: [
        img(
          'regions',
          'Régiók listája',
          'A régiók listája névvel, sluggal és állapottal, soronként aktiválás, szerkesztés és törlés.',
        ),
        img(
          'region-form',
          'Régió szerkesztése',
          'A régió szerkesztő ablaka a portfólió kiemelés beállításaival és a képekkel.',
        ),
        fields('Mezők', [
          field(
            'Név',
            'A régió neve.',
            'A régióoldal címe (adriaholiday.hu/regiok/<slug>), a régiókártyák és az apartmanok adatai.',
          ),
          field(
            'Slug + Generálás',
            'A régió webcímben használt neve, kisbetűvel (pl. „albania”).',
            'A régióoldal webcímében.',
          ),
          field(
            'Állapot',
            'Aktív / inaktív. Inaktív régió nem jelenik meg.',
            'A régióoldalon és a régiókártyákon.',
          ),
          field(
            'Portfólió kiemelt',
            'Csak a kiemelt régiók jelennek meg a főoldal régiókártyái (TravelCategories blokk) között.',
            'A főoldal „úti célok” régiókártyáin.',
          ),
          field(
            'Portfólió sorrend',
            'A kiemelt régiók sorrendje; kisebb szám előrébb.',
            'A főoldal régiókártyáinak sorrendjében.',
          ),
          field(
            'Fő kép',
            'A régió főképe.',
            'A régióoldal tetején és megosztáskor (Facebook) előnézeti képként.',
          ),
          field(
            'Portfólió kép',
            'A főoldali régiókártya képe. Ha üres, a fő kép látszik.',
            'A főoldal régiókártyáján.',
          ),
          field(
            'Portfólió rövid leírás',
            'Rövid leírás a régiókártyához.',
            'A főoldal régiókártyáján és a régióoldal bevezetőjében.',
          ),
        ]),
        list([
          'A bekapcsoló ikon azonnal aktiválja vagy deaktiválja a régiót.',
          'Régiót csak akkor törölj, ha nincs hozzá rendelve apartman.',
        ]),
      ],
    },
  ],
};

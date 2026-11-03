import { PencilLine } from 'lucide-react';

import type { GuideChapter } from '../lib/user-guide.types';

import {
  ADMIN_ONLY,
  SEARCH_RESULTS,
  field,
  fields,
  img,
  list,
  p,
  steps,
  tip,
  warning,
} from './blocks';

export const websiteContentChapter: GuideChapter = {
  id: 'website-content',
  title: 'Weboldal tartalma',
  description:
    'A publikus weboldal tartalmai: főoldali ajánlatblokkok, a kategóriaoldalak szűrői, a főoldali hero, utasaink levelei, szöveges oldalak, átirányítások és a buszok.',
  icon: PencilLine,
  topics: [
    {
      id: 'homepage-offers',
      title: 'Főoldali ajánlatok',
      summary:
        'A főoldalon megjelenő ajánlatcsoport-csempék (pl. Körutazások, Repülős körutazások, Tengerparti nyaralás). Mindegyik csempe képből, névből és egy linkből áll.',
      path: '/homepage-offers',
      menu: 'Főoldali ajánlatok',
      access: 'Főoldali ajánlatok megtekintése',
      blocks: [
        img(
          'homepage-offers',
          'Főoldali ajánlatok listája',
          'A főoldali ajánlatok sorrenddel, névvel, képpel és állapottal.',
        ),
        img(
          'homepage-offer-form',
          'Főoldali ajánlat szerkesztése',
          'Egy főoldali ajánlat szerkesztése: aktív, sorrend, kép, link és nyelvi tartalmak.',
        ),
        fields('Mezők', [
          field(
            'Aktív',
            'Csak az aktív ajánlat jelenik meg.',
            'A főoldal ajánlatcsempéi között.',
          ),
          field(
            'Sorrend',
            'A csempék sorrendje; kisebb szám előrébb.',
            'A főoldalon.',
          ),
          field(
            'Kép / Kép címe',
            'A csempe háttérképe és szöveges leírása.',
            'A főoldali csempén.',
          ),
          field(
            'Link',
            'Kategória oldala (pl. /kategoriak/korutazasok), vagy külső weboldal teljes címe (https://…), ami új lapon nyílik meg.',
            'A csempére kattintva ide jut a látogató.',
          ),
          field(
            'Név (nyelvenként)',
            'A csempén megjelenő cím.',
            'A főoldali csempén.',
          ),
          field(
            'SEO név + Automatikus generálás',
            'A csempe azonosító neve.',
            ADMIN_ONLY,
          ),
        ]),
        p(
          'A körutazás szerkesztőben a „Főoldali ajánlat” mezőben választható ki, melyik csempéhez tartozik egy út.',
        ),
      ],
    },
    {
      id: 'filter-chips',
      title: 'Portfólió filter chipek',
      summary:
        'A kategóriaoldalak tetején megjelenő gyorsszűrő gombok (chipek), pl. „Autóbuszos utak”, „Tengerpart”, „Max. 25 ezer Ft”.',
      path: '/portfolio-filter-chips',
      menu: 'Portfólió filter chipek',
      access: 'Filter chipek megtekintése',
      blocks: [
        img(
          'filter-chips',
          'Filter chipek listája',
          'A filter chipek listája címkével, hatókörrel, szűrővel, sorrenddel és állapottal.',
        ),
        img(
          'filter-chip-form',
          'Filter chip szerkesztése',
          'Egy filter chip szerkesztése.',
        ),
        fields('Mezők', [
          field(
            'Label',
            'A gomb felirata (pl. „Autóbuszos utak”).',
            'A kategóriaoldalak szűrősávjában.',
          ),
          field(
            'Slug',
            'Technikai azonosító; a webcímbe is bekerül, ha a látogató rákattint.',
            'A böngésző címsorában szűréskor.',
          ),
          field(
            'Ikon',
            'A gomb ikonja (hullám, épület, természet, busz, repülő, nap, címke, térkép, iránytű, pénztárca).',
            'A gomb felirata előtt.',
          ),
          field(
            'Sorrend',
            'A gombok sorrendje; kisebb szám előrébb.',
            'A szűrősávban.',
          ),
          field(
            'Scope típus / Scope érték',
            'Hol jelenjen meg a chip. „Globális”: minden kategóriaoldalon. „Kategória”: csak a megadott kategória oldalán. „Főoldali ajánlat”: csak az adott főoldali ajánlat oldalán.',
            'Az érintett kategóriaoldalakon.',
          ),
          field(
            'Filter típus / Filter érték',
            'Mi alapján szűr a gomb: téma, címke, kategória, közlekedés, ország vagy ár. Árnál minimum és maximum ár adható meg.',
            'A gombra kattintva a lista ennek megfelelően szűkül.',
          ),
          field(
            'Custom érték / Custom config JSON',
            'Haladó beállítás, csak fejlesztői használatra. Ne módosítsd.',
            ADMIN_ONLY,
          ),
          field('Aktív', 'Csak aktív chip jelenik meg.', 'A szűrősávban.'),
          field(
            'Elrejtés 0 találatnál',
            'Ha a szűrésnek nincs eredménye az adott oldalon, a gomb nem jelenik meg.',
            'A szűrősávban.',
          ),
        ]),
      ],
    },
    {
      id: 'portfolio-editor',
      title: 'Portfólió szerkesztése (főoldal)',
      summary:
        'A főoldal felső, nagy bemutató részének (hero) és további szövegblokkjainak szerkesztése. A módosítás először piszkozat, és csak a publikálás után látszik a weboldalon.',
      path: '/portfolio-editor',
      menu: 'Portfólió szerkesztése',
      access: 'Portfólió tartalom megtekintése / szerkesztése',
      blocks: [
        img(
          'portfolio-editor',
          'Portfólió szerkesztése',
          'Bal oldalt a hero szekció szerkesztője, jobb oldalt a háttérkép és videó; fent a piszkozat mentése és a publikálás gombjai.',
        ),
        fields('Hero szekció', [
          field(
            'Hero alcím',
            'A főcím fölötti kis felirat.',
            'A főoldal tetején.',
          ),
          field(
            'Hero főcím részek',
            'A főcím darabokban; minden darabhoz stílus választható (default, gradient, muted, accent), így egy-egy szó kiemelhető.',
            'A főoldal nagy főcíme.',
          ),
          field(
            'Hero alcím / leírás',
            'A főcím alatti bekezdés.',
            'A főoldal tetején.',
          ),
          field(
            'Elsődleges / Másodlagos CTA szöveg és link',
            'A hero két gombjának felirata és célja.',
            'A főoldal tetején lévő gombok.',
          ),
          field(
            'Hero statisztikák / Hero badge-ek',
            'Számkártyák (pl. „{evek}+ év tapasztalat”) és lebegő címkék. A {evek} helyére a cég alapítása óta eltelt évek, a {ertekeles} helyére a Google-értékelés kerül automatikusan.',
            'A főoldal tetején.',
          ),
          field(
            'Hero háttérkép / Hero videó',
            'A hero háttere. Ha van videó, az játszódik le, a kép tartalékként szolgál.',
            'A főoldal tetején.',
          ),
        ]),
        steps(
          [
            'Módosítsd a szövegeket vagy képeket.',
            'Kattints a „Mentés draftként” gombra – ekkor még csak piszkozat, a látogatók nem látják.',
            'A „Portfólió megnyitása szerkesztői módban” gombbal megnézheted az eredményt a weboldalon, és ott közvetlenül is szerkesztheted a blokkokat.',
            'Ha minden rendben, kattints a „Hero publikálása” (vagy az „Összes publikálása”) gombra.',
          ],
          'Szerkesztés menete',
        ),
        p(
          'A blokklistában a „Draft van” címke jelzi, ha egy blokknak publikálatlan módosítása van.',
        ),
      ],
    },
    {
      id: 'testimonials',
      title: 'Rólunk írták',
      summary:
        'Utasaink levelei és élménybeszámolói. Az aktív levelek közül a legfrissebbek a főoldalon, az összes a „Rólunk írták” oldalon jelenik meg.',
      path: '/testimonials',
      menu: 'Rólunk írták',
      access: 'Rólunk írták megtekintése',
      blocks: [
        img(
          'testimonials',
          'Rólunk írták',
          'A levelek listája dátummal, címmel, aláírással és állapottal.',
        ),
        img(
          'testimonial-form',
          'Levél szerkesztése',
          'Egy levél szerkesztése: cím, aláírás, dátum, megjelenés és a levél szövege.',
        ),
        fields('Mezők', [
          field(
            'Cím',
            'A levél címe, általában az út és az időpont (pl. „Bosznia 2026.05.07–10.”).',
            'A „Rólunk írták” oldalon és a főoldalon.',
          ),
          field(
            'Aláírás (opcionális)',
            'A levélíró neve, ahogy megjelenhet (pl. „B. Istvánné”). Csak az utas hozzájárulásával írd ki a teljes nevet.',
            'A levél alatt.',
          ),
          field(
            'Dátum',
            'A levél dátuma; ez alapján rendeződnek.',
            'A levél mellett; a legfrissebbek kerülnek a főoldalra.',
          ),
          field(
            'Megjelenik',
            'Kikapcsolva a levél rejtett.',
            'A „Rólunk írták” oldalon (adriaholiday.hu/rolunk-irtak) és a főoldalon.',
          ),
          field(
            'A levél szövege',
            'A levél teljes szövege, formázással.',
            'A „Rólunk írták” oldalon.',
          ),
        ]),
      ],
    },
    {
      id: 'pages',
      title: 'Oldalak',
      summary:
        'Szöveges oldalak a saját címükön (pl. /autobuszaink) és szövegblokkok. A régi oldalról áthozott oldalak rejtve érkeznek: nézd át, melyik jelenjen meg.',
      path: '/pages',
      menu: 'Oldalak',
      access: 'Oldalak megtekintése',
      blocks: [
        img('page-form', 'Új oldal', 'Új oldal vagy szövegblokk létrehozása.'),
        fields('Mezők', [
          field(
            'Fajta',
            '„Oldal”: saját címen elérhető weboldal. „Szövegblokk”: nincs saját címe, csak tárolja a szöveget, amelyet a weboldal más része használ.',
          ),
          field(
            'Cím',
            'Az oldal címe (pl. „Autóbuszaink”).',
            'Az oldal főcíme és a böngésző füle.',
          ),
          field(
            'Megjelenik',
            'Kikapcsolva az oldal nem érhető el.',
            'adriaholiday.hu/<oldal címe (URL)>',
          ),
          field(
            'Oldal címe (URL)',
            'Az oldal webcíme kisbetűvel, kötőjellel (pl. „autobuszaink”).',
            'A böngésző címsorában.',
          ),
          field(
            'SEO cím / SEO leírás (opcionális)',
            'Üresen a címből és a tartalom elejéből készül.',
            SEARCH_RESULTS,
          ),
          field(
            'Tartalom',
            'Az oldal szövege formázással, képekkel, táblázatokkal.',
            'Az oldalon.',
          ),
        ]),
        tip(
          'Az új oldalt a fejléc menüjébe a Beállítások › Header navigation részben veheted fel.',
        ),
      ],
    },
    {
      id: 'seo-redirects',
      title: 'Átirányítások',
      summary:
        'Régi címek, amelyeken már nincs oldal: a látogató és a Google tartós (301) átirányítással a megadott célra kerül. A lista elején a legtöbbet látogatott régi címek állnak.',
      path: '/seo-redirects',
      menu: 'Átirányítások',
      access: 'Átirányítások megtekintése',
      blocks: [
        img(
          'seo-redirects',
          'Átirányítások',
          'Az átirányítások listája a régi címmel, céllal, látogatásszámmal, forrással és állapottal.',
        ),
        img(
          'seo-redirect-form',
          'Új átirányítás',
          'Új átirányítás: régi cím, cél és aktív jelölő.',
        ),
        fields('Mezők', [
          field(
            'Régi cím',
            'A megszűnt cím a domain nélkül (pl. /apartman/regi-apartman).',
            'Aki erre a címre érkezik…',
          ),
          field(
            'Cél',
            'Az új cím (pl. /ajanlat/uj-ajanlat) vagy teljes külső cím.',
            '…automatikusan ide kerül.',
          ),
          field('Aktív', 'Kikapcsolva az átirányítás nem működik.'),
          field(
            'Látogatás',
            'Hányszor használták az átirányítást. Segít eldönteni, mely régi címek fontosak.',
            ADMIN_ONLY,
          ),
          field(
            'Forrás',
            '„Régi oldalról”: az importból származik. „Kézi”: itt vették fel. A módosított átirányítást a régi oldal újabb importja nem írja felül.',
            ADMIN_ONLY,
          ),
        ]),
        list([
          'Átirányítás csak akkor lép életbe, ha a régi címen nincs élő oldal.',
          'Ha egy út, apartman vagy oldal webcímét (SEO nevét) megváltoztatod, mindig vegyél fel átirányítást a régi címről az újra.',
        ]),
        warning(
          'Ne irányíts át egy címet önmagára vagy körbe (A → B → A), mert az oldal nem fog betölteni.',
        ),
      ],
    },
    {
      id: 'buses',
      title: 'Buszok',
      summary:
        'A cég autóbuszainak nyilvántartása járműkóddal és nyelvenkénti névvel.',
      path: '/buses',
      menu: 'Buszok',
      access: 'Buszok megtekintése',
      blocks: [
        img(
          'bus-form',
          'Busz szerkesztése',
          'Egy busz szerkesztése: aktív, busz kiválasztása, járműkód és nyelvi tartalom.',
        ),
        fields('Mezők', [
          field('Aktív', 'Kikapcsolva a busz archivált.', ADMIN_ONLY),
          field(
            'Busz kiválasztása',
            'A jármű típusa az előre megadott listából.',
            ADMIN_ONLY,
          ),
          field(
            'Jármű kód',
            'Egyedi azonosító (pl. man-lions-coach-r08-2019).',
            ADMIN_ONLY,
          ),
          field(
            'Név / SEO név (nyelvenként)',
            'A busz megnevezése.',
            ADMIN_ONLY,
          ),
        ]),
        p(
          'Az „Autóbuszaink” bemutató oldal szövege az Oldalak menüpontban szerkeszthető.',
        ),
      ],
    },
  ],
};

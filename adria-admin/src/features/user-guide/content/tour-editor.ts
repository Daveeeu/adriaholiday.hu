import type { GuideTopic } from '../lib/user-guide.types';

import {
  ADMIN_ONLY,
  SEARCH_RESULTS,
  field,
  fields,
  forms,
  shown,
  img,
  list,
  p,
  tip,
  warning,
} from './blocks';

const TOUR_PAGE = 'Az utazás saját oldalán (adriaholiday.hu/ajanlat/<Webcím>)';
const EDITOR_MENU = 'Körutazások › Ajánlatok › ceruza ikon';
const EDITOR_ACCESS = 'Körutazások szerkesztése';

/** The tour editor is long, so every collapsible section gets its own topic. */
export const tourEditorTopics: GuideTopic[] = [
  {
    id: 'tour-editor',
    title: 'A körutazás szerkesztő felépítése',
    summary:
      'A szerkesztő külön oldalon nyílik (új útnál az „Új körutazás” gombbal, meglévőnél a ceruza ikonnal). Bal oldalt a szakaszok menüje, jobb oldalt mindig csak a kiválasztott szakasz látszik; keskeny képernyőn a menü a szerkesztő felett, vízszintesen görgethető gombsorként jelenik meg.',
    path: '/tours',
    menu: EDITOR_MENU,
    access: EDITOR_ACCESS,
    blocks: [
      img(
        'tour-form-overview',
        'A körutazás szerkesztő',
        'Felül a vissza nyíl, az út neve és állapota, a Törlés, Mégse és Mentés gombok; bal oldalt a szakaszok menüje. A menüpont melletti szám (pl. „3”) a felvitt elemek (időpontok, képek, napok) számát, a piros pötty hibás mezőt jelez.',
      ),
      list(
        [
          'Alapok: Alapadatok (láthatóság, sorrend), Név és webcím, Képek',
          'Ár és időpontok: Árdoboz, Időpontok (a ritkábban kellő mezők, pl. akció, saját szállás, felárak, egy időpont „További beállítások” részében), Ár tartalma',
          'Tartalom: Leírások (lista leírás, ismertető, keresési kulcsszavak), Program szövege, Program napok, Útvonal térkép, Szállás és ellátás, Tudnivalók (kedvcsináló, fakultatív programok, belépők, fizetés, árak, kedvezmények, jegyzet; fent a gombokkal választod, melyiket szerkeszted, a zöld pötty a kitöltötteket jelzi)',
          'Beállítások: Besorolás és kiemelés (régió, kategóriák, országok, címkék, felszállási helyek, főoldali kiemelés), Partnerportálok, Foglalási űrlap',
        ],
        'A szakaszok menüje',
      ),
      tip(
        'A „Mentés” gomb az oldal tetején görgetés közben is látszik. Szakaszt váltani mentés nélkül is lehet: egyszerre több szakaszt is módosíthatsz, a mentés mindet rögzíti; mentés után a szerkesztő nyitva marad, a „Mégse” vagy a vissza nyíl visz vissza a listához.',
      ),
      tip(
        'Amíg van nem mentett módosítás, a fejlécben „Nem mentett módosítások” áll, és ha elhagynád az oldalt (másik menüpont, vissza gomb, a lap bezárása vagy újratöltése), a rendszer előbb rákérdez.',
      ),
      tip(
        'Ha egy mező hibás (pl. hiányzik a név), a mentés nem történik meg: a szerkesztő megnyitja a hibás szakaszt, a menüben piros pötty jelzi, a mező alatt pirossal kiírja a hibát, és felugró üzenetben is összefoglalja.',
      ),
    ],
  },
  {
    id: 'tour-basics',
    title: 'Alapadatok',
    summary:
      'Az út láthatóságát és alapvető viselkedését meghatározó kapcsolók.',
    menu: EDITOR_MENU,
    access: EDITOR_ACCESS,
    blocks: [
      img(
        'tour-form-basics',
        'Alapadatok szekció',
        'Az Alapadatok szekció a sorrenddel és a jelölőnégyzetekkel.',
      ),
      fields('Mezők', [
        field(
          'Sorrend',
          'Szám; a kisebb szám előrébb kerül. A listában a fel/le nyilakkal is állítható.',
          'A publikus ajánlatlisták és kategóriaoldalak sorrendjében.',
          forms('sortOrder'),
        ),
        field(
          'Aktív?',
          'A fő kapcsoló. Kikapcsolva az út sehol nem jelenik meg a weboldalon és nem foglalható, de az adminban megmarad.',
          'Mindenhol a publikus oldalon (listák, kereső, az út oldala, főoldal).',
          forms('active'),
        ),
        field(
          'Megjelenik az ajánlatlistákban?',
          'Kikapcsolva az út aktív marad és a saját címén elérhető (pl. egy hírlevélből linkelve), de a listákban, kategóriaoldalakon és a főoldalon nem szerepel.',
          'Ajánlatlisták, kategóriaoldalak, főoldali kiemelések és az „Ezek is érdekelhetnek” ajánló.',
          forms('listed'),
        ),
        field(
          'Partnerportálokon megjelenik?',
          'Bekapcsolva az út bekerül a partnerportálok (Travelgate, Travelmax, Cesys és az általános feed) adataiba. A részleteket a „Partnerportálok” szekcióban adhatod meg.',
          'A partnerek adatfolyamaiban (/xmltravel, /xmltravelmax, /xmlcesys, /xml).',
          forms('xmlEnabled'),
        ),
        field(
          'Kuponozható?',
          'Bekapcsolva a foglaláskor beváltható kuponkód (pl. a hírlevél-feliratkozás kuponja) erre az útra. Kikapcsolva a kupon nem csökkenti az árat.',
          'A foglalási űrlap kupon mezőjénél és az árösszesítőben.',
          forms('couponable'),
        ),
      ]),
    ],
  },
  {
    id: 'tour-seo',
    title: 'Név és webcím',
    summary: 'Az út neve, alcíme, webcíme és a keresőkben megjelenő szövegek.',
    menu: EDITOR_MENU,
    access: EDITOR_ACCESS,
    blocks: [
      img(
        'tour-form-seo',
        'Név és webcím szekció',
        'A név, alcím, Webcím, Keresőben megjelenő cím, robots és Keresőben megjelenő leírás mezői.',
      ),
      fields('Mezők', [
        field(
          'Név',
          'Az út neve, ahogy a látogatók látják (pl. „Dél-Erdély és a Vaskapu-szoros”).',
          `${TOUR_PAGE} főcímként, az ajánlatkártyákon, a keresőben, a foglalási e-mailekben és a PDF programban.`,
          shown(
            'field-trip-hero',
            'Az utazás oldalának fejléce: név, alcím, közlekedés, ellátás és szállás',
            'name',
          ),
        ),
        field(
          'Alcím',
          'Opcionális kiegészítő cím a név alatt.',
          `${TOUR_PAGE}, a név alatt.`,
          shown(
            'field-trip-hero',
            'Az utazás oldalának fejléce: név, alcím, közlekedés, ellátás és szállás',
            'subtitle',
          ),
        ),
        field(
          'Webcím',
          'Az út webcíme: adriaholiday.hu/ajanlat/<Webcím>. Csak kisbetű, szám és kötőjel. A „Generálás” gomb a névből készíti el.',
          'A böngésző címsorában és minden, az útra mutató linkben.',
          forms('seoName'),
        ),
        field(
          'Keresőben megjelenő cím',
          'A keresőkben megjelenő cím. Üresen az út neve lesz.',
          SEARCH_RESULTS,
          forms('seoTitle'),
        ),
        field(
          'Megjelenjen a keresőkben?',
          'Alapértelmezetten az út megjelenhet a Google-ben. A „Ne jelenjen meg a keresőkben” beállítás belső vagy kísérleti utaknál hasznos.',
          'Csak a keresőrobotok látják.',
          forms('seoRobots'),
        ),
        field(
          'Keresőben megjelenő leírás',
          'A keresőtalálat alatti 1–2 mondatos leírás. Üresen az ismertető szöveg eleje lesz. A mező alatti számláló segít: 120–160 karakter az ideális.',
          `${SEARCH_RESULTS} Facebookon megosztva is ez a leírás látszik.`,
          forms('seoDescription'),
        ),
        field(
          'Automatikus generálás',
          'Bekapcsolva a Webcím minden mentéskor a névből készül. Élő útnál kapcsold ki, ha nem akarod, hogy a név módosítása megváltoztassa a webcímet.',
          undefined,
          forms('seoAutoGenerate'),
        ),
      ]),
      warning(
        'Ha egy már élő út SEO nevét megváltoztatod, a régi cím megszűnik (pl. a Google-ben és a kiküldött hírlevelekben). Ilyenkor a Tartalom › Átirányítások oldalon irányítsd át a régi címet az újra.',
      ),
    ],
  },
  {
    id: 'tour-gallery',
    title: 'Galéria és média',
    summary:
      'Az út képei, tetszőleges sorrendben. Az első aktív kép a borítókép, a képek ebben a sorrendben jelennek meg a galériában.',
    menu: EDITOR_MENU,
    access: EDITOR_ACCESS,
    blocks: [
      img(
        'tour-form-gallery',
        'Galéria és média szekció',
        'A galéria címe, alcíme és a képek listája; a képek húzással vagy a fel–le nyilakkal rendezhetők.',
      ),
      fields('Mezők', [
        field(
          'Galéria cím / Galéria alcím',
          'A galéria blokk címe és alcíme (pl. „Képek az utazás hangulatából”).',
          `${TOUR_PAGE}, a képgaléria fölött.`,
          shown(
            'field-gallery',
            'A galéria az utazás oldalán',
            'galleryTitle',
            'gallerySubtitle',
          ),
        ),
        field(
          'Képek',
          'Képek hozzáadása a médiatárból vagy feltöltéssel. A sorrendet a kártya bal felső sarkában lévő fogantyút megfogva, a kártyát a kívánt helyre húzva, vagy a jobb oldali fel–le nyilakkal állíthatod; a kártyán az „1. kép”, „2. kép”… címke mutatja a helyét. A sorrend mentéskor rögzül. Az első aktív kép a borítókép.',
          'A borítókép az ajánlatkártyákon, a főoldali kiemeléseknél és az út oldalának tetején; a képek ugyanebben a sorrendben jelennek meg az út galériájában és a programleírás képei között, és a kép nélküli programnapok is ebben a sorrendben kapnak képet.',
          shown('field-gallery', 'A galéria az utazás oldalán', 'gallery'),
        ),
        field(
          'Cím / Alt szöveg / Képaláírás',
          'A kép címe, szöveges leírása (keresőknek, képernyőolvasóknak) és a galériában megjelenő aláírás.',
          'A galéria nagyított nézetében a képaláírás.',
        ),
        field(
          'Aktív / Megjelenik',
          'Kikapcsolva a kép megmarad a listában (a helyével együtt), de nem jelenik meg a weboldalon, és nem lehet borítókép.',
        ),
      ]),
      tip(
        'Fekvő, legalább 1600 px széles képeket használj; a rendszer automatikusan készít belőlük kisebb méreteket.',
      ),
    ],
  },
  {
    id: 'tour-pricebox',
    title: 'Árdoboz',
    summary:
      'Az út árdoboza: az alapár és a kedvezmények. A megjelenített árat (pl. „269.600 Ft / fő”) a rendszer írja az árból és az ár utótagból. Az időpontoknál időpontonként eltérő ár is megadható, az felülírja az itteni alapárat.',
    menu: EDITOR_MENU,
    access: EDITOR_ACCESS,
    blocks: [
      img(
        'tour-form-pricebox',
        'Árdoboz szekció',
        'Az árdoboz mezői: alapár, pénznem, utótag és kedvezmény.',
      ),
      fields('Mezők', [
        field(
          'Alapár',
          'Az út ára forintban, fejenként, csak számmal (pl. 269600). Ebből számol a foglalás.',
          `${TOUR_PAGE} az árdobozban, az ajánlatkártyákon és a foglalási űrlap árösszesítőjében, a rendszer formázásában (pl. „269.600 Ft”).`,
          shown(
            'field-price-box',
            'Az árdoboz az utazás oldalán, kedvezménnyel',
            'priceBox.price',
          ),
        ),
        field(
          'Pénznem',
          'Általában HUF.',
          undefined,
          forms('priceBox.currency'),
        ),
        field(
          'Ár utótag',
          'Az ár után írt szöveg (pl. „/ fő”), a rendszer az ár mögé írja.',
          `${TOUR_PAGE}, az árdobozban az ár mellett.`,
          shown(
            'field-price-box',
            'Az árdoboz az utazás oldalán, kedvezménnyel',
            'priceBox.priceSuffix',
          ),
        ),
        field(
          'Kedvezmény címke',
          'Kedvezmény jelölése. Ha százalékot írsz (pl. „-15%”), az árdoboz áthúzza az eredeti árat és a kedvezményes árat mutatja, és a foglaláskor is ennyivel csökken a részvételi díj.',
          `${TOUR_PAGE} az árdobozban és a foglalás árösszesítőjében.`,
          shown(
            'field-price-box',
            'Az árdoboz az utazás oldalán, kedvezménnyel',
            'priceBox.discountBadge',
          ),
        ),
        field(
          'Ár alatti szöveg',
          'Rövid szöveg közvetlenül az ár alatt (pl. „Előfoglalási kedvezmény”); ha ki van töltve, mindig megjelenik. Ha a kedvezmény címke százalékot ad, ezzel a névvel jelenik meg a kedvezmény a foglalás árösszesítőjében.',
          `${TOUR_PAGE}, az árdobozban az ár alatt, és a foglalás árösszesítőjében.`,
          shown(
            'field-price-box',
            'Az árdoboz az utazás oldalán, kedvezménnyel',
            'priceBox.discountText',
          ),
        ),
      ]),
      tip(
        'Akciónál (pl. előfoglalási árnál) egyszerűbb időpontonként megadni az „Eredeti ár (áthúzva)” értéket az Időpontok szekcióban: így csak az adott indulásnál látszik áthúzott ár.',
      ),
    ],
  },
  {
    id: 'tour-content',
    title: 'Tartalmi blokkok',
    summary:
      'Az út összes szöveges tartalma és a keresési kulcsszavak. Minden blokk formázott szöveg; az üresen hagyott blokk nem jelenik meg a weboldalon.',
    menu: EDITOR_MENU,
    access: EDITOR_ACCESS,
    blocks: [
      img(
        'tour-form-content',
        'Tartalmi blokkok szekció',
        'A leírások és a keresési kulcsszavak mezői.',
      ),
      fields('Mezők', [
        field(
          'Lista rövid leírása',
          'Egy-két mondatos összefoglaló.',
          'Az ajánlatkártyákon (listák, kategóriaoldalak, főoldal).',
          shown(
            'field-offer-card',
            'Egy ajánlatkártya a listákban',
            'listDescription',
          ),
        ),
        field(
          'Ismertető szöveg',
          'Az út rövid bemutatása. Ebből készül automatikusan a Keresőben megjelenő leírás, ha az üres, és ebből javasol keresési kulcsszavakat a rendszer.',
          `${TOUR_PAGE}, a cím alatti bevezetőben.`,
          shown(
            'field-trip-hero-pills',
            'Az utazás oldalának fejléce: az ismertető szöveg a cím felett',
            'shortDescription',
          ),
        ),
        field(
          'Keresési kulcsszavak',
          'Azok a szavak, amelyekre a weboldal keresője megtalálja az utat (pl. „Róma, Vatikán, Firenze”). Enterrel vagy vesszővel adhatsz hozzá újat, az X-szel törölhetsz. A „Javaslat az ismertető szövegből” gomb kigyűjti a szövegben szereplő helyszíneket. Az út neve, országai és régiója magától is kereshető.',
          'A weboldal keresőjében (fejléc kereső és ajánlatkereső). Egész szavakra keres: a „Róma” megtalálja az utat, a „Románia” nem.',
          forms('searchKeywords'),
        ),
        field(
          'Program előtti szöveg',
          'Bevezető a részletes program előtt.',
          `${TOUR_PAGE}, a Program blokk elején.`,
          shown(
            'field-program',
            'A Program blokk az utazás oldalán',
            'programBefore',
          ),
        ),
        field(
          'Program (teljes szöveg)',
          'A teljes program egyben. Ha napokra bontott program is van (Program napok szekció), az utazás oldalán az jelenik meg.',
          `${TOUR_PAGE}, a Program blokkban, és a PDF programban.`,
          shown(
            'field-program',
            'A Program blokk az utazás oldalán',
            'program',
          ),
        ),
        field(
          'Programok alatti szöveg',
          'A program alatti tudnivalók, pl. „A programváltozás jogát fenntartjuk.”',
          `${TOUR_PAGE}, a program alatt.`,
          shown(
            'field-program-footer',
            'A program alatti szöveg az utazás oldalán',
            'programFooter',
          ),
        ),
        field(
          'Kedvcsináló',
          'Hangulatos bevezető szöveg az utazáshoz.',
          TOUR_PAGE,
          shown(
            'field-teaser',
            'A kedvcsináló doboz az utazás oldalán',
            'teaser',
          ),
        ),
        field(
          'Fakultatív programok',
          'Választható, külön fizetendő programok leírása és ára.',
          `${TOUR_PAGE}, külön blokkban.`,
          shown(
            'field-optional-programs',
            'A fakultatív programok blokk az utazás oldalán',
            'optionalPrograms',
          ),
        ),
        field(
          'Belépőjegyek',
          'A belépőjegyek árai (táblázat is lehet).',
          `${TOUR_PAGE}, külön blokkban.`,
          shown(
            'field-tickets',
            'A belépőjegyek blokk az utazás oldalán',
            'tickets',
          ),
        ),
        field(
          'További szolgáltatási információk',
          'Kiegészítő, nem árhoz kötött információk.',
          TOUR_PAGE,
          shown(
            'field-inclusions',
            'A további szolgáltatási információk az utazás oldalán',
            'inclusions',
          ),
        ),
        field(
          'Fizetési program',
          'Az út egyedi fizetési feltételei.',
          TOUR_PAGE,
          forms('paymentProgram'),
        ),
        field(
          'Árak',
          'Részletes árazási információk (pl. gyermekár, egyágyas felár szövegesen).',
          TOUR_PAGE,
          shown('field-prices', 'Az árak blokk az utazás oldalán', 'prices'),
        ),
        field(
          'Kedvezmények',
          'Az út kedvezményeinek leírása.',
          TOUR_PAGE,
          shown(
            'field-discounts',
            'A kedvezmények blokk az utazás oldalán',
            'discounts',
          ),
        ),
        field(
          'Jegyzet / egyéb információ',
          'Egyéb tudnivalók.',
          TOUR_PAGE,
          shown('field-notes', 'A jegyzet blokk az utazás oldalán', 'notes'),
        ),
      ]),
      tip(
        'A szövegek szerkesztőjében az „Előnézet” gombbal ellenőrizheted a formázást mentés előtt.',
      ),
    ],
  },
  {
    id: 'tour-program-days',
    title: 'Program napok',
    summary:
      'Napokra bontott program idővonalként. Ha van legalább egy aktív programnap, az utazás oldalán ez jelenik meg a teljes szöveges program helyett.',
    menu: EDITOR_MENU,
    access: EDITOR_ACCESS,
    blocks: [
      img(
        'tour-form-program-days',
        'Program napok szekció',
        'A programnapok listája; egy nap címmel, leírással, ikonnal, képpel és címkékkel.',
      ),
      fields('Egy programnap mezői', [
        field(
          'Nap száma',
          'Hányadik nap (1, 2, 3…).',
          `${TOUR_PAGE}, az idővonalon.`,
          shown(
            'field-program-day',
            'Egy programnap az utazás oldalán',
            'programDays.dayNumber',
          ),
        ),
        field(
          'Cím',
          'A nap címe (pl. „Városnézés Brassóban”).',
          `${TOUR_PAGE}, az idővonalon.`,
          shown(
            'field-program-day',
            'Egy programnap az utazás oldalán',
            'programDays.title',
          ),
        ),
        field(
          'Leírás',
          'A nap részletes programja.',
          `${TOUR_PAGE}, az idővonalon.`,
          shown(
            'field-program-day',
            'Egy programnap az utazás oldalán',
            'programDays.description',
          ),
        ),
        field(
          'Élmény típusa',
          'Rövid kategória (pl. „Utazás, Kultúra”).',
          `${TOUR_PAGE}, a nap mellett.`,
          forms('programDays.experienceType'),
        ),
        field(
          'Ikon kulcs',
          'A naphoz tartozó ikon (pl. bus, beach, camera).',
          `${TOUR_PAGE}, a nap ikonja.`,
          forms('programDays.icon'),
        ),
        field(
          'Kép',
          'Opcionális kép a naphoz a médiatárból.',
          `${TOUR_PAGE}, a nap mellett.`,
          forms('programDays.image'),
        ),
        field(
          'Badge-ek',
          'Rövid címkék a naphoz (pl. „Városnézés”, „Fotómegálló”).',
          `${TOUR_PAGE}, a nap alatt.`,
          shown(
            'field-program-day',
            'Egy programnap az utazás oldalán',
            'programDays.badges',
            'programDays.badges.text',
          ),
        ),
        field(
          'Aktív / Megjelenik',
          'Kikapcsolva a nap rejtve marad.',
          undefined,
          forms('programDays.active'),
        ),
      ]),
      p(
        'A napok sorrendje húzással módosítható, a másolás ikonnal egy nap lemásolható.',
      ),
    ],
  },
  {
    id: 'tour-route-map',
    title: 'Útvonal térkép',
    summary:
      'A megállók sorrendben, amelyekből a rendszer térképet rajzol az utazás oldalára és a PDF-ekbe.',
    menu: EDITOR_MENU,
    access: EDITOR_ACCESS,
    blocks: [
      fields('Mezők', [
        field(
          'Megálló hozzáadása',
          'Kezdd el írni a város nevét, és válaszd ki a találatok közül (OpenStreetMap). A megálló a lista végére kerül.',
          ADMIN_ONLY,
        ),
        field(
          'Javaslat a programleírásból',
          'A mentett program napcímeiből (pl. „1. NAP BELGRÁD: …”) kiolvasott helynevek. Egy névre kattintva rákeres; a találatot neked kell kiválasztani.',
          ADMIN_ONLY,
        ),
        field(
          'Megálló neve',
          'Így jelenik meg a térképen; átírható (pl. „Skadar” helyett „Shkoder”).',
          `${TOUR_PAGE}, a jobb oldali panel alatti térképen, a program PDF-ben és az utazási könyvben.`,
          shown(
            'field-route-map',
            'Az útvonaltérkép az utazás oldalán',
            'routeStops.name',
          ),
        ),
        field(
          'Szállás',
          'A szállás helye pirossal jelenik meg, a többi megálló feketével.',
          'A térképen.',
          shown(
            'field-route-map',
            'Az útvonaltérkép az utazás oldalán',
            'routeStops.accommodation',
          ),
        ),
      ]),
      p(
        'A térkép a megállókat a lista sorrendjében köti össze pontozott vonallal, és azokat az országokat mutatja, ahol megálló van. A nyilakkal a sorrend változtatható. Az előnézet mentés előtt is mutatja a térképet; üres listával nincs térkép.',
      ),
    ],
  },
  {
    id: 'tour-stay',
    title: 'Szállás és ellátás',
    summary: 'Az út szállása és ellátása, kiegészítő információval.',
    menu: EDITOR_MENU,
    access: EDITOR_ACCESS,
    blocks: [
      img(
        'tour-form-stay',
        'Szállás és ellátás szekció',
        'A szállás és az ellátás megnevezése, mindkettőhöz kiegészítő információval.',
      ),
      fields('Mezők', [
        field(
          'Szállás',
          'A szállás típusa (pl. „Hotel***”).',
          `${TOUR_PAGE}, a felső információs kártyákon.`,
          shown(
            'field-trip-hero',
            'Az utazás oldalának fejléce: név, alcím, közlekedés, ellátás és szállás',
            'accommodation',
          ),
        ),
        field(
          'Szállás információ',
          'Kiegészítés (pl. „2 ágyas szoba”).',
          `${TOUR_PAGE}, a szállás kártyán az ⓘ ikonra kattintva.`,
          shown(
            'field-trip-hero',
            'Az utazás oldalának fejléce: név, alcím, közlekedés, ellátás és szállás',
            'accommodationInfo',
          ),
        ),
        field(
          'Ellátás',
          'Az ellátás (pl. „reggeli”, „félpanzió”).',
          `${TOUR_PAGE}, a felső információs kártyákon.`,
          shown(
            'field-trip-hero',
            'Az utazás oldalának fejléce: név, alcím, közlekedés, ellátás és szállás',
            'catering',
          ),
        ),
        field(
          'Ellátás információ',
          'Kiegészítés az ellátáshoz.',
          `${TOUR_PAGE}, az ellátás kártyán az ⓘ ikonra kattintva.`,
          shown(
            'field-trip-hero',
            'Az utazás oldalának fejléce: név, alcím, közlekedés, ellátás és szállás',
            'cateringInfo',
          ),
        ),
      ]),
      p(
        'Az időpontoknál időpontonként eltérő szállás és ellátás is megadható; üresen az itt megadott érvényes.',
      ),
    ],
  },
  {
    id: 'tour-price-items',
    title: 'Ár tartalma',
    summary:
      'Az árban szereplő és az árban nem szereplő tételek két külön, rendezhető listában.',
    menu: EDITOR_MENU,
    access: EDITOR_ACCESS,
    blocks: [
      img(
        'tour-form-price-items',
        'Ár tartalma szekció',
        'Az „Az ár tartalmazza” és „Az ár nem tartalmazza” listák.',
      ),
      fields('Mezők', [
        field(
          'Az ár tartalmazza',
          'Tételenként egy sor (pl. „Utazás klimatizált autóbusszal”).',
          `${TOUR_PAGE}, pipával jelölt listában.`,
          shown(
            'field-price-items',
            'Az ár tartalma az utazás oldalán',
            'priceItems.included',
          ),
        ),
        field(
          'Az ár nem tartalmazza',
          'Tételenként egy sor (pl. „Belépőjegyek”).',
          `${TOUR_PAGE}, külön listában.`,
          shown(
            'field-price-items',
            'Az ár tartalma az utazás oldalán',
            'priceItems.excluded',
          ),
        ),
        field(
          'Aktív / Megjelenik',
          'Kikapcsolva a tétel nem látszik.',
          undefined,
          forms('priceItems.active'),
        ),
      ]),
      p(
        'Új tételt az „Új elem” gombbal veszel fel; a sorrend húzással módosítható.',
      ),
    ],
  },
  {
    id: 'tour-filters',
    title: 'Szűrők és kapcsolatok',
    summary:
      'Az út besorolása: ezek alapján kerül a megfelelő kategóriaoldalakra, szűrőkbe, és ezek határozzák meg a felszállási helyeket és a főoldali kiemelést.',
    menu: EDITOR_MENU,
    access: EDITOR_ACCESS,
    blocks: [
      img(
        'tour-form-filters',
        'Szűrők és kapcsolatok szekció',
        'Régió, kiemelés, kategóriák, program típus, közlekedés, országok, címkék és a felszállási helyek felára.',
      ),
      fields('Mezők', [
        field(
          'Régiók',
          'A körutazás régiója (Apartmanok › Régiók).',
          'A listák szűrőiben, az út adatai között és a partnerportálok adataiban.',
          forms('regionId'),
        ),
        field(
          'Kiemelt?',
          'Bekapcsolva az út a főoldal kiemelt ajánlatai között szerepel. A főoldal egyszerre legfeljebb 5 kiemelt utat mutat, és naponta a következő ötre vált, így minden kiemelt út sorra kerül.',
          'A főoldal kiemelt ajánlatok blokkjában.',
          shown(
            'field-home-featured',
            'A főoldal kiemelt ajánlatai',
            'featured',
          ),
        ),
        field(
          'Kiemelt sorrend',
          'A főoldali kiemelt ajánlatok sorrendje (kisebb szám előrébb); a napi váltás is ebben a sorrendben halad. Üresen az út a kiemeltek végére kerül.',
          'A főoldal kiemelt ajánlatok blokkjában.',
          shown(
            'field-home-featured',
            'A főoldal kiemelt ajánlatai',
            'featuredOrder',
          ),
        ),
        field(
          'Kiemelés a pozitív kiemelt ajánlatok között',
          'Bekapcsolva az út előrébb kerül a kiemelt ajánlatok között (a „Kiemelt?” utak után).',
          'Az ajánlatlista és a kategóriaoldalak tetején kiemelt három ajánlat kiválasztásában.',
          forms('recommended'),
        ),
        field(
          'Kategóriák',
          'Az út kategóriái (pl. Körutazások, Adventi barangolások). Új útnál a „Körutazások” alapból ki van választva; ha nem illik, vedd le vagy cseréld. A kategóriákat a Blog › Kategóriák oldalon lehet kezelni. A legördülőben új kategória is létrehozható.',
          'A kategóriaoldalakon (adriaholiday.hu/kategoriak/<kategória>), az ajánlatkártyák címkéiben és az „Ezek is érdekelhetnek” ajánlóban.',
          forms('categoryIds'),
        ),
        field(
          'Program típus',
          'Az út jellegének besorolása.',
          'Az ajánlatkártyákon.',
          forms('programTypeId'),
        ),
        field(
          'Közlekedés',
          'Busz, repülő vagy vonat.',
          'A „Buszos utak” és „Repülős utak” kategóriaoldalakon, az árajánlat-kérő és a foglalási űrlapon.',
          shown(
            'field-trip-hero',
            'Az utazás oldalának fejléce: név, alcím, közlekedés, ellátás és szállás',
            'travelModeId',
          ),
        ),
        field(
          'Országok',
          'Az út által érintett országok.',
          'A keresőben (országnévre is megtalálható az út), az „Ezek is érdekelhetnek” ajánlóban, és a foglalás-visszaigazoló e-mailben a „Beutazási feltételek” linkek országonként.',
          forms('countryIds'),
        ),
        field(
          'Címkék',
          'Szabad címkék az út jellemzésére (pl. „családbarát”).',
          'Az ajánlatkártyákon és a szűrésnél.',
          forms('tagIds'),
        ),
        field(
          'Felszállási helyek',
          'Mely felszállási helyekről indulhat az út (Körutazások › Felszállási helyek).',
          'A foglalási űrlap felszállási hely választólistájában.',
          shown(
            'field-departure-places',
            'A felszállási lehetőségek az utazás oldalán',
            'departurePlaceIds',
          ),
        ),
        field(
          'Felszállási helyek sorrendje és felára ennél az útnál',
          'A kiválasztott helyek listája. A sorrendet a fogantyúval húzva vagy a fel–le nyilakkal állíthatod, a busz útvonala szerint (pl. Miskolc, Mezőkövesd, Gyöngyös, Hatvan, Budapest); az új hely a végére kerül. A felár Ft/fő: üresen hagyva a felszállási hely általános díja érvényes, kitöltve csak ennél az útnál más a díj.',
          'A foglalási űrlap választólistájában ebben a sorrendben, a felár az árösszesítőben.',
          shown(
            'field-booking-form',
            'A foglalási űrlap: felszállási hely és felárak',
            'departurePlaceFees',
          ),
        ),
      ]),
      p(
        'Az út oldalának alján az „Ezek is érdekelhetnek” blokk a megtekintett úthoz leginkább hasonló utakat ajánlja. A hasonlóságot elsősorban a közös kategóriák és országok adják, utána a régió, a közlekedés, az út hossza és az ár. Ha a látogató elfogadta a marketing sütiket, a korábban megnézett útjai is számítanak: minden harmadik ajánlat az érdeklődéséhez igazodik. A már megnézett és az időpont nélküli utak hátrébb kerülnek. Az ajánló csak a listákban megjelenő utakból választ.',
      ),
      tip(
        'Az ajánlások annyira pontosak, amennyire a kategóriák és az országok: érdemes minden útnál kitölteni őket.',
      ),
    ],
  },
  {
    id: 'tour-dates',
    title: 'Időpontok és felárak',
    summary:
      'Az út indulási időpontjai, tetszőleges sorrendben. Minden időponthoz külön ár, státusz, akciós ár, felárak és felszállási helyek tartozhatnak. A weboldal a jövőbeli időpontokat kínálja foglalásra, az itt beállított sorrendben.',
    menu: EDITOR_MENU,
    access: EDITOR_ACCESS,
    blocks: [
      img(
        'tour-form-dates',
        'Időpontok szekció',
        'Időpontonként indulás, érkezés, ár, státusz, akciós ár, felárak és felszállási helyek.',
      ),
      fields('Sorrend', [
        field(
          'Fogantyú / Fel–le nyilak',
          'Az időpont kártyáját a bal felső fogantyúnál megfogva a kívánt helyre húzhatod, vagy a jobb oldali nyilakkal egy hellyel feljebb vagy lejjebb teheted; a kártyán az „1. időpont”, „2. időpont”… címke mutatja a helyét. Az új időpont a lista végére kerül. A sorrend mentéskor rögzül.',
          `${TOUR_PAGE} az időpontválasztóban és a foglalási űrlapon, valamint a program PDF időpontlistájában.`,
        ),
        field(
          'Rendezés dátum szerint',
          'Egy kattintással indulási dátum szerint sorba teszi az időpontokat (a legkorábbi elöl, a dátum nélküliek a végén). Utána kézzel még módosíthatsz, és mentened kell.',
          ADMIN_ONLY,
        ),
      ]),
      fields('Egy időpont mezői', [
        field(
          'Indulás / Érkezés',
          'Az utazás első és utolsó napja.',
          `${TOUR_PAGE} az időpontválasztóban, a foglalási űrlapon és a visszaigazolásban.`,
          shown(
            'field-dates',
            'Az időpontválasztó az utazás oldalán',
            'dates.startDate',
            'dates.endDate',
          ),
        ),
        field(
          'Ár',
          'Az adott időpont ára (Ft/fő). Ha üres, az árdoboz alapára érvényes.',
          'Az időpontválasztóban és a foglalás árösszesítőjében.',
          shown(
            'field-dates',
            'Az időpontválasztó az utazás oldalán',
            'dates.price',
            'dates.priceBox.price',
          ),
        ),
        field(
          'Státusz',
          '„Elérhető” vagy „Betelt”. A „Betelt” időpont a weboldalon „Betelt” felirattal látszik, nem foglalható, és kimarad a partnerportálok adataiból. Ha az időpont férőhelyei elfogytak, a rendszer magától betöltnek mutatja, akkor is, ha itt „Elérhető” áll.',
          `${TOUR_PAGE} az időpontválasztóban, valamint a partnerportálok adataiban.`,
          shown(
            'field-dates',
            'Az időpontválasztó az utazás oldalán',
            'dates.status',
          ),
        ),
        field(
          'Maximum létszám',
          'Hány utast visz ez az indulás. Új időpontnál alapból 45 fő, repülős utaknál 22 fő; átírható. Alatta látod, hány fő foglalt már rá és hány hely szabad. A foglalt létszámot a nem lemondott, nem lejárt foglalások utasai adják, a weboldalon, az irodában és importtal rögzítettek egyaránt. A szabad helyet nem kell beírni, a rendszer számolja. A mező nem állítható a már foglalt létszám alá; üresen hagyva nincs létszámkorlát.',
          `${TOUR_PAGE}: a foglalási űrlap legfeljebb a szabad helyek számáig enged foglalni, a megtelt időpont betelt. Ha már csak a helyek legfeljebb 35%-a szabad, pár másodperccel az oldal megnyitása után felugró üzenet jelzi, hány hely maradt.`,
          shown(
            'field-seats-running-low',
            'A „Fogynak a helyek!” felugró üzenet az utazás oldalán',
            'dates.capacity',
          ),
        ),
        field(
          'Eredeti ár (áthúzva)',
          'Akciónál az akció előtti ár. Csak akkor látszik, ha nagyobb, mint az időpont ára.',
          'Az időpontválasztóban és az árdobozban, áthúzva.',
          shown(
            'field-dates',
            'Az időpontválasztó az utazás oldalán',
            'dates.priceBox.originalPrice',
          ),
        ),
        field(
          'Címke az ár mellett',
          'Rövid címke (pl. „Előfoglalási akció”, „Last minute”).',
          'Az árdobozban, az ár mellett.',
          forms('dates.priceBox.label'),
        ),
        field(
          'Szállás / Ellátás (időpontonként)',
          'Ha ennél az indulásnál más a szállás vagy ellátás. Üresen az út általános értéke érvényes.',
          `${TOUR_PAGE}, az adott időpont kiválasztásakor.`,
          shown(
            'field-trip-hero',
            'Az utazás oldalának fejléce: név, alcím, közlekedés, ellátás és szállás',

            'dates.accommodation',
            'dates.accommodationInfo',
            'dates.catering',
            'dates.cateringInfo',
          ),
        ),
        field(
          'Felszállási helyek ennél az időpontnál',
          'Ha egyet sem jelölsz be, az út összes felszállási helye választható; ha bejelölsz néhányat, csak azok.',
          'A foglalási űrlap felszállási hely választólistájában.',
          shown(
            'field-booking-form',
            'A foglalási űrlap: felszállási hely és felárak',
            'dates.departurePlaceIds',
          ),
        ),
        field(
          'Partnerportálok (Partnerportálokon megjelenik, Szállás – Cesys, Szobatípus – Cesys)',
          'Az időpont megjelenése a partnerfeedekben és a Cesys számára küldött szállásadatok.',
          'A partnerportálok adataiban.',
          forms(
            'dates.xmlEnabled',
            'dates.partnerXml.cesysAccommodation',
            'dates.partnerXml.cesysRoom',
          ),
        ),
      ]),
      fields('Felárak (időpontonként)', [
        field(
          'Megnevezés',
          'A felár neve (pl. „Egyágyas felár”, „Vacsora”).',
          'A foglalási űrlapon, az árösszesítőben és a visszaigazoló e-mailben.',
          shown(
            'field-booking-form',
            'A foglalási űrlap: felszállási hely és felárak',
            'dates.extras.name',
          ),
        ),
        field(
          'Ár / Pénznem',
          'A felár összege. „Ft”: a foglalással együtt fizetendő. „EUR, helyszínen fizetendő”: nem adódik a végösszeghez, csak tájékoztatásként jelenik meg.',
          'A foglalási űrlap árösszesítőjében.',
          shown(
            'field-booking-form',
            'A foglalási űrlap: felszállási hely és felárak',
            'dates.extras.price',
            'dates.extras.currency',
          ),
        ),
        field(
          'Felszámítás',
          '„Ha a foglaló kéri”: választható. „Mindig (kötelező)”: minden foglaláshoz hozzáadódik. „Egyedül utazónak”: automatikusan felszámítja, ha egy fő foglal.',
          'A foglalási űrlapon.',
          shown(
            'field-booking-form',
            'A foglalási űrlap: felszállási hely és felárak',
            'dates.extras.priceUnit',
          ),
        ),
        field(
          'Mikor kell fizetni?',
          '„Fő után”: utasonként. „Foglalásonként”: egyszer a foglalásra.',
          'Az árösszesítőben.',
          shown(
            'field-booking-form',
            'A foglalási űrlap: felszállási hely és felárak',
            'dates.extras.chargeRule',
          ),
        ),
        field(
          'Választási lehetőségek',
          'Opcionális, soronként egy lehetőség (pl. „Egyedül szeretnék lenni a szobában” / „Szeretnék szobatársat”). Ha kitöltöd, a foglaló a felár mellé ezek közül választ egyet.',
          'A foglalási űrlapon a felár alatt.',
          forms('dates.extras.choices'),
        ),
      ]),
      list([
        'Új időpontot az „Időpont hozzáadása” gombbal veszel fel; a sor végi kuka ikon törli.',
        'A felárakat a „Másolás a többi időpontra” gombbal egyszerre átmásolhatod az összes időpontra.',
        'A felárak sorrendje a fel/le nyilakkal állítható.',
      ]),
      warning(
        'Ha egy indulásra már nem lehet foglalni, ne töröld az időpontot, hanem állítsd „Betelt” státuszra. A törölt időpont foglalásai megmaradnak, de a foglalás adatlapján ezután nem látszik a foglalt időpont, és a férőhelyek sem számolhatók tovább.',
      ),
    ],
  },
  {
    id: 'tour-partner-xml',
    title: 'Partnerportálok (Travelgate, Travelmax, Cesys)',
    summary:
      'Amit az út a partnerportálokon mutat. Csak akkor számít, ha az Alapadatoknál a „Partnerportálokon megjelenik?” be van kapcsolva. A mezők alapból az út adataiból töltődnek ki; csak azt kell átírni, ami eltér.',
    menu: EDITOR_MENU,
    access: EDITOR_ACCESS,
    blocks: [
      img(
        'tour-form-partner-xml',
        'Partnerportálok szekció',
        'A partnerportálokon használt régió, utazástípusok, szállás és biztosítás adatai.',
      ),
      tip(
        'Alapértékek: régió és ország az út régiójából (vagy az első országából), szállás neve a „Szállás” mezőből csillagok nélkül, város a szállás megállójából (Útvonal térkép) vagy az országból, biztosítás díja a foglalási beállítások napi díjából, Travelmax szállásleírás a „Szállás információ” mezőből, utazástípus: körutazás (City break program típusnál városlátogatás). Amíg nem írod át, az érték az út adataival együtt változik; az átírt érték marad. Új útnál az első mentés után jelennek meg.',
      ),
      fields('Mezők', [
        field(
          'Régió a partnereknél',
          'Ez alapján sorolják be a portálok az utat. Üresen az út saját régiója.',
          'A partner feedekben.',
          forms('partnerXml.country_id'),
        ),
        field(
          'Utazás típusa – Travelgate / Travelmax / Cesys / általános feed',
          'Portálonként eltérő utazástípus-lista; mindegyiknél a portál saját kategóriáját kell kiválasztani.',
          'Az adott partner feedjében (/xmltravel, /xmltravelmax, /xmlcesys, /xml).',
          forms(
            'partnerXml.travel_types.general',
            'partnerXml.travel_types.travelgate',
            'partnerXml.travel_types.cesys',
            'partnerXml.travel_types.travelmax',
          ),
        ),
        field(
          'Szállás megnevezése a portálokon / Város',
          'A portálokon megjelenő szálláshely és város.',
          'A partner feedekben.',
          forms('partnerXml.accommodation_name', 'partnerXml.city'),
        ),
        field(
          'Biztosítás díja (Ft/fő/nap)',
          'Az általános feedben (/xml) megjelenő biztosítási díj.',
          'Az általános feedben.',
          forms('partnerXml.insurance_value'),
        ),
        field(
          'Szállás leírása – Travelmax',
          'A Travelmax számára küldött szállásleírás.',
          'A Travelmax feedben.',
          forms('partnerXml.accommodation_description_travelmax'),
        ),
      ]),
    ],
  },
  {
    id: 'tour-booking-form',
    title: 'Foglalási űrlap beállításai',
    summary:
      'Melyik foglalási űrlap sablon alapján kérje be a weboldal az adatokat ennél az útnál.',
    menu: EDITOR_MENU,
    access: EDITOR_ACCESS,
    blocks: [
      img(
        'tour-form-booking-form',
        'Foglalási űrlap beállításai',
        'A foglalási űrlap sablon kiválasztása és a sablon mezőinek előnézete.',
      ),
      fields('Mezők', [
        field(
          'Foglalási űrlap sablon',
          'Pl. „Buszos út”, „Repülős út” vagy egyedi sablon. Csak aktív sablon választható. Üresen az alapértelmezett sablon érvényes. A sablonokat a Foglalások › Foglalási űrlap sablonok oldalon lehet szerkeszteni.',
          'A weboldal foglalási űrlapján: mely adatokat kell megadni (pl. útlevélszám, születési dátum).',
          shown(
            'field-booking-form',
            'A foglalási űrlap: felszállási hely és felárak',
            'bookingFormTemplateId',
          ),
        ),
      ]),
    ],
  },
];

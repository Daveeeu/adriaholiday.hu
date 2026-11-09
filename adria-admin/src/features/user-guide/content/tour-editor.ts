import type { GuideTopic } from '../lib/user-guide.types';

import {
  ADMIN_ONLY,
  SEARCH_RESULTS,
  field,
  fields,
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
      'A szerkesztő jobbról becsúszó panel, amely lenyitható szekciókra tagolódik. Mindig csak azt nyisd le, amin dolgozol; az „Összes lenyitása” / „Összes csukása” gombokkal egyszerre is nyithatod-zárhatod őket.',
    path: '/tours',
    menu: EDITOR_MENU,
    access: EDITOR_ACCESS,
    blocks: [
      img(
        'tour-form-overview',
        'A körutazás szerkesztő',
        'A szerkesztő teteje: a szekciók listája, alul a Törlés, Mégse és Mentés gombok. A szekciók fejlécében lévő szám (pl. „10 elem”) a már felvitt elemek számát mutatja.',
      ),
      list(
        [
          'Alapadatok – láthatóság és alapkapcsolók',
          'Név és webcím – név, alcím, webcím, keresőben megjelenő szöveg',
          'Galéria és média – képek',
          'Árdoboz – az árdoboz tartalma',
          'Tartalmi blokkok – leírások, program, keresési kulcsszavak, PDF',
          'Program napok – napokra bontott program',
          'Útvonal térkép – a megállókból rajzolt térkép',
          'Szállás és ellátás',
          'Ár tartalma – mit tartalmaz és mit nem az ár',
          'Szűrők és kapcsolatok – régió, kategória, ország, közlekedés, felszállási helyek',
          'Időpontok – indulások, időpontonkénti ár, felárak',
          'Partnerportálok – partnerportálok feedjei',
          'Foglalási űrlap beállításai – melyik űrlapsablont használja a foglalás',
          'Partner bónuszok',
        ],
        'A szekciók sorrendben',
      ),
      tip(
        'A „Mentés” gomb a panel alján mindig látszik. Egyszerre több szekciót is módosíthatsz, a mentés mindet rögzíti.',
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
        ),
        field(
          'Aktív?',
          'A fő kapcsoló. Kikapcsolva az út sehol nem jelenik meg a weboldalon és nem foglalható, de az adminban megmarad.',
          'Mindenhol a publikus oldalon (listák, kereső, az út oldala, főoldal).',
        ),
        field(
          'Megjelenik az ajánlatlistákban?',
          'Kikapcsolva az út aktív marad és a saját címén elérhető (pl. egy hírlevélből linkelve), de a listákban, kategóriaoldalakon és a főoldalon nem szerepel.',
          'Ajánlatlisták, kategóriaoldalak, főoldali kiemelések és az „Ezek is érdekelhetnek” ajánló.',
        ),
        field(
          'Partnerportálokon megjelenik?',
          'Bekapcsolva az út bekerül a partnerportálok (Travelgate, Travelmax, Cesys és az általános feed) adataiba. A részleteket a „Partnerportálok” szekcióban adhatod meg.',
          'A partnerek adatfolyamaiban (/xmltravel, /xmltravelmax, /xmlcesys, /xml).',
        ),
        field(
          'Kuponozható?',
          'Bekapcsolva a foglaláskor beváltható kuponkód (pl. a hírlevél-feliratkozás kuponja) erre az útra. Kikapcsolva a kupon nem csökkenti az árat.',
          'A foglalási űrlap kupon mezőjénél és az árösszesítőben.',
        ),
        field(
          'Képes ajánlat?',
          'A régi rendszerből átvett jelölő; a listában szűrni lehet rá.',
          ADMIN_ONLY,
        ),
        field(
          'Slider kép / Slider szöveg',
          'A régi rendszer sliderjéhez tartozó jelölők; az új weboldal nem használja őket.',
          ADMIN_ONLY,
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
        'A név, alcím, akciók, Webcím, Keresőben megjelenő cím, robots és Keresőben megjelenő leírás mezői.',
      ),
      fields('Mezők', [
        field(
          'Név',
          'Az út neve, ahogy a látogatók látják (pl. „Dél-Erdély és a Vaskapu-szoros”).',
          `${TOUR_PAGE} főcímként, az ajánlatkártyákon, a keresőben, a foglalási e-mailekben és a PDF programban.`,
        ),
        field(
          'Alcím',
          'Opcionális kiegészítő cím a név alatt.',
          `${TOUR_PAGE}, a név alatt.`,
        ),
        field(
          'Akció 1 / Akció 2',
          'Belső akciócímkék (pl. „Előfoglalás”). Az admin listában és keresőjében látszanak.',
          ADMIN_ONLY,
        ),
        field(
          'Webcím',
          'Az út webcíme: adriaholiday.hu/ajanlat/<Webcím>. Csak kisbetű, szám és kötőjel. A „Generálás” gomb a névből készíti el.',
          'A böngésző címsorában és minden, az útra mutató linkben.',
        ),
        field(
          'Keresőben megjelenő cím',
          'A keresőkben megjelenő cím. Üresen az út neve lesz.',
          SEARCH_RESULTS,
        ),
        field(
          'Megjelenjen a keresőkben?',
          'Alapértelmezetten az út megjelenhet a Google-ben. A „Ne jelenjen meg a keresőkben” beállítás belső vagy kísérleti utaknál hasznos.',
          'Csak a keresőrobotok látják.',
        ),
        field(
          'Keresőben megjelenő leírás',
          'A keresőtalálat alatti 1–2 mondatos leírás. Üresen az ismertető szöveg eleje lesz. A mező alatti számláló segít: 120–160 karakter az ideális.',
          `${SEARCH_RESULTS} Facebookon megosztva is ez a leírás látszik.`,
        ),
        field(
          'Automatikus generálás',
          'Bekapcsolva a Webcím minden mentéskor a névből készül. Élő útnál kapcsold ki, ha nem akarod, hogy a név módosítása megváltoztassa a webcímet.',
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
        ),
        field(
          'Képek',
          'Képek hozzáadása a médiatárból vagy feltöltéssel. A sorrendet a kártya bal felső sarkában lévő fogantyút megfogva, a kártyát a kívánt helyre húzva, vagy a jobb oldali fel–le nyilakkal állíthatod; a kártyán az „1. kép”, „2. kép”… címke mutatja a helyét. A sorrend mentéskor rögzül. Az első aktív kép a borítókép.',
          'A borítókép az ajánlatkártyákon, a főoldali kiemeléseknél és az út oldalának tetején; a képek ugyanebben a sorrendben jelennek meg az út galériájában és a programleírás képei között, és a kép nélküli programnapok is ebben a sorrendben kapnak képet.',
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
      'Az út árdoboza: az alapár, a megjelenített ár szövege és a kedvezmények. Az időpontoknál időpontonként eltérő ár is megadható, az felülírja az itteni alapárat.',
    menu: EDITOR_MENU,
    access: EDITOR_ACCESS,
    blocks: [
      img(
        'tour-form-pricebox',
        'Árdoboz szekció',
        'Az árdoboz mezői: alapár, megjelenített ár, pénznem, utótag, kedvezmény és létszámadatok.',
      ),
      fields('Mezők', [
        field(
          'Alapár',
          'Az út ára forintban, fejenként, csak számmal (pl. 269600). Ebből számol a foglalás.',
          'A foglalási űrlap árösszesítőjében; ha nincs megjelenített ár szöveg, az árdobozban is.',
        ),
        field(
          'Megjelenített ár szöveg',
          'Az ár, ahogy a látogató látja (pl. „269.600 Ft” vagy „199 000 Ft-tól”).',
          `${TOUR_PAGE} az árdobozban, valamint az ajánlatkártyákon.`,
        ),
        field('Pénznem', 'Általában HUF.'),
        field(
          'Ár utótag',
          'Az ár után írt szöveg (pl. „/ fő”).',
          `${TOUR_PAGE}, az árdobozban az ár mellett.`,
        ),
        field(
          'Kedvezmény címke',
          'Kedvezmény jelölése. Ha százalékot írsz (pl. „-15%”), az árdoboz áthúzza az eredeti árat és a kedvezményes árat mutatja, és a foglaláskor is ennyivel csökken a részvételi díj.',
          `${TOUR_PAGE} az árdobozban és a foglalás árösszesítőjében.`,
        ),
        field(
          'Kedvezmény szöveg',
          'A kedvezmény neve (pl. „Előfoglalási kedvezmény”). Ezzel a névvel jelenik meg a foglalás árösszesítőjében.',
          `${TOUR_PAGE}, az árdobozban és a foglalás árösszesítőjében.`,
        ),
        field(
          'Sürgető felirat',
          'Sürgető, figyelemfelkeltő rövid szöveg (pl. „18 fő érdeklődött az elmúlt 72 órában”). Csak valós adatot írj!',
          `${TOUR_PAGE}, az árdoboz alatt.`,
        ),
        field(
          'Értékelés szöveg',
          'Rövid értékelés (pl. „4.9/5 utasértékelés”).',
          `${TOUR_PAGE}, az árdobozban.`,
        ),
        field(
          'Minimum fő / Maximum fő',
          'A csoport tervezett minimális és maximális létszáma.',
          ADMIN_ONLY,
        ),
        field(
          'Szabad férőhely / Kapacitás',
          'Tájékoztató férőhely adatok.',
          ADMIN_ONLY,
        ),
        field(
          'Elsődleges / Másodlagos gomb felirata',
          'A régi árdoboz gombfeliratai. A weboldal gombjainak szövegét az oldal maga határozza meg.',
          ADMIN_ONLY,
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
        'A leírások, a keresési kulcsszavak és a program PDF mezői.',
      ),
      fields('Mezők', [
        field(
          'Lista rövid leírása',
          'Egy-két mondatos összefoglaló.',
          'Az ajánlatkártyákon (listák, kategóriaoldalak, főoldal).',
        ),
        field(
          'Ismertető szöveg',
          'Az út rövid bemutatása. Ebből készül automatikusan a Keresőben megjelenő leírás, ha az üres, és ebből javasol keresési kulcsszavakat a rendszer.',
          `${TOUR_PAGE}, a cím alatti bevezetőben.`,
        ),
        field(
          'Keresési kulcsszavak',
          'Azok a szavak, amelyekre a weboldal keresője megtalálja az utat (pl. „Róma, Vatikán, Firenze”). Enterrel vagy vesszővel adhatsz hozzá újat, az X-szel törölhetsz. A „Javaslat az ismertető szövegből” gomb kigyűjti a szövegben szereplő helyszíneket. Az út neve, országai és régiója magától is kereshető.',
          'A weboldal keresőjében (fejléc kereső és ajánlatkereső). Egész szavakra keres: a „Róma” megtalálja az utat, a „Románia” nem.',
        ),
        field(
          'Program PDF / Program PDF fájlnév',
          'A régi rendszerből átvett PDF program adatai. A weboldal letölthető programját a rendszer mindig a fenti szövegekből és a programból generálja, ezt a mezőt nem használja.',
          ADMIN_ONLY,
        ),
        field(
          'Slider kép',
          'A régi slider nézet képe; ha nincs borítókép, ez lesz az út fő képe.',
          `${TOUR_PAGE}, tartalék főképként.`,
        ),
        field(
          'Program előtti szöveg',
          'Bevezető a részletes program előtt.',
          `${TOUR_PAGE}, a Program blokk elején.`,
        ),
        field(
          'Program (teljes szöveg)',
          'A teljes program egyben. Ha napokra bontott program is van (Program napok szekció), az utazás oldalán az jelenik meg.',
          `${TOUR_PAGE}, a Program blokkban, és a PDF programban.`,
        ),
        field(
          'Programok alatti szöveg',
          'A program alatti tudnivalók, pl. „A programváltozás jogát fenntartjuk.”',
          `${TOUR_PAGE}, a program alatt.`,
        ),
        field(
          'Kedvcsináló',
          'Hangulatos bevezető szöveg az utazáshoz.',
          TOUR_PAGE,
        ),
        field(
          'Fakultatív programok',
          'Választható, külön fizetendő programok leírása és ára.',
          `${TOUR_PAGE}, külön blokkban.`,
        ),
        field(
          'Belépőjegyek',
          'A belépőjegyek árai (táblázat is lehet).',
          `${TOUR_PAGE}, külön blokkban.`,
        ),
        field(
          'További szolgáltatási információk',
          'Kiegészítő, nem árhoz kötött információk.',
          TOUR_PAGE,
        ),
        field(
          'Fizetési program',
          'Az út egyedi fizetési feltételei.',
          TOUR_PAGE,
        ),
        field(
          'Árak',
          'Részletes árazási információk (pl. gyermekár, egyágyas felár szövegesen).',
          TOUR_PAGE,
        ),
        field('Kedvezmények', 'Az út kedvezményeinek leírása.', TOUR_PAGE),
        field('Jegyzet / egyéb információ', 'Egyéb tudnivalók.', TOUR_PAGE),
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
        ),
        field(
          'Cím',
          'A nap címe (pl. „Városnézés Brassóban”).',
          `${TOUR_PAGE}, az idővonalon.`,
        ),
        field(
          'Leírás',
          'A nap részletes programja.',
          `${TOUR_PAGE}, az idővonalon.`,
        ),
        field(
          'Élmény típusa',
          'Rövid kategória (pl. „Utazás, Kultúra”).',
          `${TOUR_PAGE}, a nap mellett.`,
        ),
        field(
          'Ikon kulcs',
          'A naphoz tartozó ikon (pl. bus, beach, camera).',
          `${TOUR_PAGE}, a nap ikonja.`,
        ),
        field(
          'Kép',
          'Opcionális kép a naphoz a médiatárból.',
          `${TOUR_PAGE}, a nap mellett.`,
        ),
        field(
          'Badge-ek',
          'Rövid címkék a naphoz (pl. „Városnézés”, „Fotómegálló”).',
          `${TOUR_PAGE}, a nap alatt.`,
        ),
        field('Aktív / Megjelenik', 'Kikapcsolva a nap rejtve marad.'),
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
        ),
        field(
          'Szállás',
          'A szállás helye pirossal jelenik meg, a többi megálló feketével.',
          'A térképen.',
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
        ),
        field(
          'Szállás információ',
          'Kiegészítés (pl. „2 ágyas szoba”).',
          `${TOUR_PAGE}, a szállás kártyán az ⓘ ikonra kattintva.`,
        ),
        field(
          'Ellátás',
          'Az ellátás (pl. „reggeli”, „félpanzió”).',
          `${TOUR_PAGE}, a felső információs kártyákon.`,
        ),
        field(
          'Ellátás információ',
          'Kiegészítés az ellátáshoz.',
          `${TOUR_PAGE}, az ellátás kártyán az ⓘ ikonra kattintva.`,
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
        ),
        field(
          'Az ár nem tartalmazza',
          'Tételenként egy sor (pl. „Belépőjegyek”).',
          `${TOUR_PAGE}, külön listában.`,
        ),
        field('Aktív / Megjelenik', 'Kikapcsolva a tétel nem látszik.'),
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
        'Régiók, csoportok, főoldali ajánlat, kiemelés, kategóriák, országok, címkék és a felszállási helyek felára.',
      ),
      fields('Mezők', [
        field(
          'Régiók',
          'A körutazás régiója (Körutazások › Régiók és csoportok).',
          'A listák szűrőiben, az út adatai között és a partnerportálok adataiban.',
        ),
        field(
          'Csoportok',
          'Tematikus csoport (Körutazások › Régiók és csoportok).',
          'Az admin szűrőiben és az út besorolásában.',
        ),
        field(
          'Ajánlat csoportok',
          'Szezonális ajánlat csoport (Körutazások › Szezonális ajánlat csoportok).',
          'Az admin szűrőiben.',
        ),
        field(
          'Főoldali ajánlat',
          'Az a főoldali ajánlatblokk (Tartalom › Főoldali ajánlatok), amelyhez az út tartozik.',
          'A publikus listában az itt kiválasztott főoldali blokk alatt.',
        ),
        field(
          'Kiemelt?',
          'Bekapcsolva az út a főoldal kiemelt ajánlatai között szerepel.',
          'A főoldal kiemelt ajánlatok blokkjában.',
        ),
        field(
          'Kiemelt sorrend',
          'A főoldali kiemelt ajánlatok sorrendje (kisebb szám előrébb). Üresen az út a kiemeltek végére kerül.',
          'A főoldal kiemelt ajánlatok blokkjában.',
        ),
        field(
          'Kiemelés a pozitív kiemelt ajánlatok között / Kiemelés csempéző ajánlat',
          'A régi rendszer kiemelési jelölői.',
          ADMIN_ONLY,
        ),
        field(
          'Kategóriák',
          'Az út kategóriái (pl. Körutazások, Adventi barangolások). A kategóriákat a Blog › Kategóriák oldalon lehet kezelni. A legördülőben új kategória is létrehozható.',
          'A kategóriaoldalakon (adriaholiday.hu/kategoriak/<kategória>), az ajánlatkártyák címkéiben és az „Ezek is érdekelhetnek” ajánlóban.',
        ),
        field(
          'FIT / Program típus / Nehézségi szint',
          'Az út jellegének besorolása.',
          'Az ajánlatkártyákon és a szűrőkben, ahol a weboldal használja.',
        ),
        field(
          'Közlekedés',
          'Busz, repülő vagy vonat.',
          'A „Buszos utak” és „Repülős utak” kategóriaoldalakon, az árajánlat-kérő és a foglalási űrlapon.',
        ),
        field(
          'Országok',
          'Az út által érintett országok.',
          'A keresőben (országnévre is megtalálható az út), az „Ezek is érdekelhetnek” ajánlóban, és a foglalás-visszaigazoló e-mailben a „Beutazási feltételek” linkek országonként.',
        ),
        field(
          'Címkék',
          'Szabad címkék az út jellemzésére (pl. „családbarát”).',
          'Az ajánlatkártyákon és a szűrésnél.',
        ),
        field(
          'Felszállási helyek',
          'Mely felszállási helyekről indulhat az út (Körutazások › Felszállási helyek).',
          'A foglalási űrlap felszállási hely választólistájában.',
        ),
        field(
          'Felszállási helyek sorrendje és felára ennél az útnál',
          'A kiválasztott helyek listája. A sorrendet a fogantyúval húzva vagy a fel–le nyilakkal állíthatod, a busz útvonala szerint (pl. Miskolc, Mezőkövesd, Gyöngyös, Hatvan, Budapest); az új hely a végére kerül. A felár Ft/fő: üresen hagyva a felszállási hely általános díja érvényes, kitöltve csak ennél az útnál más a díj.',
          'A foglalási űrlap választólistájában ebben a sorrendben, a felár az árösszesítőben.',
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
        ),
        field(
          'Ár',
          'Az adott időpont ára (Ft/fő). Ha üres, az árdoboz alapára érvényes.',
          'Az időpontválasztóban és a foglalás árösszesítőjében.',
        ),
        field(
          'Státusz',
          '„Elérhető” vagy „Betelt”. Jelenleg csak az adminban tájékoztat: a weboldal minden jövőbeli időpontot foglalhatóként kínál, a státusztól függetlenül.',
          ADMIN_ONLY,
        ),
        field(
          'Megjelenített ár',
          'Az időpont ára szövegesen (pl. „189.900 Ft”). Üresen az árból készül.',
          'Az időpontválasztóban.',
        ),
        field(
          'Eredeti ár (áthúzva)',
          'Akciónál az akció előtti ár. Csak akkor látszik, ha nagyobb, mint az időpont ára.',
          'Az időpontválasztóban és az árdobozban, áthúzva.',
        ),
        field(
          'Címke az ár mellett',
          'Rövid címke (pl. „Előfoglalási akció”, „Last minute”).',
          'Az árdobozban, az ár mellett.',
        ),
        field(
          'Szállás / Ellátás (időpontonként)',
          'Ha ennél az indulásnál más a szállás vagy ellátás. Üresen az út általános értéke érvényes.',
          `${TOUR_PAGE}, az adott időpont kiválasztásakor.`,
        ),
        field(
          'Felszállási helyek ennél az időpontnál',
          'Ha egyet sem jelölsz be, az út összes felszállási helye választható; ha bejelölsz néhányat, csak azok.',
          'A foglalási űrlap felszállási hely választólistájában.',
        ),
        field(
          'Partnerportálok (Partnerportálokon megjelenik, Szállás – Cesys, Szobatípus – Cesys)',
          'Az időpont megjelenése a partnerfeedekben és a Cesys számára küldött szállásadatok.',
          'A partnerportálok adataiban.',
        ),
      ]),
      fields('Felárak (időpontonként)', [
        field(
          'Megnevezés',
          'A felár neve (pl. „Egyágyas felár”, „Vacsora”).',
          'A foglalási űrlapon, az árösszesítőben és a visszaigazoló e-mailben.',
        ),
        field(
          'Ár / Pénznem',
          'A felár összege. „Ft”: a foglalással együtt fizetendő. „EUR, helyszínen fizetendő”: nem adódik a végösszeghez, csak tájékoztatásként jelenik meg.',
          'A foglalási űrlap árösszesítőjében.',
        ),
        field(
          'Felszámítás',
          '„Ha a foglaló kéri”: választható. „Mindig (kötelező)”: minden foglaláshoz hozzáadódik. „Egyedül utazónak”: automatikusan felszámítja, ha egy fő foglal.',
          'A foglalási űrlapon.',
        ),
        field(
          'Mikor kell fizetni?',
          '„Fő után”: utasonként. „Foglalásonként”: egyszer a foglalásra.',
          'Az árösszesítőben.',
        ),
        field(
          'Választási lehetőségek',
          'Opcionális, soronként egy lehetőség (pl. „Egyedül szeretnék lenni a szobában” / „Szeretnék szobatársat”). Ha kitöltöd, a foglaló a felár mellé ezek közül választ egyet.',
          'A foglalási űrlapon a felár alatt.',
        ),
      ]),
      list([
        'Új időpontot az „Időpont hozzáadása” gombbal veszel fel; a sor végi kuka ikon törli.',
        'A felárakat a „Másolás a többi időpontra” gombbal egyszerre átmásolhatod az összes időpontra.',
        'A felárak sorrendje a fel/le nyilakkal állítható.',
      ]),
      warning(
        'A betelt időpontot a „Betelt” státusz nem veszi le a weboldalról. Ha egy indulásra már nem lehet foglalni, töröld az időpontot. A rá érkezett foglalások megmaradnak, de a foglalás adatlapján ezután nem látszik a foglalt időpont – ezért törlés előtt jegyezd fel vagy ellenőrizd őket a Foglalások menüben.',
      ),
    ],
  },
  {
    id: 'tour-partner-xml',
    title: 'Partnerportálok (Travelgate, Travelmax, Cesys)',
    summary:
      'Amit az út a partnerportálokon mutat. Csak akkor számít, ha az Alapadatoknál a „Partnerportálokon megjelenik?” be van kapcsolva.',
    menu: EDITOR_MENU,
    access: EDITOR_ACCESS,
    blocks: [
      img(
        'tour-form-partner-xml',
        'Partnerportálok szekció',
        'A partnerportálokon használt régió, utazástípusok, szállás és biztosítás adatai.',
      ),
      fields('Mezők', [
        field(
          'Régió a partnereknél',
          'Ez alapján sorolják be a portálok az utat. Üresen az út saját régiója.',
          'A partner feedekben.',
        ),
        field(
          'Utazás típusa – Travelgate / Travelmax / Cesys / általános feed',
          'Portálonként eltérő utazástípus-lista; mindegyiknél a portál saját kategóriáját kell kiválasztani.',
          'Az adott partner feedjében (/xmltravel, /xmltravelmax, /xmlcesys, /xml).',
        ),
        field(
          'Szállás megnevezése a portálokon / Város',
          'A portálokon megjelenő szálláshely és város.',
          'A partner feedekben.',
        ),
        field(
          'Biztosítás díja (Ft/fő/nap)',
          'Az általános feedben (/xml) megjelenő biztosítási díj.',
          'Az általános feedben.',
        ),
        field(
          'Szállás leírása – Travelmax',
          'A Travelmax számára küldött szállásleírás.',
          'A Travelmax feedben.',
        ),
      ]),
    ],
  },
  {
    id: 'tour-booking-form',
    title: 'Foglalási űrlap beállításai és partner bónuszok',
    summary:
      'Melyik foglalási űrlap sablon alapján kérje be a weboldal az adatokat ennél az útnál, és a partner bónuszok.',
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
        ),
        field(
          'Partner bónuszok (Bónusz neve, Érték)',
          'A partnereknek járó bónuszok listája és értéke.',
          ADMIN_ONLY,
        ),
      ]),
    ],
  },
];

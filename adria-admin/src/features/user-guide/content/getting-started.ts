import { Compass } from 'lucide-react';

import type { GuideChapter } from '../lib/user-guide.types';

import { field, fields, img, list, p, steps, tip, warning } from './blocks';

export const gettingStartedChapter: GuideChapter = {
  id: 'getting-started',
  title: 'Első lépések',
  description:
    'Belépés, a felület felépítése és azok a kezelési minták, amelyek az admin minden oldalán ugyanúgy működnek.',
  icon: Compass,
  topics: [
    {
      id: 'login',
      title: 'Belépés és kilépés',
      summary:
        'Az adminfelület csak bejelentkezés után használható. A fiókot a rendszergazda hozza létre a Rendszergazda › Felhasználók oldalon.',
      blocks: [
        img(
          'login',
          'Az admin belépési oldala',
          'A belépési oldal: e-mail cím és jelszó megadása után a „Belépés” gombbal jutsz be. Sikertelen belépésnél a hibaüzenet az űrlap fölött jelenik meg.',
        ),
        steps([
          'Nyisd meg az admin címét (éles rendszeren: https://adriaholiday.hu/admin).',
          'Írd be a fiókodhoz tartozó e-mail címet és jelszót.',
          'Kattints a belépés gombra. Sikeres belépés után a Vezérlőpult nyílik meg.',
          'Kilépéshez kattints jobb felül a nevedre, majd a „Kijelentkezés” menüpontra.',
        ]),
        p(
          'A bejelentkezés a böngészőben megmarad, így a lap bezárása után sem kell újra belépned. Közös vagy idegen gépen mindig jelentkezz ki a munka végén.',
        ),
        warning(
          'Ha a fiókodat a rendszergazda inaktiválja, vagy a munkameneted lejár, az admin automatikusan visszadob a belépési oldalra. A nem mentett módosítások ilyenkor elvesznek.',
        ),
      ],
    },
    {
      id: 'layout',
      title: 'A felület felépítése',
      summary:
        'Minden oldal ugyanabból a három részből áll: bal oldalt a menü, felül az eszköztár, középen az adott oldal tartalma.',
      blocks: [
        img(
          'dashboard',
          'Az admin felépítése a Vezérlőpulton',
          'Bal oldalt a menüsáv a modulokkal, felül a morzsamenü (hol vagy éppen), jobb felül az értesítések, a világos/sötét téma váltó és a felhasználói menü.',
        ),
        fields('A felület elemei', [
          field(
            'Bal oldali menü',
            'Az admin összes modulja. A nyíllal jelölt menüpontok (pl. Apartmanok, Foglalások, Körutazások) lenyithatók; a lenyitott állapotot a böngésző megjegyzi. Csak azok a menüpontok látszanak, amelyekhez van jogosultságod.',
          ),
          field(
            'Oldalsáv váltása gomb',
            'A felső sáv bal szélén lévő ikon összecsukja a menüt keskeny, csak ikonos sávvá, így több hely marad a táblázatoknak. Mobilon ugyanitt a menü megnyitása gomb látszik.',
          ),
          field(
            'Morzsamenü',
            'Megmutatja, hol vagy (pl. Vezérlőpult › Körutazások › Ajánlatok). Bármelyik korábbi elemére kattintva visszaléphetsz.',
          ),
          field(
            'Értesítések (csengő)',
            'Az admin rendszerüzeneteinek helye. Jelenleg nincs külön értesítés, a gomb ezt jelzi.',
          ),
          field(
            'Téma váltása (hold / nap ikon)',
            'Világos és sötét megjelenés között vált. Csak a te gépeden és böngésződben érvényes, másokra nincs hatással.',
          ),
          field(
            'Felhasználói menü',
            'A neved és a szerepköröd. Itt találod a profil és a hozzáférés összefoglalóját, valamint a kijelentkezést.',
          ),
          field(
            '„Teszt környezet” címke',
            'A menü tetején, a logó mellett látszik. Tájékoztató felirat, a működésre nincs hatása.',
          ),
        ]),
        img(
          'sidebar-collapsed',
          'Összecsukott oldalsáv',
          'Összecsukott oldalsáv: csak a menüpontok ikonjai látszanak, a tartalom szélesebb helyet kap. Újabb kattintással visszanyílik.',
        ),
        img(
          'user-menu',
          'A felhasználói menü',
          'A jobb felső sarokban a nevedre kattintva nyílik meg a felhasználói menü a kijelentkezéssel.',
        ),
      ],
    },
    {
      id: 'common-patterns',
      title: 'Általános kezelési minták',
      summary:
        'A legtöbb oldal ugyanarra a mintára épül: lista keresővel és szűrőkkel, a sorokon műveletgombok, a szerkesztés pedig jobbról becsúszó oldalsó panelen történik.',
      blocks: [
        img(
          'tours-list',
          'Tipikus listaoldal',
          'Egy tipikus listaoldal (Körutazások › Ajánlatok): felül a cím és a leírás, alatta a kereső és az „Új …” gomb, majd a szűrők és a táblázat.',
        ),
        fields('Listák', [
          field(
            'Kereső',
            'Gépelés közben szűri a listát. Minden oldalon a mező szürke szövege mutatja, mi alapján keres (pl. név, Webcím, e-mail).',
          ),
          field(
            'Szűrők (legördülő listák)',
            'Egy-egy tulajdonság szerint szűkítik a listát (pl. régió, aktív állapot). A „Szűrők törlése” gomb mindent visszaállít.',
          ),
          field(
            'Rendezés',
            'A fel-le nyíllal jelölt oszlopfejlécekre kattintva az adott oszlop szerint rendez; újabb kattintás megfordítja az irányt.',
          ),
          field(
            'Lapozás és sorok száma',
            'A táblázat alján lapozhatsz, és beállíthatod, hány sor jelenjen meg egy oldalon. A „Találatok” szám mutatja, hány elem felel meg a szűrésnek.',
          ),
          field(
            'Műveletgombok a sor végén',
            'Szem ikon: megtekintés. Ceruza: szerkesztés. Bekapcsoló ikon: aktiválás / inaktiválás. A körutazásoknál a ritkább műveletek a „…” menüben vannak. Másolás ikon: másolat készítése. Nyilak: sorrend módosítása. Piros kuka: törlés. Csak azok a gombok jelennek meg, amelyekhez van jogosultságod.',
          ),
        ]),
        fields('Szerkesztés oldalsó panelen', [
          field(
            'Megnyitás',
            'Új elemnél az „Új …” gomb, meglévőnél a ceruza ikon nyitja meg a jobbról becsúszó panelt. A panel mögött a lista változatlan marad.',
          ),
          field(
            'Mentés / Mégse',
            'A panel alján lévő „Mentés” gomb rögzíti a változásokat; a „Mégse” vagy a jobb felső X bezárja a panelt mentés nélkül. Sikeres mentés után zöld visszajelzés jelenik meg a képernyő sarkában, a lista pedig magától frissül.',
          ),
          field(
            'Hibás mező',
            'Ha valami hiányzik vagy rossz formátumú, a mentés nem történik meg, és a hibás mező alatt piros szöveg írja le a teendőt.',
          ),
          field(
            'Törlés',
            'A panel alján lévő piros „Törlés” gomb (vagy a sor kuka ikonja) megerősítést kér. A törlés végleges, nem vonható vissza – ha csak elrejtenéd az elemet, inkább kapcsold ki az „Aktív” / „Megjelenik” jelölőt.',
          ),
        ]),
        fields('Gyakran visszatérő mezők', [
          field(
            'Aktív / Megjelenik',
            'Ha ki van kapcsolva, az elem megmarad az adminban, de a publikus weboldalon nem látszik. Ez a biztonságos módja egy elem elrejtésének.',
          ),
          field(
            'Sorrend',
            'Szám, amely a megjelenítés sorrendjét adja: a kisebb szám kerül előrébb.',
          ),
          field(
            'Webcím',
            'Az elem webcímben (URL-ben) használt neve, ékezetek és szóközök nélkül, kötőjelekkel (pl. del-erdely-es-a-vaskapu-szoros). A „Generálás” gomb vagy az „Automatikus generálás” jelölő a névből készíti el. Már élő oldal SEO nevét csak indokolt esetben módosítsd, mert a régi cím megszűnik – ilyenkor vegyél fel átirányítást.',
          ),
          field(
            'Keresőben megjelenő cím és Keresőben megjelenő leírás',
            'A keresőkben megjelenő cím és leírás. Ha üresen hagyod, a rendszer a névből és a leírás elejéből készíti el. A leírás ideális hossza 120–160 karakter, a mező alatt látod a karakterszámot.',
          ),
          field(
            'Megjelenjen a keresőkben?',
            '„Alapértelmezett (indexelhető)”: a keresők megjeleníthetik az oldalt. „Ne jelenjen meg a keresőkben”: a Google nem veszi fel a találatok közé. Belső vagy ideiglenes oldalaknál hasznos.',
          ),
          field(
            'Nyelvi fülek (Magyar / Angol / Német)',
            'Egyes moduloknál (blog, buszok, főoldali ajánlatok) a szövegek nyelvenként külön fülön szerkeszthetők. A magyar fül tartalma jelenik meg a magyar weboldalon, a további nyelvek kitöltése opcionális.',
          ),
        ]),
        fields('Szövegszerkesztő és képek', [
          field(
            'Formázott szöveg szerkesztő',
            'Hosszabb szövegeknél (program, ÁSZF, blogcikk) Word-szerű szerkesztő jelenik meg: félkövér, dőlt, aláhúzás, címsorok, felsorolás, táblázat, link, igazítás és szín. Az „Előnézet” fülön láthatod, hogyan fog kinézni.',
          ),
          field(
            'Kép kiválasztása',
            'A képmezőknél feltölthetsz új fájlt a gépedről (húzd rá a mezőre vagy kattints), vagy kiválaszthatsz egy korábban feltöltött képet a médiatárból. A feltöltött kép automatikusan bekerül a Képek és média oldalra is.',
          ),
          field(
            'Alt szöveg és kép címe',
            'Az alt szöveg a kép rövid, szöveges leírása (pl. „Naplemente a bibionei tengerparton”). A keresők és a képernyőolvasók használják, a látogató csak akkor látja, ha a kép nem töltődik be.',
          ),
        ]),
        tip(
          'Ha egy mező mellett vagy alatt szürke magyarázó szöveg látszik, az mindig az adott mező kitöltéséhez ad útmutatást – érdemes elolvasni.',
        ),
      ],
    },
    {
      id: 'access',
      title: 'Jogosultságok röviden',
      summary:
        'Mindenki csak azokat a menüpontokat és gombokat látja, amelyekhez a szerepköre jogot ad. Ez a kézikönyv viszont mindenkinek elérhető.',
      blocks: [
        list([
          'A jogosultságokat szerepkörök fogják össze, pl. „Főadminisztrátor” vagy „Marketing”. Egy felhasználónak több szerepköre is lehet.',
          'Ha egy menüpont hiányzik, vagy egy oldalon „Nincs jogosultságod ehhez az oldalhoz” üzenet jelenik meg, a rendszergazdától kérj hozzáférést.',
          'A listákon a szerkesztés, törlés, másolás gombok is jogosultsághoz kötöttek: lehet, hogy egy oldalt látsz, de módosítani nem tudod.',
          'A jogosultságok kezelését a „Rendszergazda” fejezet írja le részletesen.',
        ]),
      ],
    },
  ],
};

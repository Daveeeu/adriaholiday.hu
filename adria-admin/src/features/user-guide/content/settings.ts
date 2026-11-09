import { Settings } from 'lucide-react';

import type { GuideChapter } from '../lib/user-guide.types';

import { field, fields, img, p, steps, tip, warning } from './blocks';

const FOOTER = 'A weboldal minden oldalának láblécében.';
const HEADER = 'A weboldal minden oldalának fejlécében.';

export const settingsChapter: GuideChapter = {
  id: 'settings',
  title: 'Beállítások',
  description:
    'A weboldal egészére érvényes adatok: elérhetőségek, fejléc- és láblécmenü, közösségi linkek, alapértelmezett SEO, biztosítások, online fizetés, visszaigazoló e-mail és a jogi oldalak szövege.',
  icon: Settings,
  topics: [
    {
      id: 'site-settings',
      title: 'Weboldal beállításai – áttekintés',
      summary:
        'Egyetlen hosszú űrlap, kártyákra bontva. Bármit módosítasz, az oldal alján lévő „Site settings mentése” gombbal kell elmentened; a mentés után a weboldal azonnal az új adatokat mutatja.',
      path: '/settings',
      menu: 'Beállítások',
      access:
        'Webhely beállítások megtekintése (módosításhoz szerkesztési jog)',
      blocks: [
        img(
          'settings',
          'A Beállítások oldal',
          'A Beállítások oldal teteje: Általános és Kapcsolat kártya, alatta Közösségi média és Fő gomb.',
        ),
        steps([
          'Görgess a módosítandó kártyához, és írd át a mezőt.',
          'Görgess az oldal aljára, és kattints a „Site settings mentése” gombra.',
          'A jobb alsó sarokban megjelenő zöld üzenet jelzi a sikeres mentést. Hibás mezőnél (pl. rossz e-mail cím) a mező alatt piros szöveg jelenik meg, és semmi nem mentődik.',
        ]),
        warning(
          'Ezek a beállítások az egész weboldalra hatnak. Módosítás után nézd meg a weboldalt is.',
        ),
      ],
    },
    {
      id: 'settings-contact',
      title: 'Általános, Kapcsolat, Közösségi média és Fő gomb',
      summary:
        'A cég neve, elérhetőségei, közösségi profiljai és a fő „Ajánlatot kérek” gomb.',
      path: '/settings',
      menu: 'Beállítások',
      blocks: [
        fields('Általános', [
          field(
            'Oldal neve',
            'A weboldal / cég neve (pl. „Adria Holiday”).',
            'A fejlécben a logónál, a láblécben, a böngésző fülén és a keresőtalálatok címében.',
          ),
        ]),
        fields('Kapcsolat', [
          field(
            'Fő telefonszám (fejléc)',
            'Egy telefonszám, kattintható hívás linkként.',
            HEADER,
          ),
          field(
            'Telefonszámok (lábléc, kapcsolat oldal, e-mailek, PDF)',
            'Soronként egy szám.',
            'A láblécben, a Kapcsolat oldalon, a foglalási folyamat leírásában, az ügyfeleknek küldött e-mailekben és a PDF dokumentumokban.',
          ),
          field(
            'Email',
            'A cég nyilvános e-mail címe.',
            'A láblécben, a Kapcsolat oldalon és a foglalási tájékoztatóban.',
          ),
          field(
            'WhatsApp',
            'Telefonszám nemzetközi formátumban, + és szóköz nélkül (pl. 36301234567).',
            'Mobilon az alsó, lebegő gombsávban és a Kapcsolat oldalon.',
          ),
          field(
            'Cím',
            'Az iroda címe.',
            'A láblécben és a Kapcsolat oldalon.',
          ),
          field(
            'Nyitvatartás',
            'Soronként egy sor (pl. „Hétfő–Péntek: 08:00–17:00”).',
            FOOTER,
          ),
        ]),
        img(
          'settings-social',
          'Közösségi média kártya',
          'A közösségi profilok linkjei.',
        ),
        fields('Közösségi média', [
          field(
            'Facebook / Instagram / TikTok',
            'A profil teljes címe http(s)://-sel kezdve. Üresen hagyható.',
            'A lábléc közösségi ikonjainál, valamint a weboldal háttéradataiban (a Google ebből ismeri fel a cég profiljait).',
          ),
        ]),
        fields('Fő gomb', [
          field(
            'Gomb felirata',
            'A fő gomb felirata (pl. „Ajánlatot kérek”).',
            'A fejléc jobb oldalán, a mobil menüben és mobilon az alsó lebegő gombsávban.',
          ),
          field(
            'Gomb linkje',
            'Hova vigyen a gomb (pl. /kapcsolat).',
            'Ugyanott.',
          ),
        ]),
      ],
    },
    {
      id: 'settings-header-footer',
      title: 'Fejléc, lábléc, logó és SEO',
      summary:
        'A fejléc menüpontjai, a lábléc szövegei és gyorslinkjei, a logó, valamint az alapértelmezett keresőbeállítások.',
      path: '/settings',
      menu: 'Beállítások',
      blocks: [
        img(
          'settings-header-navigation',
          'Felső menü',
          'A fejléc menüpontjai: címke és hivatkozás párok, törléssel és „Új link” gombbal.',
        ),
        fields('Felső menü / Lábléc linkjei', [
          field(
            'Címke',
            'A menüpont felirata (pl. „Utazások”).',
            'Felső menü: a fejléc menüjében és a mobil menüben. Lábléc linkjei: a lábléc gyorslinkjei között.',
          ),
          field(
            'Hivatkozás',
            'Belső cím (pl. /utazasok, /kapcsolat) vagy teljes külső cím (https://…).',
            'A menüpontra kattintva ide jut a látogató.',
          ),
          field(
            'Új link / Törlés',
            'Menüpont hozzáadása a lista végére, illetve eltávolítása. A sorrend a felvitel sorrendje.',
          ),
        ]),
        img(
          'settings-footer',
          'Lábléc kártya',
          'A lábléc leírása és copyright szövege.',
        ),
        fields('Lábléc', [
          field(
            'Leírás',
            'Rövid bemutatkozó szöveg. A {evek} helyére a cég alapítása óta eltelt évek száma kerül.',
            FOOTER,
          ),
          field(
            'Szerzői jogi sor',
            'Pl. „© 2026 Adria Holiday. Minden jog fenntartva.”',
            'A lábléc legalján.',
          ),
        ]),
        img(
          'settings-brand-logo',
          'Logó',
          'A logó feltöltése: kép, alt és title szöveg, kategória.',
        ),
        fields('Logó és SEO', [
          field(
            'Logó',
            'A cég logója. „Feltöltés vagy csere” gombbal cserélhető, a kuka ikonnal törölhető.',
            'A fejlécben és a láblécben.',
          ),
          field(
            'Megosztási kép',
            'Az alapértelmezett megosztási kép.',
            'Facebookon / Messengerben megosztott linkek előnézeti képeként, ha az oldalnak nincs saját képe.',
          ),
          field(
            'Alapértelmezett cím a keresőben',
            'Alapértelmezett cím, ha egy oldalnak nincs sajátja.',
            'A keresőtalálatokban és a böngésző fülén.',
          ),
          field(
            'Alapértelmezett leírás a keresőben',
            'Alapértelmezett leírás, ha egy oldalnak nincs sajátja.',
            'A keresőtalálatokban.',
          ),
        ]),
      ],
    },
    {
      id: 'settings-booking',
      title: 'Biztosítások, online fizetés és visszaigazoló e-mail',
      summary:
        'A foglaláskor választható biztosítások díja, a SimplePay online fizetés és a visszaigazoló e-mail banki adatai.',
      path: '/settings',
      menu: 'Beállítások',
      blocks: [
        img(
          'settings-foglalasi-biztositasok',
          'Foglalási biztosítások',
          'Az utas- és útlemondási biztosítás neve, díja és tájékoztató szövege.',
        ),
        fields('Foglalási biztosítások', [
          field(
            'Utasbiztosítás neve',
            'Pl. „ALFA Compass utasbiztosítás”.',
            'A foglalási űrlapon, az árösszesítőben és a visszaigazolásban.',
          ),
          field(
            'Utasbiztosítás díja (Ft / fő / nap)',
            'A napi díj; a rendszer az utazás napjaival és az utasok számával szorozza.',
            'A foglalási űrlap árösszesítőjében, a végösszegben.',
          ),
          field(
            'Útlemondási biztosítás neve',
            'A biztosítás megnevezése.',
            'A foglalási űrlapon és a visszaigazolásban.',
          ),
          field(
            'Útlemondási biztosítás (az utazás díjának %-a)',
            'Pl. 2,8 – a részvételi díj ennyi százaléka.',
            'A foglalási űrlap árösszesítőjében.',
          ),
          field(
            'Útlemondási biztosítás legkésőbb (nappal indulás előtt)',
            'Ennél közelebbi indulásnál már nem köthető, az űrlap nem kínálja fel.',
            'A foglalási űrlapon.',
          ),
          field(
            'Utasbiztosítás / Útlemondási biztosítás információ',
            'Rövid tájékoztató (legfeljebb 1000 karakter).',
            'A foglalási űrlapon a biztosítás melletti ⓘ ikon mögött.',
          ),
        ]),
        fields('Online fizetés (SimplePay)', [
          field(
            'Online fizetés',
            'Bekapcsolva foglalás után az ügyfél a SimplePay fizetőoldalán fizeti az előleget (a fizetési ütemezés 1. részletét; 35 napon belüli indulásnál a teljes összeget). Csak akkor működik, ha a szerveren be van állítva az adott pénznem SimplePay kereskedői fiókja.',
            'A foglalás utolsó lépésében és a fizetés eredményoldalán.',
          ),
        ]),
        img(
          'settings-foglalas-visszaigazolo-e-mail',
          'Foglalás visszaigazoló e-mail',
          'A visszaigazoló e-mail banki adatai és az engedélyszám.',
        ),
        fields('Foglalás visszaigazoló e-mail', [
          field(
            'Bankszámlaszám / Számlatulajdonos',
            'Az átutaláshoz szükséges adatok. Csak akkor jelennek meg, ha a foglalás után nincs online fizetés.',
            'Az ügyfél visszaigazoló e-mailjében.',
          ),
          field(
            'Utazásszervezői engedélyszám',
            'Pl. „BFKH eng.szám: U-000412”.',
            'A visszaigazoló e-mail láblécében.',
          ),
        ]),
        p(
          'A részletek és határidők az indulásig hátralévő napok szerint számolódnak (20/20/60%, 40/60% vagy 100%); 20 000 Ft alatti út árát egy összegben kell fizetni.',
        ),
        fields('Hírlevél', [
          field(
            'Kupon értéke (Ft)',
            'A hírlevélre feliratkozó automatikusan ekkora értékű kuponkódot kap e-mailben. 0 esetén nincs kupon.',
            'A hírlevél feliratkozó blokkban, a feliratkozási e-mailben, majd a Foglalások › Kuponok listában.',
          ),
        ]),
        fields('Mérés', [
          field(
            'Meta Pixel bekapcsolva / Meta Pixel ID',
            'A Facebook (Meta) hirdetések méréséhez. Csak a marketinges által megadott azonosítóval kapcsold be.',
            'A látogató számára nem látható; a weboldal mérőkódja használja.',
          ),
        ]),
        tip(
          'A Meta Pixel adatai nem kerülnek ki a publikus oldal adatai közé, csak a mérőkód használja őket.',
        ),
      ],
    },
    {
      id: 'settings-legal',
      title: 'Jogi oldalak',
      summary:
        'A jogi oldalak címei és a Kapcsolat, Impresszum, Adatkezelés, ÁSZF, Süti, Utazási Klub és Biztosítások oldalak szövege.',
      path: '/settings',
      menu: 'Beállítások',
      blocks: [
        img(
          'settings-legal',
          'Jogi oldalak kártya',
          'A jogi oldalak publikus útvonalai.',
        ),
        fields('Jogi oldalak', [
          field(
            'Impresszum / Adatkezelés / ÁSZF / Cookie URL',
            'A jogi oldalak címe (pl. /aszf).',
            'A lábléc jogi linkjeiben.',
          ),
        ]),
        img(
          'settings-legal-page-content',
          'Jogi oldalak szövege',
          'A jogi oldalak szövegének szerkesztője.',
        ),
        fields('Jogi oldalak szövege', [
          field(
            'Kapcsolat tartalom',
            'Elérhetőségek, cégadatok, bankszámlák.',
            'A Kapcsolat oldalon (adriaholiday.hu/kapcsolat).',
          ),
          field(
            'Impresszum tartalom',
            'Cégadatok, üzemeltető.',
            'adriaholiday.hu/impresszum',
          ),
          field(
            'Adatkezelés tartalom',
            'Adatkezelési tájékoztató.',
            'adriaholiday.hu/adatvedelem',
          ),
          field(
            'ÁSZF tartalom',
            'Általános szerződési feltételek.',
            'adriaholiday.hu/aszf; a foglalási űrlap is erre hivatkozik.',
          ),
          field(
            'Cookie tartalom',
            'Süti tájékoztató.',
            'adriaholiday.hu/sutik',
          ),
          field(
            'Utazási Klub feltételei',
            'A hírlevél-kupon felhasználási feltételei.',
            'Az Utazási Klub feltételei oldalon.',
          ),
          field(
            'Biztosítások',
            'Az utas- és útlemondási biztosítás díjai, feltételei.',
            'A Biztosítások oldalon.',
          ),
        ]),
        warning(
          'A jogi szövegek módosítása jogi következményekkel járhat; csak jóváhagyott szöveget tegyél ki.',
        ),
      ],
    },
    {
      id: 'automatic-emails',
      title: 'Automatikus e-mailek',
      summary:
        'A kiküldött e-mailek szövegét a rendszer határozza meg; a változtatható részek (telefonszámok, banki adatok, engedélyszám) a Beállításokban vannak.',
      blocks: [
        p(
          'A rendszer automatikusan küld e-mailt: új foglaláskor az irodának és az ügyfélnek (visszaigazolás), új ajánlatkéréskor és kapcsolati üzenetkor az irodának, apartman foglaláskor mindkét félnek, valamint hírlevél-feliratkozáskor a kuponkóddal. Az elküldött e-maileket a foglalás adatlapján, az „Email előzmények” blokkban láthatod.',
        ),
        tip('Ha egy e-mail szövegén változtatni kell, jelezd a fejlesztőnek.'),
      ],
    },
  ],
};

import { LayoutDashboard } from 'lucide-react';

import type { GuideChapter } from '../lib/user-guide.types';

import { field, fields, img, list, p, tip } from './blocks';

export const dashboardChapter: GuideChapter = {
  id: 'dashboard',
  title: 'Vezérlőpult és analitika',
  description:
    'Az első képernyő a rendszer pillanatnyi állapotával, és a weboldal látogatottsági adatai.',
  icon: LayoutDashboard,
  topics: [
    {
      id: 'dashboard',
      title: 'Vezérlőpult',
      summary:
        'Belépés után ez az első oldal. Nem kell rajta semmit beállítani: összefoglalja, mennyi tartalom van a rendszerben és mennyi foglalás, kérés vár feldolgozásra.',
      path: '/',
      menu: 'Vezérlőpult',
      blocks: [
        img(
          'dashboard',
          'A Vezérlőpult',
          'A Vezérlőpult: felül a gyors áttekintés, alatta a számláló kártyák, lent a havi bevétel grafikonja és a legutóbbi aktivitások.',
        ),
        fields('A kártyák jelentése', [
          field(
            'Apartmanok száma',
            'Az adminban rögzített összes apartman (aktív és inaktív együtt).',
          ),
          field('Körutazások száma', 'A rögzített körutazási ajánlatok száma.'),
          field(
            'Aktív foglalások',
            'Beérkezett és még nyitott (nem lemondott, nem lejárt) foglalások. Ezekkel még dolgozni kell.',
          ),
          field(
            'Új ajánlatkérések',
            'Az „Új” állapotú, még fel nem dolgozott körutazás ajánlatkérések.',
          ),
          field(
            'Havi bevétel (Ft)',
            'Az aktuális hónap aktív foglalásainak összértéke.',
          ),
          field(
            'Kuponok száma',
            'A rendszerben lévő kuponkódok (pl. hírlevél-feliratkozáskor kiküldöttek).',
          ),
          field(
            'Blog cikkek száma',
            'A publikált és a szerkesztés alatt lévő cikkek együtt.',
          ),
          field(
            'Üzenetek száma',
            'A weboldal kapcsolati űrlapjáról érkezett üzenetek.',
          ),
          field(
            'Havi bevétel alakulása',
            'Grafikon az elmúlt 12 hónap foglalási bevételéről. Az egérrel egy pontra mutatva látod a pontos összeget.',
          ),
          field(
            'Legutóbbi aktivitások',
            'Az adminban legutóbb végzett fontos műveletek (létrehozás, módosítás, törlés) időponttal. Segít visszakövetni, mi változott.',
          ),
        ]),
        tip(
          'A kártyák számai minden oldalbetöltéskor frissülnek; ha régóta nyitva van a lap, frissítsd a böngészőt.',
        ),
      ],
    },
    {
      id: 'analytics',
      title: 'Analitika',
      summary:
        'A weboldal saját mérése: hányszor nézték meg az oldalakat, az ajánlatokat, hányan kattintottak a gombokra, és hol morzsolódnak le a látogatók a foglalásig.',
      path: '/analytics',
      menu: 'Analitika',
      access: 'Analitika megtekintése',
      blocks: [
        img(
          'analytics',
          'Az Analitika oldal',
          'Az Analitika oldal: felül a szűrők, alattuk az eseményszámlálók és a konverziós tölcsér. Lejjebb a top ajánlatok, top kategóriák, kampányok és a legutóbbi események listája.',
        ),
        p(
          'Az adatokat a publikus weboldal saját mérése gyűjti (nem a Google Analytics). Az oldal csak megjelenít, itt semmit nem lehet elrontani.',
        ),
        fields('Szűrők', [
          field(
            'Kezdő dátum / Záró dátum',
            'A vizsgált időszak. Üresen az összes rögzített adat látszik.',
          ),
          field(
            'Esemény',
            'Egy eseménytípusra szűkít (pl. csak oldalmegtekintések vagy csak gombkattintások).',
          ),
          field(
            'Tartalom típusa / Oldal webcíme',
            'Egy adott ajánlatra vagy kategóriára szűkít a webcímben szereplő neve alapján.',
          ),
          field(
            'Kampány',
            'Hirdetési kampány neve (a linkekben szereplő utm_campaign érték). Így látod, egy kampányból érkezők mit néztek meg.',
          ),
          field(
            'Ajánlat webcíme / Kategória webcíme (tölcsérhez)',
            'A konverziós tölcsért szűkíti egy ajánlatra vagy kategóriára.',
          ),
          field('Szűrők törlése', 'Minden szűrőt alaphelyzetbe állít.'),
        ]),
        fields('A számlálók jelentése', [
          field('Oldalmegtekintések', 'Az összes oldalmegtekintés.'),
          field(
            'Ajánlat megtekintések',
            'Hányszor nyitották meg egy utazás részletes oldalát.',
          ),
          field(
            'Összes category_view',
            'Kategóriaoldalak (pl. Körutazások, Apartmanok) megtekintései.',
          ),
          field(
            'Gombkattintások',
            'Kattintások a fő gombokra (pl. „Ajánlatot kérek”, „Lefoglalom az utat”).',
          ),
          field(
            'Árdoboz megjelenések',
            'Hányszor jelent meg az utazás oldalán az árdoboz.',
          ),
          field('Időpontválasztások', 'Hányszor választottak indulási időpontot.'),
          field(
            'Szűrőhasználat',
            'Hányszor használták a kategóriaoldalak szűrőgombjait.',
          ),
        ]),
        list(
          [
            'Konverziós tölcsér: lépésenként mutatja, hány látogató jutott el az oldalmegtekintéstől az ajánlaton és az árdobozon át a foglalásig, és hány százalék morzsolódott le az egyes lépések között.',
            'Legnézettebb ajánlatok / Legnézettebb kategóriák: a legtöbbet megnézett utazások és kategóriák, az egyedi látogatók számával.',
            'Legjobb kampányok: mely hirdetési kampányok hozták a legtöbb eseményt.',
            'Legutóbbi események: a legfrissebb mért események időrendben, lapozható listában.',
          ],
          'A további blokkok',
        ),
      ],
    },
  ],
};

import { Globe } from 'lucide-react';

import type { GuideChapter } from '../lib/user-guide.types';

import { img, list, p } from './blocks';

export const publicSiteChapter: GuideChapter = {
  id: 'public-site',
  title: 'Hol jelenik meg a weboldalon?',
  description:
    'Képes térkép a publikus weboldalról: melyik admin beállítás melyik részt tölti meg a fejlécben, a főoldalon, egy utazás oldalán és a láblécben.',
  icon: Globe,
  topics: [
    {
      id: 'public-header-home',
      title: 'Fejléc és főoldal',
      summary:
        'A weboldal minden oldalán látható fejléc és a főoldal felső része.',
      blocks: [
        img(
          'public-home',
          'A weboldal főoldala',
          'A főoldal teteje: fejléc logóval, menüvel, telefonszámmal és „Ajánlatot kérek” gombbal, alatta a hero főcímmel, gombokkal és statisztikákkal.',
        ),
        list(
          [
            'Logó: Beállítások › Brand logo.',
            'Menüpontok (Utazások, Rólunk, Utazási Klub, Kapcsolat): Beállítások › Header navigation.',
            'Telefonszám a fejlécben: Beállítások › Contact › Fő telefonszám (fejléc).',
            '„Ajánlatot kérek” gomb: Beállítások › CTA › Primary CTA text / link.',
            'Főcím, alcím, gombok, statisztikák (pl. „10 000+ elégedett utas”), háttérkép/videó: Portfólió szerkesztése › Hero szekció.',
            'Promóciós felugró értesítés a bal alsó sarokban: Foglalások › Promóció.',
            'Lejjebb a főoldalon: ajánlatcsempék (Főoldali ajánlatok), kiemelt utak (körutazás „Kiemelt?” és „Kiemelt sorrend”), régiókártyák (Apartmanok › Régiók › Portfólió kiemelt), kiemelt apartmanok, utasaink levelei (Rólunk írták) és blogcikkek (Blog › „Portfólió főoldalon?”).',
          ],
          'Mi honnan jön?',
        ),
      ],
    },
    {
      id: 'public-category',
      title: 'Kategóriaoldal',
      summary:
        'Az utak listája egy kategóriában (pl. adriaholiday.hu/kategoriak/korutazasok), szűrő gombokkal.',
      blocks: [
        img(
          'public-category',
          'Kategóriaoldal',
          'A kategóriaoldal szűrősávja: közlekedés és ár szerinti gombok, országok, alatta a kiemelt ajánlat és az utak listája.',
        ),
        list([
          'Az oldal címe és webcíme: Blog › Kategóriák (név, SEO név).',
          'A szűrő gombok (pl. „Autóbuszos utak”, „Kedvező ár”): Portfólió filter chipek.',
          'Az utak listája: a kategóriába sorolt, aktív és listában megjelenő körutazások, a körutazás „Sorrend” mezője szerint.',
          'Az ajánlatkártyák képe, neve, ára és rövid leírása: a körutazás borítóképe, neve, „Megjelenített ár szöveg” és „Lista rövid leírása” mezője.',
        ]),
      ],
    },
    {
      id: 'public-offer',
      title: 'Egy utazás oldala',
      summary:
        'Egy körutazás saját oldala (adriaholiday.hu/ajanlat/<SEO név>).',
      blocks: [
        img(
          'public-offer',
          'Utazás oldala – felső rész',
          'Felül az információs kártyák (indulás, időtartam, utazás módja, ellátás, szállás), alatta a kiválasztott időpont és az árdoboz a „Foglalás” és „Egyedi ajánlatot kérek” gombokkal.',
        ),
        list([
          'Indulás, időtartam, „+2 további időpont”: Időpontok szekció.',
          'Utazás (Autóbusz): Szűrők és kapcsolatok › Közlekedés.',
          'Ellátás és Szállás kártya, ⓘ információ: Szállás és ellátás szekció.',
          'Ár, áthúzott ár, kedvezmény: Ár / PriceBox és az időpont saját ára.',
        ]),
        img(
          'public-offer-2',
          'Utazás oldala – galéria és időpontok',
          'A galéria (Galéria és média), mellette az időpontválasztó az árakkal, a foglalás gomb és a nyomtatható program letöltése.',
        ),
        p(
          'Lejjebb következnek a tartalmi blokkok (ismertető, program vagy programnapok, ár tartalma, fakultatív programok, belépőjegyek stb.) a Tartalmi blokkok, Program napok és Ár tartalma szekciókból. Az üresen hagyott blokkok nem jelennek meg.',
        ),
      ],
    },
    {
      id: 'public-footer',
      title: 'Lábléc',
      summary: 'A weboldal minden oldalának alján megjelenő lábléc.',
      blocks: [
        img(
          'public-footer',
          'A weboldal lábléce',
          'A lábléc: logó és bemutatkozó szöveg, közösségi ikonok, gyorslinkek, elérhetőségek és nyitvatartás, legalul a copyright és a jogi linkek.',
        ),
        list([
          'Bemutatkozó szöveg: Beállítások › Footer › Leírás.',
          'Közösségi ikonok: Beállítások › Social.',
          'Gyors linkek: Beállítások › Footer quick links.',
          'Telefonszámok, e-mail, cím, nyitvatartás: Beállítások › Contact.',
          'Copyright: Beállítások › Footer › Copyright.',
          'Jogi linkek (ÁSZF, Adatvédelem, Impresszum, Sütik…): Beállítások › Legal; az oldalak szövege a Legal page content kártyán.',
        ]),
      ],
    },
  ],
};

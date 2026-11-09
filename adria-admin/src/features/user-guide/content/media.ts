import { GalleryVerticalEnd } from 'lucide-react';

import type { GuideChapter } from '../lib/user-guide.types';

import { ADMIN_ONLY, field, fields, img, list, tip, warning } from './blocks';

export const mediaChapter: GuideChapter = {
  id: 'media',
  title: 'Képek és média',
  description:
    'Az összes feltöltött kép, PDF és dokumentum egy helyen: feltöltés, keresés, adatok szerkesztése és törlés.',
  icon: GalleryVerticalEnd,
  topics: [
    {
      id: 'media-library',
      title: 'Médiatár',
      summary:
        'Minden kép, amit az admin bármely részén feltöltesz, ide kerül, és innen bárhol újra felhasználható. A médiatár a menü „Galériák” pontja alatt érhető el.',
      path: '/media',
      menu: 'Galériák',
      access: 'Galériák megtekintése',
      blocks: [
        img(
          'media',
          'A médiatár',
          'A médiatár: felül kereső, kategória- és rendezési szűrő, alatta a fájlok rácsban, névvel, kategóriával, mérettel és dátummal.',
        ),
        fields('Keresés és szűrés', [
          field('Keresés', 'Fájlnév, alt szöveg vagy cím alapján.'),
          field(
            'Kategória',
            'Csak az adott kategóriájú fájlok (pl. Apartmanok, Utazások, Blog, Általános).',
          ),
          field('Rendezés', 'Legújabb, legrégebbi vagy név szerint.'),
        ]),
        img(
          'media-upload',
          'Fájl feltöltése',
          'A „Fájl feltöltése” ablak: fájl, kategória, alt szöveg és cím.',
        ),
        fields('Feltöltés', [
          field(
            'Fájl',
            'Húzd a fájlt a mezőre, vagy válaszd ki a gépről. Kép, PDF vagy dokumentum lehet.',
          ),
          field(
            'Kategória',
            'Melyik csoportba kerüljön; a kereséshez és rendszerezéshez.',
            ADMIN_ONLY,
          ),
          field(
            'Alt',
            'A kép rövid szöveges leírása.',
            'A weboldalon a kép alternatív szövegeként (keresők, képernyőolvasók).',
          ),
          field('Cím', 'A fájl megnevezése.', ADMIN_ONLY),
        ]),
        img(
          'media-detail',
          'Média részletei',
          'Egy fájl részletei: előnézet, fájlnév, URL, méret, kategória, alt szöveg, cím és felhasználási helyek.',
        ),
        fields('Média részletei', [
          field(
            'Megnyitás új lapon / Letöltés / URL másolása',
            'A fájl megtekintése teljes méretben, letöltése vagy a címének vágólapra másolása (pl. e-mailbe illesztéshez).',
          ),
          field(
            'Kategória / Alt szöveg / Cím',
            'Utólag is módosíthatók.',
            'Az alt szöveg mindenhol, ahol a kép megjelenik.',
          ),
          field(
            'Hol használják?',
            'Felsorolja, mely utaknál, apartmanoknál, cikkeknél stb. szerepel a fájl.',
            ADMIN_ONLY,
          ),
          field('Törlés', 'Megerősítés után a fájl végleg törlődik.'),
        ]),
        warning(
          'Törlés előtt nézd meg a „Hol használják?” listát: ha a fájl valahol szerepel, ott a kép a törlés után eltűnik.',
        ),
        list([
          'A rendszer minden feltöltött képből automatikusan készít kisebb méreteket (bélyegkép, előnézet, nagy), így a weboldal gyorsan tölt.',
          'Képet JPG vagy PNG formátumban tölts fel; nagyon nagy (több tíz MB-os) fájlokat előbb kicsinyíts le.',
        ]),
        tip(
          'Ugyanazt a képet nem kell többször feltölteni: a képmezők „Médiatár” gombjával a már feltöltött képek közül választhatsz.',
        ),
      ],
    },
  ],
};

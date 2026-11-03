import { Newspaper } from 'lucide-react';

import type { GuideChapter } from '../lib/user-guide.types';

import { ADMIN_ONLY, field, fields, img, p, tip, warning } from './blocks';

const ARTICLE_PAGE = 'A cikk oldalán (adriaholiday.hu/blog/<SEO név>)';

export const blogChapter: GuideChapter = {
  id: 'blog',
  title: 'Blog és kategóriák',
  description:
    'Blogcikkek írása, valamint a kategóriák és címkék kezelése. A kategóriák egyben a weboldal ajánlat-kategóriaoldalait is adják.',
  icon: Newspaper,
  topics: [
    {
      id: 'blog-articles',
      title: 'Blog cikkek',
      summary: 'Cikkek írása és közzététele a weboldal blogjában.',
      path: '/blog',
      menu: 'Blog › Cikkek',
      access: 'Blog cikkek megtekintése',
      blocks: [
        img(
          'blog-articles',
          'Blog cikkek listája',
          'A cikkek listája azonosítóval, címmel, dátummal és megnyitásszámmal.',
        ),
        img(
          'blog-article-form',
          'Blog cikk szerkesztése',
          'A cikk szerkesztője: megjelenési beállítások, borítókép, kategóriák, címkék és a nyelvenkénti tartalom.',
        ),
        fields('Megjelenés', [
          field(
            'Aktív',
            'Csak aktív cikk jelenik meg.',
            'A blogban (adriaholiday.hu/blog) és a cikk oldalán.',
          ),
          field(
            'Megjelenjen a főoldalon?',
            'Bekapcsolva a cikk a bloglista elejére kerül.',
            'A blog listájának elején.',
          ),
          field(
            'Portfólió főoldalon?',
            'Bekapcsolva a cikk a weboldal főoldalának blog blokkjában szerepel.',
            'A főoldal blog blokkjában.',
          ),
          field(
            'Portfólió sorrend',
            'A főoldali blog blokk sorrendje; kisebb szám előrébb.',
            'A főoldal blog blokkjában.',
          ),
          field(
            'Dátum',
            'A megjelenés dátuma; dátum nélkül a cikk nem jelenik meg. A lista ez alapján rendez.',
            `${ARTICLE_PAGE} és a bloglistában.`,
          ),
          field('Megnyitva', 'Hányszor nyitották meg a cikket.', ADMIN_ONLY),
        ]),
        fields('Kép, kategóriák, címkék', [
          field(
            'Borítókép / Kép címe',
            'A cikk fő képe feltöltéssel vagy a médiatárból.',
            `A bloglista kártyáján, ${ARTICLE_PAGE.toLowerCase()} tetején és megosztáskor.`,
          ),
          field(
            'Kategóriák',
            'Több is kijelölhető (Ctrl / Cmd + kattintás).',
            `${ARTICLE_PAGE} címkeként és a blog szűrésénél.`,
          ),
          field(
            'Címkék',
            'Szabad címkék a cikkhez; több is kijelölhető.',
            ARTICLE_PAGE,
          ),
        ]),
        fields('Nyelvi tartalom (Magyar / Angol / Német fül)', [
          field(
            'Cím',
            'A cikk címe.',
            `${ARTICLE_PAGE} főcímként és a bloglistában.`,
          ),
          field(
            'SEO név + Automatikus generálás',
            'A cikk webcíme.',
            'A böngésző címsorában.',
          ),
          field(
            'Kivonat',
            'Egy-két mondatos összefoglaló.',
            'A bloglista kártyáján és a keresőtalálatban.',
          ),
          field(
            'Tartalom',
            'A cikk teljes szövege formázással, képekkel, linkekkel.',
            ARTICLE_PAGE,
          ),
        ]),
        tip(
          'Írás közben az „Előnézet” fülön nézd meg a formázott szöveget. Amíg a cikk nem végleges, inaktív állapotban mentsd.',
        ),
      ],
    },
    {
      id: 'blog-categories',
      title: 'Kategóriák',
      summary:
        'A blogcikkek és a körutazások közös kategóriái. Minden aktív kategóriának saját oldala van (adriaholiday.hu/kategoriak/<SEO név>), ahol a kategóriába sorolt utak jelennek meg.',
      path: '/blog/categories',
      menu: 'Blog › Kategóriák',
      access: 'Blog kategóriák megtekintése',
      blocks: [
        img(
          'blog-categories',
          'Kategóriák listája',
          'A kategóriák listája névvel és oszloppal.',
        ),
        img(
          'blog-category-form',
          'Kategória szerkesztése',
          'Egy kategória szerkesztése: aktív, oszlop és nyelvenkénti név, SEO név.',
        ),
        fields('Mezők', [
          field(
            'Aktív',
            'Inaktív kategória oldala nem érhető el.',
            'adriaholiday.hu/kategoriak/<SEO név>',
          ),
          field(
            'Oszlop',
            'A régi rendszer menüoszlopa (1–3), a kategóriák csoportosítására.',
            ADMIN_ONLY,
          ),
          field(
            'Név (nyelvenként)',
            'A kategória neve (pl. „Adventi barangolások”).',
            'A kategóriaoldal címe, az ajánlatkártyák és cikkek címkéi.',
          ),
          field(
            'SEO név + Automatikus generálás',
            'A kategóriaoldal webcíme.',
            'A kategóriaoldal webcímében; a főoldali ajánlatok linkjei is erre mutatnak.',
          ),
        ]),
        warning(
          'Egy kategória SEO nevének módosítása megváltoztatja a kategóriaoldal címét: igazítsd hozzá a főoldali ajánlatok linkjét és vegyél fel átirányítást.',
        ),
        p(
          'A körutazás szerkesztő „Kategóriák” mezőjében ezekből választhatsz; ott új kategória is létrehozható.',
        ),
      ],
    },
    {
      id: 'blog-tags',
      title: 'Címkék',
      summary: 'Szabad címkék a blogcikkekhez és az utakhoz.',
      path: '/blog/tags',
      menu: 'Blog › Címkék',
      access: 'Blog címkék megtekintése',
      blocks: [
        img('blog-tags', 'Címkék listája', 'A címkék listája.'),
        fields('Mezők', [
          field('Aktív', 'Inaktív címke nem jelenik meg.'),
          field(
            'Név (nyelvenként)',
            'A címke szövege.',
            'A cikkek és ajánlatok címkéinél.',
          ),
        ]),
      ],
    },
  ],
};

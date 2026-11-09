import { Ticket } from 'lucide-react';

import type { GuideChapter } from '../lib/user-guide.types';

import {
  ADMIN_ONLY,
  field,
  fields,
  img,
  list,
  p,
  steps,
  tip,
  warning,
} from './blocks';
import { tourEditorTopics } from './tour-editor';

const TOURS_ACCESS =
  'Körutazások megtekintése (a módosításhoz szerkesztési jog is kell)';

export const toursChapter: GuideChapter = {
  id: 'tours',
  title: 'Körutazások',
  description:
    'A körutazási ajánlatok teljes kezelése: lista, szerkesztő, időpontok és felárak, a régiók, szezonális csoportok és felszállási helyek, valamint az utak sorrendje csempénként és országonként.',
  icon: Ticket,
  topics: [
    {
      id: 'tour-list',
      title: 'Ajánlatok listája',
      summary:
        'Itt látod az összes körutazást. Innen nyitod meg a szerkesztőt, és itt kapcsolhatod ki-be, másolhatod, rendezheted vagy törölheted az utakat.',
      path: '/tours',
      menu: 'Körutazások › Ajánlatok',
      access: TOURS_ACCESS,
      blocks: [
        img(
          'tours-list',
          'A körutazások listája',
          'Az ajánlatok listája: felül a kereső és az „Új körutazás” gomb, alatta a szűrők, a táblázatban pedig utanként a fő jelölők (Kiemelt, Aktív, Képes ajánlat, Partnerportálokon megjelenik).',
        ),
        fields('Szűrők és oszlopok', [
          field(
            'Kereső',
            'Az út nevében, SEO nevében és az akció szövegekben keres.',
          ),
          field(
            'Összes régió / csoport / szezonális csoport',
            'Csak az adott régióba vagy csoportba sorolt utakat mutatja.',
          ),
          field(
            'Aktív / Kiemelt / XML / Képes ajánlat állapot',
            'A megfelelő jelölő szerint szűr (pl. csak az inaktív utak).',
          ),
          field(
            'Név / Akció 1 / Akció 2',
            'Az út neve, alatta a belső akciócímkék és a keresési kulcsszavak. Ha egy aktív útnak nincs kulcsszava, a lista jelzi.',
          ),
          field(
            'Régió, Csoport',
            'Az út besorolása (a szerkesztő „Szűrők és kapcsolatok” részében állítható).',
          ),
          field(
            'Kiemelt, Aktív, Képes ajánlat, Partnerportálokon megjelenik',
            'Igen / Nem jelzés a szerkesztő azonos nevű kapcsolói alapján.',
          ),
        ]),
        fields('Rendezés', [
          field(
            'Rendezés választó',
            'A szűrők első listájában választhatsz: alapértelmezett sorrend, név, létrehozás, módosítás, ár, legutóbbi foglalás, legtöbb foglalás vagy legközelebbi indulás. A név alatt megjelenik a rendezés alapja, például az utolsó foglalás dátuma. Csak az admin listát rendezi, a honlap sorrendjét nem változtatja meg.',
          ),
        ]),
        fields('Műveletek egy sor végén: Szem, Ceruza és a „…” menü', [
          field(
            'Szem',
            'Megtekintés: az út összes adata csak olvasható nézetben, oldalsó panelen.',
          ),
          field(
            'Ceruza',
            'Szerkesztés: megnyitja a teljes körutazás szerkesztőt.',
          ),
          field(
            '„…” menü: Aktiválás / Inaktiválás',
            'Egy kattintással aktiválja vagy inaktiválja az utat. Az inaktív út eltűnik a publikus oldalról, de minden adata megmarad.',
            'Azonnal a publikus weboldalon (listák, kereső, az út saját oldala).',
          ),
          field(
            '„…” menü: Program PDF letöltése',
            'Letölti az út programját PDF-ben, ugyanúgy, ahogy a látogatók a weboldalon.',
          ),
          field(
            '„…” menü: Másolás új útként',
            'Teljes másolatot készít az útról (időpontokkal, szövegekkel). Új, hasonló út felviteléhez a leggyorsabb.',
          ),
          field(
            '„…” menü: Feljebb / Lejjebb az alapsorrendben',
            'Eggyel előrébb vagy hátrébb mozgatja az utat az alapértelmezett sorrendben.',
            'A publikus ajánlatlisták sorrendjében, ahol a listának nincs saját sorrendje (lásd „Sorrend listánként”).',
          ),
          field(
            '„…” menü: Törlés',
            'Végleges törlés megerősítés után. Ha csak elrejtenéd az utat, inkább inaktiváld.',
          ),
        ]),
        img(
          'tour-detail',
          'Egy körutazás megtekintése',
          'A szem ikonnal megnyitott nézet: az út minden adata csoportosítva, szerkesztés nélkül. A panel aljáról is indítható a szerkesztés, a másolás vagy a törlés.',
        ),
        steps(
          [
            'Kattints az „Új körutazás” gombra, vagy egy hasonló út sorában a másolás ikonra.',
            'Töltsd ki legalább a nevet (Név és webcím), az árat (Árdoboz) és a régiót (Szűrők és kapcsolatok).',
            'Add meg az indulási időpontokat az „Időpontok” részben, szükség esetén a felárakkal.',
            'Írd meg a leírásokat és a programot, tölts fel képeket.',
            'Pipáld be az „Aktív?” és a „Megjelenik az ajánlatlistákban?” jelölőt, majd ments.',
            'Nyisd meg az utat a weboldalon (/ajanlat/<Webcím>), és ellenőrizd a megjelenést.',
          ],
          'Új út felvitele lépésről lépésre',
        ),
      ],
    },
    ...tourEditorTopics,
    {
      id: 'tour-partner-offers',
      title: 'Szervezés alatt partner ajánlatok',
      summary:
        'Belső nyilvántartás azokról az utakról, amelyeket partnerirodák szerveznek és amelyekről érdeklődés érkezett. Csak az adminban használt munkalista.',
      path: '/tours/partner-offers',
      menu: 'Körutazások › Szervezés alatt partner ajánlatok',
      access: TOURS_ACCESS,
      blocks: [
        img(
          'tour-partner-offers',
          'Partner ajánlatok listája',
          'A partner ajánlatok listája névvel, partnerrel, partner e-mail címmel és az érdeklődés dátumával.',
        ),
        fields('Mezők', [
          field('Név', 'Az ajánlat vagy út megnevezése.', ADMIN_ONLY),
          field(
            'Partner / Partner neve / Partner email',
            'A szervező partneriroda és kapcsolattartója.',
            ADMIN_ONLY,
          ),
          field(
            'Érdeklődés dátuma',
            'Mikor érkezett az érdeklődés.',
            ADMIN_ONLY,
          ),
          field(
            'Ajánlat státusz',
            'A feldolgozás állapota: Új → Felvett kapcsolat → Ajánlat elküldve → Megnyert vagy Elvesztett.',
            ADMIN_ONLY,
          ),
          field(
            'Megjegyzés',
            'Belső jegyzet a további teendőkről.',
            ADMIN_ONLY,
          ),
          field(
            'Aktív',
            'Kikapcsolva a tétel archiváltnak tekinthető.',
            ADMIN_ONLY,
          ),
        ]),
      ],
    },
    {
      id: 'tour-region-groups',
      title: 'Régiók és csoportok (körutazás)',
      summary:
        'A körutazások besorolására szolgáló régiók (pl. Erdély, Balkán) és csoportok (pl. Klasszikus körutak). Az út szerkesztőjében a „Régiók” és „Csoportok” mezőben választhatók ki.',
      path: '/tours/region-groups',
      menu: 'Körutazások › Régiók és csoportok',
      access: TOURS_ACCESS,
      blocks: [
        img(
          'tour-region-groups',
          'Körutazás régiók és csoportok',
          'A régiók és csoportok listája típussal és állapottal.',
        ),
        img(
          'tour-region-group-form',
          'Régió / csoport szerkesztése',
          'Egy régió vagy csoport szerkesztő panelje a leírásokkal, a galériával és a beutazási feltételek linkjével.',
        ),
        fields('Mezők', [
          field(
            'Név',
            'A régió vagy csoport megnevezése.',
            'Az utak besorolásánál, a szerkesztő választólistáiban és az utak címkéiben.',
          ),
          field(
            'Típus',
            '„Régió”: földrajzi terület. „Csoport”: tematikus csoport (pl. adventi utak).',
          ),
          field('Leírás', 'Bemutató szöveg a régióhoz vagy csoporthoz.'),
          field(
            'List alatti szöveg',
            'A listázás alatt megjelenő kiegészítő szöveg.',
          ),
          field(
            'Aktív',
            'Kikapcsolva a régió nem választható és nem jelenik meg.',
          ),
          field(
            'Főoldalra kiemelt?',
            'Jelöli, hogy a régió/csoport kiemelt helyen szerepelhet.',
          ),
          field(
            'Webcím + Automatikus generálás',
            'A webcímben használt név; az automatikus generálás a névből készíti.',
          ),
          field('Galéria', 'A régióhoz tartozó képek.'),
          field(
            'Beutazási feltételek link',
            'A régióhoz tartozó beutazási tájékoztató (pl. konzuli oldal) linkje.',
          ),
        ]),
        tip(
          'Az apartmanokhoz és a weboldal régióoldalaihoz (/regiok/…) tartozó régiókat nem itt, hanem az Apartmanok › Régiók oldalon kell kezelni.',
        ),
      ],
    },
    {
      id: 'tour-seasonal-groups',
      title: 'Szezonális ajánlat csoportok',
      summary:
        'Időszakhoz vagy témához kötött ajánlatcsoportok (pl. bevezető utak, ajánlatkérő utak). Egy út a szerkesztőben egy szezonális csoportba sorolható.',
      path: '/tours/seasonal-groups',
      menu: 'Körutazások › Szezonális ajánlat csoportok',
      access: TOURS_ACCESS,
      blocks: [
        img(
          'tour-seasonal-groups',
          'Szezonális csoportok',
          'A szezonális ajánlat csoportok listája.',
        ),
        img(
          'tour-seasonal-group-form',
          'Szezonális csoport szerkesztése',
          'Egy szezonális csoport szerkesztő panelje.',
        ),
        fields('Mezők', [
          field('Név', 'A csoport neve.'),
          field(
            'Menü típus',
            'A csoport fajtája: Bevezető utak, Ajánlatkérő utak, Híres menüben, Utazási ajánlatok vagy Ikonalapúak.',
          ),
          field('Doboz szöveg', 'A csoport dobozában megjelenő rövid szöveg.'),
          field('Aktív', 'Kikapcsolva a csoport nem használható.'),
          field(
            'Ajánlatos utak?',
            'Jelöli, hogy a csoport ajánlott utakat gyűjt.',
          ),
          field(
            'Webcím + Automatikus generálás',
            'A csoport webcímben használt neve.',
          ),
        ]),
      ],
    },
    {
      id: 'tour-departure-places',
      title: 'Felszállási helyek',
      summary:
        'A buszos utak felszállási helyei – egy hely egy település – és az alapértelmezett felszállási díjuk. Az utaknál ezekből lehet választani.',
      path: '/tours/departure-places',
      menu: 'Körutazások › Felszállási helyek',
      access: TOURS_ACCESS,
      blocks: [
        img(
          'tour-departure-places',
          'Felszállási helyek',
          'A felszállási helyek listája névvel, várossal, díjjal és állapottal.',
        ),
        img(
          'tour-departure-place-form',
          'Felszállási hely szerkesztése',
          'Egy felszállási hely szerkesztése.',
        ),
        fields('Mezők', [
          field(
            'Név',
            'Egyetlen település neve (pl. „Miskolc”). Útvonal vagy felsorolás („Miskolc-Mezőkövesd-Budapest”, „mezőkövesdi, gyöngyösi indulással”) nem adható meg, és ugyanaz a név nem szerepelhet kétszer.',
            'A foglalási űrlapon a felszállási hely választólistájában és a foglalás árösszesítőjében.',
          ),
          field('Város', 'A település neve; a kereséshez és csoportosításhoz.'),
          field(
            'Díj',
            'Az alapértelmezett felszállási felár forintban, fejenként. 0, ha a felszállás ingyenes.',
            'A foglalási űrlap árösszesítőjében, a végösszegbe beszámítva.',
          ),
          field('Aktív', 'Kikapcsolva a hely nem választható új foglalásnál.'),
        ]),
        p(
          'Az utaknál a felszállási helyek díja felülírható (lásd „Szűrők és kapcsolatok”), és időpontonként szűkíthető, melyik hely választható (lásd „Időpontok”).',
        ),
        list(
          [
            'Olaszország, Horvátország, Szlovénia, Barangolás a francia riviérán: Miskolc, Mezőkövesd, Gyöngyös, Hatvan, Budapest, Székesfehérvár, Siófok, Nagykanizsa.',
            'Ausztria, Németország, Svájc, Csehország, Hollandia, Egyesült Királyság, Franciaország: Miskolc, Mezőkövesd, Gyöngyös, Hatvan, Budapest, Tatabánya, Győr, Mosonmagyaróvár.',
            'Szlovákia és Lengyelország egynapos, adventi és téli útjai: Miskolc; a többnapos utak (pl. Felvidéki barangolás, Lengyelországi kalandok): Budapest, Hatvan, Gyöngyös, Mezőkövesd, Miskolc.',
            'Románia: Budapest, Miskolc.',
            'Görögország: Miskolc, Mezőkövesd, Gyöngyös, Hatvan, Budapest, Kecskemét.',
            'Albánia (és Montenegró Albánia kincseivel): Miskolc, Mezőkövesd, Gyöngyös, Hatvan, Budapest, Kecskemét, Kiskunfélegyháza, Szeged.',
            'Bosznia, Montenegró, a mediterrán csoda: Miskolc, Mezőkövesd, Gyöngyös, Hatvan, Budapest, Dunaújváros, Paks, Szekszárd, Mohács.',
            'Repülős utak: Budapest.',
          ],
          'Szokásos felszállási helyek úti cél szerint',
        ),
        tip(
          'Új útnál egyszerűen pipáld be a fenti települések közül azokat, ahonnan indul. Ha egy helyen külön felár van (pl. Budapesten a BOK csarnoknál), azt az útnál add meg felárként, ne új felszállási helyként.',
        ),
        warning(
          'Felszállási helyet csak akkor törölj, ha egyetlen út sem használja; helyette inkább kapcsold ki.',
        ),
      ],
    },
    {
      id: 'tour-list-order',
      title: 'Sorrend listánként',
      summary:
        'A főoldal kiemelt ajánlatai, minden főoldali csempe kategóriaoldala és minden ország saját sorrendet kaphat, egymástól és az Ajánlatok oldali alapértelmezett sorrendtől függetlenül (pl. adventkor előre az adventi utak, vagy ár szerint).',
      path: '/tours/list-order',
      menu: 'Körutazások › Sorrend listánként',
      access: 'Körutazások rendezése',
      blocks: [
        fields('Listák', [
          field(
            'Főoldal – Kiemelt ajánlatok',
            'A „Kiemelt?” jelölésű utak sorrendje. Ez ugyanaz az érték, mint az út szerkesztőjében a „Kiemelt sorrend” mező, itt egyben, húzással állítható. Út felvenni vagy levenni a szerkesztőben, a „Kiemelt?” jelölővel lehet.',
            'A főoldal kiemelt ajánlatai között.',
          ),
          field(
            'Csempék',
            'A főoldali ajánlatcsempék (Főoldali ajánlatok), amelyek kategóriaoldalra visznek, a főoldali sorrendjükben. A sorrend a csempe kategóriaoldalán (pl. /kategoriak/korutazasok) érvényes, akkor is, ha a látogató ott még országra is szűr.',
            'A kategóriaoldalon, a „Legnépszerűbb” rendezésnél (ez az alapértelmezett).',
          ),
          field(
            'Országok',
            'Azok az országok, ahová legalább egy, a listákban megjelenő út visz, ábécérendben.',
            'Az Utazások oldalon (/utazasok), ha a látogató pontosan erre az egy országra szűr, a „Legnépszerűbb” rendezésnél.',
          ),
          field(
            'Kézi jelölés',
            'A listának van elmentett saját sorrendje. Jelölés nélkül a lista az Ajánlatok oldali alapértelmezett sorrendet követi; a szám a listán szereplő utak száma.',
          ),
        ]),
        fields('Gombok', [
          field(
            'Húzás / Fel–Le nyíl',
            'Az út áthelyezése a listán belül. A változás csak a „Mentés” után él.',
          ),
          field(
            'Ár szerint',
            'Egy kattintással a legolcsóbb úttal kezdi a listát (az ár nélküli utak a végére kerülnek). Utána még kézzel is igazíthatsz rajta, majd ments.',
          ),
          field(
            'Mentés',
            'Elmenti a lista sorrendjét.',
            'Azonnal a publikus weboldalon.',
          ),
          field('Mégse', 'Elveti a még nem mentett módosítást.'),
          field(
            'Alapértelmezett sorrend',
            'Törli a lista saját sorrendjét, a lista újra az Ajánlatok oldali sorrendet követi.',
            'Azonnal a publikus weboldalon.',
          ),
        ]),
        steps(
          [
            'Válaszd ki bal oldalt a csempét vagy az országot.',
            'Kattints az „Ár szerint” gombra, vagy húzd / nyilakkal tedd előre a kiemelni kívánt utakat.',
            'Kattints a „Mentés” gombra, és nézd meg a listát a weboldalon.',
          ],
          'Például: adventi utak előre a Körutazások csempén',
        ),
        p(
          'Ha egy elmentett sorrendű listára új út kerül (pl. új utat sorolsz a kategóriába), az a lista végén jelenik meg „Új a listán” jelöléssel, amíg el nem helyezed és nem mented. A látogató saját rendezése (Legolcsóbb, Legmelegebb) mindig felülírja a kézi sorrendet.',
        ),
        tip(
          'A főoldali „Kiemelt utak” blokk sorrendje a Sorrend listánként oldalon (vagy utanként a „Kiemelt sorrend” mezőben) állítható; a csempék egymás közti sorrendje a Főoldali ajánlatok oldalon.',
        ),
      ],
    },
    {
      id: 'tour-visibility-checklist',
      title: 'Miért nem látszik egy út a weboldalon?',
      summary:
        'Ellenőrzőlista, ha egy körutazás nem jelenik meg ott, ahol várnád.',
      blocks: [
        list([
          'Az „Aktív?” jelölő be van kapcsolva? Inaktív út sehol nem látszik.',
          'A „Megjelenik az ajánlatlistákban?” be van kapcsolva? Ha nincs, az út csak a saját címén (/ajanlat/…) érhető el, a listákban nem.',
          'Van jövőbeli időpontja? A már elindult (múltbeli) időpontok nem jelennek meg és nem foglalhatók.',
          'Be van sorolva legalább egy „Kategóriába” (Szűrők és kapcsolatok)? A kategóriaoldalak (pl. /kategoriak/korutazasok) a kategória – buszos és repülős oldalaknál a közlekedés – alapján gyűjtik az utakat.',
          'Főoldali kiemeléshez a „Kiemelt?” jelölő is kell.',
          'Ha a keresőben nem található: adj meg keresési kulcsszavakat a „Tartalmi blokkok” részben.',
          'Ha mentés után sem látod a változást, frissítsd a böngészőt (a nyitva hagyott oldal nem frissül magától).',
        ]),
      ],
    },
  ],
};

import { ShieldCheck } from 'lucide-react';

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

export const administrationChapter: GuideChapter = {
  id: 'administration',
  title: 'Rendszergazda',
  description:
    'Felhasználók, szerepkörök és jogosultságok kezelése: ki mit láthat és módosíthat az adminban.',
  icon: ShieldCheck,
  topics: [
    {
      id: 'users',
      title: 'Felhasználók',
      summary:
        'Az admin felhasználói fiókjai. Itt hozol létre új munkatársat, adsz neki szerepkört, és itt tiltod le a fiókját.',
      path: '/users',
      menu: 'Rendszergazda › Felhasználók',
      access: 'Felhasználók megtekintése',
      blocks: [
        img(
          'users',
          'Felhasználók',
          'A felhasználók listája a szerepkörökkel és az állapottal.',
        ),
        img(
          'user-form',
          'Felhasználó szerkesztése',
          'Egy felhasználó szerkesztése: alapadatok, szerepkörök, valamint egyedi hozzáadott és tiltott jogosultságok.',
        ),
        fields('Mezők', [
          field(
            'Név / Email',
            'A munkatárs neve és belépési e-mail címe.',
            ADMIN_ONLY,
          ),
          field(
            'Új jelszó / Jelszó megerősítése',
            'Új felhasználónál kötelező, meglévőnél csak akkor töltsd ki, ha jelszót cserélsz.',
            ADMIN_ONLY,
          ),
          field(
            'Aktív felhasználó',
            'Kikapcsolva a felhasználó nem tud belépni. A saját fiókodat nem deaktiválhatod.',
            ADMIN_ONLY,
          ),
          field(
            'Szerepkörök',
            'Egy vagy több szerepkör; a felhasználó ezek összes jogosultságát megkapja.',
            ADMIN_ONLY,
          ),
          field(
            'Direkt jogosultság hozzáadása',
            'A szerepkörön felül, kifejezetten ennek a felhasználónak adott jogok.',
            ADMIN_ONLY,
          ),
          field(
            'Direkt jogosultság tiltása',
            'Ezek a jogok akkor is tiltottak, ha egy szerepkör megadná őket.',
            ADMIN_ONLY,
          ),
        ]),
        steps(
          [
            'Kattints az „Új felhasználó” gombra.',
            'Add meg a nevet, az e-mail címet és egy ideiglenes jelszót.',
            'Jelöld be a munkakörnek megfelelő szerepkört (pl. Sales, Marketing).',
            'Ments, majd juttasd el a belépési adatokat biztonságos módon a munkatársnak, és kérd meg, hogy változtassa meg a jelszavát.',
          ],
          'Új munkatárs felvétele',
        ),
        warning(
          'Munkatárs távozásakor azonnal kapcsold ki az „Aktív felhasználó” jelölőt.',
        ),
      ],
    },
    {
      id: 'roles',
      title: 'Szerepkörök (szerepkörök)',
      summary:
        'A szerepkör jogosultságok csoportja egy munkakörhöz. A felhasználókat szerepkörhöz rendeled, nem egyenként jogokhoz.',
      path: '/roles',
      menu: 'Rendszergazda › Szerepkörök',
      access: 'Szerepkörök megtekintése',
      blocks: [
        img(
          'roles',
          'Szerepkörök',
          'A szerepkörök listája a jogosultságok és felhasználók számával.',
        ),
        img(
          'role-form',
          'Szerepkör szerkesztése',
          'Egy szerepkör szerkesztése: megnevezés és a területenként csoportosított jogosultságok.',
        ),
        fields('Mezők', [
          field(
            'Megnevezés',
            'A szerepkör neve. A rendszer szerepkörök (pl. Főadminisztrátor) neve nem módosítható.',
            ADMIN_ONLY,
          ),
          field(
            'Jogosultságok',
            'Modulonként bejelölhető műveletek; a keresővel szűrhetsz.',
            ADMIN_ONLY,
          ),
        ]),
        list(
          [
            'Főadminisztrátor: minden jog.',
            'Admin: minden, kivéve a szerepkörök és jogosultságok kezelését.',
            'Marketing: analitika, blog, főoldali ajánlatok, főoldal szerkesztése, Rólunk írták, médiatár, oldalak, átirányítások.',
            'Tartalomszerkesztő: blog, körutazások és kapcsolódó listák, médiatár, foglalási űrlap sablonok, Rólunk írták, oldalak, portfólió.',
            'Sales: foglalások, üzenetek, ügyfelek, kuponok megtekintése és kezelése, körutazások megtekintése.',
            'Operator, Partner Manager, Support, Viewer: szűkebb, munkakörre szabott jogok; a Viewer csak megtekinthet.',
          ],
          'Alap szerepkörök',
        ),
        p(
          'A pontos jogokat mindig a szerepkör szerkesztőjében ellenőrizd, mert azokat a rendszergazda módosíthatja.',
        ),
      ],
    },
    {
      id: 'permissions',
      title: 'Jogosultságok (jogosultságok)',
      summary:
        'Az összes létező jogosultság területenként, csak olvasható listában.',
      path: '/permissions',
      menu: 'Rendszergazda › Jogosultságok',
      access: 'Jogosultságok megtekintése',
      blocks: [
        img(
          'permissions',
          'Jogosultságok',
          'A jogosultságok területenként csoportosítva.',
        ),
        fields('A műveletek jelentése', [
          field(
            'Lista megtekintése',
            'A lista megtekintése (a menüpont is ettől látszik).',
          ),
          field('Megtekintés', 'Egy elem részleteinek megtekintése.'),
          field('Létrehozás', 'Új elem létrehozása.'),
          field('Módosítás', 'Meglévő elem módosítása.'),
          field('Törlés', 'Törlés.'),
          field('Állapot módosítása', 'Aktiválás / deaktiválás.'),
          field('Exportálás', 'Adatok exportálása.'),
        ]),
      ],
    },
    {
      id: 'activity-log',
      title: 'Napló',
      summary:
        'Ki és mikor lépett be az adminba, és ki melyik elemet hozta létre, módosította vagy törölte.',
      path: '/activity-log',
      menu: 'Rendszergazda › Napló',
      access: 'Napló megtekintése (csak Főadminisztrátor)',
      blocks: [
        list(
          [
            'Belépés, sikertelen belépés és kijelentkezés: időpont, IP-cím és böngésző. Sikertelen belépésnél a megadott e-mail cím és az ok (hibás jelszó vagy letiltott fiók) is látszik, a jelszó soha.',
            'Létrehozás, módosítás és törlés: melyik felhasználó, melyik elemen (körutazás, időpont, foglalás, apartman, oldal, kupon, felhasználó, szerepkör stb.).',
            'Felhasználók és szerepkörök szerepkör- és jogosultságváltozásai, valamint a jelszócsere ténye (az új jelszó nem).',
          ],
          'Mit rögzít a napló',
        ),
        fields('Szűrők', [
          field(
            'Felhasználó',
            'Egy munkatárs műveletei és a fiókjába tett belépési kísérletek.',
            ADMIN_ONLY,
          ),
          field(
            'Művelet',
            'Például csak a sikertelen belépések vagy csak a törlések.',
            ADMIN_ONLY,
          ),
          field(
            'Elem típusa',
            'Csak egy adott fajta elem (pl. Körutazás, Kupon) változásai.',
            ADMIN_ONLY,
          ),
          field(
            'Dátumtól / Dátumig',
            'Naptári napok magyar idő szerint, mindkét végpontot beleértve.',
            ADMIN_ONLY,
          ),
        ]),
        p(
          'Egy sorra kattintva oldalt megnyílik a részletes nézet: a „Mi változott” táblázat mezőnként mutatja a régi és az új értéket. A már törölt elemek neve áthúzva látszik.',
        ),
        tip(
          'A sok sikertelen belépés ugyanarról az IP-címről jelszópróbálgatásra utalhat: ilyenkor érdemes az érintett munkatárssal jelszót cserélni.',
        ),
      ],
    },
    {
      id: 'ai-assistant',
      title: 'AI asszisztens (Claude, ChatGPT, Gemini)',
      summary:
        'A saját Claude-, ChatGPT- vagy Gemini-fiókodból kérdezhetsz az admin adatairól: utakról, időpontokról, szabad helyekről, foglalásokról, ügyfelekről, apartmanokról, bevételről és arról, hogyan kell valamit megcsinálni az adminban. Az asszisztens csak olvas: semmit nem hoz létre, nem módosít, nem töröl és e-mailt sem küld.',
      menu: 'A Claude, a ChatGPT vagy a Gemini beállításaiban, nem az adminban',
      access: 'AI asszisztens (Claude, ChatGPT, Gemini) › Csatlakozás',
      blocks: [
        list(
          [
            '„Hány szabad hely van a júliusi montenegrói úton, és hányan foglaltak rá?”',
            '„Mutasd Kovács Anna foglalását: mennyit fizetett, mikor esedékes a következő részlet?”',
            '„Mennyi volt a bevétel októberben, és melyik út fogyott a legjobban?”',
            '„Mutass képeket a bibionei Dune Villáról.”',
            '„Hogyan veszek fel új időpontot felárral?” – a kézikönyv lépéseit és képernyőképeit küldi.',
          ],
          'Példakérdések',
        ),
        p(
          'A szerver címe mindhárom asszisztensnél: https://adriaholiday.hu/mcp. Csatlakozáskor megnyílik az Adria Holiday belépőoldala: ott az admin e-mail címeddel és jelszavaddal lépj be, majd kattints az „Engedélyezem” gombra.',
        ),
        steps(
          [
            'Beállítások › Connectors (Csatlakozók) › „Add custom connector”.',
            'Név: Adria Holiday, URL: https://adriaholiday.hu/mcp, majd „Add”.',
            '„Connect”: lépj be az admin adataiddal, és kattints az „Engedélyezem” gombra.',
            'Egy új beszélgetésben a „+” / eszközök menüben kapcsold be az Adria Holiday csatlakozót.',
          ],
          'Claude (claude.ai vagy asztali alkalmazás)',
        ),
        steps(
          [
            'Settings › Apps & Connectors › Advanced settings: kapcsold be a Developer mode-ot. Céges vagy csapat-előfizetésnél ezt a ChatGPT-fiók adminisztrátorának kell engedélyeznie.',
            '„Create”: név Adria Holiday, MCP server URL: https://adriaholiday.hu/mcp, Authentication: OAuth.',
            'Lépj be az admin adataiddal, és kattints az „Engedélyezem” gombra.',
            'Egy új beszélgetésben a „+” menüben válaszd ki az Adria Holiday csatlakozót.',
          ],
          'ChatGPT',
        ),
        steps(
          [
            'Beállítások › Connectors (gemini.google.com/customize/connectors) › „+ Custom”.',
            'Név: Adria Holiday, szerver URL: https://adriaholiday.hu/mcp.',
            'Ha a Gemini Client ID-t és Client secretet kér: a „Copy redirect URI” gombbal másold ki a visszairányítási címet, és küldd el a rendszergazdának. Ő ehhez létrehoz egy kliensazonosítót és titkos kulcsot, ezeket írd be a két mezőbe.',
            'Mentés után lépj be az admin adataiddal, és kattints az „Engedélyezem” gombra.',
          ],
          'Gemini',
        ),
        warning(
          'A Gemini egyéni csatlakozói nem minden országban és fióktípusnál érhetők el. Ha a „+ Custom” lehetőség hiányzik, használd a Claude-ot vagy a ChatGPT-t, vagy céges (Gemini Enterprise) fiókot.',
        ),
        fields('Jogosultságok', [
          field(
            'AI asszisztens › Csatlakozás',
            'Enélkül nem lehet belépni a csatlakozáskor. Alapból a Főadminisztrátor és az Admin szerepkör kapja meg, másnak a Szerepkörök vagy a Felhasználók oldalon adható meg.',
            ADMIN_ONLY,
          ),
          field(
            'A többi jogosultság',
            'Az asszisztens csak azt látja, amit te az adminban: foglalásokat csak „Foglalások” joggal, ügyfeleket csak „Ügyfelek” joggal, a bevételt csak „Vezérlőpult” joggal.',
            ADMIN_ONLY,
          ),
        ]),
        p(
          'Minden kérdés bekerül a Naplóba „AI lekérdezés” műveletként: ki kérdezett, melyik asszisztensből, mire és milyen szűrőkkel.',
        ),
        warning(
          'A hozzáférés azonnal megszűnik, ha a felhasználót letiltod, vagy elveszed tőle az „AI asszisztens › Csatlakozás” jogosultságot. A válaszok ügyféladatot tartalmazhatnak, ezért céges vagy csapat-előfizetést használj, ahol a beszélgetésekből nem tanítanak modellt.',
        ),
        tip(
          'Az asszisztens a pillanatnyi adatokból válaszol, és megadja a foglalás vagy az út azonosítóját és linkjét. Ha valamit módosítani kell, megmondja, hol és hogyan teheted meg az adminban.',
        ),
      ],
    },
  ],
};

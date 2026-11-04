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
    'Felhasználók, szerepkörök (role-ok) és jogosultságok kezelése: ki mit láthat és módosíthat az adminban.',
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
      title: 'Role-ok (szerepkörök)',
      summary:
        'A szerepkör jogosultságok csoportja egy munkakörhöz. A felhasználókat szerepkörhöz rendeled, nem egyenként jogokhoz.',
      path: '/roles',
      menu: 'Rendszergazda › Role-ok',
      access: 'Role-ok megtekintése',
      blocks: [
        img(
          'roles',
          'Role-ok',
          'A szerepkörök listája a jogosultságok és felhasználók számával.',
        ),
        img(
          'role-form',
          'Role szerkesztése',
          'Egy szerepkör szerkesztése: megnevezés és a modulonként csoportosított jogosultságok.',
        ),
        fields('Mezők', [
          field(
            'Megnevezés',
            'A szerepkör neve. A rendszer szerepkörök (pl. Super Admin) neve nem módosítható.',
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
            'Super Admin: minden jog.',
            'Admin: minden, kivéve a szerepkörök és jogosultságok kezelését.',
            'Marketing: analitika, blog, főoldali ajánlatok, portfólió, Rólunk írták, médiatár, oldalak, átirányítások.',
            'Content Editor: blog, körutazások és kapcsolódó listák, médiatár, foglalási űrlap sablonok, Rólunk írták, oldalak, portfólió.',
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
      title: 'Permissionök (jogosultságok)',
      summary:
        'Az összes létező jogosultság modulonként, csak olvasható listában.',
      path: '/permissions',
      menu: 'Rendszergazda › Permissionök',
      access: 'Jogosultságok megtekintése',
      blocks: [
        img(
          'permissions',
          'Permissionök',
          'A jogosultságok modulonként csoportosítva.',
        ),
        fields('A műveletek jelentése', [
          field(
            'viewAny',
            'A lista megtekintése (a menüpont is ettől látszik).',
          ),
          field('view', 'Egy elem részleteinek megtekintése.'),
          field('create', 'Új elem létrehozása.'),
          field('update', 'Meglévő elem módosítása.'),
          field('delete', 'Törlés.'),
          field('status', 'Aktiválás / deaktiválás.'),
          field('export', 'Adatok exportálása.'),
        ]),
      ],
    },
    {
      id: 'activity-log',
      title: 'Napló',
      summary:
        'Ki és mikor lépett be az adminba, és ki melyik rekordot hozta létre, módosította vagy törölte.',
      path: '/activity-log',
      menu: 'Rendszergazda › Napló',
      access: 'Napló megtekintése (csak Super Admin)',
      blocks: [
        list(
          [
            'Belépés, sikertelen belépés és kijelentkezés: időpont, IP-cím és böngésző. Sikertelen belépésnél a megadott e-mail cím és az ok (hibás jelszó vagy letiltott fiók) is látszik, a jelszó soha.',
            'Létrehozás, módosítás és törlés: melyik felhasználó, melyik rekordon (körutazás, időpont, foglalás, apartman, oldal, kupon, felhasználó, szerepkör stb.).',
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
            'Rekordtípus',
            'Csak egy adott fajta rekord (pl. Körutazás, Kupon) változásai.',
            ADMIN_ONLY,
          ),
          field(
            'Dátumtól / Dátumig',
            'Naptári napok magyar idő szerint, mindkét végpontot beleértve.',
            ADMIN_ONLY,
          ),
        ]),
        p(
          'Egy sorra kattintva oldalt megnyílik a részletes nézet: a „Mi változott” táblázat mezőnként mutatja a régi és az új értéket. A már törölt rekordok neve áthúzva látszik.',
        ),
        tip(
          'A sok sikertelen belépés ugyanarról az IP-címről jelszópróbálgatásra utalhat: ilyenkor érdemes az érintett munkatárssal jelszót cserélni.',
        ),
      ],
    },
  ],
};

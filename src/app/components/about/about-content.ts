import { usePortfolioContent } from "../../content/PortfolioContentProvider";
import type { PortfolioHeadingPart } from "../../content/PortfolioHeading";

export type AboutItem = {
  icon: string;
  title: string;
  description: string;
};

export type AboutStat = {
  value: string;
  label: string;
};

export type AboutMilestone = {
  year: string;
  title: string;
  description: string;
};

export type AboutTeamMember = {
  name: string;
  role: string;
};

/** Six portraits; each member's photo is its own image field (about.team.member.{n}.image). */
export const TEAM_SIZE = 6;

export const aboutFallback = {
  hero: {
    eyebrow: "RÓLUNK",
    titleParts: [
      { text: "2003 óta utazunk" },
      { text: "együtt veletek", variant: "gradient" },
    ] satisfies PortfolioHeadingPart[],
    lead: "Az Adria Holiday 2003-ban indult európai kulturális körutazásokkal. Azóta kínálatunk egzotikus úti célokkal is bővült, és szeretnénk még több utazóhoz eljutni, aki igényes, mégis megfizethető utazásra vágyik.",
    stats: [
      { value: "2003", label: "óta szervezünk utakat" },
      { value: "10 000+", label: "elégedett utas" },
      { value: "2–3 év", label: "buszaink átlagos kora" },
    ] satisfies AboutStat[],
  },
  intro: {
    statement: "Minőséget nyújtani elfogadható, korrekt árakon.",
    text: "Ennyi a lényeg, és 23 éve ehhez tartjuk magunkat. Az Adria Holiday csapata azon dolgozik, hogy utasaink pihenjenek, feltöltődjenek, közben tanuljanak is valamit a helyekről, ahol járnak – és jó kedvvel emlékezzenek vissza a velünk töltött napokra.",
  },
  timeline: {
    eyebrow: "A TÖRTÉNETÜNK",
    titleParts: [
      { text: "23 év," },
      { text: "egy irány", variant: "gradient" },
    ] satisfies PortfolioHeadingPart[],
    items: [
      {
        year: "2003",
        title: "Az első indulás",
        description: "Európai kulturális körutazásokkal kezdtünk: kevés út, sok odafigyelés. Ez a felállás azóta is működik.",
      },
      {
        year: "Az első nyártól",
        title: "Bibione, minden évben",
        description: "Az első évtől szerepel a kínálatunkban. Vannak utasaink, akik minden nyáron velünk mennek.",
      },
      {
        year: "Évről évre",
        title: "Bővülő térkép",
        description: "A körutak mellé tengerparti üdülések, adventi utak, repülős városlátogatások és egzotikus úti célok kerültek.",
      },
      {
        year: "Csoportoknak",
        title: "Céges és közösségi utak",
        description: "Csapatépítő út, kulturális program vagy külföldi partnerek kalauzolása – egyedi igények szerint szervezzük.",
      },
      {
        year: "Ma",
        title: "10 000+ utas után",
        description: "Újszerű buszokkal, ismerős idegenvezetőkkel és ugyanazzal az elvvel: igényes utazás, elérhető áron.",
      },
    ] satisfies AboutMilestone[],
  },
  difference: {
    eyebrow: "MIBEN VAGYUNK MÁSOK?",
    titleParts: [
      { text: "Az átlagosnál többet," },
      { text: "alacsony áron", variant: "gradient" },
    ] satisfies PortfolioHeadingPart[],
    description: "Célunk, hogy az átlagosnál többet nyújtsunk, miközben tartjuk kedvező árainkat. Ehhez három dologra figyelünk különösen.",
    pillars: [
      {
        icon: "hotel",
        title: "Gondosan kiválasztott szállások",
        description: "Minden szálláshelyet alaposan megvizsgálunk, mielőtt utasaink elé kerül.",
      },
      {
        icon: "users",
        title: "Felkészült idegenvezetők",
        description: "Idegenvezetőinknél a szakmai felkészültség mellett a legfontosabb az emberi hozzáállás.",
      },
      {
        icon: "bus",
        title: "Újszerű, kényelmes autóbuszok",
        description: "Buszaink átlagos kora mindössze 2–3 év, így már az út is az élmény része.",
      },
    ] satisfies AboutItem[],
  },
  story: {
    highlights: [
      {
        icon: "beach",
        title: "Bibione a kezdetek óta",
        description: "Visszatérő utasaink legnagyobb örömére Bibione az első évtől kezdve minden évben szerepel a kínálatunkban.",
      },
      {
        icon: "heart",
        title: "Kiemelt odafigyelés",
        description: "Utasaink a gondos odafigyeléssel összeállított szolgáltatásaink minősége miatt választanak minket újra és újra.",
      },
      {
        icon: "compass",
        title: "Hűek maradtunk önmagunkhoz",
        description: "Legfontosabb mérföldkövünk, hogy 23 év után is megőriztük eredeti elképzelésünket: igényes utazás, elérhető áron.",
      },
    ] satisfies AboutItem[],
  },
  team: {
    eyebrow: "A CSAPATUNK",
    titleParts: [
      { text: "Akik az utazásaidat" },
      { text: "megszervezik", variant: "gradient" },
    ] satisfies PortfolioHeadingPart[],
    description: "Az első érdeklődéstől a hazaérkezésig ők foglalkoznak veled. Nem call center – név szerint ismerjük az utasainkat.",
    members: Array.from({ length: TEAM_SIZE }, () => ({ name: "", role: "" })) satisfies AboutTeamMember[],
  },
  groups: {
    eyebrow: "CÉGEKNEK ÉS CSOPORTOKNAK",
    titleParts: [
      { text: "Saját út," },
      { text: "saját programmal", variant: "gradient" },
    ] satisfies PortfolioHeadingPart[],
    description: "Munkahelyi közösségek, egyesületek, osztálykirándulások: legyen szó vidám csapatépítésről, kulturális programról vagy külföldi partnerek hazai kalauzolásáról, az útvonalat és a programot az igényeitekhez igazítjuk.",
    ctaLabel: "Ajánlatot kérek",
    ctaUrl: "/kapcsolat",
  },
  values: {
    titleParts: [
      { text: "Amit velünk" },
      { text: "kapsz", variant: "gradient" },
    ] satisfies PortfolioHeadingPart[],
    items: [
      { icon: "shieldCheck", title: "Biztonság", description: "Gondos szervezés az indulástól a hazaérkezésig." },
      { icon: "award", title: "Megbízhatóság", description: "Több mint 23 év tapasztalata és visszatérő utasok ezrei." },
      { icon: "sparkles", title: "Élményvágy", description: "Utak, amelyekre évek múlva is szívesen emlékszel." },
    ] satisfies AboutItem[],
    ctaLabel: "Fedezd fel utazásainkat",
    ctaUrl: "/utazasok",
  },
};

export function useContentList<T>(fieldKey: string, fallback: T[]): T[] {
  const { getValue } = usePortfolioContent();
  const value = getValue(fieldKey, fallback);

  return Array.isArray(value) ? (value as T[]) : fallback;
}

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
        description: "Legfontosabb mérföldkövünk, hogy két évtized után is megőriztük eredeti elképzelésünket: igényes utazás, elérhető áron.",
      },
    ] satisfies AboutItem[],
  },
  team: {
    eyebrow: "A CSAPATUNK",
    titleParts: [
      { text: "Akik az utazásaidat" },
      { text: "megszervezik", variant: "gradient" },
    ] satisfies PortfolioHeadingPart[],
    description: "Hét ember, egy közös cél: hogy az első érdeklődéstől a hazaérkezésig gondtalanul utazz.",
  },
  values: {
    titleParts: [
      { text: "Amit velünk" },
      { text: "kapsz", variant: "gradient" },
    ] satisfies PortfolioHeadingPart[],
    items: [
      { icon: "shieldCheck", title: "Biztonság", description: "Gondos szervezés az indulástól a hazaérkezésig." },
      { icon: "award", title: "Megbízhatóság", description: "Több mint két évtized tapasztalata és visszatérő utasok ezrei." },
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

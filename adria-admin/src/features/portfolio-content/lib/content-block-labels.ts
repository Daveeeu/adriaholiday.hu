const WORD_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bHero\b/g, 'Nyitókép'],
  [/\bhero\b/g, 'nyitókép'],
  [/\bFooter\b/g, 'Lábléc'],
  [/\bfooter\b/g, 'lábléc'],
  [/\bTrust\b/g, 'Bizalom blokk'],
  [/\bCTA\b/g, 'gomb'],
  [/\bExperience\b/g, 'Tapasztalat blokk'],
  [/\bHow it works\b/g, 'Hogyan működik blokk'],
  [/\bNewsletter\b/g, 'Hírlevél'],
  [/\bStory\b/g, 'Történetünk blokk'],
  [/\bWhy choose us\b/g, 'Miért válassz minket blokk'],
  [/\bdisclaimer\b/g, 'tájékoztató szöveg'],
  [/\bplaceholder\b/g, 'mintaszöveg'],
];

/** Block labels are stored in the database with developer words; show them in plain Hungarian. */
export function getContentBlockLabel(label: string): string {
  return WORD_REPLACEMENTS.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    label,
  );
}

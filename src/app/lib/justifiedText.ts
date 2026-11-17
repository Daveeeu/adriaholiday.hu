/**
 * Trip descriptions are justified, including paragraphs the legacy editor
 * aligned with inline styles. Words are never hyphenated at line ends: a
 * word that does not fit moves to the next line whole.
 */
export const JUSTIFIED_TEXT =
  "text-justify [&_p]:!text-justify [&_li]:!text-justify [&_div]:!text-justify";

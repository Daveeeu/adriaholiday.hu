import type { GuideBlock, GuideChapter, GuideTopic } from './user-guide.types';

export type GuideSearchResult = {
  chapter: GuideChapter;
  topic: GuideTopic;
  /** The first piece of text that matched, to show why the topic was found. */
  excerpt: string;
};

const MAX_RESULTS = 30;

/** Lower-case and strip accents so "arfolyam" also finds "árfolyam". */
export function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase('hu-HU')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function blockTexts(block: GuideBlock): string[] {
  switch (block.type) {
    case 'paragraph':
    case 'tip':
    case 'warning':
      return [block.text];
    case 'list':
    case 'steps':
      return [block.title ?? '', ...block.items];
    case 'fields':
      return [
        block.title,
        block.description ?? '',
        ...block.fields.flatMap((field) => [
          `${field.name}: ${field.description}`,
          field.appearsAt ?? '',
        ]),
      ];
    case 'image':
      return [block.image.caption];
  }
}

function topicTexts(topic: GuideTopic) {
  return [
    topic.title,
    topic.summary,
    topic.menu ?? '',
    ...topic.blocks.flatMap(blockTexts),
  ].filter((text) => text.trim() !== '');
}

export function searchGuide(
  chapters: GuideChapter[],
  query: string,
): GuideSearchResult[] {
  const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);

  if (terms.length === 0) {
    return [];
  }

  const results: GuideSearchResult[] = [];

  for (const chapter of chapters) {
    for (const topic of chapter.topics) {
      const texts = topicTexts(topic);
      const haystack = normalizeSearchText(
        `${chapter.title} ${texts.join(' ')}`,
      );

      if (!terms.every((term) => haystack.includes(term))) {
        continue;
      }

      const excerpt =
        texts.find((text) =>
          terms.some((term) => normalizeSearchText(text).includes(term)),
        ) ?? topic.summary;

      results.push({ chapter, topic, excerpt });

      if (results.length === MAX_RESULTS) {
        return results;
      }
    }
  }

  return results;
}

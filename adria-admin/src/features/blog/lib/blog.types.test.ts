import { describe, expect, it } from 'vitest';

import {
  getBlogArticleFormDefaults,
  getBlogCategoryFormDefaults,
  getBlogTagFormDefaults,
  type BlogArticle,
  type BlogCategory,
  type BlogTag,
} from './blog.types';

const hungarianOnlyArticle = {
  id: 49,
  active: true,
  publishedAt: '2019-07-02',
  categoryIds: [],
  tagIds: [],
  translations: {
    hu: {
      title: '5 TIPP - MIÉRT Horvátország?',
      seoName: '5-tipp-miert-horvatorszag',
      seoAutoGenerate: false,
      excerpt: '',
      content: '<p>Az Adriai-tenger és a hegyek találkozása</p>',
    },
  },
} as unknown as BlogArticle;

describe('blog form defaults', () => {
  it('opens a legacy post that has only its Hungarian text', () => {
    const values = getBlogArticleFormDefaults(hungarianOnlyArticle);

    expect(values.translations.hu.title).toBe('5 TIPP - MIÉRT Horvátország?');
    expect(values.translations.hu.seoAutoGenerate).toBe(false);
    expect(values.translations.en).toEqual({ title: '', seoName: '', seoAutoGenerate: true, excerpt: '', content: '' });
    expect(values.translations.de.title).toBe('');
  });

  it('opens a category or tag without English and German names', () => {
    const category = { id: 1, active: true, column: '2', seoName: 'celpontban', translations: { hu: { name: 'Célpontban', seoName: 'celpontban', seoAutoGenerate: true } } } as BlogCategory;
    const tag = { id: 2, active: true, translations: { hu: { name: 'Advent' } } } as BlogTag;

    expect(getBlogCategoryFormDefaults(category).translations.en).toEqual({ name: '', seoName: '', seoAutoGenerate: true });
    expect(getBlogTagFormDefaults(tag).translations.de).toEqual({ name: '' });
  });
});

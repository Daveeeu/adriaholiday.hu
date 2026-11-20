import { describe, expect, it } from 'vitest';

import {
  blogArticleFormSchema,
  blogCategoryFormSchema,
  blogTagFormSchema,
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

  it('saves a post, category or tag with its Hungarian text only', () => {
    const article = getBlogArticleFormDefaults(hungarianOnlyArticle);
    article.categoryIds = ['1'];
    article.translations.en.content = '<p></p>';

    expect(blogArticleFormSchema.safeParse(article).success).toBe(true);
    expect(blogCategoryFormSchema.safeParse({ active: true, column: '1', translations: { hu: { name: 'Célpontban', seoName: '', seoAutoGenerate: true }, en: { name: '', seoName: '', seoAutoGenerate: true }, de: { name: '', seoName: '', seoAutoGenerate: true } } }).success).toBe(true);
    expect(blogTagFormSchema.safeParse({ active: true, translations: { hu: { name: 'Advent' }, en: { name: '' }, de: { name: '' } } }).success).toBe(true);
  });

  it('asks for a title once a language has text', () => {
    const article = getBlogArticleFormDefaults(hungarianOnlyArticle);
    article.translations.de.content = '<p>Nur Text</p>';

    const result = blogArticleFormSchema.safeParse(article);

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toContain('translations.de.title');
  });
});

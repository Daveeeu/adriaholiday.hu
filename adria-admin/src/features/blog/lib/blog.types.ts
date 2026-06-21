import { z } from 'zod';

import { slugifyBlogText } from './blog.constants';

export type BlogLanguage = 'hu' | 'en' | 'de';
export type BlogCategoryColumn = '1' | '2' | '3';

export type BlogArticleTranslation = {
  title: string;
  seoName: string;
  seoAutoGenerate: boolean;
  excerpt: string;
  content: string;
};

export type BlogCategoryTranslation = {
  name: string;
  seoName: string;
  seoAutoGenerate: boolean;
};

export type BlogTagTranslation = {
  name: string;
};

export type BlogArticleTranslations = Record<BlogLanguage, BlogArticleTranslation>;
export type BlogCategoryTranslations = Record<BlogLanguage, BlogCategoryTranslation>;
export type BlogTagTranslations = Record<BlogLanguage, BlogTagTranslation>;

export type BlogArticle = {
  id: string | number;
  active: boolean;
  createdAt: string;
  publishedAt: string;
  updatedAt?: string;
  image: string | null;
  imageTitle: string;
  showOnHomepage: boolean;
  title: string;
  seoName: string;
  excerpt: string;
  content: string;
  categoryIds: Array<string | number>;
  tagIds: Array<string | number>;
  views: number;
  translations: BlogArticleTranslations;
};

export type BlogCategory = {
  id: string | number;
  active: boolean;
  translations: BlogCategoryTranslations;
  column: BlogCategoryColumn;
  seoName: string;
};

export type BlogTag = {
  id: string | number;
  active: boolean;
  translations: BlogTagTranslations;
};

export type BlogArticleFormValues = {
  active: boolean;
  showOnHomepage: boolean;
  publishedAt: string;
  image: string;
  imageTitle: string;
  categoryIds: string[];
  tagIds: string[];
  translations: BlogArticleTranslations;
};

export type BlogCategoryFormValues = {
  active: boolean;
  column: BlogCategory['column'];
  translations: BlogCategoryTranslations;
};

export type BlogTagFormValues = {
  active: boolean;
  translations: BlogTagTranslations;
};

export type BlogArticlesListQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: BlogArticlesSortKey;
  sortDirection?: 'asc' | 'desc';
};

export type BlogCategoriesListQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: BlogCategoriesSortKey;
  sortDirection?: 'asc' | 'desc';
};

export type BlogTagsListQuery = {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: BlogTagsSortKey;
  sortDirection?: 'asc' | 'desc';
};

export type BlogArticlesSortKey =
  | 'id'
  | 'title'
  | 'publishedAt'
  | 'showOnHomepage'
  | 'views';

export type BlogCategoriesSortKey = 'id' | 'name' | 'column';
export type BlogTagsSortKey = 'id' | 'name';

export type BlogArticlesListResponse = {
  items: BlogArticle[];
  totalCount: number;
  page: number;
  perPage: number;
};

export type BlogCategoriesListResponse = {
  items: BlogCategory[];
  totalCount: number;
  page: number;
  perPage: number;
};

export type BlogTagsListResponse = {
  items: BlogTag[];
  totalCount: number;
  page: number;
  perPage: number;
};

export type BlogArticleUpsertInput = {
  active: boolean;
  showOnHomepage: boolean;
  publishedAt: string;
  image: string | null;
  imageTitle: string;
  categoryIds: Array<string | number>;
  tagIds: Array<string | number>;
  translations: BlogArticleTranslations;
};

export type BlogCategoryUpsertInput = {
  active: boolean;
  column: BlogCategory['column'];
  translations: BlogCategoryTranslations;
};

export type BlogTagUpsertInput = {
  active: boolean;
  translations: BlogTagTranslations;
};

export type BlogPanelMode = 'create' | 'edit' | 'detail';

export const blogArticleTranslationSchema = z.object({
  title: z.string().trim().min(2, 'A cím megadása kötelező.'),
  seoName: z.string().trim(),
  seoAutoGenerate: z.boolean(),
  excerpt: z.string().trim(),
  content: z.string().trim(),
});

export const blogArticleFormSchema = z.object({
  active: z.boolean(),
  showOnHomepage: z.boolean(),
  publishedAt: z.string().trim().min(1, 'A dátum megadása kötelező.'),
  image: z.string().trim(),
  imageTitle: z.string().trim(),
  categoryIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  translations: z.object({
    hu: blogArticleTranslationSchema,
    en: blogArticleTranslationSchema,
    de: blogArticleTranslationSchema,
  }),
});

export const blogCategoryTranslationSchema = z.object({
  name: z.string().trim().min(2, 'A név megadása kötelező.'),
  seoName: z.string().trim(),
  seoAutoGenerate: z.boolean(),
});

export const blogCategoryFormSchema = z.object({
  active: z.boolean(),
  column: z.enum(['1', '2', '3']),
  translations: z.object({
    hu: blogCategoryTranslationSchema,
    en: blogCategoryTranslationSchema,
    de: blogCategoryTranslationSchema,
  }),
});

export const blogTagTranslationSchema = z.object({
  name: z.string().trim().min(2, 'A név megadása kötelező.'),
});

export const blogTagFormSchema = z.object({
  active: z.boolean(),
  translations: z.object({
    hu: blogTagTranslationSchema,
    en: blogTagTranslationSchema,
    de: blogTagTranslationSchema,
  }),
});

export type BlogArticleFormSchema = z.infer<typeof blogArticleFormSchema>;
export type BlogCategoryFormSchema = z.infer<typeof blogCategoryFormSchema>;
export type BlogTagFormSchema = z.infer<typeof blogTagFormSchema>;

function normalizeArticleTranslation(translation: BlogArticleTranslation) {
  return {
    ...translation,
    seoName: translation.seoAutoGenerate
      ? slugifyBlogText(translation.title)
      : translation.seoName.trim(),
    excerpt: translation.excerpt.trim(),
    content: translation.content.trim(),
  };
}

function normalizeCategoryTranslation(translation: BlogCategoryTranslation) {
  return {
    ...translation,
    seoName: translation.seoAutoGenerate
      ? slugifyBlogText(translation.name)
      : translation.seoName.trim(),
  };
}

export function normalizeBlogArticleFormValues(
  values: BlogArticleFormValues,
): BlogArticleUpsertInput {
  return {
    active: values.active,
    showOnHomepage: values.showOnHomepage,
    publishedAt: values.publishedAt.trim(),
    image: values.image.trim() ? values.image.trim() : null,
    imageTitle: values.imageTitle.trim(),
    categoryIds: values.categoryIds,
    tagIds: values.tagIds,
    translations: {
      hu: normalizeArticleTranslation(values.translations.hu),
      en: normalizeArticleTranslation(values.translations.en),
      de: normalizeArticleTranslation(values.translations.de),
    },
  };
}

export function normalizeBlogCategoryFormValues(
  values: BlogCategoryFormValues,
): BlogCategoryUpsertInput {
  return {
    active: values.active,
    column: values.column,
    translations: {
      hu: normalizeCategoryTranslation(values.translations.hu),
      en: normalizeCategoryTranslation(values.translations.en),
      de: normalizeCategoryTranslation(values.translations.de),
    },
  };
}

export function normalizeBlogTagFormValues(
  values: BlogTagFormValues,
): BlogTagUpsertInput {
  return {
    active: values.active,
    translations: {
      hu: { name: values.translations.hu.name.trim() },
      en: { name: values.translations.en.name.trim() },
      de: { name: values.translations.de.name.trim() },
    },
  };
}

export function getBlogArticleFormDefaults(
  article?: BlogArticle,
): BlogArticleFormValues {
  return {
    active: article?.active ?? true,
    showOnHomepage: article?.showOnHomepage ?? false,
    publishedAt: article?.publishedAt ?? new Date().toISOString().slice(0, 10),
    image: article?.image ?? '',
    imageTitle: article?.imageTitle ?? '',
    categoryIds: article?.categoryIds.map(String) ?? [],
    tagIds: article?.tagIds.map(String) ?? [],
    translations: {
      hu: {
        title: article?.translations.hu.title ?? '',
        seoName: article?.translations.hu.seoName ?? '',
        seoAutoGenerate: article?.translations.hu.seoAutoGenerate ?? true,
        excerpt: article?.translations.hu.excerpt ?? '',
        content: article?.translations.hu.content ?? '',
      },
      en: {
        title: article?.translations.en.title ?? '',
        seoName: article?.translations.en.seoName ?? '',
        seoAutoGenerate: article?.translations.en.seoAutoGenerate ?? true,
        excerpt: article?.translations.en.excerpt ?? '',
        content: article?.translations.en.content ?? '',
      },
      de: {
        title: article?.translations.de.title ?? '',
        seoName: article?.translations.de.seoName ?? '',
        seoAutoGenerate: article?.translations.de.seoAutoGenerate ?? true,
        excerpt: article?.translations.de.excerpt ?? '',
        content: article?.translations.de.content ?? '',
      },
    },
  };
}

export function getBlogCategoryFormDefaults(
  category?: BlogCategory,
): BlogCategoryFormValues {
  return {
    active: category?.active ?? true,
    column: category?.column ?? '1',
    translations: {
      hu: {
        name: category?.translations.hu.name ?? '',
        seoName: category?.translations.hu.seoName ?? '',
        seoAutoGenerate: category?.translations.hu.seoAutoGenerate ?? true,
      },
      en: {
        name: category?.translations.en.name ?? '',
        seoName: category?.translations.en.seoName ?? '',
        seoAutoGenerate: category?.translations.en.seoAutoGenerate ?? true,
      },
      de: {
        name: category?.translations.de.name ?? '',
        seoName: category?.translations.de.seoName ?? '',
        seoAutoGenerate: category?.translations.de.seoAutoGenerate ?? true,
      },
    },
  };
}

export function getBlogTagFormDefaults(tag?: BlogTag): BlogTagFormValues {
  return {
    active: tag?.active ?? true,
    translations: {
      hu: { name: tag?.translations.hu.name ?? '' },
      en: { name: tag?.translations.en.name ?? '' },
      de: { name: tag?.translations.de.name ?? '' },
    },
  };
}

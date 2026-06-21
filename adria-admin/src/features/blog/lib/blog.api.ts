import { apiClient } from '@/lib/api-client';

import type {
  BlogArticleUpsertInput,
  BlogArticlesListQuery,
  BlogArticlesListResponse,
  BlogCategoryUpsertInput,
  BlogCategoriesListQuery,
  BlogCategoriesListResponse,
  BlogTagUpsertInput,
  BlogTagsListQuery,
  BlogTagsListResponse,
  BlogArticle,
  BlogCategory,
  BlogTag,
} from './blog.types';

export function getBlogArticles(
  query?: BlogArticlesListQuery,
): Promise<BlogArticlesListResponse> {
  return apiClient.get<BlogArticlesListResponse>('/api/admin/blog/articles', {
    query,
  });
}

export async function getAllBlogArticles(): Promise<BlogArticle[]> {
  const response = await getBlogArticles({ page: 1, perPage: 1000 });
  return response.items;
}

export function createBlogArticle(values: BlogArticleUpsertInput) {
  return apiClient.post<BlogArticle>('/api/admin/blog/articles', values);
}

export function updateBlogArticle(
  id: string | number,
  values: BlogArticleUpsertInput,
) {
  return apiClient.patch<BlogArticle>(`/api/admin/blog/articles/${id}`, values);
}

export function deleteBlogArticle(id: string | number) {
  return apiClient.delete<{ id: string }>(`/api/admin/blog/articles/${id}`);
}

export function setBlogArticleStatus(id: string | number, active: boolean) {
  return apiClient.patch<BlogArticle>(`/api/admin/blog/articles/${id}/status`, {
    active,
  });
}

export function getBlogCategories(
  query?: BlogCategoriesListQuery,
): Promise<BlogCategoriesListResponse> {
  return apiClient.get<BlogCategoriesListResponse>(
    '/api/admin/blog/categories',
    { query },
  );
}

export async function getAllBlogCategories(): Promise<BlogCategory[]> {
  const response = await getBlogCategories({ page: 1, perPage: 1000 });
  return response.items;
}

export function createBlogCategory(values: BlogCategoryUpsertInput) {
  return apiClient.post<BlogCategory>('/api/admin/blog/categories', values);
}

export function updateBlogCategory(
  id: string | number,
  values: BlogCategoryUpsertInput,
) {
  return apiClient.patch<BlogCategory>(
    `/api/admin/blog/categories/${id}`,
    values,
  );
}

export function deleteBlogCategory(id: string | number) {
  return apiClient.delete<{ id: string }>(`/api/admin/blog/categories/${id}`);
}

export function setBlogCategoryStatus(id: string | number, active: boolean) {
  return apiClient.patch<BlogCategory>(
    `/api/admin/blog/categories/${id}/status`,
    { active },
  );
}

export function getBlogTags(
  query?: BlogTagsListQuery,
): Promise<BlogTagsListResponse> {
  return apiClient.get<BlogTagsListResponse>('/api/admin/blog/tags', { query });
}

export async function getAllBlogTags(): Promise<BlogTag[]> {
  const response = await getBlogTags({ page: 1, perPage: 1000 });
  return response.items;
}

export function createBlogTag(values: BlogTagUpsertInput) {
  return apiClient.post<BlogTag>('/api/admin/blog/tags', values);
}

export function updateBlogTag(id: string | number, values: BlogTagUpsertInput) {
  return apiClient.patch<BlogTag>(`/api/admin/blog/tags/${id}`, values);
}

export function deleteBlogTag(id: string | number) {
  return apiClient.delete<{ id: string }>(`/api/admin/blog/tags/${id}`);
}

export function setBlogTagStatus(id: string | number, active: boolean) {
  return apiClient.patch<BlogTag>(`/api/admin/blog/tags/${id}/status`, {
    active,
  });
}


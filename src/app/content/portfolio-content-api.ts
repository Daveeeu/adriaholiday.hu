import type {
  AdminPortfolioContentBlock,
  PortfolioContentMode,
  PortfolioContentResponse,
  PortfolioContentValue,
} from './portfolio-content.types';

const TOKEN_KEYS = ['admin_api_token', 'access_token', 'token'] as const;

function getStoredAuthToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  for (const key of TOKEN_KEYS) {
    const token = window.localStorage.getItem(key);
    if (token) {
      return token;
    }
  }

  return null;
}

function getBaseUrl() {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (envBaseUrl) {
    return envBaseUrl.replace(/\/+$/, '');
  }

  return '/api';
}

async function request<T>(
  path: string,
  mode: PortfolioContentMode,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');

  const token = getStoredAuthToken();
  if (mode === 'editor' && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchPortfolioContent(
  page: string,
  mode: PortfolioContentMode,
) {
  const path = mode === 'editor'
    ? `/admin/portfolio/content?page=${encodeURIComponent(page)}`
    : `/portfolio/content?page=${encodeURIComponent(page)}`;

  return request<PortfolioContentResponse>(path, mode);
}

export async function updatePortfolioContentBlock(
  key: string,
  value: PortfolioContentValue,
  type: string,
) {
  const body =
    type === 'image' || type === 'button' || type === 'list' || type === 'json'
      ? { draftValueJson: value }
      : { draftValue: value };

  return request<AdminPortfolioContentBlock>(
    `/admin/portfolio/content/${encodeURIComponent(key)}`,
    'editor',
    {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

export async function publishPortfolioContentBlock(key: string) {
  return request<AdminPortfolioContentBlock>(
    `/admin/portfolio/content/${encodeURIComponent(key)}/publish`,
    'editor',
    {
      method: 'POST',
    },
  );
}

export async function publishAllPortfolioContent(page: string) {
  return request<{ page: string; publishedCount: number }>(
    `/admin/portfolio/content/publish-all`,
    'editor',
    {
      method: 'POST',
      body: JSON.stringify({ page }),
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

export async function uploadPortfolioContentMedia(
  key: string,
  file: File,
  metadata: { alt?: string; title?: string } = {},
) {
  const formData = new FormData();
  formData.append('file', file);

  if (metadata.alt) {
    formData.append('alt', metadata.alt);
  }

  if (metadata.title) {
    formData.append('title', metadata.title);
  }

  return request<AdminPortfolioContentBlock>(
    `/admin/portfolio/content/${encodeURIComponent(key)}/media`,
    'editor',
    {
      method: 'POST',
      body: formData,
    },
  );
}

export async function deletePortfolioContentMedia(key: string) {
  return request<AdminPortfolioContentBlock>(
    `/admin/portfolio/content/${encodeURIComponent(key)}/media`,
    'editor',
    {
      method: 'DELETE',
    },
  );
}

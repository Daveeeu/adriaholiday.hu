import { notifyForbidden, notifyUnauthorized, getStoredAuthToken } from '@/lib/auth-session';

export class ApiError extends Error {
  public readonly status: number;
  public readonly payload: unknown;

  public constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export type ApiQueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean | null | undefined>;

export type ApiQuery = Record<string, ApiQueryValue>;

export type RequestOptions = {
  query?: ApiQuery;
  signal?: AbortSignal;
  headers?: HeadersInit;
};

export type BodyRequestOptions = RequestOptions & {
  body?: unknown;
};

function getBaseUrl() {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (envBaseUrl) {
    return envBaseUrl.replace(/\/+$/, '');
  }

  return '/api/admin';
}

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//.test(value);
}

function buildUrl(path: string, query?: ApiQuery) {
  const baseUrl = getBaseUrl();
  const backendOrigin = isAbsoluteUrl(baseUrl)
    ? new URL(baseUrl).origin
    : window.location.origin;
  const requestPath = path.startsWith('http://') || path.startsWith('https://')
    ? path
    : path.startsWith('/api/')
      ? path
      : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  const url = new URL(
    requestPath,
    isAbsoluteUrl(requestPath) ? undefined : backendOrigin,
  );

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === null || value === undefined || value === '') {
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          if (item === null || item === undefined || item === '') {
            continue;
          }
          url.searchParams.append(key, String(item));
        }
        continue;
      }

      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  if (response.status === 204) {
    return undefined as T;
  }

  if (!isJson) {
    const text = await response.text();
    return text as T;
  }

  return (await response.json()) as T;
}

export async function request<T>(
  method: string,
  path: string,
  options: BodyRequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  const token = getStoredAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let body: BodyInit | undefined;
  if (options.body instanceof FormData || options.body instanceof Blob) {
    body = options.body;
  } else if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }

  const response = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    body,
    signal: options.signal,
  });

  if (!response.ok) {
    const payload = await parseResponse<unknown>(response).catch(() => null);
    const message =
      (payload as { message?: string } | null | undefined)?.message ??
      response.statusText ??
      'API request failed';
    if (response.status === 401) {
      notifyUnauthorized();
    } else if (response.status === 403) {
      notifyForbidden();
    }
    throw new ApiError(message, response.status, payload);
  }

  return parseResponse<T>(response);
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions) {
    return request<T>('GET', path, options);
  },
  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('POST', path, { ...options, body });
  },
  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('PATCH', path, { ...options, body });
  },
  delete<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('DELETE', path, { ...options, body });
  },
  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>('PUT', path, { ...options, body });
  },
};

export type PaginatedResponse<T> = {
  items: T[];
  totalCount: number;
  page: number;
  perPage: number;
};

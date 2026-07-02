export type PortfolioBlogArticleCard = {
  id: string | number;
  slug: string;
  title: string;
  excerpt: string;
  image: string | null;
  publishedAt: string | null;
  publishedAtLabel: string | null;
  category: string | null;
  categorySlug: string | null;
  readingTime: string;
};

export type PortfolioBlogArticleDetail = PortfolioBlogArticleCard & {
  content: string;
  categories: Array<{
    id: string | number;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    id: string | number;
    name: string;
    slug: string;
  }>;
};

function getBaseUrl() {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (envBaseUrl) {
    return envBaseUrl.replace(/\/+$/, "");
  }

  return "/api";
}

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`) as Error & {
      status?: number;
    };
    error.status = response.status;
    throw error;
  }

  return (await response.json()) as T;
}

export async function fetchPortfolioBlogArticles(options?: {
  limit?: number;
  featuredOnly?: boolean;
}): Promise<PortfolioBlogArticleCard[]> {
  const params = new URLSearchParams();
  params.set("limit", String(options?.limit ?? 6));
  params.set("featuredOnly", String(options?.featuredOnly ?? true));

  return requestJson<PortfolioBlogArticleCard[]>(
    `/portfolio/blog?${params.toString()}`,
  );
}

export async function fetchPortfolioBlogArticleDetail(
  slug: string,
): Promise<PortfolioBlogArticleDetail> {
  return requestJson<PortfolioBlogArticleDetail>(
    `/portfolio/blog/${encodeURIComponent(slug)}`,
  );
}

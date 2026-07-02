export type PortfolioContentBlock = {
  key: string;
  label: string;
  type: string;
  page: string;
  section: string | null;
  locale: string;
  publishedValue: unknown;
  draftValue: unknown;
  publishedMedia?: {
    id?: number;
    url: string;
    thumbnailUrl?: string | null;
    sizes?: {
      thumbnail?: string | null;
      preview?: string | null;
      large?: string | null;
      original?: string | null;
    } | null;
    name?: string | null;
    fileName?: string | null;
    size?: number | null;
    mimeType?: string | null;
    alt?: string | null;
    title?: string | null;
  } | null;
  draftMedia?: {
    id?: number;
    url: string;
    thumbnailUrl?: string | null;
    sizes?: {
      thumbnail?: string | null;
      preview?: string | null;
      large?: string | null;
      original?: string | null;
    } | null;
    name?: string | null;
    fileName?: string | null;
    size?: number | null;
    mimeType?: string | null;
    alt?: string | null;
    title?: string | null;
  } | null;
  hasDraft: boolean;
  isPublished: boolean;
  updatedBy: number | null;
  updatedAt: string | null;
};

export type PortfolioContentResponse = Record<string, PortfolioContentBlock>;

export type PortfolioContentValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>
  | Array<unknown>;

export type PortfolioMedia = {
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
};

export type PublicPortfolioContentBlock = {
  key: string;
  type: string;
  value: PortfolioContentValue;
};

export type AdminPortfolioContentBlock = {
  key: string;
  label: string;
  type: string;
  page: string;
  section: string | null;
  locale: string;
  publishedValue: PortfolioContentValue;
  draftValue: PortfolioContentValue;
  publishedMedia?: PortfolioMedia | null;
  draftMedia?: PortfolioMedia | null;
  hasDraft: boolean;
  isPublished: boolean;
  updatedBy: number | null;
  updatedAt: string | null;
};

export type PortfolioContentResponse =
  | Record<string, PublicPortfolioContentBlock>
  | Record<string, AdminPortfolioContentBlock>;

export type PortfolioContentMode = 'public' | 'editor';

export type PortfolioContentFieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'image'
  | 'button'
  | 'url'
  | 'list'
  | 'json';

export type PortfolioEditorSelection =
  | {
      kind: 'field';
      fieldKey: string;
    }
  | {
      kind: 'button';
      labelKey: string;
      urlKey: string;
    };
